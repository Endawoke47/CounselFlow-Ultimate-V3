"""
CounselFlow Ultimate V3 - Users API Routes
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_user, get_current_active_user
from app.schemas.user import UserResponse, UserUpdate, UserCreate, UserRole
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE, description="Number of users to return"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of users (admin or legal ops only)"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view users"
        )
    
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