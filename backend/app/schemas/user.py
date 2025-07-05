"""
CounselFlow Ultimate V3 - User Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    IN_HOUSE_COUNSEL = "IN_HOUSE_COUNSEL"
    LEGAL_OPS = "LEGAL_OPS"
    EXTERNAL_COUNSEL = "EXTERNAL_COUNSEL"
    BUSINESS_STAKEHOLDER = "BUSINESS_STAKEHOLDER"


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: Optional[UserRole] = UserRole.BUSINESS_STAKEHOLDER
    active: Optional[bool] = True
    tenant_id: Optional[str] = None


class UserCreate(UserBase):
    password: str
    
    @validator('password')
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


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    active: Optional[bool] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: UserRole
    active: bool
    email_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True