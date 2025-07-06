"""
CounselFlow Ultimate V3 - Comprehensive Error Handling System
"""

import traceback
import asyncio
from typing import Dict, Any, Optional, Union, List, Type
from enum import Enum
from datetime import datetime
import structlog
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR, HTTP_422_UNPROCESSABLE_ENTITY
from pydantic import ValidationError
import sentry_sdk

from app.core.config import settings

logger = structlog.get_logger()


class ErrorCode(str, Enum):
    """Standardized error codes for the application"""
    
    # Authentication & Authorization
    AUTHENTICATION_FAILED = "AUTH_001"
    INVALID_TOKEN = "AUTH_002"
    TOKEN_EXPIRED = "AUTH_003"
    INSUFFICIENT_PERMISSIONS = "AUTH_004"
    ACCOUNT_LOCKED = "AUTH_005"
    ACCOUNT_DISABLED = "AUTH_006"
    
    # Validation Errors
    VALIDATION_ERROR = "VAL_001"
    INVALID_INPUT_FORMAT = "VAL_002"
    MISSING_REQUIRED_FIELD = "VAL_003"
    INVALID_FILE_TYPE = "VAL_004"
    FILE_TOO_LARGE = "VAL_005"
    INVALID_DATE_RANGE = "VAL_006"
    
    # Resource Errors
    RESOURCE_NOT_FOUND = "RES_001"
    RESOURCE_ALREADY_EXISTS = "RES_002"
    RESOURCE_CONFLICT = "RES_003"
    RESOURCE_LOCKED = "RES_004"
    RESOURCE_DELETED = "RES_005"
    
    # Database Errors
    DATABASE_CONNECTION_ERROR = "DB_001"
    DATABASE_QUERY_ERROR = "DB_002"
    DATABASE_CONSTRAINT_VIOLATION = "DB_003"
    DATABASE_TRANSACTION_ERROR = "DB_004"
    DATABASE_MIGRATION_ERROR = "DB_005"
    
    # External Service Errors
    AI_SERVICE_ERROR = "AI_001"
    AI_SERVICE_TIMEOUT = "AI_002"
    AI_SERVICE_QUOTA_EXCEEDED = "AI_003"
    AI_SERVICE_UNAVAILABLE = "AI_004"
    EMAIL_SERVICE_ERROR = "EMAIL_001"
    STORAGE_SERVICE_ERROR = "STORAGE_001"
    DOCUSIGN_ERROR = "DOCUSIGN_001"
    
    # Business Logic Errors
    BUSINESS_RULE_VIOLATION = "BIZ_001"
    CONTRACT_VALIDATION_ERROR = "BIZ_002"
    MATTER_STATUS_ERROR = "BIZ_003"
    DOCUMENT_PROCESSING_ERROR = "BIZ_004"
    COMPLIANCE_VIOLATION = "BIZ_005"
    
    # System Errors
    INTERNAL_SERVER_ERROR = "SYS_001"
    SERVICE_UNAVAILABLE = "SYS_002"
    RATE_LIMIT_EXCEEDED = "SYS_003"
    CONFIGURATION_ERROR = "SYS_004"
    CACHE_ERROR = "SYS_005"
    
    # Integration Errors
    API_INTEGRATION_ERROR = "INT_001"
    WEBHOOK_ERROR = "INT_002"
    SYNC_ERROR = "INT_003"


class CounselFlowError(Exception):
    """Base exception class for CounselFlow-specific errors"""
    
    def __init__(
        self,
        message: str,
        error_code: ErrorCode,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
        user_message: Optional[str] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.user_message = user_message or message
        self.timestamp = datetime.utcnow()
        super().__init__(self.message)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary representation"""
        return {
            "error": True,
            "error_code": self.error_code.value,
            "message": self.message,
            "user_message": self.user_message,
            "status_code": self.status_code,
            "details": self.details,
            "timestamp": self.timestamp.isoformat(),
        }


class AuthenticationError(CounselFlowError):
    """Authentication-related errors"""
    
    def __init__(self, message: str = "Authentication failed", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.AUTHENTICATION_FAILED,
            status_code=401,
            **kwargs
        )


class AuthorizationError(CounselFlowError):
    """Authorization-related errors"""
    
    def __init__(self, message: str = "Insufficient permissions", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.INSUFFICIENT_PERMISSIONS,
            status_code=403,
            **kwargs
        )


class ValidationError(CounselFlowError):
    """Validation-related errors"""
    
    def __init__(self, message: str = "Validation failed", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.VALIDATION_ERROR,
            status_code=422,
            **kwargs
        )


class ResourceNotFoundError(CounselFlowError):
    """Resource not found errors"""
    
    def __init__(self, resource: str = "Resource", **kwargs):
        super().__init__(
            message=f"{resource} not found",
            error_code=ErrorCode.RESOURCE_NOT_FOUND,
            status_code=404,
            **kwargs
        )


class ResourceConflictError(CounselFlowError):
    """Resource conflict errors"""
    
    def __init__(self, message: str = "Resource conflict", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.RESOURCE_CONFLICT,
            status_code=409,
            **kwargs
        )


class DatabaseError(CounselFlowError):
    """Database-related errors"""
    
    def __init__(self, message: str = "Database error", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.DATABASE_CONNECTION_ERROR,
            status_code=500,
            **kwargs
        )


class AIServiceError(CounselFlowError):
    """AI service-related errors"""
    
    def __init__(self, message: str = "AI service error", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.AI_SERVICE_ERROR,
            status_code=503,
            **kwargs
        )


class BusinessRuleError(CounselFlowError):
    """Business logic violation errors"""
    
    def __init__(self, message: str = "Business rule violation", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.BUSINESS_RULE_VIOLATION,
            status_code=400,
            **kwargs
        )


class RateLimitError(CounselFlowError):
    """Rate limiting errors"""
    
    def __init__(self, message: str = "Rate limit exceeded", **kwargs):
        super().__init__(
            message=message,
            error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
            status_code=429,
            **kwargs
        )


class ErrorHandler:
    """Centralized error handling and logging"""
    
    def __init__(self):
        self.error_counts = {}
        self.last_errors = {}
    
    async def handle_error(
        self,
        error: Exception,
        request: Optional[Request] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Handle any type of error with appropriate logging and response"""
        
        try:
            # Extract request information
            request_info = self._extract_request_info(request) if request else {}
            
            # Handle CounselFlow-specific errors
            if isinstance(error, CounselFlowError):
                error_response = error.to_dict()
                
                # Log based on severity
                if error.status_code >= 500:
                    logger.error(
                        "CounselFlow error occurred",
                        error_code=error.error_code.value,
                        message=error.message,
                        status_code=error.status_code,
                        details=error.details,
                        request_info=request_info,
                        context=context
                    )
                else:
                    logger.warning(
                        "CounselFlow error occurred",
                        error_code=error.error_code.value,
                        message=error.message,
                        status_code=error.status_code,
                        request_info=request_info
                    )
                
                return error_response
            
            # Handle FastAPI validation errors
            elif isinstance(error, RequestValidationError):
                return await self._handle_validation_error(error, request_info)
            
            # Handle Pydantic validation errors
            elif isinstance(error, ValidationError):
                return await self._handle_pydantic_error(error, request_info)
            
            # Handle HTTP exceptions
            elif isinstance(error, (HTTPException, StarletteHTTPException)):
                return await self._handle_http_error(error, request_info)
            
            # Handle database errors
            elif self._is_database_error(error):
                return await self._handle_database_error(error, request_info, context)
            
            # Handle other exceptions
            else:
                return await self._handle_generic_error(error, request_info, context)
                
        except Exception as handler_error:
            # If error handling itself fails, log and return basic error
            logger.critical(
                "Error handler failed",
                original_error=str(error),
                handler_error=str(handler_error),
                traceback=traceback.format_exc()
            )
            
            return {
                "error": True,
                "error_code": ErrorCode.INTERNAL_SERVER_ERROR.value,
                "message": "Internal server error",
                "user_message": "An unexpected error occurred. Please try again later.",
                "status_code": 500,
                "timestamp": datetime.utcnow().isoformat(),
            }
    
    def _extract_request_info(self, request: Request) -> Dict[str, Any]:
        """Extract relevant information from request for logging"""
        try:
            return {
                "method": request.method,
                "url": str(request.url),
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "headers": {
                    key: value for key, value in request.headers.items()
                    if key.lower() not in ['authorization', 'cookie', 'x-api-key']
                },
                "client": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }
        except Exception as e:
            logger.warning("Failed to extract request info", error=str(e))
            return {}
    
    async def _handle_validation_error(
        self, 
        error: RequestValidationError, 
        request_info: Dict
    ) -> Dict[str, Any]:
        """Handle FastAPI validation errors"""
        
        validation_details = []
        for err in error.errors():
            validation_details.append({
                "field": ".".join(str(x) for x in err["loc"]),
                "message": err["msg"],
                "type": err["type"],
                "input": err.get("input")
            })
        
        logger.warning(
            "Validation error occurred",
            validation_errors=validation_details,
            request_info=request_info
        )
        
        return {
            "error": True,
            "error_code": ErrorCode.VALIDATION_ERROR.value,
            "message": "Request validation failed",
            "user_message": "Please check your input and try again",
            "status_code": HTTP_422_UNPROCESSABLE_ENTITY,
            "details": {"validation_errors": validation_details},
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    async def _handle_pydantic_error(
        self, 
        error: ValidationError, 
        request_info: Dict
    ) -> Dict[str, Any]:
        """Handle Pydantic validation errors"""
        
        logger.warning(
            "Pydantic validation error",
            error=str(error),
            request_info=request_info
        )
        
        return {
            "error": True,
            "error_code": ErrorCode.VALIDATION_ERROR.value,
            "message": "Data validation failed",
            "user_message": "Invalid data format",
            "status_code": HTTP_422_UNPROCESSABLE_ENTITY,
            "details": {"validation_error": str(error)},
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    async def _handle_http_error(
        self, 
        error: Union[HTTPException, StarletteHTTPException], 
        request_info: Dict
    ) -> Dict[str, Any]:
        """Handle HTTP exceptions"""
        
        logger.warning(
            "HTTP error occurred",
            status_code=error.status_code,
            detail=error.detail,
            request_info=request_info
        )
        
        return {
            "error": True,
            "error_code": f"HTTP_{error.status_code}",
            "message": str(error.detail),
            "user_message": str(error.detail),
            "status_code": error.status_code,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    def _is_database_error(self, error: Exception) -> bool:
        """Check if error is database-related"""
        error_types = [
            "DatabaseError",
            "OperationalError", 
            "IntegrityError",
            "ProgrammingError",
            "DataError",
            "InternalError",
            "InterfaceError",
            "NotSupportedError"
        ]
        
        return any(error_type in str(type(error)) for error_type in error_types)
    
    async def _handle_database_error(
        self, 
        error: Exception, 
        request_info: Dict,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle database-related errors"""
        
        error_message = str(error)
        
        # Determine specific database error type
        if "connection" in error_message.lower():
            error_code = ErrorCode.DATABASE_CONNECTION_ERROR
            user_message = "Database connection issue. Please try again later."
        elif "constraint" in error_message.lower() or "integrity" in error_message.lower():
            error_code = ErrorCode.DATABASE_CONSTRAINT_VIOLATION
            user_message = "Data constraint violation. Please check your input."
        else:
            error_code = ErrorCode.DATABASE_QUERY_ERROR
            user_message = "Database operation failed. Please try again."
        
        logger.error(
            "Database error occurred",
            error_code=error_code.value,
            error_message=error_message,
            request_info=request_info,
            context=context,
            traceback=traceback.format_exc()
        )
        
        # Report to Sentry if configured
        if settings.SENTRY_DSN:
            sentry_sdk.capture_exception(error)
        
        return {
            "error": True,
            "error_code": error_code.value,
            "message": f"Database error: {error_message}",
            "user_message": user_message,
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    async def _handle_generic_error(
        self, 
        error: Exception, 
        request_info: Dict,
        context: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Handle generic/unexpected errors"""
        
        error_message = str(error)
        error_type = type(error).__name__
        
        logger.error(
            "Unexpected error occurred",
            error_type=error_type,
            error_message=error_message,
            request_info=request_info,
            context=context,
            traceback=traceback.format_exc()
        )
        
        # Report to Sentry if configured
        if settings.SENTRY_DSN:
            sentry_sdk.capture_exception(error)
        
        # Hide internal details in production
        if settings.ENVIRONMENT == "production":
            public_message = "An unexpected error occurred. Please try again later."
            details = {}
        else:
            public_message = f"{error_type}: {error_message}"
            details = {"traceback": traceback.format_exc()}
        
        return {
            "error": True,
            "error_code": ErrorCode.INTERNAL_SERVER_ERROR.value,
            "message": f"Internal server error: {error_message}",
            "user_message": public_message,
            "status_code": HTTP_500_INTERNAL_SERVER_ERROR,
            "details": details,
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    async def track_error_metrics(self, error_code: str, status_code: int):
        """Track error metrics for monitoring"""
        try:
            # Increment error counter
            self.error_counts[error_code] = self.error_counts.get(error_code, 0) + 1
            self.last_errors[error_code] = datetime.utcnow()
            
            # Log metrics
            logger.info(
                "Error metrics updated",
                error_code=error_code,
                count=self.error_counts[error_code],
                status_code=status_code
            )
            
        except Exception as e:
            logger.warning("Failed to track error metrics", error=str(e))
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get summary of error occurrences"""
        return {
            "error_counts": self.error_counts,
            "last_errors": {
                code: timestamp.isoformat() 
                for code, timestamp in self.last_errors.items()
            },
            "total_errors": sum(self.error_counts.values()),
            "timestamp": datetime.utcnow().isoformat()
        }


# Global error handler instance
error_handler = ErrorHandler()


# Exception handler functions for FastAPI
async def counselflow_exception_handler(request: Request, exc: CounselFlowError) -> JSONResponse:
    """Handle CounselFlow-specific exceptions"""
    error_response = await error_handler.handle_error(exc, request)
    await error_handler.track_error_metrics(exc.error_code.value, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation exceptions"""
    error_response = await error_handler.handle_error(exc, request)
    await error_handler.track_error_metrics(ErrorCode.VALIDATION_ERROR.value, HTTP_422_UNPROCESSABLE_ENTITY)
    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions"""
    error_response = await error_handler.handle_error(exc, request)
    await error_handler.track_error_metrics(f"HTTP_{exc.status_code}", exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other exceptions"""
    error_response = await error_handler.handle_error(exc, request)
    await error_handler.track_error_metrics(ErrorCode.INTERNAL_SERVER_ERROR.value, HTTP_500_INTERNAL_SERVER_ERROR)
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )


# Utility functions
def get_error_handler() -> ErrorHandler:
    """Get the global error handler instance"""
    return error_handler


async def log_business_error(
    error_code: ErrorCode,
    message: str,
    context: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
):
    """Log business-specific errors for tracking"""
    logger.warning(
        "Business error logged",
        error_code=error_code.value,
        message=message,
        context=context,
        user_id=user_id,
        timestamp=datetime.utcnow().isoformat()
    )


# Context manager for error handling
class ErrorContext:
    """Context manager for handling errors in specific operations"""
    
    def __init__(self, operation: str, context: Optional[Dict[str, Any]] = None):
        self.operation = operation
        self.context = context or {}
        self.start_time = None
    
    async def __aenter__(self):
        self.start_time = datetime.utcnow()
        logger.info(f"Starting operation: {self.operation}", context=self.context)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.utcnow() - self.start_time).total_seconds()
        
        if exc_type is None:
            logger.info(
                f"Operation completed: {self.operation}",
                duration=duration,
                context=self.context
            )
        else:
            logger.error(
                f"Operation failed: {self.operation}",
                duration=duration,
                error=str(exc_val),
                context=self.context,
                traceback=traceback.format_exc()
            )
            
            # Re-raise the exception
            return False