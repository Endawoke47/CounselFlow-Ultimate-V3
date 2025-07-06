"""
CounselFlow Ultimate V3 - Enhanced Logging Configuration
"""

import json
import os
import sys
from typing import Dict, Any, Optional, List
from datetime import datetime
from pathlib import Path
import structlog
import logging
import logging.handlers
from pythonjsonlogger import jsonlogger

from app.core.config import settings


class ContextualFilter(logging.Filter):
    """Add contextual information to log records"""
    
    def filter(self, record):
        # Add standard fields
        record.service = "counselflow"
        record.version = "3.0.0"
        record.environment = settings.ENVIRONMENT
        record.hostname = os.getenv("HOSTNAME", "unknown")
        
        # Add correlation ID if available
        if hasattr(record, 'correlation_id'):
            record.correlation_id = getattr(record, 'correlation_id', None)
        
        return True


class SensitiveDataFilter(logging.Filter):
    """Filter out sensitive data from logs"""
    
    SENSITIVE_FIELDS = [
        'password', 'passwd', 'secret', 'token', 'key', 'authorization',
        'credit_card', 'ssn', 'social_security', 'api_key', 'private_key',
        'access_token', 'refresh_token', 'session_id', 'cookie'
    ]
    
    def filter(self, record):
        if hasattr(record, 'args') and record.args:
            # Filter args tuple
            record.args = self._filter_args(record.args)
        
        # Filter the message
        if hasattr(record, 'getMessage'):
            original_get_message = record.getMessage
            
            def safe_get_message():
                message = original_get_message()
                return self._filter_message(message)
            
            record.getMessage = safe_get_message
        
        return True
    
    def _filter_args(self, args):
        """Filter sensitive data from log arguments"""
        if isinstance(args, (list, tuple)):
            return tuple(self._filter_value(arg) for arg in args)
        return args
    
    def _filter_value(self, value):
        """Filter sensitive data from a single value"""
        if isinstance(value, dict):
            return {k: self._filter_value(v) if not self._is_sensitive_field(k) else "[FILTERED]" 
                   for k, v in value.items()}
        elif isinstance(value, str):
            return self._filter_message(value)
        elif isinstance(value, (list, tuple)):
            return [self._filter_value(item) for item in value]
        return value
    
    def _filter_message(self, message: str) -> str:
        """Filter sensitive data from log message"""
        # Simple pattern matching for common sensitive data patterns
        import re
        
        # Email addresses (partial masking)
        message = re.sub(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 
                        r'\1***@\2', message)
        
        # Credit card numbers
        message = re.sub(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', 
                        '[CREDIT_CARD_FILTERED]', message)
        
        # Social Security Numbers
        message = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN_FILTERED]', message)
        
        return message
    
    def _is_sensitive_field(self, field_name: str) -> bool:
        """Check if field name indicates sensitive data"""
        field_lower = field_name.lower()
        return any(sensitive in field_lower for sensitive in self.SENSITIVE_FIELDS)


class PerformanceFilter(logging.Filter):
    """Add performance metrics to log records"""
    
    def filter(self, record):
        # Add timing information if available
        if hasattr(record, 'duration'):
            record.performance = {
                'duration_ms': round(record.duration * 1000, 2),
                'slow_query': record.duration > 1.0 if hasattr(record, 'duration') else False
            }
        
        return True


class CustomJSONFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with enhanced structure"""
    
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        
        # Ensure timestamp is always present and properly formatted
        if not log_record.get('timestamp'):
            log_record['timestamp'] = datetime.utcnow().isoformat() + 'Z'
        
        # Add log level as both number and string
        log_record['level'] = record.levelname
        log_record['level_num'] = record.levelno
        
        # Add logger name
        log_record['logger'] = record.name
        
        # Add process and thread info
        log_record['process'] = record.process
        log_record['thread'] = record.thread
        
        # Add exception info if present
        if record.exc_info:
            log_record['exception'] = {
                'type': record.exc_info[0].__name__ if record.exc_info[0] else None,
                'message': str(record.exc_info[1]) if record.exc_info[1] else None,
                'traceback': self.formatException(record.exc_info) if record.exc_info else None
            }
        
        # Structure the log record for better searchability
        log_record['service'] = {
            'name': getattr(record, 'service', 'counselflow'),
            'version': getattr(record, 'version', '3.0.0'),
            'environment': getattr(record, 'environment', settings.ENVIRONMENT)
        }
        
        # Add request context if available
        if hasattr(record, 'request_id'):
            log_record['request'] = {
                'id': record.request_id,
                'method': getattr(record, 'method', None),
                'path': getattr(record, 'path', None),
                'user_id': getattr(record, 'user_id', None)
            }


class LoggingConfig:
    """Centralized logging configuration"""
    
    def __init__(self):
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        self.loggers_configured = False
    
    def configure_logging(self):
        """Configure comprehensive logging for the application"""
        if self.loggers_configured:
            return
        
        # Configure structlog
        self._configure_structlog()
        
        # Configure standard library logging
        self._configure_stdlib_logging()
        
        # Configure specific loggers
        self._configure_specific_loggers()
        
        self.loggers_configured = True
        
        # Log configuration completion
        logger = structlog.get_logger(__name__)
        logger.info(
            "Logging configuration completed",
            log_level=settings.LOG_LEVEL,
            environment=settings.ENVIRONMENT,
            log_directory=str(self.log_dir)
        )
    
    def _configure_structlog(self):
        """Configure structlog for structured logging"""
        processors = [
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
        ]
        
        # Add JSON processor for production, colored output for development
        if settings.ENVIRONMENT == "production":
            processors.append(structlog.processors.JSONRenderer())
        else:
            processors.append(structlog.dev.ConsoleRenderer(colors=True))
        
        structlog.configure(
            processors=processors,
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )
    
    def _configure_stdlib_logging(self):
        """Configure Python standard library logging"""
        # Set root logger level
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
        
        # Remove default handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
        
        # File handlers
        file_handlers = self._create_file_handlers()
        
        # JSON formatter for production, simple formatter for development
        if settings.ENVIRONMENT == "production":
            formatter = CustomJSONFormatter(
                fmt='%(timestamp)s %(level)s %(name)s %(message)s'
            )
        else:
            formatter = logging.Formatter(
                fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
        
        # Apply formatter and filters to all handlers
        all_handlers = [console_handler] + file_handlers
        
        for handler in all_handlers:
            handler.setFormatter(formatter)
            handler.addFilter(ContextualFilter())
            handler.addFilter(SensitiveDataFilter())
            handler.addFilter(PerformanceFilter())
            root_logger.addHandler(handler)
    
    def _create_file_handlers(self) -> List[logging.Handler]:
        """Create file handlers for different log levels"""
        handlers = []
        
        # Application log (all levels)
        app_handler = logging.handlers.RotatingFileHandler(
            filename=self.log_dir / "counselflow.log",
            maxBytes=50 * 1024 * 1024,  # 50MB
            backupCount=10,
            encoding='utf-8'
        )
        app_handler.setLevel(logging.DEBUG)
        handlers.append(app_handler)
        
        # Error log (warnings and errors only)
        error_handler = logging.handlers.RotatingFileHandler(
            filename=self.log_dir / "counselflow_errors.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.WARNING)
        handlers.append(error_handler)
        
        # Security log
        security_handler = logging.handlers.RotatingFileHandler(
            filename=self.log_dir / "counselflow_security.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=10,
            encoding='utf-8'
        )
        security_handler.setLevel(logging.INFO)
        security_handler.addFilter(self._create_security_filter())
        handlers.append(security_handler)
        
        # Audit log
        audit_handler = logging.handlers.RotatingFileHandler(
            filename=self.log_dir / "counselflow_audit.log",
            maxBytes=20 * 1024 * 1024,  # 20MB
            backupCount=20,
            encoding='utf-8'
        )
        audit_handler.setLevel(logging.INFO)
        audit_handler.addFilter(self._create_audit_filter())
        handlers.append(audit_handler)
        
        # Performance log
        performance_handler = logging.handlers.RotatingFileHandler(
            filename=self.log_dir / "counselflow_performance.log",
            maxBytes=20 * 1024 * 1024,  # 20MB
            backupCount=5,
            encoding='utf-8'
        )
        performance_handler.setLevel(logging.INFO)
        performance_handler.addFilter(self._create_performance_filter())
        handlers.append(performance_handler)
        
        return handlers
    
    def _create_security_filter(self):
        """Create filter for security-related logs"""
        class SecurityFilter(logging.Filter):
            def filter(self, record):
                security_keywords = [
                    'authentication', 'authorization', 'login', 'logout',
                    'permission', 'access', 'security', 'token', 'session',
                    'failed_login', 'suspicious', 'attack', 'breach'
                ]
                message = record.getMessage().lower()
                return any(keyword in message for keyword in security_keywords)
        
        return SecurityFilter()
    
    def _create_audit_filter(self):
        """Create filter for audit-related logs"""
        class AuditFilter(logging.Filter):
            def filter(self, record):
                audit_keywords = [
                    'created', 'updated', 'deleted', 'accessed', 'modified',
                    'audit', 'compliance', 'gdpr', 'contract_signed',
                    'document_uploaded', 'user_action'
                ]
                message = record.getMessage().lower()
                return any(keyword in message for keyword in audit_keywords)
        
        return AuditFilter()
    
    def _create_performance_filter(self):
        """Create filter for performance-related logs"""
        class PerformanceFilter(logging.Filter):
            def filter(self, record):
                performance_keywords = [
                    'slow', 'performance', 'duration', 'timeout', 'latency',
                    'query_time', 'response_time', 'memory', 'cpu'
                ]
                message = record.getMessage().lower()
                return (any(keyword in message for keyword in performance_keywords) or
                       hasattr(record, 'duration'))
        
        return PerformanceFilter()
    
    def _configure_specific_loggers(self):
        """Configure specific third-party loggers"""
        # Reduce verbosity of third-party libraries
        logging.getLogger("uvicorn").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("fastapi").setLevel(logging.WARNING)
        logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("openai").setLevel(logging.WARNING)
        logging.getLogger("anthropic").setLevel(logging.WARNING)
        
        # Configure database query logging
        if settings.DB_ECHO:
            logging.getLogger("sqlalchemy.engine").setLevel(logging.INFO)


# Context managers for structured logging
class LogContext:
    """Context manager for adding structured context to logs"""
    
    def __init__(self, **context):
        self.context = context
        self.logger = structlog.get_logger()
    
    def __enter__(self):
        self.bound_logger = self.logger.bind(**self.context)
        return self.bound_logger
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.bound_logger.error(
                "Context operation failed",
                exception_type=exc_type.__name__,
                exception_message=str(exc_val)
            )


class RequestLogContext:
    """Context manager for request-scoped logging"""
    
    def __init__(self, request_id: str, method: str, path: str, user_id: Optional[str] = None):
        self.context = {
            'request_id': request_id,
            'method': method,
            'path': path,
            'user_id': user_id
        }
        self.logger = structlog.get_logger()
    
    def __enter__(self):
        self.bound_logger = self.logger.bind(**self.context)
        self.bound_logger.info("Request started")
        return self.bound_logger
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.bound_logger.error(
                "Request failed",
                exception_type=exc_type.__name__,
                exception_message=str(exc_val)
            )
        else:
            self.bound_logger.info("Request completed")


# Utility functions
def get_logger(name: str = None) -> structlog.BoundLogger:
    """Get a structured logger instance"""
    return structlog.get_logger(name)


def log_user_action(
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    details: Optional[Dict[str, Any]] = None
):
    """Log user actions for audit purposes"""
    logger = get_logger("audit")
    logger.info(
        "User action performed",
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        audit=True
    )


def log_security_event(
    event_type: str,
    severity: str,
    details: Dict[str, Any],
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None
):
    """Log security events"""
    logger = get_logger("security")
    logger.warning(
        f"Security event: {event_type}",
        event_type=event_type,
        severity=severity,
        user_id=user_id,
        ip_address=ip_address,
        details=details,
        security=True
    )


def log_performance_metric(
    operation: str,
    duration: float,
    details: Optional[Dict[str, Any]] = None
):
    """Log performance metrics"""
    logger = get_logger("performance")
    logger.info(
        f"Performance metric: {operation}",
        operation=operation,
        duration=duration,
        is_slow=duration > 1.0,
        details=details or {},
        performance=True
    )


# Global configuration
logging_config = LoggingConfig()


def configure_logging():
    """Configure logging for the application"""
    logging_config.configure_logging()