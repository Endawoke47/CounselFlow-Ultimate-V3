"""
CounselFlow Ultimate V3 - Application Configuration
"""

import os
from typing import List, Optional, Any
from pydantic import BaseSettings, validator, Field
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    APP_NAME: str = "CounselFlow Ultimate V3"
    VERSION: str = "3.0.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    AUTO_MIGRATE: bool = Field(default=True, env="AUTO_MIGRATE")
    DB_ECHO: bool = Field(default=False, env="DB_ECHO")
    
    # Redis
    REDIS_URL: str = Field(..., env="REDIS_URL")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, env="ANTHROPIC_API_KEY")
    GOOGLE_API_KEY: Optional[str] = Field(default=None, env="GOOGLE_API_KEY")
    
    # AI Configuration
    DEFAULT_AI_MODEL: str = Field(default="gpt-4", env="DEFAULT_AI_MODEL")
    AI_MAX_TOKENS: int = Field(default=4000, env="AI_MAX_TOKENS")
    AI_TEMPERATURE: float = Field(default=0.1, env="AI_TEMPERATURE")
    AI_REQUEST_TIMEOUT: int = Field(default=120, env="AI_REQUEST_TIMEOUT")
    
    # Document & E-signature
    DOCUSIGN_INTEGRATION_KEY: Optional[str] = Field(default=None, env="DOCUSIGN_INTEGRATION_KEY")
    DOCUSIGN_USER_ID: Optional[str] = Field(default=None, env="DOCUSIGN_USER_ID")
    DOCUSIGN_ACCOUNT_ID: Optional[str] = Field(default=None, env="DOCUSIGN_ACCOUNT_ID")
    DOCUSIGN_PRIVATE_KEY_PATH: Optional[str] = Field(default=None, env="DOCUSIGN_PRIVATE_KEY_PATH")
    
    ADOBE_SIGN_CLIENT_ID: Optional[str] = Field(default=None, env="ADOBE_SIGN_CLIENT_ID")
    ADOBE_SIGN_CLIENT_SECRET: Optional[str] = Field(default=None, env="ADOBE_SIGN_CLIENT_SECRET")
    ADOBE_SIGN_REDIRECT_URI: Optional[str] = Field(default=None, env="ADOBE_SIGN_REDIRECT_URI")
    
    # File Upload & Storage
    MAX_FILE_SIZE_MB: int = Field(default=50, env="MAX_FILE_SIZE_MB")
    ALLOWED_FILE_TYPES: str = Field(default="pdf,doc,docx,txt,jpg,png", env="ALLOWED_FILE_TYPES")
    UPLOAD_DIR: str = Field(default="/app/uploads", env="UPLOAD_DIR")
    
    # Email Configuration
    SMTP_HOST: Optional[str] = Field(default=None, env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: Optional[str] = Field(default=None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    FROM_EMAIL: str = Field(default="noreply@counselflow.com", env="FROM_EMAIL")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=100, env="RATE_LIMIT_PER_MINUTE")
    RATE_LIMIT_BURST: int = Field(default=10, env="RATE_LIMIT_BURST")
    
    # Monitoring & Analytics
    SENTRY_DSN: Optional[str] = Field(default=None, env="SENTRY_DSN")
    ANALYTICS_ENABLED: bool = Field(default=True, env="ANALYTICS_ENABLED")
    
    # Backup
    BACKUP_RETENTION_DAYS: int = Field(default=7, env="BACKUP_RETENTION_DAYS")
    BACKUP_SCHEDULE: str = Field(default="0 2 * * *", env="BACKUP_SCHEDULE")  # Daily at 2 AM
    
    # Multi-tenancy
    MULTI_TENANT: bool = Field(default=False, env="MULTI_TENANT")
    DEFAULT_TENANT: str = Field(default="counselflow", env="DEFAULT_TENANT")
    
    # Compliance & Audit
    AUDIT_LOG_ENABLED: bool = Field(default=True, env="AUDIT_LOG_ENABLED")
    ENCRYPTION_AT_REST: bool = Field(default=True, env="ENCRYPTION_AT_REST")
    DATA_RETENTION_DAYS: int = Field(default=2555, env="DATA_RETENTION_DAYS")  # 7 years
    
    # Development & Testing
    ENABLE_SWAGGER_DOCS: bool = Field(default=True, env="ENABLE_SWAGGER_DOCS")
    ENABLE_CORS: bool = Field(default=True, env="ENABLE_CORS")
    CORS_ORIGINS: str = Field(default="http://localhost:3000,http://localhost:5173", env="CORS_ORIGINS")
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        if v not in ["development", "staging", "production"]:
            raise ValueError("ENVIRONMENT must be one of: development, staging, production")
        return v
    
    @validator("LOG_LEVEL")
    def validate_log_level(cls, v):
        if v not in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]:
            raise ValueError("LOG_LEVEL must be one of: DEBUG, INFO, WARNING, ERROR, CRITICAL")
        return v
    
    @validator("ALLOWED_FILE_TYPES")
    def validate_file_types(cls, v):
        """Convert comma-separated string to list"""
        return [ext.strip().lower() for ext in v.split(",")]
    
    @validator("CORS_ORIGINS")
    def validate_cors_origins(cls, v):
        """Convert comma-separated string to list"""
        return [origin.strip() for origin in v.split(",")]
    
    @property
    def database_url_async(self) -> str:
        """Get async database URL for asyncpg"""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    @property
    def redis_url_parsed(self) -> dict:
        """Parse Redis URL into components"""
        from urllib.parse import urlparse
        parsed = urlparse(self.REDIS_URL)
        return {
            "host": parsed.hostname or "localhost",
            "port": parsed.port or 6379,
            "password": parsed.password,
            "db": self.REDIS_DB,
        }
    
    @property
    def ai_services_configured(self) -> dict:
        """Check which AI services are configured"""
        return {
            "openai": bool(self.OPENAI_API_KEY),
            "anthropic": bool(self.ANTHROPIC_API_KEY),
            "google": bool(self.GOOGLE_API_KEY),
        }
    
    @property
    def email_configured(self) -> bool:
        """Check if email is configured"""
        return bool(self.SMTP_HOST and self.SMTP_USER and self.SMTP_PASSWORD)
    
    @property
    def docusign_configured(self) -> bool:
        """Check if DocuSign is configured"""
        return bool(
            self.DOCUSIGN_INTEGRATION_KEY and 
            self.DOCUSIGN_USER_ID and 
            self.DOCUSIGN_ACCOUNT_ID
        )
    
    @property
    def adobe_sign_configured(self) -> bool:
        """Check if Adobe Sign is configured"""
        return bool(
            self.ADOBE_SIGN_CLIENT_ID and 
            self.ADOBE_SIGN_CLIENT_SECRET
        )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()


# Environment-specific configurations
class DevelopmentConfig(Settings):
    """Development environment configuration"""
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    ENABLE_SWAGGER_DOCS: bool = True
    DB_ECHO: bool = True


class StagingConfig(Settings):
    """Staging environment configuration"""
    ENVIRONMENT: str = "staging"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    ENABLE_SWAGGER_DOCS: bool = True
    DB_ECHO: bool = False


class ProductionConfig(Settings):
    """Production environment configuration"""
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    LOG_LEVEL: str = "WARNING"
    ENABLE_SWAGGER_DOCS: bool = False
    DB_ECHO: bool = False
    ENABLE_CORS: bool = False


def get_config_by_environment(env: str) -> Settings:
    """Get configuration class by environment name"""
    configs = {
        "development": DevelopmentConfig,
        "staging": StagingConfig,
        "production": ProductionConfig,
    }
    
    config_class = configs.get(env, DevelopmentConfig)
    return config_class()


# Feature flags
class FeatureFlags:
    """Feature flags for controlling application features"""
    
    AI_FEATURES = True
    CONTRACT_ANALYSIS = True
    DOCUMENT_GENERATION = True
    IP_MANAGEMENT = True
    PRIVACY_FEATURES = True
    RISK_MANAGEMENT = True
    DISPUTE_MANAGEMENT = True
    E_SIGNATURE = True
    ADVANCED_ANALYTICS = True
    AUDIT_LOGGING = True
    NOTIFICATIONS = True
    
    @classmethod
    def is_enabled(cls, feature: str) -> bool:
        """Check if a feature is enabled"""
        return getattr(cls, feature.upper(), False)


# Application constants
class Constants:
    """Application-wide constants"""
    
    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # File sizes (in bytes)
    MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB
    MAX_DOCUMENT_SIZE = 50 * 1024 * 1024  # 50MB
    
    # AI limits
    MAX_AI_PROMPT_LENGTH = 100000  # 100k characters
    MAX_AI_RESPONSE_LENGTH = 50000  # 50k characters
    
    # Security
    PASSWORD_MIN_LENGTH = 8
    PASSWORD_RESET_TOKEN_EXPIRE_HOURS = 24
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS = 48
    
    # Business rules
    CONTRACT_EXPIRY_WARNING_DAYS = 30
    TASK_OVERDUE_WARNING_HOURS = 24
    MATTER_INACTIVE_WARNING_DAYS = 90
    
    # Supported file types by category
    DOCUMENT_TYPES = ["pdf", "doc", "docx", "txt", "rtf"]
    IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "bmp"]
    ARCHIVE_TYPES = ["zip", "rar", "7z"]
    
    # Default AI models
    DEFAULT_MODELS = {
        "openai": "gpt-4",
        "anthropic": "claude-3-sonnet-20240229",
        "google": "gemini-pro",
    }
    
    # Risk scoring thresholds
    RISK_SCORE_THRESHOLDS = {
        "low": 3.0,
        "medium": 6.0,
        "high": 8.0,
        "critical": 10.0,
    }
    
    # Compliance frameworks
    COMPLIANCE_FRAMEWORKS = [
        "GDPR", "CCPA", "HIPAA", "SOX", "PCI_DSS", 
        "FERPA", "COPPA", "ISO27001", "SOC2"
    ]
    
    # Legal jurisdictions
    JURISDICTIONS = [
        "US", "UK", "EU", "CA", "AU", "DE", "FR", "JP", "SG"
    ]