"""
CounselFlow Ultimate V3 - Authentication API Routes
"""

from datetime import datetime, timedelta
from typing import Optional
import structlog
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, validator
from jose import JWTError, jwt
from passlib.context import CryptContext
from prisma import Prisma

from app.core.config import settings
from app.core.database import get_prisma
from app.core.redis import get_session_manager
from app.schemas.user import (
    UserCreate, UserResponse, UserLogin, UserRole, Permission, Department,
    UserWithPermissions, PermissionCheck, PermissionResult, RoleAssignment,
    UserSearch, UserStats, TeamMember
)
from app.schemas.auth import Token, TokenData, PasswordReset, PasswordChange, SessionInfo
from app.services.auth_service import auth_service, UserSession
from app.services.rbac_service import rbac_service, require_permission, require_role

logger = structlog.get_logger()
router = APIRouter()

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

# JWT settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    prisma: Prisma = Depends(get_prisma)
):
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "access":
            raise credentials_exception
            
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = await prisma.user.find_unique(
        where={"id": token_data.user_id},
        include={"tenant": True}
    )
    
    if user is None:
        raise credentials_exception
    
    if not user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(current_user = Depends(get_current_user)):
    """Get current active user"""
    if not current_user.active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def authenticate_user(email: str, password: str, prisma: Prisma) -> Optional[dict]:
    """Authenticate user with email and password"""
    user = await prisma.user.find_unique(
        where={"email": email},
        include={"tenant": True}
    )
    
    if not user:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    request: Request,
    prisma: Prisma = Depends(get_prisma)
):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await prisma.user.find_unique(where={"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user = await prisma.user.create(
            data={
                "email": user_data.email,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "password_hash": hashed_password,
                "role": user_data.role or "BUSINESS_STAKEHOLDER",
                "active": True,
                "email_verified": False,
                "tenant_id": user_data.tenant_id,
            },
            include={"tenant": True}
        )
        
        logger.info(
            "User registered successfully",
            user_id=user.id,
            email=user.email,
            role=user.role,
            client_ip=request.client.host if request.client else "unknown"
        )
        
        return UserResponse.from_orm(user)
        
    except Exception as e:
        logger.error("User registration failed", error=str(e), email=user_data.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin,
    request: Request,
    response: Response,
    prisma: Prisma = Depends(get_prisma)
):
    """Authenticate user and return tokens"""
    try:
        # Authenticate user
        user = await authenticate_user(user_credentials.email, user_credentials.password, prisma)
        if not user:
            logger.warning(
                "Login attempt failed",
                email=user_credentials.email,
                client_ip=request.client.host if request.client else "unknown"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create tokens
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email, "role": user.role},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(
            data={"sub": user.id, "email": user.email}
        )
        
        # Store session in Redis
        session_manager = await get_session_manager()
        session_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "tenant_id": user.tenant_id,
            "login_time": datetime.utcnow().isoformat(),
            "ip_address": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown")
        }
        
        await session_manager.create_session(
            session_id=user.id,
            data=session_data,
            expire=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        # Update last login
        await prisma.user.update(
            where={"id": user.id},
            data={"last_login": datetime.utcnow()}
        )
        
        logger.info(
            "User logged in successfully",
            user_id=user.id,
            email=user.email,
            role=user.role,
            client_ip=request.client.host if request.client else "unknown"
        )
        
        # Set refresh token as secure HTTP-only cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # seconds
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax"
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            email=user.email,
            role=user.role
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login failed", error=str(e), email=user_credentials.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    prisma: Prisma = Depends(get_prisma)
):
    """Refresh access token using refresh token"""
    try:
        # Get refresh token from cookie
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found"
            )
        
        # Decode refresh token
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if user_id is None or token_type != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user
        user = await prisma.user.find_unique(
            where={"id": user_id},
            include={"tenant": True}
        )
        
        if not user or not user.active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email, "role": user.role},
            expires_delta=access_token_expires
        )
        
        # Update session
        session_manager = await get_session_manager()
        session_data = await session_manager.get_session(user.id)
        if session_data:
            session_data["last_refresh"] = datetime.utcnow().isoformat()
            await session_manager.update_session(
                session_id=user.id,
                data=session_data,
                expire=ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
        
        logger.info(
            "Token refreshed successfully",
            user_id=user.id,
            email=user.email
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=user.id,
            email=user.email,
            role=user.role
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Token refresh failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(
    response: Response,
    current_user = Depends(get_current_user)
):
    """Logout user and invalidate tokens"""
    try:
        # Remove session from Redis
        session_manager = await get_session_manager()
        await session_manager.delete_session(current_user.id)
        
        # Clear refresh token cookie
        response.delete_cookie(key="refresh_token")
        
        logger.info(
            "User logged out successfully",
            user_id=current_user.id,
            email=current_user.email
        )
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error("Logout failed", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse.from_orm(current_user)


@router.post("/forgot-password")
async def forgot_password(
    email: EmailStr,
    request: Request,
    prisma: Prisma = Depends(get_prisma)
):
    """Request password reset"""
    try:
        # Check if user exists
        user = await prisma.user.find_unique(where={"email": email})
        if not user:
            # Don't reveal if email exists for security
            return {"message": "If the email exists, a reset link has been sent"}
        
        # Generate reset token
        reset_token = create_access_token(
            data={"sub": user.id, "purpose": "password_reset"},
            expires_delta=timedelta(hours=24)
        )
        
        # Store reset token (in production, send email with reset link)
        # For now, we'll just log it
        logger.info(
            "Password reset requested",
            user_id=user.id,
            email=user.email,
            reset_token=reset_token,
            client_ip=request.client.host if request.client else "unknown"
        )
        
        # TODO: Send email with reset link
        # await send_password_reset_email(user.email, reset_token)
        
        return {"message": "If the email exists, a reset link has been sent"}
        
    except Exception as e:
        logger.error("Password reset request failed", error=str(e), email=email)
        return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    prisma: Prisma = Depends(get_prisma)
):
    """Reset password using reset token"""
    try:
        # Decode reset token
        try:
            payload = jwt.decode(reset_data.token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            purpose: str = payload.get("purpose")
            
            if user_id is None or purpose != "password_reset":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid reset token"
                )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Get user
        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        
        # Hash new password
        hashed_password = get_password_hash(reset_data.new_password)
        
        # Update password
        await prisma.user.update(
            where={"id": user.id},
            data={"password_hash": hashed_password}
        )
        
        # Invalidate all existing sessions
        session_manager = await get_session_manager()
        await session_manager.delete_session(user.id)
        
        logger.info(
            "Password reset successfully",
            user_id=user.id,
            email=user.email
        )
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Password reset failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user = Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Change user password"""
    try:
        # Verify current password
        if not verify_password(password_data.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )
        
        # Hash new password
        hashed_password = get_password_hash(password_data.new_password)
        
        # Update password
        await prisma.user.update(
            where={"id": current_user.id},
            data={"password_hash": hashed_password}
        )
        
        logger.info(
            "Password changed successfully",
            user_id=current_user.id,
            email=current_user.email
        )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Password change failed", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )


@router.get("/sessions")
async def get_active_sessions(
    current_user = Depends(get_current_user)
):
    """Get user's active sessions"""
    try:
        session_manager = await get_session_manager()
        session_data = await session_manager.get_session(current_user.id)
        
        if session_data:
            return {
                "active_sessions": [session_data],
                "current_session": session_data
            }
        else:
            return {
                "active_sessions": [],
                "current_session": None
            }
            
    except Exception as e:
        logger.error("Failed to get sessions", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get sessions"
        )


# RBAC Endpoints

@router.get("/permissions", response_model=dict)
async def get_user_permissions(
    current_user = Depends(get_current_user)
):
    """Get current user's permissions"""
    try:
        permissions = rbac_service.get_role_permissions(UserRole(current_user.role))
        
        return {
            "user_id": current_user.id,
            "role": current_user.role,
            "permissions": [p.value for p in permissions],
            "role_description": rbac_service.get_role_description(UserRole(current_user.role))
        }
        
    except Exception as e:
        logger.error("Failed to get permissions", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get permissions"
        )


@router.post("/check-permission", response_model=PermissionResult)
async def check_permission(
    permission_check: PermissionCheck,
    current_user = Depends(get_current_user)
):
    """Check if user has specific permission"""
    try:
        # Only allow users to check their own permissions unless they're admin
        if permission_check.user_id != current_user.id:
            user_permissions = rbac_service.get_role_permissions(UserRole(current_user.role))
            if Permission.USER_MANAGEMENT not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot check permissions for other users"
                )
        
        # Get target user's role (in real implementation, query database)
        target_role = UserRole(current_user.role)  # Simplified
        
        has_permission = rbac_service.has_permission(
            user_role=target_role,
            permission=permission_check.permission,
            resource_id=permission_check.resource_id
        )
        
        return PermissionResult(
            has_permission=has_permission,
            reason="Permission granted" if has_permission else "Permission denied"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Permission check failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Permission check failed"
        )


@router.get("/roles", response_model=dict)
@require_permission(Permission.ROLE_MANAGEMENT)
async def get_available_roles(
    current_user = Depends(get_current_user)
):
    """Get available roles and their descriptions"""
    try:
        roles_info = {}
        
        for role in UserRole:
            # Check if current user can assign this role
            can_assign = rbac_service.can_assign_role(
                assigner_role=UserRole(current_user.role),
                target_role=role
            )
            
            roles_info[role.value] = {
                "description": rbac_service.get_role_description(role),
                "permissions": [p.value for p in rbac_service.get_role_permissions(role)],
                "can_assign": can_assign
            }
        
        return {
            "roles": roles_info,
            "current_user_role": current_user.role
        }
        
    except Exception as e:
        logger.error("Failed to get roles", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get roles"
        )


@router.post("/assign-role")
@require_permission(Permission.ROLE_MANAGEMENT)
async def assign_role(
    role_assignment: RoleAssignment,
    current_user = Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Assign role to user"""
    try:
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
        
        # Update user role (in real implementation)
        # await prisma.user.update(
        #     where={"id": role_assignment.user_id},
        #     data={"role": role_assignment.role.value}
        # )
        
        # Log role assignment
        logger.info(
            "Role assigned",
            user_id=role_assignment.user_id,
            new_role=role_assignment.role.value,
            assigned_by=current_user.id,
            reason=role_assignment.reason
        )
        
        return {
            "message": "Role assigned successfully",
            "user_id": role_assignment.user_id,
            "new_role": role_assignment.role.value,
            "assigned_by": current_user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Role assignment failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Role assignment failed"
        )


@router.get("/departments", response_model=dict)
async def get_departments():
    """Get available departments"""
    return {
        "departments": [
            {
                "value": dept.value,
                "name": dept.value.replace("_", " ").title()
            }
            for dept in Department
        ]
    }


@router.get("/user-stats", response_model=UserStats)
@require_permission(Permission.ANALYTICS_VIEW)
async def get_user_statistics(
    current_user = Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get user statistics and analytics"""
    try:
        # In a real implementation, this would query the database
        # For demo, return mock data
        
        return UserStats(
            total_users=247,
            active_users=231,
            users_by_role={
                "GENERAL_COUNSEL": 1,
                "SENIOR_COUNSEL": 3,
                "COUNSEL": 12,
                "ASSOCIATE_COUNSEL": 8,
                "LEGAL_OPS_MANAGER": 2,
                "LEGAL_OPS_ANALYST": 4,
                "PARALEGAL": 15,
                "LEGAL_ASSISTANT": 8,
                "COMPLIANCE_OFFICER": 3,
                "BUSINESS_STAKEHOLDER": 156,
                "EXTERNAL_COUNSEL": 24,
                "CONTRACT_MANAGER": 6,
                "VENDOR_MANAGER": 3,
                "VIEWER": 2
            },
            users_by_department={
                "LEGAL": 45,
                "COMPLIANCE": 8,
                "BUSINESS": 156,
                "CONTRACTS": 12,
                "IT": 15,
                "FINANCE": 8,
                "HR": 3
            },
            recent_logins=89,
            new_users_this_month=12
        )
        
    except Exception as e:
        logger.error("Failed to get user stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )


@router.get("/team-members", response_model=dict)
async def get_team_members(
    department: Optional[Department] = None,
    role: Optional[UserRole] = None,
    limit: int = 50,
    current_user = Depends(get_current_user)
):
    """Get team members with optional filtering"""
    try:
        # In a real implementation, this would query the database
        # For demo, return mock data
        
        mock_members = [
            TeamMember(
                id="1",
                first_name="Sarah",
                last_name="Chen",
                email="sarah.chen@counselflow.com",
                role=UserRole.GENERAL_COUNSEL,
                department=Department.LEGAL,
                title="General Counsel",
                active=True
            ),
            TeamMember(
                id="2",
                first_name="Michael",
                last_name="Rodriguez",
                email="michael.rodriguez@counselflow.com",
                role=UserRole.SENIOR_COUNSEL,
                department=Department.LEGAL,
                title="Senior Counsel - Litigation",
                active=True
            ),
            TeamMember(
                id="3",
                first_name="Dr. Lisa",
                last_name="Wang",
                email="lisa.wang@counselflow.com",
                role=UserRole.COUNSEL,
                department=Department.LEGAL,
                title="Counsel - IP & Technology",
                active=True
            )
        ]
        
        # Apply filters
        filtered_members = mock_members
        if department:
            filtered_members = [m for m in filtered_members if m.department == department]
        if role:
            filtered_members = [m for m in filtered_members if m.role == role]
        
        return {
            "members": filtered_members[:limit],
            "total": len(filtered_members),
            "filters": {
                "department": department.value if department else None,
                "role": role.value if role else None
            }
        }
        
    except Exception as e:
        logger.error("Failed to get team members", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get team members"
        )


@router.get("/audit-log")
@require_permission(Permission.AUDIT_READ)
async def get_authentication_audit_log(
    days: int = 7,
    user_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 100,
    current_user = Depends(get_current_user)
):
    """Get authentication audit log"""
    try:
        # In a real implementation, this would query audit logs from database
        # For demo, return mock audit data
        
        from datetime import datetime, timedelta
        
        mock_audit_entries = [
            {
                "id": "1",
                "event_type": "login_success",
                "user_id": "user-123",
                "email": "sarah.chen@counselflow.com",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0...",
                "timestamp": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                "details": {"role": "GENERAL_COUNSEL", "department": "LEGAL"}
            },
            {
                "id": "2",
                "event_type": "permission_check",
                "user_id": "user-456",
                "email": "michael.rodriguez@counselflow.com",
                "ip_address": "192.168.1.101",
                "user_agent": "Mozilla/5.0...",
                "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                "details": {"permission": "CONTRACT_APPROVE", "result": "granted"}
            },
            {
                "id": "3",
                "event_type": "role_assignment",
                "user_id": "user-789",
                "email": "admin@counselflow.com",
                "ip_address": "192.168.1.102",
                "user_agent": "Mozilla/5.0...",
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "details": {"target_user": "user-321", "new_role": "COUNSEL", "previous_role": "ASSOCIATE_COUNSEL"}
            }
        ]
        
        # Apply filters
        filtered_entries = mock_audit_entries
        if user_id:
            filtered_entries = [e for e in filtered_entries if e["user_id"] == user_id]
        if event_type:
            filtered_entries = [e for e in filtered_entries if e["event_type"] == event_type]
        
        return {
            "audit_entries": filtered_entries[:limit],
            "total": len(filtered_entries),
            "filters": {
                "days": days,
                "user_id": user_id,
                "event_type": event_type
            }
        }
        
    except Exception as e:
        logger.error("Failed to get audit log", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get audit log"
        )