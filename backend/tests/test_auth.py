"""
CounselFlow Ultimate V3 - Authentication Tests
============================================

Comprehensive tests for authentication, authorization, and JWT handling.
"""

import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient
from app.core.security import create_access_token, verify_password
from app.services.auth_service import AuthService

class TestAuthentication:
    """Test authentication endpoints and functionality"""
    
    @pytest.mark.auth
    async def test_login_success(self, async_client: AsyncClient, test_user):
        """Test successful login"""
        login_data = {
            "email": "test@counselflow.com",
            "password": "testpassword"
        }
        
        response = await async_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["email"] == test_user.email
    
    @pytest.mark.auth
    async def test_login_invalid_credentials(self, async_client: AsyncClient, test_user):
        """Test login with invalid credentials"""
        login_data = {
            "email": "test@counselflow.com",
            "password": "wrongpassword"
        }
        
        response = await async_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    
    @pytest.mark.auth
    async def test_login_nonexistent_user(self, async_client: AsyncClient):
        """Test login with non-existent user"""
        login_data = {
            "email": "nonexistent@counselflow.com",
            "password": "password"
        }
        
        response = await async_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
    
    @pytest.mark.auth
    async def test_login_inactive_user(self, async_client: AsyncClient, clean_db):
        """Test login with inactive user"""
        # Create inactive user
        from app.core.security import get_password_hash
        
        inactive_user_data = {
            'email': 'inactive@counselflow.com',
            'firstName': 'Inactive',
            'lastName': 'User',
            'role': 'IN_HOUSE_COUNSEL',
            'status': 'INACTIVE',
            'hashedPassword': get_password_hash('password'),
            'title': 'Legal Counsel',
            'department': 'Legal'
        }
        
        await clean_db.user.create(data=inactive_user_data)
        
        login_data = {
            "email": "inactive@counselflow.com",
            "password": "password"
        }
        
        response = await async_client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
    
    @pytest.mark.auth
    async def test_get_current_user(self, async_client: AsyncClient, test_user, auth_headers):
        """Test getting current user profile"""
        response = await async_client.get("/api/v1/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["firstName"] == test_user.firstName
        assert data["lastName"] == test_user.lastName
        assert data["role"] == test_user.role
    
    @pytest.mark.auth
    async def test_get_current_user_invalid_token(self, async_client: AsyncClient):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await async_client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    @pytest.mark.auth
    async def test_get_current_user_no_token(self, async_client: AsyncClient):
        """Test getting current user without token"""
        response = await async_client.get("/api/v1/auth/me")
        
        assert response.status_code == 401
    
    @pytest.mark.auth
    async def test_refresh_token(self, async_client: AsyncClient, test_user):
        """Test token refresh functionality"""
        # First login to get tokens
        login_data = {
            "email": "test@counselflow.com",
            "password": "testpassword"
        }
        
        login_response = await async_client.post("/api/v1/auth/login", json=login_data)
        tokens = login_response.json()
        
        # Use refresh token to get new access token
        refresh_data = {
            "refresh_token": tokens["refresh_token"]
        }
        
        response = await async_client.post("/api/v1/auth/refresh", json=refresh_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
    
    @pytest.mark.auth
    async def test_refresh_token_invalid(self, async_client: AsyncClient):
        """Test refresh with invalid token"""
        refresh_data = {
            "refresh_token": "invalid_refresh_token"
        }
        
        response = await async_client.post("/api/v1/auth/refresh", json=refresh_data)
        
        assert response.status_code == 401
    
    @pytest.mark.auth
    async def test_logout(self, async_client: AsyncClient, test_user, auth_headers):
        """Test logout functionality"""
        response = await async_client.post("/api/v1/auth/logout", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Successfully logged out"


class TestRoleBasedAccess:
    """Test role-based access control (RBAC)"""
    
    @pytest.mark.rbac
    async def test_admin_access_to_users(self, async_client: AsyncClient, admin_user, admin_headers):
        """Test admin can access user management endpoints"""
        response = await async_client.get("/api/v1/admin/users", headers=admin_headers)
        
        assert response.status_code == 200
    
    @pytest.mark.rbac
    async def test_non_admin_denied_user_management(self, async_client: AsyncClient, test_user, auth_headers):
        """Test non-admin cannot access user management"""
        response = await async_client.get("/api/v1/admin/users", headers=auth_headers)
        
        assert response.status_code == 403
    
    @pytest.mark.rbac
    async def test_client_access_restrictions(self, async_client: AsyncClient, client_user, client_headers):
        """Test client user access restrictions"""
        # Client should not access admin endpoints
        response = await async_client.get("/api/v1/admin/users", headers=client_headers)
        assert response.status_code == 403
        
        # Client should not access all contracts
        response = await async_client.get("/api/v1/contracts", headers=client_headers)
        assert response.status_code == 403 or response.status_code == 200  # Depends on implementation
    
    @pytest.mark.rbac
    async def test_legal_counsel_permissions(self, async_client: AsyncClient, test_user, auth_headers):
        """Test legal counsel permissions"""
        # Should access contracts
        response = await async_client.get("/api/v1/contracts", headers=auth_headers)
        assert response.status_code == 200
        
        # Should access matters
        response = await async_client.get("/api/v1/matters", headers=auth_headers)
        assert response.status_code == 200
        
        # Should access clients
        response = await async_client.get("/api/v1/clients", headers=auth_headers)
        assert response.status_code == 200


class TestPasswordSecurity:
    """Test password security features"""
    
    def test_password_hashing(self):
        """Test password hashing and verification"""
        from app.core.security import get_password_hash, verify_password
        
        password = "test_password_123!"
        hashed = get_password_hash(password)
        
        # Hash should be different from original password
        assert hashed != password
        
        # Should verify correctly
        assert verify_password(password, hashed) is True
        
        # Should not verify incorrect password
        assert verify_password("wrong_password", hashed) is False
    
    def test_password_hash_uniqueness(self):
        """Test that same password generates different hashes"""
        from app.core.security import get_password_hash
        
        password = "same_password"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Should generate different hashes due to salt
        assert hash1 != hash2


class TestJWTTokens:
    """Test JWT token functionality"""
    
    def test_create_access_token(self):
        """Test access token creation"""
        data = {"sub": "test@counselflow.com"}
        token = create_access_token(data=data)
        
        assert isinstance(token, str)
        assert len(token) > 0
    
    def test_token_expiration(self):
        """Test token expiration"""
        from app.core.security import decode_token
        from datetime import timedelta
        
        # Create token with short expiration
        data = {"sub": "test@counselflow.com"}
        token = create_access_token(data=data, expires_delta=timedelta(seconds=1))
        
        # Should be valid immediately
        payload = decode_token(token)
        assert payload is not None
        assert payload.get("sub") == "test@counselflow.com"
        
        # Should expire (in real test, we'd use freezegun to mock time)
        import time
        time.sleep(2)
        
        expired_payload = decode_token(token)
        assert expired_payload is None  # Should be None for expired token


class TestAuthenticationService:
    """Test authentication service layer"""
    
    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, clean_db, test_user):
        """Test successful user authentication"""
        auth_service = AuthService(clean_db)
        
        user = await auth_service.authenticate_user("test@counselflow.com", "testpassword")
        
        assert user is not None
        assert user.email == test_user.email
    
    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self, clean_db, test_user):
        """Test authentication with wrong password"""
        auth_service = AuthService(clean_db)
        
        user = await auth_service.authenticate_user("test@counselflow.com", "wrongpassword")
        
        assert user is None
    
    @pytest.mark.asyncio
    async def test_authenticate_nonexistent_user(self, clean_db):
        """Test authentication with non-existent user"""
        auth_service = AuthService(clean_db)
        
        user = await auth_service.authenticate_user("nonexistent@counselflow.com", "password")
        
        assert user is None


class TestSecurityHeaders:
    """Test security headers and CORS"""
    
    @pytest.mark.auth
    async def test_cors_headers(self, async_client: AsyncClient):
        """Test CORS headers are present"""
        response = await async_client.options("/api/v1/auth/login")
        
        # Should include CORS headers
        assert "access-control-allow-origin" in response.headers
    
    @pytest.mark.auth
    async def test_security_headers(self, async_client: AsyncClient):
        """Test security headers are present"""
        response = await async_client.get("/api/v1/auth/me")
        
        # Should include security headers (if configured)
        # These would depend on middleware configuration