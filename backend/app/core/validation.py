"""
CounselFlow Ultimate V3 - Core Validation Utilities
Enhanced validation schemas and utilities for data integrity
"""

from typing import Any, Dict, List, Optional, Union, Callable
from pydantic import BaseModel, validator, Field, root_validator
from datetime import datetime, date
from decimal import Decimal
import re
import uuid
from enum import Enum

from app.middleware.input_validation import (
    InputValidator, InputSanitizer, SecurityValidator, ValidationConfig
)


class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message: str, field: str = None, value: Any = None):
        self.message = message
        self.field = field
        self.value = value
        super().__init__(message)


class ValidatedBaseModel(BaseModel):
    """Enhanced base model with comprehensive validation"""
    
    class Config:
        # Enable validation on assignment
        validate_assignment = True
        # Use enum values
        use_enum_values = True
        # Allow population by field name
        allow_population_by_field_name = True
        # Extra fields are forbidden by default
        extra = "forbid"
        # JSON encoders for special types
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat(),
            Decimal: lambda v: float(v),
            uuid.UUID: lambda v: str(v)
        }
    
    @root_validator(pre=True)
    def sanitize_inputs(cls, values):
        """Sanitize all string inputs"""
        if not isinstance(values, dict):
            return values
        
        sanitized = {}
        for field_name, value in values.items():
            if isinstance(value, str):
                # Basic sanitization for all string fields
                sanitized[field_name] = InputSanitizer.sanitize_string(value)
            elif isinstance(value, dict):
                # Recursively sanitize nested dictionaries
                sanitized[field_name] = InputSanitizer.sanitize_json(value)
            elif isinstance(value, list):
                # Sanitize lists
                sanitized[field_name] = InputSanitizer.sanitize_json(value)
            else:
                sanitized[field_name] = value
        
        return sanitized
    
    @root_validator
    def validate_security(cls, values):
        """Security validation for all fields"""
        for field_name, value in values.items():
            if isinstance(value, str) and not SecurityValidator.is_safe_input(value):
                raise ValidationError(
                    f"Security validation failed for field '{field_name}'",
                    field=field_name,
                    value=value
                )
        return values


# Field validators
class SecureStr(str):
    """String type with security validation"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        
        # Security validation
        if not SecurityValidator.is_safe_input(v):
            raise ValueError('Input contains potentially malicious content')
        
        # Sanitize
        sanitized = InputSanitizer.sanitize_string(v)
        return cls(sanitized)


class EmailStr(str):
    """Email string with validation"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        
        # Sanitize first
        sanitized = InputSanitizer.sanitize_email(v)
        
        # Validate format
        if not InputValidator.validate_email(sanitized):
            raise ValueError('Invalid email format')
        
        return cls(sanitized)


class PhoneStr(str):
    """Phone number string with validation"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        
        # Sanitize first
        sanitized = InputSanitizer.sanitize_phone(v)
        
        # Validate format
        if not InputValidator.validate_phone(sanitized):
            raise ValueError('Invalid phone number format')
        
        return cls(sanitized)


class URLStr(str):
    """URL string with validation"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        
        # Sanitize first
        sanitized = InputSanitizer.sanitize_url(v)
        
        # Validate format
        if not InputValidator.validate_url(sanitized):
            raise ValueError('Invalid URL format')
        
        return cls(sanitized)


class UUIDStr(str):
    """UUID string with validation"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        
        # Validate UUID format
        if not InputValidator.validate_uuid(v):
            raise ValueError('Invalid UUID format')
        
        return cls(v)


class SafeHTMLStr(str):
    """HTML string with sanitization"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        
        # Sanitize HTML
        sanitized = InputSanitizer.sanitize_html(v, allow_tags=True)
        
        return cls(sanitized)


class PlainTextStr(str):
    """Plain text string (HTML stripped)"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        
        # Strip HTML and sanitize
        sanitized = InputSanitizer.sanitize_html(v, allow_tags=False)
        sanitized = InputSanitizer.sanitize_string(sanitized)
        
        return cls(sanitized)


# Common validation schemas
class UserValidationMixin(BaseModel):
    """Mixin for user-related validation"""
    
    @validator('email', pre=True)
    def validate_email_field(cls, v):
        if v:
            return EmailStr.validate(v)
        return v
    
    @validator('phone', pre=True)
    def validate_phone_field(cls, v):
        if v:
            return PhoneStr.validate(v)
        return v
    
    @validator('first_name', 'last_name', pre=True)
    def validate_name_fields(cls, v):
        if v:
            sanitized = InputSanitizer.sanitize_string(v, ValidationConfig.MAX_NAME_LENGTH)
            if not sanitized.replace(' ', '').replace('-', '').replace("'", '').isalpha():
                raise ValueError('Name contains invalid characters')
            return sanitized
        return v


class ClientValidationMixin(BaseModel):
    """Mixin for client-related validation"""
    
    @validator('name', pre=True)
    def validate_client_name(cls, v):
        if v:
            sanitized = InputSanitizer.sanitize_string(v, ValidationConfig.MAX_NAME_LENGTH)
            if len(sanitized.strip()) < 2:
                raise ValueError('Client name must be at least 2 characters')
            return sanitized
        return v
    
    @validator('website', pre=True)
    def validate_website_field(cls, v):
        if v:
            return URLStr.validate(v)
        return v
    
    @validator('annual_revenue', pre=True)
    def validate_annual_revenue(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError('Annual revenue cannot be negative')
            if v > 1e15:  # 1 quadrillion limit
                raise ValueError('Annual revenue value too large')
        return v
    
    @validator('employee_count', pre=True)
    def validate_employee_count(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError('Employee count cannot be negative')
            if v > 10000000:  # 10 million limit
                raise ValueError('Employee count too large')
        return v


class ContractValidationMixin(BaseModel):
    """Mixin for contract-related validation"""
    
    @validator('title', pre=True)
    def validate_contract_title(cls, v):
        if v:
            sanitized = InputSanitizer.sanitize_string(v, ValidationConfig.MAX_NAME_LENGTH)
            if len(sanitized.strip()) < 3:
                raise ValueError('Contract title must be at least 3 characters')
            return sanitized
        return v
    
    @validator('contract_value', pre=True)
    def validate_contract_value(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError('Contract value cannot be negative')
            if v > 1e12:  # 1 trillion limit
                raise ValueError('Contract value too large')
        return v
    
    @validator('content', pre=True)
    def validate_contract_content(cls, v):
        if v:
            # Allow HTML but sanitize it
            return SafeHTMLStr.validate(v)
        return v
    
    @validator('start_date', 'end_date', 'execution_date', 'renewal_date', pre=True)
    def validate_dates(cls, v):
        if v:
            if isinstance(v, str):
                try:
                    # Try to parse ISO format
                    datetime.fromisoformat(v.replace('Z', '+00:00'))
                except ValueError:
                    raise ValueError('Invalid date format. Use ISO format (YYYY-MM-DD)')
        return v


class MatterValidationMixin(BaseModel):
    """Mixin for matter-related validation"""
    
    @validator('title', pre=True)
    def validate_matter_title(cls, v):
        if v:
            sanitized = InputSanitizer.sanitize_string(v, ValidationConfig.MAX_NAME_LENGTH)
            if len(sanitized.strip()) < 3:
                raise ValueError('Matter title must be at least 3 characters')
            return sanitized
        return v
    
    @validator('matter_number', pre=True)
    def validate_matter_number(cls, v):
        if v:
            sanitized = InputSanitizer.sanitize_string(v, 50)
            if not re.match(r'^[A-Za-z0-9\-_]+$', sanitized):
                raise ValueError('Matter number can only contain letters, numbers, hyphens, and underscores')
            return sanitized
        return v
    
    @validator('budget_amount', 'estimated_value', pre=True)
    def validate_financial_fields(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError('Financial amounts cannot be negative')
            if v > 1e12:  # 1 trillion limit
                raise ValueError('Financial amount too large')
        return v
    
    @validator('estimated_hours', pre=True)
    def validate_estimated_hours(cls, v):
        if v is not None:
            if v < 0:
                raise ValueError('Estimated hours cannot be negative')
            if v > 100000:  # 100k hours limit (about 48 years full-time)
                raise ValueError('Estimated hours too large')
        return v


class FileValidationMixin(BaseModel):
    """Mixin for file-related validation"""
    
    @validator('filename', pre=True)
    def validate_filename(cls, v):
        if v:
            # Sanitize filename
            sanitized = re.sub(r'[<>:"/\\|?*]', '_', v)
            sanitized = sanitized.strip()
            
            if len(sanitized) > 255:
                sanitized = sanitized[:255]
            
            if not sanitized or sanitized in ['.', '..']:
                raise ValueError('Invalid filename')
            
            return sanitized
        return v
    
    @validator('file_size', pre=True)
    def validate_file_size(cls, v):
        if v is not None:
            max_size = 100 * 1024 * 1024  # 100MB
            if v < 0:
                raise ValueError('File size cannot be negative')
            if v > max_size:
                raise ValueError(f'File size too large. Maximum allowed: {max_size} bytes')
        return v


# Comprehensive validation utilities
class DataValidator:
    """Comprehensive data validation utility"""
    
    @staticmethod
    def validate_pagination(skip: int = 0, limit: int = 20) -> tuple[int, int]:
        """Validate pagination parameters"""
        if skip < 0:
            skip = 0
        if limit < 1:
            limit = 1
        if limit > 1000:  # Maximum page size
            limit = 1000
        
        return skip, limit
    
    @staticmethod
    def validate_search_query(query: str) -> str:
        """Validate and sanitize search query"""
        if not query:
            return ""
        
        # Sanitize
        sanitized = InputSanitizer.sanitize_string(query, 500)
        
        # Remove SQL injection patterns
        if InputValidator.detect_sql_injection(sanitized):
            raise ValidationError("Invalid search query")
        
        return sanitized
    
    @staticmethod
    def validate_sort_field(field: str, allowed_fields: List[str]) -> str:
        """Validate sort field"""
        if not field:
            return allowed_fields[0] if allowed_fields else "id"
        
        # Sanitize field name
        sanitized = re.sub(r'[^a-zA-Z0-9_]', '', field)
        
        # Check if field is allowed
        if sanitized not in allowed_fields:
            raise ValidationError(f"Invalid sort field. Allowed: {', '.join(allowed_fields)}")
        
        return sanitized
    
    @staticmethod
    def validate_filter_values(filters: Dict[str, Any], allowed_filters: Dict[str, type]) -> Dict[str, Any]:
        """Validate filter values"""
        validated = {}
        
        for key, value in filters.items():
            if key not in allowed_filters:
                continue
            
            expected_type = allowed_filters[key]
            
            try:
                if expected_type == str:
                    validated[key] = InputSanitizer.sanitize_string(str(value))
                elif expected_type == int:
                    validated[key] = int(value)
                elif expected_type == float:
                    validated[key] = float(value)
                elif expected_type == bool:
                    validated[key] = bool(value) if not isinstance(value, str) else value.lower() in ['true', '1', 'yes']
                else:
                    validated[key] = value
            except (ValueError, TypeError):
                raise ValidationError(f"Invalid value for filter '{key}'")
        
        return validated
    
    @staticmethod
    def validate_date_range(start_date: Optional[str], end_date: Optional[str]) -> tuple[Optional[datetime], Optional[datetime]]:
        """Validate date range"""
        start_dt = None
        end_dt = None
        
        if start_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            except ValueError:
                raise ValidationError("Invalid start date format")
        
        if end_date:
            try:
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            except ValueError:
                raise ValidationError("Invalid end date format")
        
        if start_dt and end_dt and start_dt > end_dt:
            raise ValidationError("Start date cannot be after end date")
        
        return start_dt, end_dt


# Validation function factory
def create_validator(
    field_name: str,
    field_type: type,
    required: bool = False,
    min_length: Optional[int] = None,
    max_length: Optional[int] = None,
    pattern: Optional[str] = None,
    custom_validator: Optional[Callable] = None
) -> Callable:
    """Create a custom field validator"""
    
    def validator_func(cls, v):
        # Required check
        if required and not v:
            raise ValueError(f'{field_name} is required')
        
        if v is None:
            return v
        
        # Type check
        if not isinstance(v, field_type):
            try:
                v = field_type(v)
            except (ValueError, TypeError):
                raise ValueError(f'{field_name} must be of type {field_type.__name__}')
        
        # String-specific validations
        if field_type == str:
            # Length check
            if min_length is not None and len(v) < min_length:
                raise ValueError(f'{field_name} must be at least {min_length} characters')
            
            if max_length is not None and len(v) > max_length:
                raise ValueError(f'{field_name} must not exceed {max_length} characters')
            
            # Pattern check
            if pattern and not re.match(pattern, v):
                raise ValueError(f'{field_name} format is invalid')
            
            # Security check
            if not SecurityValidator.is_safe_input(v):
                raise ValueError(f'{field_name} contains invalid content')
            
            # Sanitize
            v = InputSanitizer.sanitize_string(v, max_length or ValidationConfig.MAX_STRING_LENGTH)
        
        # Custom validation
        if custom_validator:
            v = custom_validator(v)
        
        return v
    
    return validator_func


# Export main components
__all__ = [
    'ValidationError',
    'ValidatedBaseModel',
    'SecureStr',
    'EmailStr',
    'PhoneStr',
    'URLStr',
    'UUIDStr',
    'SafeHTMLStr',
    'PlainTextStr',
    'UserValidationMixin',
    'ClientValidationMixin',
    'ContractValidationMixin',
    'MatterValidationMixin',
    'FileValidationMixin',
    'DataValidator',
    'create_validator'
]