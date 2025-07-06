"""
CounselFlow Ultimate V3 - Test Configuration and Fixtures
========================================================

Central configuration for all tests including database setup, 
authentication, and common fixtures.
"""

import asyncio
import os
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient
from fastapi.testclient import TestClient
from prisma import Prisma
import tempfile
from pathlib import Path

# Import the FastAPI app
from app.main import app
from app.core.config import settings
from app.core.database import get_prisma_client, create_database_connection, close_database_connection
from app.core.security import create_access_token, get_password_hash
from app.services.auth_service import AuthService

# Test database URL for isolation
TEST_DATABASE_URL = "postgresql://counselflow_user:strongpassword123!@localhost:5432/counselflow_test_db"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_settings():
    """Override settings for testing"""
    # Store original values
    original_db_url = settings.DATABASE_URL
    original_environment = settings.ENVIRONMENT
    original_debug = settings.DEBUG
    
    # Set test values
    settings.DATABASE_URL = TEST_DATABASE_URL
    settings.ENVIRONMENT = "testing"
    settings.DEBUG = True
    
    yield settings
    
    # Restore original values
    settings.DATABASE_URL = original_db_url
    settings.ENVIRONMENT = original_environment
    settings.DEBUG = original_debug

@pytest_asyncio.fixture(scope="session")
async def db_client():
    """Create a test database client"""
    client = Prisma(datasource={"url": TEST_DATABASE_URL})
    await client.connect()
    yield client
    await client.disconnect()

@pytest_asyncio.fixture
async def clean_db(db_client):
    """Clean database before each test"""
    # Clean up database in correct order to handle foreign key constraints
    tables = [
        'AITask', 'AuditLog', 'Notification', 'TimelineEvent',
        'Obligation', 'Clause', 'License', 'Filing', 'Task',
        'Document', 'Dispute', 'PrivacyEvent', 'DataSubjectRequest',
        'PIA', 'IncidentReport', 'ComplianceRequirement',
        'RiskEvent', 'Contract', 'IPAsset', 'Matter', 'Client', 'User'
    ]
    
    for table in tables:
        try:
            await db_client.execute_raw(f'DELETE FROM "{table}";')
        except Exception:
            # Table might not exist or be empty
            pass
    
    yield db_client

@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)

@pytest_asyncio.fixture
async def async_client():
    """Create an async test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def test_user(clean_db):
    """Create a test user"""
    user_data = {
        'email': 'test@counselflow.com',
        'firstName': 'Test',
        'lastName': 'User',
        'role': 'IN_HOUSE_COUNSEL',
        'status': 'ACTIVE',
        'hashedPassword': get_password_hash('testpassword'),
        'title': 'Senior Legal Counsel',
        'department': 'Legal'
    }
    
    user = await clean_db.user.create(data=user_data)
    return user

@pytest_asyncio.fixture
async def admin_user(clean_db):
    """Create an admin test user"""
    admin_data = {
        'email': 'admin@counselflow.com',
        'firstName': 'Admin',
        'lastName': 'User',
        'role': 'ADMIN',
        'status': 'ACTIVE',
        'hashedPassword': get_password_hash('adminpassword'),
        'title': 'System Administrator',
        'department': 'IT'
    }
    
    admin = await clean_db.user.create(data=admin_data)
    return admin

@pytest_asyncio.fixture
async def client_user(clean_db):
    """Create a client test user"""
    client_data = {
        'email': 'client@company.com',
        'firstName': 'Client',
        'lastName': 'User',
        'role': 'CLIENT',
        'status': 'ACTIVE',
        'hashedPassword': get_password_hash('clientpassword'),
        'title': 'CEO',
        'department': 'Executive'
    }
    
    client = await clean_db.user.create(data=client_data)
    return client

@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers for test user"""
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def admin_headers(admin_user):
    """Create authentication headers for admin user"""
    access_token = create_access_token(data={"sub": admin_user.email})
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def client_headers(client_user):
    """Create authentication headers for client user"""
    access_token = create_access_token(data={"sub": client_user.email})
    return {"Authorization": f"Bearer {access_token}"}

@pytest_asyncio.fixture
async def test_client_entity(clean_db):
    """Create a test client entity"""
    client_data = {
        'name': 'Test Corporation',
        'type': 'CORPORATE',
        'status': 'ACTIVE',
        'contactPerson': 'John Doe',
        'email': 'contact@testcorp.com',
        'phone': '+1-555-0123',
        'website': 'www.testcorp.com',
        'addressLine1': '123 Business Ave',
        'city': 'New York',
        'state': 'NY',
        'postalCode': '10001',
        'country': 'US',
        'industry': 'Technology',
        'revenue': 5000000.00,
        'employeeCount': 250
    }
    
    client = await clean_db.client.create(data=client_data)
    return client

@pytest_asyncio.fixture
async def test_contract(clean_db, test_user, test_client_entity):
    """Create a test contract"""
    contract_data = {
        'title': 'Test Service Agreement',
        'type': 'MSA',
        'status': 'DRAFT',
        'clientId': test_client_entity.id,
        'counterparty': 'Service Provider Inc.',
        'content': 'This is a test contract content.',
        'aiRiskScore': 0.3,
        'riskLevel': 'MEDIUM',
        'aiSummary': 'AI Analysis: Standard service agreement with moderate risk.',
        'value': 100000.00,
        'currency': 'USD',
        'effectiveDate': '2024-01-01',
        'expirationDate': '2025-01-01',
        'priority': 'MEDIUM',
        'tags': ['test', 'service'],
        'createdById': test_user.id
    }
    
    contract = await clean_db.contract.create(data=contract_data)
    return contract

@pytest_asyncio.fixture
async def test_matter(clean_db, test_user, test_client_entity):
    """Create a test matter"""
    matter_data = {
        'title': 'Test Legal Matter',
        'description': 'A test legal matter for litigation',
        'type': 'LITIGATION',
        'status': 'OPEN',
        'priority': 'HIGH',
        'clientId': test_client_entity.id,
        'budget': 250000.00,
        'spentAmount': 50000.00,
        'billingRate': 450.00,
        'startDate': '2024-01-01',
        'targetCloseDate': '2024-12-31',
        'assignedToId': test_user.id,
        'createdById': test_user.id,
        'tags': ['test', 'litigation']
    }
    
    matter = await clean_db.matter.create(data=matter_data)
    return matter

# Mock fixtures for external services
@pytest.fixture
def mock_openai():
    """Mock OpenAI service"""
    mock = MagicMock()
    mock.chat.completions.create = AsyncMock()
    mock.chat.completions.create.return_value.choices = [
        MagicMock(message=MagicMock(content="Mock AI response"))
    ]
    return mock

@pytest.fixture
def mock_anthropic():
    """Mock Anthropic service"""
    mock = MagicMock()
    mock.messages.create = AsyncMock()
    mock.messages.create.return_value.content = [
        MagicMock(text="Mock Claude response")
    ]
    return mock

@pytest.fixture
def mock_google_ai():
    """Mock Google AI service"""
    mock = MagicMock()
    mock.generate_content = AsyncMock()
    mock.generate_content.return_value.text = "Mock Gemini response"
    return mock

@pytest.fixture
def mock_ai_services(mock_openai, mock_anthropic, mock_google_ai):
    """Mock all AI services"""
    return {
        'openai': mock_openai,
        'anthropic': mock_anthropic,
        'google': mock_google_ai
    }

@pytest.fixture
def temp_upload_dir():
    """Create a temporary directory for file uploads"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)

@pytest.fixture
def sample_pdf_file(temp_upload_dir):
    """Create a sample PDF file for testing"""
    pdf_path = temp_upload_dir / "test_contract.pdf"
    pdf_path.write_bytes(b"%PDF-1.4 fake pdf content for testing")
    return pdf_path

@pytest.fixture
def sample_docx_file(temp_upload_dir):
    """Create a sample DOCX file for testing"""
    docx_path = temp_upload_dir / "test_document.docx"
    docx_path.write_bytes(b"PK fake docx content for testing")
    return docx_path

# Database transaction fixtures
@pytest_asyncio.fixture
async def db_transaction(clean_db):
    """Provide a database transaction that can be rolled back"""
    # Note: Prisma doesn't support manual transactions in the same way as SQLAlchemy
    # This is a placeholder for when we need transaction testing
    yield clean_db

# Performance testing fixtures
@pytest.fixture
def performance_timer():
    """Timer for performance testing"""
    import time
    
    class Timer:
        def __init__(self):
            self.start_time = None
            self.end_time = None
        
        def start(self):
            self.start_time = time.time()
        
        def stop(self):
            self.end_time = time.time()
        
        @property
        def elapsed(self):
            if self.start_time and self.end_time:
                return self.end_time - self.start_time
            return 0
    
    return Timer()

# Authentication test utilities
class AuthTestUtils:
    @staticmethod
    def create_token_for_user(user):
        """Create a JWT token for a user"""
        return create_access_token(data={"sub": user.email})
    
    @staticmethod
    def create_headers_for_user(user):
        """Create authorization headers for a user"""
        token = AuthTestUtils.create_token_for_user(user)
        return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_utils():
    """Authentication testing utilities"""
    return AuthTestUtils

# Mock Redis for testing
@pytest.fixture
def mock_redis():
    """Mock Redis client for testing"""
    from unittest.mock import AsyncMock
    
    mock = AsyncMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock(return_value=True)
    mock.delete = AsyncMock(return_value=True)
    mock.exists = AsyncMock(return_value=False)
    mock.expire = AsyncMock(return_value=True)
    
    return mock

# API testing utilities
@pytest.fixture
def api_test_utils():
    """API testing utilities"""
    
    class APITestUtils:
        @staticmethod
        def assert_api_error(response, status_code, error_code=None):
            """Assert API error response format"""
            assert response.status_code == status_code
            data = response.json()
            assert "detail" in data
            if error_code:
                assert data.get("code") == error_code
        
        @staticmethod
        def assert_api_success(response, status_code=200):
            """Assert API success response"""
            assert response.status_code == status_code
            return response.json()
        
        @staticmethod
        def assert_pagination_response(response):
            """Assert paginated response format"""
            data = response.json()
            assert "items" in data
            assert "total" in data
            assert "page" in data
            assert "size" in data
            assert "pages" in data
    
    return APITestUtils