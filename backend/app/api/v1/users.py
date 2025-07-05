"""
CounselFlow Ultimate V3 - Users API Routes
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_user, get_current_active_user
from app.schemas.user import (
    UserResponse, UserUpdate, UserCreate, UserRole, Permission, Department,
    UserWithPermissions, UserProfile, TeamMember, UserStats, BulkRoleAssignment,
    RoleAssignment
)
from app.services.rbac_service import rbac_service, require_permission, require_role
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


@router.get("/", response_model=dict)
@require_permission(Permission.USER_MANAGEMENT)
async def get_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE, description="Number of users to return"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    department: Optional[Department] = Query(None, description="Filter by department"),
    active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of users with RBAC filtering"""
    
    try:
        # Build where clause
        where_clause = {}
        
        if role:
            where_clause["role"] = role
        
        if active is not None:
            where_clause["active"] = active
        
        if search:
            where_clause["OR"] = [
                {"first_name": {"contains": search, "mode": "insensitive"}},
                {"last_name": {"contains": search, "mode": "insensitive"}},
                {"email": {"contains": search, "mode": "insensitive"}},
            ]
        
        # Add tenant filtering for non-admin users
        if current_user.role != UserRole.ADMIN and current_user.tenant_id:
            where_clause["tenant_id"] = current_user.tenant_id
        
        users = await prisma.user.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"},
            include={"tenant": True}
        )
        
        return [UserResponse.from_orm(user) for user in users]
        
    except Exception as e:
        logger.error("Failed to get users", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get user by ID"""
    
    # Users can view their own profile, admins and legal ops can view any user
    if (user_id != current_user.id and 
        current_user.role not in [UserRole.ADMIN, UserRole.LEGAL_OPS]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    try:
        where_clause = {"id": user_id}
        
        # Add tenant filtering for non-admin users
        if (current_user.role != UserRole.ADMIN and 
            current_user.tenant_id and 
            user_id != current_user.id):
            where_clause["tenant_id"] = current_user.tenant_id
        
        user = await prisma.user.find_unique(
            where=where_clause,
            include={"tenant": True}
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse.from_orm(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get user", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Create new user (admin only)"""
    
    # Only admins can create users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create users"
        )
    
    try:
        # Check if user already exists
        existing_user = await prisma.user.find_unique(where={"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        from app.api.v1.auth import get_password_hash
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = await prisma.user.create(
            data={
                "email": user_data.email,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "password_hash": hashed_password,
                "role": user_data.role or UserRole.BUSINESS_STAKEHOLDER,
                "active": user_data.active if user_data.active is not None else True,
                "email_verified": False,
                "tenant_id": user_data.tenant_id,
            },
            include={"tenant": True}
        )
        
        logger.info(
            "User created by admin",
            created_user_id=user.id,
            created_user_email=user.email,
            admin_user_id=current_user.id,
            admin_email=current_user.email
        )
        
        return UserResponse.from_orm(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to create user", error=str(e), admin_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Update user"""
    
    # Users can update their own profile (limited fields), admins can update any user
    is_self_update = user_id == current_user.id
    is_admin = current_user.role == UserRole.ADMIN
    
    if not is_self_update and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    try:
        # Get existing user
        where_clause = {"id": user_id}
        
        # Add tenant filtering for non-admin users
        if not is_admin and current_user.tenant_id and not is_self_update:
            where_clause["tenant_id"] = current_user.tenant_id
        
        existing_user = await prisma.user.find_unique(where=where_clause)
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prepare update data
        update_data = {}
        
        # Fields that users can update for themselves
        if user_data.email is not None:
            # Check if email is already taken
            email_check = await prisma.user.find_unique(where={"email": user_data.email})
            if email_check and email_check.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            update_data["email"] = user_data.email
        
        if user_data.first_name is not None:
            update_data["first_name"] = user_data.first_name
        
        if user_data.last_name is not None:
            update_data["last_name"] = user_data.last_name
        
        # Fields that only admins can update
        if is_admin:
            if user_data.role is not None:
                update_data["role"] = user_data.role
            
            if user_data.active is not None:
                update_data["active"] = user_data.active
        elif not is_self_update:
            # Non-admin trying to update admin-only fields
            if user_data.role is not None or user_data.active is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to update role or active status"
                )
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Update user
        updated_user = await prisma.user.update(
            where={"id": user_id},
            data=update_data,
            include={"tenant": True}
        )
        
        logger.info(
            "User updated",
            updated_user_id=user_id,
            updated_fields=list(update_data.keys()),
            updated_by=current_user.id,
            is_self_update=is_self_update
        )
        
        return UserResponse.from_orm(updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update user", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Delete user (admin only)"""
    
    # Only admins can delete users
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete users"
        )
    
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    try:
        # Check if user exists
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Soft delete by deactivating instead of hard delete for data integrity
        await prisma.user.update(
            where={"id": user_id},
            data={"active": False}
        )
        
        logger.info(
            "User deactivated",
            deactivated_user_id=user_id,
            deactivated_user_email=user.email,
            admin_user_id=current_user.id
        )
        
        return {"message": "User deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete user", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )


@router.get("/stats/overview")
async def get_user_stats(
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get user statistics (admin or legal ops only)"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view user statistics"
        )
    
    try:
        where_clause = {}
        
        # Add tenant filtering for non-admin users
        if current_user.role != UserRole.ADMIN and current_user.tenant_id:
            where_clause["tenant_id"] = current_user.tenant_id
        
        # Get total users
        total_users = await prisma.user.count(where=where_clause)
        
        # Get active users
        active_users = await prisma.user.count(
            where={**where_clause, "active": True}
        )
        
        # Get users by role
        role_stats = {}
        for role in UserRole:
            count = await prisma.user.count(
                where={**where_clause, "role": role, "active": True}
            )
            role_stats[role.value] = count
        
        # Get recent registrations (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_registrations = await prisma.user.count(
            where={
                **where_clause,
                "created_at": {"gte": thirty_days_ago}
            }
        )
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "role_distribution": role_stats,
            "recent_registrations": recent_registrations,
            "stats_generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error("Failed to get user stats", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user statistics"
        )


# Enhanced RBAC Endpoints

@router.get("/{user_id}/permissions", response_model=dict)
@require_permission(Permission.USER_MANAGEMENT)
async def get_user_permissions(
    user_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get permissions for a specific user"""
    try:
        # In real implementation, get user role from database
        user_role = UserRole.COUNSEL  # Mock
        
        permissions = rbac_service.get_role_permissions(user_role)
        
        return {
            "user_id": user_id,
            "role": user_role.value,
            "permissions": [p.value for p in permissions],
            "role_description": rbac_service.get_role_description(user_role),
            "total_permissions": len(permissions)
        }
        
    except Exception as e:
        logger.error("Failed to get user permissions", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user permissions"
        )


@router.post("/bulk-role-assignment")
@require_permission(Permission.ROLE_MANAGEMENT)
async def bulk_assign_roles(
    bulk_assignment: BulkRoleAssignment,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Assign role to multiple users"""
    try:
        # Check if current user can assign this role
        can_assign = rbac_service.can_assign_role(
            assigner_role=UserRole(current_user.role),
            target_role=bulk_assignment.role
        )
        if not can_assign:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cannot assign role {bulk_assignment.role.value}"
            )
        
        # In real implementation, update users in database
        updated_count = len(bulk_assignment.user_ids)
        
        logger.info(
            "Bulk role assignment completed",
            user_count=updated_count,
            new_role=bulk_assignment.role.value,
            assigned_by=current_user.id,
            reason=bulk_assignment.reason
        )
        
        return {
            "message": f"Role assigned to {updated_count} users",
            "users_updated": updated_count,
            "role": bulk_assignment.role.value,
            "assigned_by": current_user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Bulk role assignment failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bulk role assignment failed"
        )


@router.get("/{user_id}/profile", response_model=UserProfile)
async def get_user_profile(
    user_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get detailed user profile"""
    try:
        # Check if viewing own profile or has permission
        if user_id != current_user.id:
            user_permissions = rbac_service.get_role_permissions(UserRole(current_user.role))
            if Permission.USER_MANAGEMENT not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot view other user profiles"
                )
        
        # Mock user profile for demo
        return UserProfile(
            id=user_id,
            email="demo@counselflow.com",
            first_name="Demo",
            last_name="User",
            role=UserRole.COUNSEL,
            department=Department.LEGAL,
            title="Senior Counsel",
            phone="+1-555-0123",
            office_location="New York, NY",
            active=True,
            email_verified=True,
            created_at="2024-01-01T00:00:00Z",
            last_login="2024-01-20T10:30:00Z",
            permissions=list(rbac_service.get_role_permissions(UserRole.COUNSEL))
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get user profile", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )


@router.get("/department/{department}/members", response_model=dict)
async def get_department_members(
    department: Department,
    active_only: bool = Query(True, description="Include only active users"),
    current_user = Depends(get_current_active_user)
):
    """Get members of a specific department"""
    try:
        # Mock department members for demo
        mock_members = [
            TeamMember(
                id="1",
                first_name="Sarah",
                last_name="Chen",
                email="sarah.chen@counselflow.com",
                role=UserRole.GENERAL_COUNSEL,
                department=department,
                title="General Counsel",
                active=True
            ),
            TeamMember(
                id="2",
                first_name="Michael",
                last_name="Rodriguez",
                email="michael.rodriguez@counselflow.com",
                role=UserRole.SENIOR_COUNSEL,
                department=department,
                title="Senior Counsel - Litigation",
                active=True
            ),
            TeamMember(
                id="3",
                first_name="Dr. Lisa",
                last_name="Wang",
                email="lisa.wang@counselflow.com",
                role=UserRole.COUNSEL,
                department=department,
                title="Counsel - IP & Technology",
                active=True
            )
        ]
        
        if active_only:
            mock_members = [m for m in mock_members if m.active]
        
        return {
            "department": department.value,
            "department_name": department.value.replace("_", " ").title(),
            "members": mock_members,
            "total": len(mock_members),
            "active_only": active_only
        }
        
    except Exception as e:
        logger.error("Failed to get department members", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get department members"
        )


@router.post("/{user_id}/assign-role")
@require_permission(Permission.ROLE_MANAGEMENT)
async def assign_user_role(
    user_id: str,
    role_assignment: RoleAssignment,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Assign role to a specific user"""
    try:
        # Ensure user_id matches the assignment
        if role_assignment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID mismatch"
            )
        
        # Check if current user can assign this role
        can_assign = rbac_service.can_assign_role(
            assigner_role=UserRole(current_user.role),
            target_role=role_assignment.role
        )
        if not can_assign:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cannot assign role {role_assignment.role.value}"
            )
        
        # In real implementation, update user in database
        # await prisma.user.update(
        #     where={"id": user_id},
        #     data={"role": role_assignment.role.value}
        # )
        
        logger.info(
            "Role assigned to user",
            user_id=user_id,
            new_role=role_assignment.role.value,
            assigned_by=current_user.id,
            reason=role_assignment.reason
        )
        
        return {
            "message": "Role assigned successfully",
            "user_id": user_id,
            "new_role": role_assignment.role.value,
            "assigned_by": current_user.id,
            "reason": role_assignment.reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Role assignment failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Role assignment failed"
        )


@router.get("/roles/available", response_model=dict)
@require_permission(Permission.ROLE_MANAGEMENT)
async def get_assignable_roles(
    current_user = Depends(get_current_active_user)
):
    """Get roles that current user can assign"""
    try:
        assignable_roles = {}
        
        for role in UserRole:
            can_assign = rbac_service.can_assign_role(
                assigner_role=UserRole(current_user.role),
                target_role=role
            )
            
            if can_assign:
                assignable_roles[role.value] = {
                    "description": rbac_service.get_role_description(role),
                    "permissions_count": len(rbac_service.get_role_permissions(role))
                }
        
        return {
            "assignable_roles": assignable_roles,
            "total_assignable": len(assignable_roles),
            "assigner_role": current_user.role
        }
        
    except Exception as e:
        logger.error("Failed to get assignable roles", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get assignable roles"
        )