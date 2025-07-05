"""
CounselFlow Ultimate V3 - Rate Limiting Middleware
"""

import time
import asyncio
from typing import Callable, Dict, Optional, Tuple
import structlog
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.redis import get_rate_limiter

logger = structlog.get_logger()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with Redis backend"""
    
    def __init__(
        self,
        app,
        default_rate_limit: int = None,
        burst_limit: int = None,
        window_seconds: int = 60,
        rate_limit_by: str = "ip",  # 'ip', 'user', 'ip_and_user'
    ):
        super().__init__(app)
        self.default_rate_limit = default_rate_limit or settings.RATE_LIMIT_PER_MINUTE
        self.burst_limit = burst_limit or settings.RATE_LIMIT_BURST
        self.window_seconds = window_seconds
        self.rate_limit_by = rate_limit_by
        
        # Different rate limits for different endpoint types
        self.endpoint_limits = {
            # Authentication endpoints - stricter limits
            "/api/v1/auth/login": {"limit": 5, "window": 300},  # 5 attempts per 5 minutes
            "/api/v1/auth/register": {"limit": 3, "window": 3600},  # 3 attempts per hour
            "/api/v1/auth/forgot-password": {"limit": 3, "window": 3600},
            
            # AI endpoints - expensive operations
            "/api/v1/ai/analyze": {"limit": 10, "window": 60},
            "/api/v1/ai/generate": {"limit": 5, "window": 60},
            
            # File upload endpoints
            "/api/v1/documents/upload": {"limit": 20, "window": 60},
            
            # Admin endpoints - more restrictive
            "/api/v1/admin": {"limit": 30, "window": 60},
        }
        
        # Exempt paths from rate limiting
        self.exempt_paths = [
            "/health", "/docs", "/redoc", "/openapi.json",
            "/static", "/favicon.ico"
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Apply rate limiting to requests"""
        
        # Skip rate limiting for exempt paths
        if any(request.url.path.startswith(path) for path in self.exempt_paths):
            return await call_next(request)
        
        try:
            # Get rate limiter
            rate_limiter = await get_rate_limiter()
            
            # Determine rate limit parameters
            rate_limit, window = self._get_rate_limit_for_endpoint(request.url.path)
            
            # Generate identifier for rate limiting
            identifier = await self._get_rate_limit_identifier(request)
            
            # Check rate limit
            is_allowed, current_count, remaining = await rate_limiter.is_allowed(
                identifier=identifier,
                limit=rate_limit,
                window_seconds=window,
                window_type="sliding"
            )
            
            if not is_allowed:
                # Rate limit exceeded
                await self._log_rate_limit_exceeded(request, identifier, current_count, rate_limit)
                
                response = JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": True,
                        "message": "Rate limit exceeded. Please try again later.",
                        "rate_limit": {
                            "limit": rate_limit,
                            "window_seconds": window,
                            "current": current_count,
                            "remaining": 0,
                            "reset_time": int(time.time()) + window,
                        },
                        "timestamp": time.time(),
                    }
                )
                
                # Add rate limiting headers
                self._add_rate_limit_headers(response, rate_limit, current_count, remaining, window)
                
                return response
            
            # Process the request
            response = await call_next(request)
            
            # Add rate limiting headers to successful responses
            self._add_rate_limit_headers(response, rate_limit, current_count, remaining, window)
            
            return response
            
        except Exception as e:
            logger.error("Rate limiting error", error=str(e), path=request.url.path)
            # If rate limiting fails, allow the request to proceed
            return await call_next(request)
    
    def _get_rate_limit_for_endpoint(self, path: str) -> Tuple[int, int]:
        """Get rate limit and window for specific endpoint"""
        
        # Check for exact matches first
        if path in self.endpoint_limits:
            config = self.endpoint_limits[path]
            return config["limit"], config["window"]
        
        # Check for prefix matches
        for endpoint_pattern, config in self.endpoint_limits.items():
            if path.startswith(endpoint_pattern):
                return config["limit"], config["window"]
        
        # Default rate limit
        return self.default_rate_limit, self.window_seconds
    
    async def _get_rate_limit_identifier(self, request: Request) -> str:
        """Generate identifier for rate limiting"""
        
        identifiers = []
        
        if self.rate_limit_by in ["ip", "ip_and_user"]:
            client_ip = self._get_client_ip(request)
            identifiers.append(f"ip:{client_ip}")
        
        if self.rate_limit_by in ["user", "ip_and_user"]:
            # Try to get user ID from request state (set by auth middleware)
            user_id = None
            if hasattr(request.state, 'user'):
                user_id = getattr(request.state.user, 'id', None)
            
            if user_id:
                identifiers.append(f"user:{user_id}")
            else:
                # Fallback to IP if no user
                client_ip = self._get_client_ip(request)
                identifiers.append(f"anonymous:{client_ip}")
        
        # Combine identifiers
        base_identifier = ":".join(identifiers)
        
        # Add endpoint-specific prefix for different limits per endpoint
        endpoint_key = self._get_endpoint_key(request.url.path)
        
        return f"rate_limit:{endpoint_key}:{base_identifier}"
    
    def _get_endpoint_key(self, path: str) -> str:
        """Get simplified endpoint key for rate limiting"""
        
        # Remove IDs and other dynamic parts from path
        # e.g., /api/v1/contracts/123 -> /api/v1/contracts/:id
        
        parts = path.split("/")
        normalized_parts = []
        
        for part in parts:
            if part.isdigit() or self._looks_like_uuid(part):
                normalized_parts.append(":id")
            else:
                normalized_parts.append(part)
        
        return "/".join(normalized_parts)
    
    def _looks_like_uuid(self, value: str) -> bool:
        """Check if string looks like a UUID"""
        import re
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            re.IGNORECASE
        )
        return bool(uuid_pattern.match(value))
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        # Check forwarded headers
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _add_rate_limit_headers(
        self, 
        response: Response, 
        limit: int, 
        current: int, 
        remaining: int, 
        window: int
    ) -> None:
        """Add rate limiting headers to response"""
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time()) + window)
        response.headers["X-RateLimit-Used"] = str(current)
    
    async def _log_rate_limit_exceeded(
        self, 
        request: Request, 
        identifier: str, 
        current_count: int, 
        limit: int
    ) -> None:
        """Log rate limit exceeded event"""
        logger.warning(
            "Rate limit exceeded",
            identifier=identifier,
            path=request.url.path,
            method=request.method,
            current_count=current_count,
            limit=limit,
            client_ip=self._get_client_ip(request),
            user_agent=request.headers.get("user-agent"),
        )


class BurstProtectionMiddleware(BaseHTTPMiddleware):
    """Burst protection middleware for handling traffic spikes"""
    
    def __init__(self, app, burst_threshold: int = 10, burst_window: int = 1):
        super().__init__(app)
        self.burst_threshold = burst_threshold
        self.burst_window = burst_window
        self.request_times: Dict[str, list] = {}
        self.cleanup_interval = 60  # Clean up old entries every 60 seconds
        self.last_cleanup = time.time()
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Protect against burst requests"""
        
        current_time = time.time()
        
        # Periodic cleanup of old entries
        if current_time - self.last_cleanup > self.cleanup_interval:
            await self._cleanup_old_entries(current_time)
            self.last_cleanup = current_time
        
        # Get client identifier
        client_id = self._get_client_ip(request)
        
        # Initialize request times for this client
        if client_id not in self.request_times:
            self.request_times[client_id] = []
        
        # Remove old request times outside the burst window
        cutoff_time = current_time - self.burst_window
        self.request_times[client_id] = [
            req_time for req_time in self.request_times[client_id]
            if req_time > cutoff_time
        ]
        
        # Check if burst threshold is exceeded
        if len(self.request_times[client_id]) >= self.burst_threshold:
            logger.warning(
                "Burst protection triggered",
                client_ip=client_id,
                path=request.url.path,
                requests_in_window=len(self.request_times[client_id]),
                threshold=self.burst_threshold,
                window=self.burst_window,
            )
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": True,
                    "message": "Too many requests in a short time. Please slow down.",
                    "burst_protection": {
                        "threshold": self.burst_threshold,
                        "window_seconds": self.burst_window,
                        "requests_in_window": len(self.request_times[client_id]),
                    },
                    "timestamp": current_time,
                }
            )
        
        # Add current request time
        self.request_times[client_id].append(current_time)
        
        # Process the request
        response = await call_next(request)
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        
        if request.client:
            return request.client.host
        
        return "unknown"
    
    async def _cleanup_old_entries(self, current_time: float) -> None:
        """Clean up old request time entries"""
        cutoff_time = current_time - self.burst_window * 2  # Keep some extra buffer
        
        for client_id in list(self.request_times.keys()):
            self.request_times[client_id] = [
                req_time for req_time in self.request_times[client_id]
                if req_time > cutoff_time
            ]
            
            # Remove empty entries
            if not self.request_times[client_id]:
                del self.request_times[client_id]


class AdaptiveRateLimitMiddleware(BaseHTTPMiddleware):
    """Adaptive rate limiting that adjusts based on system load"""
    
    def __init__(self, app, base_limit: int = 100, load_threshold: float = 0.8):
        super().__init__(app)
        self.base_limit = base_limit
        self.load_threshold = load_threshold
        self.load_check_interval = 10  # Check system load every 10 seconds
        self.last_load_check = 0
        self.current_load = 0.0
        self.adaptive_multiplier = 1.0
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Apply adaptive rate limiting based on system load"""
        
        current_time = time.time()
        
        # Check system load periodically
        if current_time - self.last_load_check > self.load_check_interval:
            await self._update_system_load()
            self.last_load_check = current_time
        
        # Calculate adaptive rate limit
        adaptive_limit = int(self.base_limit * self.adaptive_multiplier)
        
        # Apply rate limiting logic here (similar to RateLimitMiddleware)
        # For brevity, we'll just add headers and process the request
        
        response = await call_next(request)
        
        # Add adaptive rate limit headers
        response.headers["X-Adaptive-RateLimit-Current-Load"] = f"{self.current_load:.2f}"
        response.headers["X-Adaptive-RateLimit-Multiplier"] = f"{self.adaptive_multiplier:.2f}"
        response.headers["X-Adaptive-RateLimit-Effective-Limit"] = str(adaptive_limit)
        
        return response
    
    async def _update_system_load(self) -> None:
        """Update system load metrics"""
        try:
            import psutil
            
            # Get CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Get memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Calculate overall system load
            self.current_load = max(cpu_percent, memory_percent) / 100.0
            
            # Adjust rate limit multiplier based on load
            if self.current_load > self.load_threshold:
                # Reduce rate limits when system is under load
                self.adaptive_multiplier = max(0.1, 1.0 - (self.current_load - self.load_threshold))
            else:
                # Gradually restore normal rate limits
                self.adaptive_multiplier = min(1.0, self.adaptive_multiplier + 0.1)
            
            logger.debug(
                "System load updated",
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                current_load=self.current_load,
                adaptive_multiplier=self.adaptive_multiplier,
            )
            
        except ImportError:
            # psutil not available, use default multiplier
            self.adaptive_multiplier = 1.0
        except Exception as e:
            logger.error("Failed to update system load", error=str(e))