"""
CounselFlow Ultimate V3 - Logging Middleware
"""

import time
import json
import uuid
from typing import Callable, Dict, Any, Optional
import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse

from app.core.config import settings

logger = structlog.get_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    """Comprehensive logging middleware for request/response tracking"""
    
    def __init__(self, app, log_request_body: bool = False, log_response_body: bool = False):
        super().__init__(app)
        self.log_request_body = log_request_body and settings.ENVIRONMENT != "production"
        self.log_response_body = log_response_body and settings.ENVIRONMENT != "production"
        self.sensitive_headers = {
            "authorization", "cookie", "x-api-key", "x-auth-token",
            "x-csrf-token", "x-session-id", "authentication"
        }
        self.sensitive_fields = {
            "password", "token", "secret", "key", "credential",
            "authorization", "auth", "pass", "pwd"
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request and response details"""
        
        # Generate or get request ID
        request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
        request.state.request_id = request_id
        
        start_time = time.time()
        
        # Log incoming request
        await self._log_request(request, request_id)
        
        # Process request and capture response
        response = await call_next(request)
        
        duration = time.time() - start_time
        
        # Log outgoing response
        await self._log_response(request, response, duration, request_id)
        
        return response
    
    async def _log_request(self, request: Request, request_id: str) -> None:
        """Log incoming request details"""
        try:
            # Basic request info
            request_data = {
                "event": "request_started",
                "request_id": request_id,
                "method": request.method,
                "url": str(request.url),
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "client_ip": self._get_client_ip(request),
                "user_agent": request.headers.get("user-agent", "unknown"),
                "referer": request.headers.get("referer"),
                "timestamp": time.time(),
            }
            
            # Add headers (filtered for sensitive data)
            if settings.ENVIRONMENT != "production":
                request_data["headers"] = self._filter_sensitive_data(dict(request.headers))
            
            # Add request body if enabled and safe
            if (self.log_request_body and 
                request.method in ["POST", "PUT", "PATCH"] and
                self._is_safe_to_log_body(request)):
                
                body = await self._get_request_body(request)
                if body:
                    request_data["body"] = self._filter_sensitive_data(body)
            
            # Add user context if available
            if hasattr(request.state, 'user'):
                request_data["user_id"] = getattr(request.state.user, 'id', None)
                request_data["user_email"] = getattr(request.state.user, 'email', None)
                request_data["user_role"] = getattr(request.state.user, 'role', None)
            
            logger.info("Request received", **request_data)
            
        except Exception as e:
            logger.error("Failed to log request", error=str(e), request_id=request_id)
    
    async def _log_response(
        self, 
        request: Request, 
        response: Response, 
        duration: float, 
        request_id: str
    ) -> None:
        """Log outgoing response details"""
        try:
            response_data = {
                "event": "request_completed",
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration": round(duration, 3),
                "timestamp": time.time(),
            }
            
            # Add response headers (filtered)
            if settings.ENVIRONMENT != "production":
                response_data["response_headers"] = self._filter_sensitive_data(dict(response.headers))
            
            # Add response body if enabled and safe
            if (self.log_response_body and 
                self._is_safe_to_log_response_body(response) and
                not isinstance(response, StreamingResponse)):
                
                try:
                    # This is tricky with FastAPI - we'd need to read the response body
                    # For now, we'll skip response body logging to avoid complexity
                    pass
                except Exception:
                    pass
            
            # Determine log level based on status code
            if response.status_code >= 500:
                logger.error("Request failed", **response_data)
            elif response.status_code >= 400:
                logger.warning("Request error", **response_data)
            elif duration > 5.0:  # Slow request threshold
                logger.warning("Slow request", **response_data)
            else:
                logger.info("Request completed", **response_data)
                
        except Exception as e:
            logger.error("Failed to log response", error=str(e), request_id=request_id)
    
    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
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
    
    async def _get_request_body(self, request: Request) -> Optional[Dict[str, Any]]:
        """Safely get request body"""
        try:
            content_type = request.headers.get("content-type", "")
            
            if "application/json" in content_type:
                # For JSON requests
                body = await request.body()
                if body:
                    return json.loads(body.decode("utf-8"))
            
            elif "application/x-www-form-urlencoded" in content_type:
                # For form requests
                form_data = await request.form()
                return dict(form_data)
            
            elif "multipart/form-data" in content_type:
                # For file uploads - log metadata only
                form_data = await request.form()
                return {
                    "form_fields": list(form_data.keys()),
                    "has_files": any(hasattr(v, 'filename') for v in form_data.values())
                }
            
            return None
            
        except Exception as e:
            logger.debug("Failed to parse request body", error=str(e))
            return None
    
    def _is_safe_to_log_body(self, request: Request) -> bool:
        """Check if it's safe to log request body"""
        content_type = request.headers.get("content-type", "")
        
        # Don't log binary data
        if any(ct in content_type for ct in ["image/", "video/", "audio/", "application/octet-stream"]):
            return False
        
        # Don't log file uploads in production
        if "multipart/form-data" in content_type and settings.ENVIRONMENT == "production":
            return False
        
        # Check content length
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 1024 * 10:  # 10KB limit
            return False
        
        return True
    
    def _is_safe_to_log_response_body(self, response: Response) -> bool:
        """Check if it's safe to log response body"""
        content_type = response.headers.get("content-type", "")
        
        # Only log JSON responses
        if "application/json" not in content_type:
            return False
        
        # Check response size
        content_length = response.headers.get("content-length")
        if content_length and int(content_length) > 1024 * 10:  # 10KB limit
            return False
        
        return True
    
    def _filter_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Filter sensitive data from logs"""
        if not isinstance(data, dict):
            return data
        
        filtered = {}
        
        for key, value in data.items():
            key_lower = key.lower()
            
            # Check if key contains sensitive information
            if any(sensitive in key_lower for sensitive in self.sensitive_fields):
                filtered[key] = "[REDACTED]"
            elif any(sensitive in key_lower for sensitive in self.sensitive_headers):
                filtered[key] = "[REDACTED]"
            elif isinstance(value, dict):
                filtered[key] = self._filter_sensitive_data(value)
            elif isinstance(value, list):
                filtered[key] = [
                    self._filter_sensitive_data(item) if isinstance(item, dict) else item
                    for item in value
                ]
            else:
                filtered[key] = value
        
        return filtered


class AuditLogMiddleware(BaseHTTPMiddleware):
    """Audit logging middleware for compliance and security"""
    
    def __init__(self, app, audit_endpoints: Optional[list] = None):
        super().__init__(app)
        # Endpoints that require audit logging
        self.audit_endpoints = audit_endpoints or [
            "/api/v1/admin",
            "/api/v1/users",
            "/api/v1/contracts",
            "/api/v1/matters",
            "/api/v1/documents",
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log audit events for sensitive operations"""
        
        # Check if this endpoint requires audit logging
        requires_audit = any(
            request.url.path.startswith(endpoint) 
            for endpoint in self.audit_endpoints
        )
        
        if not requires_audit:
            return await call_next(request)
        
        request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
        start_time = time.time()
        
        # Log audit event before processing
        await self._log_audit_start(request, request_id)
        
        # Process request
        response = await call_next(request)
        
        # Log audit event after processing
        await self._log_audit_complete(request, response, time.time() - start_time, request_id)
        
        return response
    
    async def _log_audit_start(self, request: Request, request_id: str) -> None:
        """Log audit event start"""
        try:
            audit_data = {
                "event_type": "audit_log",
                "action": "request_started",
                "request_id": request_id,
                "method": request.method,
                "endpoint": request.url.path,
                "client_ip": self._get_client_ip(request),
                "user_agent": request.headers.get("user-agent"),
                "timestamp": time.time(),
            }
            
            # Add user context if available
            if hasattr(request.state, 'user'):
                audit_data.update({
                    "user_id": getattr(request.state.user, 'id', None),
                    "user_email": getattr(request.state.user, 'email', None),
                    "user_role": getattr(request.state.user, 'role', None),
                })
            
            # Add resource context from path parameters
            if hasattr(request, 'path_params'):
                audit_data["resource_ids"] = dict(request.path_params)
            
            logger.info("Audit event started", **audit_data)
            
        except Exception as e:
            logger.error("Failed to log audit start", error=str(e), request_id=request_id)
    
    async def _log_audit_complete(
        self, 
        request: Request, 
        response: Response, 
        duration: float, 
        request_id: str
    ) -> None:
        """Log audit event completion"""
        try:
            audit_data = {
                "event_type": "audit_log",
                "action": "request_completed",
                "request_id": request_id,
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": response.status_code,
                "duration": round(duration, 3),
                "success": 200 <= response.status_code < 300,
                "timestamp": time.time(),
            }
            
            # Add user context if available
            if hasattr(request.state, 'user'):
                audit_data.update({
                    "user_id": getattr(request.state.user, 'id', None),
                    "user_email": getattr(request.state.user, 'email', None),
                })
            
            # Determine event severity
            if response.status_code >= 500:
                logger.error("Audit event failed", **audit_data)
            elif response.status_code >= 400:
                logger.warning("Audit event error", **audit_data)
            else:
                logger.info("Audit event completed", **audit_data)
                
        except Exception as e:
            logger.error("Failed to log audit completion", error=str(e), request_id=request_id)
    
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


class PerformanceLogMiddleware(BaseHTTPMiddleware):
    """Performance monitoring middleware"""
    
    def __init__(self, app, slow_request_threshold: float = 1.0):
        super().__init__(app)
        self.slow_request_threshold = slow_request_threshold
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Monitor request performance"""
        
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        duration = time.time() - start_time
        
        # Log performance metrics
        await self._log_performance(request, response, duration)
        
        return response
    
    async def _log_performance(self, request: Request, response: Response, duration: float) -> None:
        """Log performance metrics"""
        try:
            perf_data = {
                "event_type": "performance",
                "method": request.method,
                "endpoint": request.url.path,
                "status_code": response.status_code,
                "duration": round(duration, 3),
                "slow_request": duration > self.slow_request_threshold,
                "timestamp": time.time(),
            }
            
            # Add memory usage if available
            try:
                import psutil
                import os
                process = psutil.Process(os.getpid())
                perf_data["memory_mb"] = round(process.memory_info().rss / 1024 / 1024, 2)
            except ImportError:
                pass
            
            if duration > self.slow_request_threshold:
                logger.warning("Slow request detected", **perf_data)
            else:
                logger.debug("Request performance", **perf_data)
                
        except Exception as e:
            logger.error("Failed to log performance metrics", error=str(e))