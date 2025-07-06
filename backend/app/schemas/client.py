"""
CounselFlow Ultimate V3 - Client Schemas
Enhanced with comprehensive validation and sanitization
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, validator
from enum import Enum

from app.core.validation import (
    ValidatedBaseModel, EmailStr, URLStr, ClientValidationMixin,
    DataValidator, ValidationError
)


class ClientStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    POTENTIAL = "POTENTIAL"
    FORMER = "FORMER"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ClientBase(ValidatedBaseModel, ClientValidationMixin):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[URLStr] = None
    description: Optional[str] = None
    status: Optional[ClientStatus] = ClientStatus.ACTIVE
    risk_level: Optional[RiskLevel] = RiskLevel.MEDIUM
    billing_contact: Optional[str] = None
    primary_contact: Optional[str] = None
    business_unit: Optional[str] = None
    annual_revenue: Optional[float] = None
    employee_count: Optional[int] = None
    jurisdiction: Optional[str] = None
    tenant_id: Optional[str] = None


class ClientCreate(ClientBase):
    pass  # Validation handled by ClientValidationMixin


class ClientUpdate(ValidatedBaseModel, ClientValidationMixin):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[URLStr] = None
    description: Optional[str] = None
    status: Optional[ClientStatus] = None
    risk_level: Optional[RiskLevel] = None
    billing_contact: Optional[str] = None
    primary_contact: Optional[str] = None
    business_unit: Optional[str] = None
    annual_revenue: Optional[float] = None
    employee_count: Optional[int] = None
    jurisdiction: Optional[str] = None


class ClientResponse(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    created_by: str
    
    # Related counts (from _count)
    matters_count: Optional[int] = 0
    contracts_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        """Custom from_orm to handle _count fields"""
        data = obj.__dict__.copy()
        
        # Handle _count field if present
        if hasattr(obj, '_count'):
            data['matters_count'] = getattr(obj._count, 'matters', 0)
            data['contracts_count'] = getattr(obj._count, 'contracts', 0)
        
        return cls(**data)


class ClientSearch(BaseModel):
    query: Optional[str] = None
    status: Optional[ClientStatus] = None
    risk_level: Optional[RiskLevel] = None
    industry: Optional[str] = None
    limit: int = 50
    offset: int = 0

    @validator('limit')
    def validate_limit(cls, v):
        if v < 1 or v > 200:
            raise ValueError('Limit must be between 1 and 200')
        return v

    @validator('offset')
    def validate_offset(cls, v):
        if v < 0:
            raise ValueError('Offset must be non-negative')
        return v


class ClientStats(BaseModel):
    client_id: str
    client_name: str
    total_matters: int
    total_contracts: int
    matter_breakdown: dict
    contract_breakdown: dict


class ClientSummary(BaseModel):
    id: str
    name: str
    status: ClientStatus
    risk_level: RiskLevel
    industry: Optional[str]
    matters_count: int
    contracts_count: int
    last_activity: Optional[datetime]