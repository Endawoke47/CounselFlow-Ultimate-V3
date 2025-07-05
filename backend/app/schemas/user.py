"""
CounselFlow Ultimate V3 - User Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from enum import Enum


class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    GENERAL_COUNSEL = "GENERAL_COUNSEL"
    DEPUTY_GENERAL_COUNSEL = "DEPUTY_GENERAL_COUNSEL"
    SENIOR_COUNSEL = "SENIOR_COUNSEL"
    COUNSEL = "COUNSEL"
    ASSOCIATE_COUNSEL = "ASSOCIATE_COUNSEL"
    LEGAL_OPS_MANAGER = "LEGAL_OPS_MANAGER"
    LEGAL_OPS_ANALYST = "LEGAL_OPS_ANALYST"
    PARALEGAL = "PARALEGAL"
    LEGAL_ASSISTANT = "LEGAL_ASSISTANT"
    EXTERNAL_COUNSEL = "EXTERNAL_COUNSEL"
    COMPLIANCE_OFFICER = "COMPLIANCE_OFFICER"
    BUSINESS_STAKEHOLDER = "BUSINESS_STAKEHOLDER"
    CONTRACT_MANAGER = "CONTRACT_MANAGER"
    VENDOR_MANAGER = "VENDOR_MANAGER"
    VIEWER = "VIEWER"


class Department(str, Enum):
    LEGAL = "LEGAL"
    COMPLIANCE = "COMPLIANCE"
    CONTRACTS = "CONTRACTS"
    LITIGATION = "LITIGATION"
    IP = "INTELLECTUAL_PROPERTY"
    PRIVACY = "PRIVACY"
    EMPLOYMENT = "EMPLOYMENT"
    CORPORATE = "CORPORATE"
    REGULATORY = "REGULATORY"
    BUSINESS = "BUSINESS"
    IT = "IT"
    FINANCE = "FINANCE"
    HR = "HR"
    OPERATIONS = "OPERATIONS"


class Permission(str, Enum):
    # System administration
    SYSTEM_ADMIN = "system:admin"
    USER_MANAGEMENT = "users:manage"
    ROLE_MANAGEMENT = "roles:manage"
    
    # Matter management
    MATTER_CREATE = "matters:create"
    MATTER_READ = "matters:read"
    MATTER_UPDATE = "matters:update"
    MATTER_DELETE = "matters:delete"
    MATTER_ASSIGN = "matters:assign"
    
    # Contract management
    CONTRACT_CREATE = "contracts:create"
    CONTRACT_READ = "contracts:read"
    CONTRACT_UPDATE = "contracts:update"
    CONTRACT_DELETE = "contracts:delete"
    CONTRACT_APPROVE = "contracts:approve"
    CONTRACT_EXECUTE = "contracts:execute"
    CONTRACT_NEGOTIATE = "contracts:negotiate"
    
    # Client management
    CLIENT_CREATE = "clients:create"
    CLIENT_READ = "clients:read"
    CLIENT_UPDATE = "clients:update"
    CLIENT_DELETE = "clients:delete"
    
    # Document management
    DOCUMENT_CREATE = "documents:create"
    DOCUMENT_READ = "documents:read"
    DOCUMENT_UPDATE = "documents:update"
    DOCUMENT_DELETE = "documents:delete"
    DOCUMENT_SHARE = "documents:share"
    
    # Billing and financial
    BILLING_READ = "billing:read"
    BILLING_CREATE = "billing:create"
    BILLING_APPROVE = "billing:approve"
    INVOICE_MANAGEMENT = "invoices:manage"
    
    # AI services
    AI_BASIC = "ai:basic"
    AI_ADVANCED = "ai:advanced"
    AI_ADMIN = "ai:admin"
    
    # Reporting and analytics
    REPORTS_READ = "reports:read"
    REPORTS_CREATE = "reports:create"
    ANALYTICS_VIEW = "analytics:view"
    ANALYTICS_ADMIN = "analytics:admin"
    
    # Litigation
    LITIGATION_READ = "litigation:read"
    LITIGATION_MANAGE = "litigation:manage"
    DISCOVERY_MANAGE = "discovery:manage"
    
    # IP management
    IP_READ = "ip:read"
    IP_MANAGE = "ip:manage"
    IP_FILE = "ip:file"
    
    # Privacy and compliance
    PRIVACY_READ = "privacy:read"
    PRIVACY_MANAGE = "privacy:manage"
    COMPLIANCE_READ = "compliance:read"
    COMPLIANCE_MANAGE = "compliance:manage"
    
    # Risk management
    RISK_READ = "risk:read"
    RISK_MANAGE = "risk:manage"
    
    # Audit and security
    AUDIT_READ = "audit:read"
    SECURITY_ADMIN = "security:admin"


class RolePermissions(BaseModel):
    role: UserRole
    permissions: list[Permission]
    description: str


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: Optional[UserRole] = UserRole.BUSINESS_STAKEHOLDER
    department: Optional[Department] = Department.BUSINESS
    title: Optional[str] = None
    phone: Optional[str] = None
    office_location: Optional[str] = None
    manager_id: Optional[str] = None
    cost_center: Optional[str] = None
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
    department: Department
    title: Optional[str] = None
    phone: Optional[str] = None
    office_location: Optional[str] = None
    active: bool
    email_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    permissions: Optional[list[Permission]] = None
    
    class Config:
        from_attributes = True


class UserWithPermissions(UserResponse):
    permissions: list[Permission]
    department: Department
    title: Optional[str] = None
    manager_id: Optional[str] = None


class PermissionCheck(BaseModel):
    user_id: str
    permission: Permission
    resource_id: Optional[str] = None


class PermissionResult(BaseModel):
    has_permission: bool
    reason: Optional[str] = None


class RoleAssignment(BaseModel):
    user_id: str
    role: UserRole
    assigned_by: str
    reason: Optional[str] = None


class BulkRoleAssignment(BaseModel):
    user_ids: list[str]
    role: UserRole
    assigned_by: str
    reason: Optional[str] = None


class UserAccessLog(BaseModel):
    user_id: str
    action: str
    resource: str
    resource_id: Optional[str] = None
    timestamp: datetime
    ip_address: str
    user_agent: str
    success: bool
    details: Optional[dict] = None


class TeamMember(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    role: UserRole
    department: Department
    title: Optional[str] = None
    active: bool


class UserSearch(BaseModel):
    query: Optional[str] = None
    role: Optional[UserRole] = None
    department: Optional[Department] = None
    active: Optional[bool] = None
    limit: Optional[int] = 50
    offset: Optional[int] = 0


class UserStats(BaseModel):
    total_users: int
    active_users: int
    users_by_role: dict[str, int]
    users_by_department: dict[str, int]
    recent_logins: int
    new_users_this_month: int