"""
CounselFlow Ultimate V3 - Authentication Service
Enhanced authentication with RBAC integration
"""

import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import structlog
from fastapi import HTTPException, status, Request
from uuid import uuid4
import redis
import json
from dataclasses import dataclass

from app.core.config import settings
from app.schemas.user import UserRole, Permission, Department
from app.schemas.auth import Token, TokenData, SessionInfo
from app.services.rbac_service import rbac_service

logger = structlog.get_logger()


@dataclass
class UserSession:
    user_id: str
    email: str
    role: UserRole
    department: Department
    permissions: List[Permission]
    tenant_id: Optional[str]
    session_id: str
    ip_address: str
    user_agent: str
    login_time: datetime
    last_activity: datetime
    expires_at: datetime


class AuthService:
    """Enhanced Authentication Service with RBAC integration"""
    
    def __init__(self):
        self.redis_client = None  # Would be initialized with Redis connection
        self.session_timeout = timedelta(hours=8)  # 8-hour sessions
        self.max_sessions_per_user = 5
        
    async def authenticate_user(
        self,
        email: str,
        password: str,
        request: Request
    ) -> Optional[UserSession]:
        """Authenticate user and create session"""
        
        try:
            # In a real implementation, this would:
            # 1. Query database for user by email
            # 2. Verify password hash
            # 3. Check if user is active
            # 4. Check if email is verified
            
            # Mock user data for demonstration
            mock_user = {
                "id": str(uuid4()),
                "email": email,
                "role": UserRole.COUNSEL,
                "department": Department.LEGAL,
                "active": True,
                "email_verified": True,
                "tenant_id": "counselflow-demo"
            }
            
            if not mock_user["active"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is deactivated"
                )
            
            if not mock_user["email_verified"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email not verified"
                )
            
            # Get user permissions from RBAC service
            permissions = list(rbac_service.get_role_permissions(mock_user["role"]))
            
            # Create user session
            session = await self._create_session(
                user_id=mock_user["id"],
                email=mock_user["email"],
                role=mock_user["role"],
                department=mock_user["department"],
                permissions=permissions,
                tenant_id=mock_user["tenant_id"],
                ip_address=request.client.host if request.client else "unknown",
                user_agent=request.headers.get("user-agent", "unknown")
            )
            
            # Log successful authentication
            logger.info(
                "User authenticated successfully",
                user_id=session.user_id,
                email=session.email,
                role=session.role.value,
                ip_address=session.ip_address
            )
            
            return session
            
        except Exception as e:
            logger.error(
                "Authentication failed",
                email=email,
                error=str(e),
                ip_address=request.client.host if request.client else "unknown"
            )
            return None
    
    async def _create_session(
        self,
        user_id: str,
        email: str,
        role: UserRole,
        department: Department,
        permissions: List[Permission],
        tenant_id: Optional[str],
        ip_address: str,
        user_agent: str
    ) -> UserSession:
        """Create a new user session"""
        
        session_id = str(uuid4())
        now = datetime.utcnow()
        expires_at = now + self.session_timeout
        
        session = UserSession(
            user_id=user_id,
            email=email,
            role=role,
            department=department,
            permissions=permissions,
            tenant_id=tenant_id,
            session_id=session_id,
            ip_address=ip_address,
            user_agent=user_agent,
            login_time=now,
            last_activity=now,
            expires_at=expires_at
        )
        
        # Store session in Redis (or database)
        await self._store_session(session)
        
        # Clean up old sessions for this user
        await self._cleanup_user_sessions(user_id)
        
        return session
    
    async def _store_session(self, session: UserSession) -> None:
        """Store session in Redis"""
        
        session_data = {
            "user_id": session.user_id,
            "email": session.email,
            "role": session.role.value,
            "department": session.department.value,
            "permissions": [p.value for p in session.permissions],
            "tenant_id": session.tenant_id,
            "ip_address": session.ip_address,
            "user_agent": session.user_agent,
            "login_time": session.login_time.isoformat(),
            "last_activity": session.last_activity.isoformat(),
            "expires_at": session.expires_at.isoformat()
        }
        
        # In a real implementation, this would store in Redis
        # self.redis_client.setex(
        #     f"session:{session.session_id}",
        #     int(self.session_timeout.total_seconds()),
        #     json.dumps(session_data)
        # )
        
        logger.debug("Session stored", session_id=session.session_id)
    
    async def _cleanup_user_sessions(self, user_id: str) -> None:
        """Clean up old sessions for a user"""
        
        # In a real implementation, this would:
        # 1. Get all sessions for the user
        # 2. Sort by last_activity
        # 3. Remove oldest sessions if count > max_sessions_per_user
        
        logger.debug("Cleaned up old sessions", user_id=user_id)
    
    def create_access_token(
        self,
        session: UserSession,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = {
            "sub": session.user_id,
            "email": session.email,
            "role": session.role.value,
            "department": session.department.value,
            "session_id": session.session_id,
            "tenant_id": session.tenant_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    def create_refresh_token(self, session: UserSession) -> str:
        """Create JWT refresh token"""
        
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode = {
            "sub": session.user_id,
            "session_id": session.session_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    async def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify and decode JWT token"""
        
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            user_id: str = payload.get("sub")
            email: str = payload.get("email")
            role_str: str = payload.get("role")
            session_id: str = payload.get("session_id")
            
            if user_id is None or session_id is None:
                return None
            
            # Verify session is still valid
            session = await self._get_session(session_id)
            if not session or session.expires_at < datetime.utcnow():
                return None
            
            # Update last activity
            await self._update_session_activity(session_id)
            
            return TokenData(
                user_id=user_id,
                email=email,
                role=UserRole(role_str) if role_str else None
            )
            
        except jwt.PyJWTError as e:
            logger.warning("Token verification failed", error=str(e))
            return None
    
    async def _get_session(self, session_id: str) -> Optional[UserSession]:
        """Get session from storage"""
        
        # In a real implementation, this would get from Redis
        # session_data = self.redis_client.get(f"session:{session_id}")
        # if not session_data:
        #     return None
        
        # For demo, return a mock session
        return UserSession(
            user_id=str(uuid4()),
            email="demo@counselflow.com",
            role=UserRole.COUNSEL,
            department=Department.LEGAL,
            permissions=list(rbac_service.get_role_permissions(UserRole.COUNSEL)),
            tenant_id="counselflow-demo",
            session_id=session_id,
            ip_address="127.0.0.1",
            user_agent="demo",
            login_time=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(hours=8)
        )
    
    async def _update_session_activity(self, session_id: str) -> None:
        """Update session last activity timestamp"""
        
        # In a real implementation, this would update Redis
        logger.debug("Updated session activity", session_id=session_id)
    
    async def refresh_access_token(self, refresh_token: str) -> Optional[str]:
        """Refresh access token using refresh token"""
        
        try:
            payload = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            user_id: str = payload.get("sub")
            session_id: str = payload.get("session_id")
            token_type: str = payload.get("type")
            
            if token_type != "refresh" or not user_id or not session_id:
                return None
            
            # Get session and verify it's still valid
            session = await self._get_session(session_id)
            if not session or session.expires_at < datetime.utcnow():
                return None
            
            # Create new access token
            new_access_token = self.create_access_token(session)
            
            logger.info("Access token refreshed", user_id=user_id, session_id=session_id)
            
            return new_access_token
            
        except jwt.PyJWTError as e:
            logger.warning("Refresh token verification failed", error=str(e))
            return None
    
    async def logout_user(self, session_id: str) -> bool:
        """Logout user by invalidating session"""
        
        try:
            # In a real implementation, this would delete from Redis
            # self.redis_client.delete(f"session:{session_id}")
            
            logger.info("User logged out", session_id=session_id)
            return True
            
        except Exception as e:
            logger.error("Logout failed", session_id=session_id, error=str(e))
            return False
    
    async def logout_all_sessions(self, user_id: str) -> bool:
        """Logout user from all sessions"""
        
        try:
            # In a real implementation, this would:
            # 1. Find all sessions for the user
            # 2. Delete them from Redis
            
            logger.info("User logged out from all sessions", user_id=user_id)
            return True
            
        except Exception as e:
            logger.error("Logout all failed", user_id=user_id, error=str(e))
            return False
    
    async def get_user_sessions(self, user_id: str) -> List[SessionInfo]:
        """Get all active sessions for a user"""
        
        # In a real implementation, this would query Redis for all user sessions
        # For demo, return a mock session
        return [
            SessionInfo(
                user_id=user_id,
                email="demo@counselflow.com",
                role=UserRole.COUNSEL,
                tenant_id="counselflow-demo",
                login_time=datetime.utcnow(),
                ip_address="127.0.0.1",
                user_agent="Mozilla/5.0 (Demo Browser)",
                last_activity=datetime.utcnow()
            )
        ]
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    async def check_user_permission(
        self,
        user_id: str,
        permission: Permission,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None
    ) -> bool:
        """Check if user has specific permission"""
        
        # Get user session to get role
        # In a real implementation, this would get from active session or database
        user_role = UserRole.COUNSEL  # Mock for demo
        
        return rbac_service.has_permission(
            user_role=user_role,
            permission=permission,
            resource_type=resource_type,
            resource_id=resource_id,
            user_id=user_id
        )
    
    async def create_password_reset_token(self, email: str) -> str:
        """Create password reset token"""
        
        expire = datetime.utcnow() + timedelta(hours=24)
        
        to_encode = {
            "sub": email,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "password_reset"
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    async def verify_password_reset_token(self, token: str) -> Optional[str]:
        """Verify password reset token and return email"""
        
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if token_type != "password_reset" or not email:
                return None
            
            return email
            
        except jwt.PyJWTError:
            return None
    
    async def create_email_verification_token(self, email: str) -> str:
        """Create email verification token"""
        
        expire = datetime.utcnow() + timedelta(hours=48)
        
        to_encode = {
            "sub": email,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "email_verification"
        }
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        return encoded_jwt
    
    async def verify_email_verification_token(self, token: str) -> Optional[str]:
        """Verify email verification token and return email"""
        
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )
            
            email: str = payload.get("sub")
            token_type: str = payload.get("type")
            
            if token_type != "email_verification" or not email:
                return None
            
            return email
            
        except jwt.PyJWTError:
            return None
    
    async def audit_authentication_event(
        self,
        event_type: str,
        user_id: Optional[str],
        email: Optional[str],
        ip_address: str,
        user_agent: str,
        success: bool,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """Audit authentication events"""
        
        audit_entry = {
            "event_type": event_type,
            "user_id": user_id,
            "email": email,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "success": success,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details or {}
        }
        
        logger.info("Authentication event audited", **audit_entry)


# Global auth service instance
auth_service = AuthService()


def get_current_user_session():
    """Dependency to get current user session from JWT token"""
    
    async def _get_current_user_session(token: str = None) -> UserSession:
        # In a real implementation, this would:
        # 1. Extract token from Authorization header
        # 2. Verify token
        # 3. Get session data
        # 4. Return session or raise HTTPException
        
        # For demo, return mock session
        return UserSession(
            user_id=str(uuid4()),
            email="demo@counselflow.com",
            role=UserRole.COUNSEL,
            department=Department.LEGAL,
            permissions=list(rbac_service.get_role_permissions(UserRole.COUNSEL)),
            tenant_id="counselflow-demo",
            session_id=str(uuid4()),
            ip_address="127.0.0.1",
            user_agent="demo",
            login_time=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(hours=8)
        )
    
    return _get_current_user_session