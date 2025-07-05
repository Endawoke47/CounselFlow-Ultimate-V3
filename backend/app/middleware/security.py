"""
CounselFlow Ultimate V3 - Security Middleware
"""

import time
import uuid
from typing import Callable, Optional
import structlog
from fastapi import Request, Response, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import httpx

from app.core.config import settings

logger = structlog.get_logger()

# Security headers configuration
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
}


class SecurityMiddleware(BaseHTTPMiddleware):
    """Security middleware for request/response processing"""
    
    def __init__(self, app, max_request_size: int = 10 * 1024 * 1024):  # 10MB default
        super().__init__(app)
        self.max_request_size = max_request_size
        self.bearer_scheme = HTTPBearer(auto_error=False)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and response with security measures"""
        
        # Generate request ID for tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        start_time = time.time()
        
        try:
            # Security checks
            await self._validate_request_size(request)
            await self._validate_content_type(request)
            await self._check_suspicious_patterns(request)
            
            # Process the request
            response = await call_next(request)
            
            # Add security headers
            self._add_security_headers(response)
            
            # Add request tracking headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{(time.time() - start_time):.3f}s"
            
            # Log successful requests in production
            if settings.ENVIRONMENT == "production":
                await self._log_request(request, response, time.time() - start_time)
            
            return response
            
        except HTTPException as e:
            logger.warning(
                "Security middleware blocked request",
                request_id=request_id,
                path=request.url.path,
                method=request.method,
                client_ip=self._get_client_ip(request),
                error=e.detail,
                status_code=e.status_code,
            )
            
            response = JSONResponse(
                status_code=e.status_code,
                content={
                    "error": True,
                    "message": e.detail,
                    "request_id": request_id,
                    "timestamp": time.time(),
                }
            )
            self._add_security_headers(response)
            return response
            
        except Exception as e:
            logger.error(
                "Security middleware error",
                request_id=request_id,
                path=request.url.path,
                method=request.method,
                client_ip=self._get_client_ip(request),
                error=str(e),
                duration=time.time() - start_time,
            )
            
            response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": True,
                    "message": "Internal server error",
                    "request_id": request_id,
                    "timestamp": time.time(),
                }
            )
            self._add_security_headers(response)
            return response
    
    async def _validate_request_size(self, request: Request) -> None:
        """Validate request size to prevent DoS attacks"""
        content_length = request.headers.get("content-length")
        
        if content_length:
            try:
                size = int(content_length)
                if size > self.max_request_size:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Request too large. Maximum size: {self.max_request_size} bytes"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Content-Length header"
                )
    
    async def _validate_content_type(self, request: Request) -> None:
        """Validate content type for POST/PUT/PATCH requests"""
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            
            # Allow common content types
            allowed_types = [
                "application/json",
                "application/x-www-form-urlencoded",
                "multipart/form-data",
                "text/plain",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]
            
            # Extract base content type (remove charset, boundary, etc.)
            base_content_type = content_type.split(";")[0].strip().lower()
            
            if base_content_type and not any(allowed in base_content_type for allowed in allowed_types):
                logger.warning(
                    "Suspicious content type detected",
                    content_type=content_type,
                    path=request.url.path,
                    method=request.method,
                    client_ip=self._get_client_ip(request),
                )
    
    async def _check_suspicious_patterns(self, request: Request) -> None:
        """Check for suspicious patterns in request"""
        # Check URL for suspicious patterns
        suspicious_patterns = [
            "../", "..\\",  # Path traversal
            "<script", "</script>",  # XSS
            "javascript:", "data:",  # Injection
            "union select", "drop table",  # SQL injection
            "<?php", "<%",  # Code injection
        ]
        
        url_path = str(request.url.path).lower()
        query_string = str(request.url.query).lower()
        
        for pattern in suspicious_patterns:
            if pattern in url_path or pattern in query_string:
                logger.warning(
                    "Suspicious pattern detected in URL",
                    pattern=pattern,
                    path=request.url.path,
                    query=request.url.query,
                    client_ip=self._get_client_ip(request),
                )
                
                # For now, just log. In production, you might want to block
                # raise HTTPException(
                #     status_code=status.HTTP_400_BAD_REQUEST,
                #     detail="Suspicious request pattern detected"
                # )
    
    def _add_security_headers(self, response: Response) -> None:
        """Add security headers to response"""
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
        
        # Add HSTS only for HTTPS
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        # Check for forwarded headers (when behind a proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        # Fallback to direct client IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    async def _log_request(self, request: Request, response: Response, duration: float) -> None:
        """Log request details for audit purposes"""
        try:
            logger.info(
                "Request processed",
                request_id=getattr(request.state, 'request_id', 'unknown'),
                method=request.method,
                path=request.url.path,
                query_params=dict(request.query_params),
                status_code=response.status_code,
                duration=duration,
                client_ip=self._get_client_ip(request),
                user_agent=request.headers.get("user-agent", "unknown"),
                referer=request.headers.get("referer"),
                content_length=response.headers.get("content-length"),
            )
        except Exception as e:
            logger.error("Failed to log request", error=str(e))


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """CSRF protection middleware"""
    
    def __init__(self, app, exempt_paths: Optional[list] = None):
        super().__init__(app)
        self.exempt_paths = exempt_paths or [
            "/docs", "/redoc", "/openapi.json", "/health",
            "/api/v1/auth/login", "/api/v1/auth/register"
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Check CSRF token for state-changing requests"""
        
        # Skip CSRF check for safe methods and exempt paths
        if (request.method in ["GET", "HEAD", "OPTIONS"] or 
            any(request.url.path.startswith(path) for path in self.exempt_paths)):
            return await call_next(request)
        
        # Check for CSRF token in headers
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token:
            # Also check in form data for HTML forms
            if "application/x-www-form-urlencoded" in request.headers.get("content-type", ""):
                form_data = await request.form()
                csrf_token = form_data.get("csrf_token")
        
        # In development, be more lenient
        if settings.ENVIRONMENT == "development" and not csrf_token:
            logger.debug("CSRF token missing in development mode", path=request.url.path)
            return await call_next(request)
        
        # Validate CSRF token (simplified - in production use proper token validation)
        if not csrf_token or len(csrf_token) < 20:
            logger.warning(
                "CSRF token validation failed",
                path=request.url.path,
                method=request.method,
                client_ip=request.client.host if request.client else "unknown",
                has_token=bool(csrf_token),
            )
            
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": True,
                    "message": "CSRF token required",
                    "timestamp": time.time(),
                }
            )
        
        return await call_next(request)


class IPWhitelistMiddleware(BaseHTTPMiddleware):
    """IP whitelist middleware for admin endpoints"""
    
    def __init__(self, app, whitelist: Optional[list] = None, protected_paths: Optional[list] = None):
        super().__init__(app)
        self.whitelist = whitelist or ["127.0.0.1", "::1"]  # Default to localhost
        self.protected_paths = protected_paths or ["/api/v1/admin"]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Check IP whitelist for protected paths"""
        
        # Check if this is a protected path
        is_protected = any(request.url.path.startswith(path) for path in self.protected_paths)
        
        if not is_protected:
            return await call_next(request)
        
        client_ip = self._get_client_ip(request)
        
        # Check if IP is whitelisted
        if client_ip not in self.whitelist:
            logger.warning(
                "Access denied - IP not whitelisted",
                client_ip=client_ip,
                path=request.url.path,
                method=request.method,
            )
            
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "error": True,
                    "message": "Access denied",
                    "timestamp": time.time(),
                }
            )
        
        return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        # Check for forwarded headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()
        
        if request.client:
            return request.client.host
        
        return "unknown"


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Request validation middleware"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Validate request format and headers"""
        
        try:
            # Validate required headers for API requests
            if request.url.path.startswith("/api/"):
                await self._validate_api_headers(request)
            
            # Validate JSON payload for JSON requests
            if "application/json" in request.headers.get("content-type", ""):
                await self._validate_json_payload(request)
            
            return await call_next(request)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Request validation error", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request format"
            )
    
    async def _validate_api_headers(self, request: Request) -> None:
        """Validate required headers for API requests"""
        required_headers = []
        
        # Add any required headers based on your API design
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type")
            if not content_type:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Content-Type header required"
                )
    
    async def _validate_json_payload(self, request: Request) -> None:
        """Validate JSON payload structure"""
        try:
            # This will be handled by FastAPI's request parsing
            # But we can add additional validation here if needed
            pass
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload"
            )