"""
CounselFlow Ultimate V3 - Client Management API Tests
===================================================

Comprehensive tests for client CRUD operations, search, filtering, and validation.
"""

import pytest
from decimal import Decimal
from httpx import AsyncClient
from typing import Dict, Any

class TestClientsCRUD:
    """Test basic CRUD operations for clients"""
    
    @pytest.mark.api
    async def test_create_client_success(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test successful client creation"""
        client_data = {
            "name": "Acme Corporation",
            "type": "CORPORATE",
            "status": "ACTIVE",
            "contactPerson": "John Smith",
            "email": "contact@acme.com",
            "phone": "+1-555-0123",
            "website": "www.acme.com",
            "addressLine1": "123 Business Street",
            "city": "New York",
            "state": "NY",
            "postalCode": "10001",
            "country": "US",
            "industry": "Technology",
            "revenue": "5000000.00",
            "employeeCount": 250
        }
        
        response = await async_client.post("/api/v1/clients", json=client_data, headers=auth_headers)
        
        data = api_test_utils.assert_api_success(response, 201)
        assert data["name"] == client_data["name"]
        assert data["type"] == client_data["type"]
        assert data["email"] == client_data["email"]
        assert "id" in data
        assert "createdAt" in data
    
    @pytest.mark.api
    async def test_create_client_validation_errors(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test client creation with validation errors"""
        # Missing required fields
        invalid_data = {
            "name": "",  # Empty name
            "type": "INVALID_TYPE",  # Invalid type
            "email": "invalid-email"  # Invalid email format
        }
        
        response = await async_client.post("/api/v1/clients", json=invalid_data, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 422)
    
    @pytest.mark.api
    async def test_create_client_unauthorized(self, async_client: AsyncClient, api_test_utils):
        """Test client creation without authentication"""
        client_data = {"name": "Test Corp", "type": "CORPORATE"}
        
        response = await async_client.post("/api/v1/clients", json=client_data)
        
        api_test_utils.assert_api_error(response, 401)
    
    @pytest.mark.api
    async def test_get_client_success(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test successful client retrieval"""
        response = await async_client.get(f"/api/v1/clients/{test_client_entity.id}", headers=auth_headers)
        
        data = api_test_utils.assert_api_success(response)
        assert data["id"] == test_client_entity.id
        assert data["name"] == test_client_entity.name
        assert data["email"] == test_client_entity.email
    
    @pytest.mark.api
    async def test_get_client_not_found(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test client retrieval with non-existent ID"""
        fake_id = "550e8400-e29b-41d4-a716-446655440000"
        response = await async_client.get(f"/api/v1/clients/{fake_id}", headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 404)
    
    @pytest.mark.api
    async def test_update_client_success(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test successful client update"""
        update_data = {
            "name": "Updated Corporation Name",
            "contactPerson": "Jane Doe",
            "phone": "+1-555-9999"
        }
        
        response = await async_client.put(
            f"/api/v1/clients/{test_client_entity.id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        data = api_test_utils.assert_api_success(response)
        assert data["name"] == update_data["name"]
        assert data["contactPerson"] == update_data["contactPerson"]
        assert data["phone"] == update_data["phone"]
        assert "updatedAt" in data
    
    @pytest.mark.api
    async def test_update_client_partial(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test partial client update"""
        update_data = {"status": "PROSPECT"}
        
        response = await async_client.patch(
            f"/api/v1/clients/{test_client_entity.id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        data = api_test_utils.assert_api_success(response)
        assert data["status"] == update_data["status"]
        # Other fields should remain unchanged
        assert data["name"] == test_client_entity.name
    
    @pytest.mark.api
    async def test_delete_client_success(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test successful client deletion"""
        response = await async_client.delete(f"/api/v1/clients/{test_client_entity.id}", headers=auth_headers)
        
        api_test_utils.assert_api_success(response, 204)
        
        # Verify client is deleted
        get_response = await async_client.get(f"/api/v1/clients/{test_client_entity.id}", headers=auth_headers)
        api_test_utils.assert_api_error(get_response, 404)


class TestClientsListing:
    """Test client listing, pagination, and filtering"""
    
    @pytest.mark.api
    async def test_list_clients_success(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test successful client listing"""
        response = await async_client.get("/api/v1/clients", headers=auth_headers)
        
        data = api_test_utils.assert_api_success(response)
        api_test_utils.assert_pagination_response(response)
    
    @pytest.mark.api
    async def test_list_clients_pagination(self, async_client: AsyncClient, auth_headers, clean_db, api_test_utils):
        """Test client listing with pagination"""
        # Create multiple clients for pagination testing
        for i in range(25):
            client_data = {
                'name': f'Test Client {i}',
                'type': 'CORPORATE',
                'status': 'ACTIVE',
                'email': f'client{i}@test.com',
                'industry': 'Technology',
                'revenue': 1000000.00,
                'employeeCount': 100
            }
            await clean_db.client.create(data=client_data)
        
        # Test first page
        response = await async_client.get("/api/v1/clients?page=1&size=10", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        assert len(data["items"]) == 10
        assert data["page"] == 1
        assert data["size"] == 10
        assert data["total"] == 25
        assert data["pages"] == 3
        
        # Test second page
        response = await async_client.get("/api/v1/clients?page=2&size=10", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        assert len(data["items"]) == 10
        assert data["page"] == 2
    
    @pytest.mark.api
    async def test_list_clients_search(self, async_client: AsyncClient, auth_headers, clean_db, api_test_utils):
        """Test client search functionality"""
        # Create clients with specific names for search testing
        await clean_db.client.create(data={
            'name': 'Searchable Tech Corp',
            'type': 'CORPORATE',
            'status': 'ACTIVE',
            'email': 'search@tech.com',
            'industry': 'Technology',
            'revenue': 1000000.00,
            'employeeCount': 100
        })
        
        await clean_db.client.create(data={
            'name': 'Another Company',
            'type': 'STARTUP',
            'status': 'ACTIVE',
            'email': 'another@company.com',
            'industry': 'Finance',
            'revenue': 500000.00,
            'employeeCount': 50
        })
        
        # Search for "Searchable"
        response = await async_client.get("/api/v1/clients?search=Searchable", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        assert len(data["items"]) == 1
        assert "Searchable" in data["items"][0]["name"]
    
    @pytest.mark.api
    async def test_list_clients_filter_by_type(self, async_client: AsyncClient, auth_headers, clean_db, api_test_utils):
        """Test client filtering by type"""
        # Create clients of different types
        await clean_db.client.create(data={
            'name': 'Corporate Client',
            'type': 'CORPORATE',
            'status': 'ACTIVE',
            'email': 'corp@test.com',
            'industry': 'Technology',
            'revenue': 1000000.00,
            'employeeCount': 100
        })
        
        await clean_db.client.create(data={
            'name': 'Startup Client',
            'type': 'STARTUP',
            'status': 'ACTIVE',
            'email': 'startup@test.com',
            'industry': 'Technology',
            'revenue': 500000.00,
            'employeeCount': 25
        })
        
        # Filter by CORPORATE type
        response = await async_client.get("/api/v1/clients?type=CORPORATE", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        assert len(data["items"]) == 1
        assert data["items"][0]["type"] == "CORPORATE"
    
    @pytest.mark.api
    async def test_list_clients_filter_by_status(self, async_client: AsyncClient, auth_headers, clean_db, api_test_utils):
        """Test client filtering by status"""
        # Create clients with different statuses
        await clean_db.client.create(data={
            'name': 'Active Client',
            'type': 'CORPORATE',
            'status': 'ACTIVE',
            'email': 'active@test.com',
            'industry': 'Technology',
            'revenue': 1000000.00,
            'employeeCount': 100
        })
        
        await clean_db.client.create(data={
            'name': 'Prospect Client',
            'type': 'CORPORATE',
            'status': 'PROSPECT',
            'email': 'prospect@test.com',
            'industry': 'Technology',
            'revenue': 1000000.00,
            'employeeCount': 100
        })
        
        # Filter by PROSPECT status
        response = await async_client.get("/api/v1/clients?status=PROSPECT", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        assert len(data["items"]) == 1
        assert data["items"][0]["status"] == "PROSPECT"
    
    @pytest.mark.api
    async def test_list_clients_sorting(self, async_client: AsyncClient, auth_headers, clean_db, api_test_utils):
        """Test client listing with sorting"""
        # Create clients for sorting
        await clean_db.client.create(data={
            'name': 'Alpha Company',
            'type': 'CORPORATE',
            'status': 'ACTIVE',
            'email': 'alpha@test.com',
            'industry': 'Technology',
            'revenue': 1000000.00,
            'employeeCount': 100
        })
        
        await clean_db.client.create(data={
            'name': 'Zeta Company',
            'type': 'CORPORATE',
            'status': 'ACTIVE',
            'email': 'zeta@test.com',
            'industry': 'Technology',
            'revenue': 2000000.00,
            'employeeCount': 200
        })
        
        # Sort by name ascending
        response = await async_client.get("/api/v1/clients?sort=name&order=asc", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        names = [client["name"] for client in data["items"]]
        assert names == sorted(names)
        
        # Sort by name descending
        response = await async_client.get("/api/v1/clients?sort=name&order=desc", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        names = [client["name"] for client in data["items"]]
        assert names == sorted(names, reverse=True)


class TestClientValidation:
    """Test client data validation"""
    
    @pytest.mark.api
    async def test_client_email_uniqueness(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test email uniqueness validation"""
        duplicate_client = {
            "name": "Duplicate Email Corp",
            "type": "CORPORATE",
            "email": test_client_entity.email,  # Same email as existing client
            "industry": "Technology",
            "revenue": "1000000.00",
            "employeeCount": 100
        }
        
        response = await async_client.post("/api/v1/clients", json=duplicate_client, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 400)
    
    @pytest.mark.api
    async def test_client_invalid_enum_values(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test validation of enum fields"""
        invalid_client = {
            "name": "Invalid Enum Corp",
            "type": "INVALID_TYPE",  # Invalid client type
            "status": "INVALID_STATUS",  # Invalid status
            "email": "invalid@test.com",
            "country": "INVALID_COUNTRY",  # Invalid country code
            "industry": "Technology",
            "revenue": "1000000.00",
            "employeeCount": 100
        }
        
        response = await async_client.post("/api/v1/clients", json=invalid_client, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 422)
    
    @pytest.mark.api
    async def test_client_revenue_validation(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test revenue field validation"""
        invalid_client = {
            "name": "Negative Revenue Corp",
            "type": "CORPORATE",
            "email": "negative@test.com",
            "revenue": "-1000000.00",  # Negative revenue
            "employeeCount": 100,
            "industry": "Technology"
        }
        
        response = await async_client.post("/api/v1/clients", json=invalid_client, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 422)
    
    @pytest.mark.api
    async def test_client_employee_count_validation(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test employee count validation"""
        invalid_client = {
            "name": "Negative Employees Corp",
            "type": "CORPORATE",
            "email": "negativeemployees@test.com",
            "revenue": "1000000.00",
            "employeeCount": -50,  # Negative employee count
            "industry": "Technology"
        }
        
        response = await async_client.post("/api/v1/clients", json=invalid_client, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 422)


class TestClientPermissions:
    """Test role-based permissions for client operations"""
    
    @pytest.mark.rbac
    async def test_client_access_permissions(self, async_client: AsyncClient, client_headers, api_test_utils):
        """Test client user permissions on client endpoints"""
        # Client users should have limited access
        response = await async_client.get("/api/v1/clients", headers=client_headers)
        
        # Depending on implementation, might be 403 (forbidden) or filtered results
        assert response.status_code in [200, 403]
    
    @pytest.mark.rbac
    async def test_admin_full_access(self, async_client: AsyncClient, admin_headers, api_test_utils):
        """Test admin full access to client operations"""
        # Admin should have full access
        response = await async_client.get("/api/v1/clients", headers=admin_headers)
        api_test_utils.assert_api_success(response)
    
    @pytest.mark.rbac
    async def test_legal_counsel_access(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test legal counsel access to client operations"""
        # Legal counsel should have access to clients
        response = await async_client.get("/api/v1/clients", headers=auth_headers)
        api_test_utils.assert_api_success(response)


class TestClientStatistics:
    """Test client statistics and analytics endpoints"""
    
    @pytest.mark.api
    async def test_client_statistics(self, async_client: AsyncClient, auth_headers, clean_db, api_test_utils):
        """Test client statistics endpoint"""
        # Create various clients for statistics
        clients_data = [
            {'name': 'Corp1', 'type': 'CORPORATE', 'status': 'ACTIVE', 'industry': 'Technology', 'revenue': 1000000.00, 'employeeCount': 100, 'email': 'corp1@test.com'},
            {'name': 'Corp2', 'type': 'STARTUP', 'status': 'ACTIVE', 'industry': 'Healthcare', 'revenue': 500000.00, 'employeeCount': 50, 'email': 'corp2@test.com'},
            {'name': 'Corp3', 'type': 'ENTERPRISE', 'status': 'PROSPECT', 'industry': 'Finance', 'revenue': 5000000.00, 'employeeCount': 500, 'email': 'corp3@test.com'},
        ]
        
        for client_data in clients_data:
            await clean_db.client.create(data=client_data)
        
        response = await async_client.get("/api/v1/clients/statistics", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        # Should include various statistics
        assert "total" in data
        assert "by_type" in data
        assert "by_status" in data
        assert "by_industry" in data
        assert "total_revenue" in data