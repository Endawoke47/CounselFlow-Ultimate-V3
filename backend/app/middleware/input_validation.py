"""
CounselFlow Ultimate V3 - Input Validation and Sanitization Middleware
Comprehensive security-focused input validation and sanitization
"""

import re
import html
import bleach
import json
from typing import Any, Dict, List, Optional, Union
from fastapi import Request, HTTPException, status
from fastapi.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel, validator
import structlog
from urllib.parse import unquote
from datetime import datetime

logger = structlog.get_logger()


class ValidationConfig:
    """Configuration for input validation"""
    
    # Maximum lengths for various input types
    MAX_STRING_LENGTH = 10000
    MAX_TEXT_LENGTH = 100000
    MAX_EMAIL_LENGTH = 320
    MAX_URL_LENGTH = 2048
    MAX_PHONE_LENGTH = 20
    MAX_NAME_LENGTH = 100
    MAX_DESCRIPTION_LENGTH = 5000
    MAX_JSON_DEPTH = 10
    MAX_ARRAY_LENGTH = 1000
    
    # Allowed HTML tags and attributes for rich text
    ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ol', 'ul', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code',
        'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ]
    
    ALLOWED_ATTRIBUTES = {
        '*': ['class', 'id'],
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'table': ['border', 'cellpadding', 'cellspacing'],
    }
    
    # Regular expressions for validation
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE_REGEX = re.compile(r'^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$')
    URL_REGEX = re.compile(r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$')
    UUID_REGEX = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.IGNORECASE)
    ALPHANUMERIC_REGEX = re.compile(r'^[a-zA-Z0-9_-]+$')
    
    # SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r"(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)",
        r"(\bUNION\b.*\bSELECT\b)",
        r"(\bOR\b.*=.*\bOR\b)",
        r"('|\"|;|--|\/\*|\*\/)",
        r"(\bEXEC\b|\bEXECUTE\b)",
        r"(\bxp_\w+)",
        r"(\bsp_\w+)",
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"vbscript:",
        r"onload\s*=",
        r"onerror\s*=",
        r"onclick\s*=",
        r"onmouseover\s*=",
        r"onfocus\s*=",
        r"onblur\s*=",
        r"<iframe[^>]*>.*?</iframe>",
        r"<object[^>]*>.*?</object>",
        r"<embed[^>]*>",
        r"<link[^>]*>",
        r"<meta[^>]*>",
    ]
    
    # Path traversal patterns
    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.\\",
        r"%2e%2e%2f",
        r"%252e%252e%252f",
        r"..%2f",
        r"..%5c",
    ]


class InputSanitizer:
    """Comprehensive input sanitization utility"""
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = ValidationConfig.MAX_STRING_LENGTH) -> str:
        """Sanitize general string input"""
        if not isinstance(value, str):
            return str(value)
        
        # Decode URL encoding
        value = unquote(value)
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # Normalize whitespace
        value = ' '.join(value.split())
        
        # HTML escape
        value = html.escape(value)
        
        # Truncate if too long
        if len(value) > max_length:
            value = value[:max_length]
        
        return value
    
    @staticmethod
    def sanitize_html(value: str, allow_tags: bool = True) -> str:
        """Sanitize HTML content"""
        if not isinstance(value, str):
            return str(value)
        
        if allow_tags:
            # Use bleach to sanitize HTML
            sanitized = bleach.clean(
                value,
                tags=ValidationConfig.ALLOWED_TAGS,
                attributes=ValidationConfig.ALLOWED_ATTRIBUTES,
                strip=True
            )
        else:
            # Strip all HTML tags
            sanitized = bleach.clean(value, tags=[], strip=True)
        
        return sanitized
    
    @staticmethod
    def sanitize_email(value: str) -> str:
        """Sanitize email input"""
        if not isinstance(value, str):
            return ""
        
        value = value.strip().lower()
        value = InputSanitizer.sanitize_string(value, ValidationConfig.MAX_EMAIL_LENGTH)
        
        return value
    
    @staticmethod
    def sanitize_phone(value: str) -> str:
        """Sanitize phone number input"""
        if not isinstance(value, str):
            return ""
        
        # Remove all non-digit and non-plus characters
        value = re.sub(r'[^\d+]', '', value)
        
        # Truncate if too long
        if len(value) > ValidationConfig.MAX_PHONE_LENGTH:
            value = value[:ValidationConfig.MAX_PHONE_LENGTH]
        
        return value
    
    @staticmethod
    def sanitize_url(value: str) -> str:
        """Sanitize URL input"""
        if not isinstance(value, str):
            return ""
        
        value = value.strip()
        value = InputSanitizer.sanitize_string(value, ValidationConfig.MAX_URL_LENGTH)
        
        return value
    
    @staticmethod
    def sanitize_json(value: Any, max_depth: int = ValidationConfig.MAX_JSON_DEPTH) -> Any:
        """Sanitize JSON data recursively"""
        if max_depth <= 0:
            return None
        
        if isinstance(value, dict):
            return {
                InputSanitizer.sanitize_string(k): InputSanitizer.sanitize_json(v, max_depth - 1)
                for k, v in value.items()
            }
        elif isinstance(value, list):
            if len(value) > ValidationConfig.MAX_ARRAY_LENGTH:
                value = value[:ValidationConfig.MAX_ARRAY_LENGTH]
            return [InputSanitizer.sanitize_json(item, max_depth - 1) for item in value]
        elif isinstance(value, str):
            return InputSanitizer.sanitize_string(value)
        else:
            return value


class InputValidator:
    """Comprehensive input validation utility"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        if not email or len(email) > ValidationConfig.MAX_EMAIL_LENGTH:
            return False
        return bool(ValidationConfig.EMAIL_REGEX.match(email))
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format"""
        if not phone or len(phone) > ValidationConfig.MAX_PHONE_LENGTH:
            return False
        return bool(ValidationConfig.PHONE_REGEX.match(phone))
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format"""
        if not url or len(url) > ValidationConfig.MAX_URL_LENGTH:
            return False
        return bool(ValidationConfig.URL_REGEX.match(url))
    
    @staticmethod
    def validate_uuid(uuid_str: str) -> bool:
        """Validate UUID format"""
        if not uuid_str:
            return False
        return bool(ValidationConfig.UUID_REGEX.match(uuid_str))
    
    @staticmethod
    def detect_sql_injection(value: str) -> bool:
        """Detect potential SQL injection attempts"""
        if not isinstance(value, str):
            return False
        
        value_lower = value.lower()
        for pattern in ValidationConfig.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def detect_xss(value: str) -> bool:
        """Detect potential XSS attempts"""
        if not isinstance(value, str):
            return False
        
        value_lower = value.lower()
        for pattern in ValidationConfig.XSS_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE | re.DOTALL):
                return True
        return False
    
    @staticmethod
    def detect_path_traversal(value: str) -> bool:
        """Detect potential path traversal attempts"""
        if not isinstance(value, str):
            return False
        
        value_lower = value.lower()
        for pattern in ValidationConfig.PATH_TRAVERSAL_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def validate_string_length(value: str, max_length: int, min_length: int = 0) -> bool:
        """Validate string length"""
        if not isinstance(value, str):
            return False
        return min_length <= len(value) <= max_length
    
    @staticmethod
    def validate_alphanumeric(value: str, allow_underscore: bool = True, allow_dash: bool = True) -> bool:
        """Validate alphanumeric string"""
        if not isinstance(value, str):
            return False
        
        pattern = r'^[a-zA-Z0-9'
        if allow_underscore:
            pattern += '_'
        if allow_dash:
            pattern += '-'
        pattern += ']+$'
        
        return bool(re.match(pattern, value))


class SecurityValidator:
    """Security-focused validation"""
    
    @staticmethod
    def is_safe_input(value: Any) -> bool:
        """Comprehensive safety check for input"""
        if isinstance(value, str):
            # Check for malicious patterns
            if (InputValidator.detect_sql_injection(value) or
                InputValidator.detect_xss(value) or
                InputValidator.detect_path_traversal(value)):
                return False
            
            # Check for suspicious patterns
            suspicious_patterns = [
                r'eval\s*\(',
                r'exec\s*\(',
                r'system\s*\(',
                r'shell_exec\s*\(',
                r'passthru\s*\(',
                r'file_get_contents\s*\(',
                r'file_put_contents\s*\(',
                r'fopen\s*\(',
                r'include\s*\(',
                r'require\s*\(',
                r'import\s+os',
                r'import\s+subprocess',
                r'__import__\s*\(',
            ]
            
            value_lower = value.lower()
            for pattern in suspicious_patterns:
                if re.search(pattern, value_lower, re.IGNORECASE):
                    return False
        
        return True
    
    @staticmethod
    def validate_file_content(content: bytes, allowed_types: List[str]) -> bool:
        """Validate file content based on magic bytes"""
        if not content:
            return False
        
        # File type signatures (magic bytes)
        file_signatures = {
            'pdf': [b'%PDF'],
            'docx': [b'PK\x03\x04'],
            'doc': [b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1'],
            'jpg': [b'\xff\xd8\xff'],
            'jpeg': [b'\xff\xd8\xff'],
            'png': [b'\x89PNG\r\n\x1a\n'],
            'gif': [b'GIF87a', b'GIF89a'],
            'txt': [b''],  # Text files can start with anything
        }
        
        for file_type in allowed_types:
            if file_type.lower() in file_signatures:
                signatures = file_signatures[file_type.lower()]
                for signature in signatures:
                    if not signature or content.startswith(signature):
                        return True
        
        return False


class InputValidationMiddleware(BaseHTTPMiddleware):
    """Middleware for comprehensive input validation and sanitization"""
    
    def __init__(self, app, strict_mode: bool = True):
        super().__init__(app)
        self.strict_mode = strict_mode
        self.sanitizer = InputSanitizer()
        self.validator = InputValidator()
        self.security_validator = SecurityValidator()
    
    async def dispatch(self, request: Request, call_next):
        """Process request with input validation"""
        start_time = datetime.utcnow()
        
        try:
            # Validate request path
            if self.validator.detect_path_traversal(str(request.url.path)):
                logger.warning(
                    "Path traversal attempt detected",
                    path=request.url.path,
                    client_ip=request.client.host if request.client else None
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request path"
                )
            
            # Validate query parameters
            await self._validate_query_params(request)
            
            # Validate request body for POST/PUT/PATCH
            if request.method in ['POST', 'PUT', 'PATCH']:
                await self._validate_request_body(request)
            
            # Process request
            response = await call_next(request)
            
            # Log validation metrics
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            if processing_time > 0.1:  # Log slow validation
                logger.info(
                    "Input validation completed",
                    method=request.method,
                    path=request.url.path,
                    processing_time=processing_time
                )
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Input validation error",
                error=str(e),
                path=request.url.path,
                method=request.method
            )
            if self.strict_mode:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request data"
                )
            else:
                return await call_next(request)
    
    async def _validate_query_params(self, request: Request):
        """Validate query parameters"""
        for key, value in request.query_params.items():
            # Check parameter name
            if not self.validator.validate_alphanumeric(key, allow_underscore=True):
                if self.strict_mode:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid query parameter name: {key}"
                    )
            
            # Check parameter value
            if not self.security_validator.is_safe_input(value):
                logger.warning(
                    "Malicious query parameter detected",
                    key=key,
                    value=value[:100],  # Log first 100 chars only
                    client_ip=request.client.host if request.client else None
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid query parameter value"
                )
            
            # Check length
            if len(value) > ValidationConfig.MAX_STRING_LENGTH:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Query parameter value too long"
                )
    
    async def _validate_request_body(self, request: Request):
        """Validate request body"""
        try:
            # Get content type
            content_type = request.headers.get('content-type', '')
            
            if 'application/json' in content_type:
                # Read and validate JSON body
                body = await request.body()
                if len(body) > 10 * 1024 * 1024:  # 10MB limit
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Request body too large"
                    )
                
                if body:
                    try:
                        json_data = json.loads(body)
                        self._validate_json_recursively(json_data)
                    except json.JSONDecodeError:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Invalid JSON format"
                        )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Request body validation error", error=str(e))
            if self.strict_mode:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request body"
                )
    
    def _validate_json_recursively(self, data: Any, depth: int = 0):
        """Recursively validate JSON data"""
        if depth > ValidationConfig.MAX_JSON_DEPTH:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="JSON nesting too deep"
            )
        
        if isinstance(data, dict):
            if len(data) > 1000:  # Limit number of keys
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Too many JSON object keys"
                )
            
            for key, value in data.items():
                # Validate key
                if not isinstance(key, str):
                    continue
                
                if len(key) > 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="JSON key too long"
                    )
                
                if not self.security_validator.is_safe_input(key):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid JSON key"
                    )
                
                # Validate value recursively
                self._validate_json_recursively(value, depth + 1)
        
        elif isinstance(data, list):
            if len(data) > ValidationConfig.MAX_ARRAY_LENGTH:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="JSON array too long"
                )
            
            for item in data:
                self._validate_json_recursively(item, depth + 1)
        
        elif isinstance(data, str):
            if len(data) > ValidationConfig.MAX_TEXT_LENGTH:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="JSON string value too long"
                )
            
            if not self.security_validator.is_safe_input(data):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid JSON string value"
                )


# Validation decorators for Pydantic models
def sanitize_input(func):
    """Decorator to sanitize function inputs"""
    def wrapper(*args, **kwargs):
        sanitized_args = []
        sanitized_kwargs = {}
        
        # Sanitize args
        for arg in args:
            if isinstance(arg, str):
                sanitized_args.append(InputSanitizer.sanitize_string(arg))
            else:
                sanitized_args.append(arg)
        
        # Sanitize kwargs
        for key, value in kwargs.items():
            if isinstance(value, str):
                sanitized_kwargs[key] = InputSanitizer.sanitize_string(value)
            else:
                sanitized_kwargs[key] = value
        
        return func(*sanitized_args, **sanitized_kwargs)
    
    return wrapper


# Export main components
__all__ = [
    'ValidationConfig',
    'InputSanitizer',
    'InputValidator',
    'SecurityValidator',
    'InputValidationMiddleware',
    'sanitize_input'
]