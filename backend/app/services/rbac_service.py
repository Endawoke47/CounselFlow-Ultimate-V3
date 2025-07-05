"""
CounselFlow Ultimate V3 - Role-Based Access Control Service
Comprehensive RBAC system for legal operations
"""

from typing import Dict, List, Optional, Set
from enum import Enum
import structlog
from functools import wraps
from fastapi import HTTPException, status, Depends
from datetime import datetime

from app.schemas.user import UserRole, Permission, Department, RolePermissions
from app.core.config import settings

logger = structlog.get_logger()


class AccessLevel(str, Enum):
    NONE = "none"
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"


class ResourceType(str, Enum):
    MATTER = "matter"
    CONTRACT = "contract"
    CLIENT = "client"
    DOCUMENT = "document"
    BILLING = "billing"
    REPORT = "report"
    USER = "user"
    SYSTEM = "system"


class RBACService:
    """Role-Based Access Control Service"""
    
    def __init__(self):
        self.role_permissions = self._initialize_role_permissions()
        self.hierarchical_roles = self._initialize_role_hierarchy()
        
    def _initialize_role_permissions(self) -> Dict[UserRole, Set[Permission]]:
        """Initialize role-permission mappings"""
        
        # Define permission sets for each role
        role_permissions = {
            # Super Admin - Full system access
            UserRole.SUPER_ADMIN: {
                Permission.SYSTEM_ADMIN,
                Permission.USER_MANAGEMENT,
                Permission.ROLE_MANAGEMENT,
                Permission.SECURITY_ADMIN,
                Permission.AUDIT_READ,
                Permission.ANALYTICS_ADMIN,
                Permission.AI_ADMIN,
            },
            
            # Admin - System administration without security controls
            UserRole.ADMIN: {
                Permission.USER_MANAGEMENT,
                Permission.ANALYTICS_ADMIN,
                Permission.REPORTS_CREATE,
                Permission.REPORTS_READ,
                Permission.AI_ADMIN,
                Permission.AUDIT_READ,
            },
            
            # General Counsel - Full legal operations access
            UserRole.GENERAL_COUNSEL: {
                Permission.MATTER_CREATE,
                Permission.MATTER_READ,
                Permission.MATTER_UPDATE,
                Permission.MATTER_DELETE,
                Permission.MATTER_ASSIGN,
                Permission.CONTRACT_CREATE,
                Permission.CONTRACT_READ,
                Permission.CONTRACT_UPDATE,
                Permission.CONTRACT_DELETE,
                Permission.CONTRACT_APPROVE,
                Permission.CONTRACT_EXECUTE,
                Permission.CONTRACT_NEGOTIATE,
                Permission.CLIENT_CREATE,
                Permission.CLIENT_READ,
                Permission.CLIENT_UPDATE,
                Permission.CLIENT_DELETE,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_UPDATE,
                Permission.DOCUMENT_DELETE,
                Permission.DOCUMENT_SHARE,
                Permission.BILLING_READ,
                Permission.BILLING_CREATE,
                Permission.BILLING_APPROVE,
                Permission.INVOICE_MANAGEMENT,
                Permission.AI_ADVANCED,
                Permission.REPORTS_READ,
                Permission.REPORTS_CREATE,
                Permission.ANALYTICS_VIEW,
                Permission.LITIGATION_READ,
                Permission.LITIGATION_MANAGE,
                Permission.DISCOVERY_MANAGE,
                Permission.IP_READ,
                Permission.IP_MANAGE,
                Permission.IP_FILE,
                Permission.PRIVACY_READ,
                Permission.PRIVACY_MANAGE,
                Permission.COMPLIANCE_READ,
                Permission.COMPLIANCE_MANAGE,
                Permission.RISK_READ,
                Permission.RISK_MANAGE,
                Permission.AUDIT_READ,
            },
            
            # Deputy General Counsel - Similar to GC with some restrictions
            UserRole.DEPUTY_GENERAL_COUNSEL: {
                Permission.MATTER_CREATE,
                Permission.MATTER_READ,
                Permission.MATTER_UPDATE,
                Permission.MATTER_ASSIGN,
                Permission.CONTRACT_CREATE,
                Permission.CONTRACT_READ,
                Permission.CONTRACT_UPDATE,
                Permission.CONTRACT_APPROVE,
                Permission.CONTRACT_NEGOTIATE,
                Permission.CLIENT_CREATE,
                Permission.CLIENT_READ,
                Permission.CLIENT_UPDATE,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_UPDATE,
                Permission.DOCUMENT_SHARE,
                Permission.BILLING_READ,
                Permission.BILLING_CREATE,
                Permission.AI_ADVANCED,
                Permission.REPORTS_READ,
                Permission.REPORTS_CREATE,
                Permission.ANALYTICS_VIEW,
                Permission.LITIGATION_READ,
                Permission.LITIGATION_MANAGE,
                Permission.IP_READ,
                Permission.IP_MANAGE,
                Permission.PRIVACY_READ,
                Permission.PRIVACY_MANAGE,
                Permission.COMPLIANCE_READ,
                Permission.COMPLIANCE_MANAGE,
                Permission.RISK_READ,
                Permission.RISK_MANAGE,
            },
            
            # Senior Counsel - Full legal work with limited admin
            UserRole.SENIOR_COUNSEL: {
                Permission.MATTER_CREATE,
                Permission.MATTER_READ,
                Permission.MATTER_UPDATE,
                Permission.MATTER_ASSIGN,
                Permission.CONTRACT_CREATE,
                Permission.CONTRACT_READ,
                Permission.CONTRACT_UPDATE,
                Permission.CONTRACT_NEGOTIATE,
                Permission.CLIENT_READ,
                Permission.CLIENT_UPDATE,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_UPDATE,
                Permission.DOCUMENT_SHARE,
                Permission.BILLING_READ,
                Permission.AI_ADVANCED,
                Permission.REPORTS_READ,
                Permission.ANALYTICS_VIEW,
                Permission.LITIGATION_READ,
                Permission.LITIGATION_MANAGE,
                Permission.IP_READ,
                Permission.IP_MANAGE,
                Permission.PRIVACY_READ,
                Permission.PRIVACY_MANAGE,
                Permission.COMPLIANCE_READ,
                Permission.RISK_READ,
            },
            
            # Counsel - Standard legal work
            UserRole.COUNSEL: {
                Permission.MATTER_CREATE,
                Permission.MATTER_READ,
                Permission.MATTER_UPDATE,
                Permission.CONTRACT_CREATE,
                Permission.CONTRACT_READ,
                Permission.CONTRACT_UPDATE,
                Permission.CONTRACT_NEGOTIATE,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_UPDATE,
                Permission.DOCUMENT_SHARE,
                Permission.BILLING_READ,
                Permission.AI_ADVANCED,
                Permission.REPORTS_READ,
                Permission.LITIGATION_READ,
                Permission.IP_READ,
                Permission.PRIVACY_READ,
                Permission.COMPLIANCE_READ,
                Permission.RISK_READ,
            },
            
            # Associate Counsel - Junior legal work
            UserRole.ASSOCIATE_COUNSEL: {
                Permission.MATTER_READ,
                Permission.MATTER_UPDATE,
                Permission.CONTRACT_READ,
                Permission.CONTRACT_UPDATE,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_UPDATE,
                Permission.AI_BASIC,
                Permission.REPORTS_READ,
                Permission.LITIGATION_READ,
                Permission.IP_READ,
                Permission.PRIVACY_READ,
                Permission.COMPLIANCE_READ,
                Permission.RISK_READ,
            },
            
            # Legal Ops Manager - Operations and process management
            UserRole.LEGAL_OPS_MANAGER: {
                Permission.MATTER_READ,
                Permission.CONTRACT_READ,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_READ,
                Permission.BILLING_READ,
                Permission.BILLING_CREATE,
                Permission.INVOICE_MANAGEMENT,
                Permission.AI_ADVANCED,
                Permission.REPORTS_READ,
                Permission.REPORTS_CREATE,
                Permission.ANALYTICS_VIEW,
                Permission.ANALYTICS_ADMIN,
                Permission.RISK_READ,
            },
            
            # Legal Ops Analyst - Data and analytics focus
            UserRole.LEGAL_OPS_ANALYST: {
                Permission.MATTER_READ,
                Permission.CONTRACT_READ,
                Permission.BILLING_READ,
                Permission.AI_BASIC,
                Permission.REPORTS_READ,
                Permission.ANALYTICS_VIEW,
                Permission.RISK_READ,
            },
            
            # Paralegal - Support role with document focus
            UserRole.PARALEGAL: {
                Permission.MATTER_READ,
                Permission.MATTER_UPDATE,
                Permission.CONTRACT_READ,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_UPDATE,
                Permission.AI_BASIC,
                Permission.LITIGATION_READ,
            },
            
            # Legal Assistant - Administrative support
            UserRole.LEGAL_ASSISTANT: {
                Permission.MATTER_READ,
                Permission.CONTRACT_READ,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_READ,
                Permission.AI_BASIC,
            },
            
            # External Counsel - Limited access to relevant matters
            UserRole.EXTERNAL_COUNSEL: {
                Permission.MATTER_READ,
                Permission.MATTER_UPDATE,
                Permission.CONTRACT_READ,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_UPDATE,
                Permission.AI_BASIC,
                Permission.LITIGATION_READ,
            },
            
            # Compliance Officer - Compliance and risk focus
            UserRole.COMPLIANCE_OFFICER: {
                Permission.COMPLIANCE_READ,
                Permission.COMPLIANCE_MANAGE,
                Permission.RISK_READ,
                Permission.RISK_MANAGE,
                Permission.PRIVACY_READ,
                Permission.PRIVACY_MANAGE,
                Permission.CONTRACT_READ,
                Permission.MATTER_READ,
                Permission.DOCUMENT_READ,
                Permission.AI_BASIC,
                Permission.REPORTS_READ,
                Permission.ANALYTICS_VIEW,
                Permission.AUDIT_READ,
            },
            
            # Contract Manager - Contract lifecycle focus
            UserRole.CONTRACT_MANAGER: {
                Permission.CONTRACT_CREATE,
                Permission.CONTRACT_READ,
                Permission.CONTRACT_UPDATE,
                Permission.CONTRACT_NEGOTIATE,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_CREATE,
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_UPDATE,
                Permission.AI_BASIC,
                Permission.REPORTS_READ,
            },
            
            # Vendor Manager - Vendor relationship management
            UserRole.VENDOR_MANAGER: {
                Permission.CONTRACT_READ,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_READ,
                Permission.BILLING_READ,
                Permission.AI_BASIC,
                Permission.REPORTS_READ,
            },
            
            # Business Stakeholder - Limited business access
            UserRole.BUSINESS_STAKEHOLDER: {
                Permission.CONTRACT_READ,
                Permission.DOCUMENT_READ,
                Permission.AI_BASIC,
                Permission.REPORTS_READ,
            },
            
            # Viewer - Read-only access
            UserRole.VIEWER: {
                Permission.MATTER_READ,
                Permission.CONTRACT_READ,
                Permission.CLIENT_READ,
                Permission.DOCUMENT_READ,
                Permission.REPORTS_READ,
            },
        }
        
        return role_permissions
    
    def _initialize_role_hierarchy(self) -> Dict[UserRole, List[UserRole]]:
        """Initialize role hierarchy - higher roles inherit permissions from lower roles"""
        
        return {
            UserRole.SUPER_ADMIN: [
                UserRole.ADMIN,
                UserRole.GENERAL_COUNSEL,
            ],
            UserRole.ADMIN: [
                UserRole.LEGAL_OPS_MANAGER,
            ],
            UserRole.GENERAL_COUNSEL: [
                UserRole.DEPUTY_GENERAL_COUNSEL,
                UserRole.COMPLIANCE_OFFICER,
            ],
            UserRole.DEPUTY_GENERAL_COUNSEL: [
                UserRole.SENIOR_COUNSEL,
            ],
            UserRole.SENIOR_COUNSEL: [
                UserRole.COUNSEL,
            ],
            UserRole.COUNSEL: [
                UserRole.ASSOCIATE_COUNSEL,
            ],
            UserRole.LEGAL_OPS_MANAGER: [
                UserRole.LEGAL_OPS_ANALYST,
                UserRole.CONTRACT_MANAGER,
            ],
            UserRole.ASSOCIATE_COUNSEL: [
                UserRole.PARALEGAL,
            ],
            UserRole.PARALEGAL: [
                UserRole.LEGAL_ASSISTANT,
            ],
            UserRole.CONTRACT_MANAGER: [
                UserRole.VENDOR_MANAGER,
            ],
            UserRole.BUSINESS_STAKEHOLDER: [
                UserRole.VIEWER,
            ],
        }
    
    def get_role_permissions(self, role: UserRole) -> Set[Permission]:
        """Get all permissions for a role including inherited permissions"""
        
        permissions = set()
        
        # Add direct permissions
        if role in self.role_permissions:
            permissions.update(self.role_permissions[role])
        
        # Add inherited permissions from subordinate roles
        if role in self.hierarchical_roles:
            for subordinate_role in self.hierarchical_roles[role]:
                permissions.update(self.get_role_permissions(subordinate_role))
        
        return permissions
    
    def has_permission(
        self,
        user_role: UserRole,
        permission: Permission,
        resource_type: Optional[ResourceType] = None,
        resource_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> bool:
        """Check if a user role has a specific permission"""
        
        user_permissions = self.get_role_permissions(user_role)
        
        # Check direct permission
        if permission in user_permissions:
            return True
        
        # Check for admin override
        if Permission.SYSTEM_ADMIN in user_permissions:
            return True
        
        # Resource-specific permission checks
        if resource_type and resource_id:
            return self._check_resource_permission(
                user_role, permission, resource_type, resource_id, user_id
            )
        
        return False
    
    def _check_resource_permission(
        self,
        user_role: UserRole,
        permission: Permission,
        resource_type: ResourceType,
        resource_id: str,
        user_id: Optional[str] = None
    ) -> bool:
        """Check resource-specific permissions"""
        
        # In a full implementation, this would check:
        # - Matter assignments
        # - Client relationships
        # - Document ownership
        # - Contract stakeholders
        # - Department access
        
        # For now, return basic logic
        user_permissions = self.get_role_permissions(user_role)
        
        # External counsel can only access assigned matters
        if user_role == UserRole.EXTERNAL_COUNSEL:
            if resource_type == ResourceType.MATTER:
                # Would check if user is assigned to this matter
                return True  # Simplified for demo
        
        # Business stakeholders can only read their own contracts
        if user_role == UserRole.BUSINESS_STAKEHOLDER:
            if resource_type == ResourceType.CONTRACT and "read" in permission.value:
                # Would check if user is stakeholder for this contract
                return True  # Simplified for demo
        
        return permission in user_permissions
    
    def check_multiple_permissions(
        self,
        user_role: UserRole,
        permissions: List[Permission]
    ) -> Dict[Permission, bool]:
        """Check multiple permissions at once"""
        
        return {
            permission: self.has_permission(user_role, permission)
            for permission in permissions
        }
    
    def get_accessible_resources(
        self,
        user_role: UserRole,
        resource_type: ResourceType,
        user_id: Optional[str] = None
    ) -> Dict[str, AccessLevel]:
        """Get resources accessible to a user role with access levels"""
        
        # This would typically query the database for accessible resources
        # For now, return simplified logic based on role
        
        accessible = {}
        user_permissions = self.get_role_permissions(user_role)
        
        # Determine access level based on permissions
        access_level = AccessLevel.NONE
        
        if resource_type == ResourceType.MATTER:
            if Permission.MATTER_DELETE in user_permissions:
                access_level = AccessLevel.ADMIN
            elif Permission.MATTER_UPDATE in user_permissions:
                access_level = AccessLevel.WRITE
            elif Permission.MATTER_READ in user_permissions:
                access_level = AccessLevel.READ
        
        elif resource_type == ResourceType.CONTRACT:
            if Permission.CONTRACT_DELETE in user_permissions:
                access_level = AccessLevel.ADMIN
            elif Permission.CONTRACT_UPDATE in user_permissions:
                access_level = AccessLevel.WRITE
            elif Permission.CONTRACT_READ in user_permissions:
                access_level = AccessLevel.READ
        
        # In a real implementation, this would return actual resource IDs
        return {"*": access_level}  # Simplified
    
    def can_assign_role(
        self,
        assigner_role: UserRole,
        target_role: UserRole
    ) -> bool:
        """Check if a user can assign a specific role to another user"""
        
        assigner_permissions = self.get_role_permissions(assigner_role)
        
        # Only users with role management permission can assign roles
        if Permission.ROLE_MANAGEMENT not in assigner_permissions:
            return False
        
        # Super admin can assign any role
        if Permission.SYSTEM_ADMIN in assigner_permissions:
            return True
        
        # General Counsel can assign legal roles
        if assigner_role == UserRole.GENERAL_COUNSEL:
            legal_roles = {
                UserRole.DEPUTY_GENERAL_COUNSEL,
                UserRole.SENIOR_COUNSEL,
                UserRole.COUNSEL,
                UserRole.ASSOCIATE_COUNSEL,
                UserRole.PARALEGAL,
                UserRole.LEGAL_ASSISTANT,
                UserRole.COMPLIANCE_OFFICER,
            }
            return target_role in legal_roles
        
        # Admin can assign operational roles
        if assigner_role == UserRole.ADMIN:
            operational_roles = {
                UserRole.LEGAL_OPS_MANAGER,
                UserRole.LEGAL_OPS_ANALYST,
                UserRole.CONTRACT_MANAGER,
                UserRole.VENDOR_MANAGER,
                UserRole.BUSINESS_STAKEHOLDER,
                UserRole.VIEWER,
            }
            return target_role in operational_roles
        
        return False
    
    def get_role_description(self, role: UserRole) -> str:
        """Get human-readable description of a role"""
        
        descriptions = {
            UserRole.SUPER_ADMIN: "System Super Administrator with full access to all features and settings",
            UserRole.ADMIN: "System Administrator with user management and system configuration access",
            UserRole.GENERAL_COUNSEL: "Chief Legal Officer with full legal operations oversight and decision-making authority",
            UserRole.DEPUTY_GENERAL_COUNSEL: "Senior legal executive with broad legal operations authority",
            UserRole.SENIOR_COUNSEL: "Experienced attorney with matter management and team leadership responsibilities",
            UserRole.COUNSEL: "Licensed attorney handling legal matters and providing legal advice",
            UserRole.ASSOCIATE_COUNSEL: "Junior attorney supporting legal matters under supervision",
            UserRole.LEGAL_OPS_MANAGER: "Legal operations professional managing processes, vendors, and analytics",
            UserRole.LEGAL_OPS_ANALYST: "Data analyst supporting legal operations with metrics and reporting",
            UserRole.PARALEGAL: "Legal support professional assisting with case preparation and documentation",
            UserRole.LEGAL_ASSISTANT: "Administrative support for legal team with basic document access",
            UserRole.EXTERNAL_COUNSEL: "Outside attorney with limited access to assigned matters",
            UserRole.COMPLIANCE_OFFICER: "Professional responsible for regulatory compliance and risk management",
            UserRole.BUSINESS_STAKEHOLDER: "Business user with limited access to relevant legal information",
            UserRole.CONTRACT_MANAGER: "Professional managing contract lifecycle and vendor relationships",
            UserRole.VENDOR_MANAGER: "Professional overseeing vendor relationships and contracts",
            UserRole.VIEWER: "Read-only access for oversight and reporting purposes",
        }
        
        return descriptions.get(role, "Standard user role")
    
    def audit_permission_check(
        self,
        user_id: str,
        user_role: UserRole,
        permission: Permission,
        resource_type: Optional[ResourceType],
        resource_id: Optional[str],
        result: bool,
        ip_address: str,
        user_agent: str
    ) -> None:
        """Audit permission checks for security monitoring"""
        
        audit_entry = {
            "user_id": user_id,
            "user_role": user_role.value,
            "permission": permission.value,
            "resource_type": resource_type.value if resource_type else None,
            "resource_id": resource_id,
            "result": result,
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": ip_address,
            "user_agent": user_agent,
        }
        
        logger.info("Permission check audited", **audit_entry)
        
        # In a production system, this would be stored in an audit database


# Global RBAC service instance
rbac_service = RBACService()


def require_permission(permission: Permission):
    """Decorator to require specific permission for API endpoints"""
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # In a real implementation, this would:
            # 1. Extract user from JWT token
            # 2. Check permission using rbac_service
            # 3. Raise HTTPException if permission denied
            
            # For now, assume permission is granted
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def require_role(allowed_roles: List[UserRole]):
    """Decorator to require specific roles for API endpoints"""
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # In a real implementation, this would:
            # 1. Extract user from JWT token
            # 2. Check if user role is in allowed_roles
            # 3. Raise HTTPException if role not allowed
            
            # For now, assume role is allowed
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def check_resource_access(
    resource_type: ResourceType,
    permission: Permission
):
    """Decorator to check resource-specific access"""
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # In a real implementation, this would:
            # 1. Extract resource_id from request
            # 2. Check resource-specific permissions
            # 3. Raise HTTPException if access denied
            
            # For now, assume access is granted
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator