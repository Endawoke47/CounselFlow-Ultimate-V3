"""
CounselFlow Ultimate V3 - Authentication Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from app.schemas.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    email: str
    role: UserRole


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None


class RefreshToken(BaseModel):
    refresh_token: str


class PasswordReset(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class EmailVerification(BaseModel):
    token: str


class SessionInfo(BaseModel):
    user_id: str
    email: str
    role: UserRole
    tenant_id: Optional[str] = None
    login_time: datetime
    ip_address: str
    user_agent: str
    last_activity: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ActiveSessions(BaseModel):
    active_sessions: list[SessionInfo]
    current_session: Optional[SessionInfo] = None