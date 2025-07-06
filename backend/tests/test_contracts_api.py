"""
CounselFlow Ultimate V3 - Contract Management API Tests
=====================================================

Comprehensive tests for contract CRUD operations, AI analysis, and file handling.
"""

import pytest
from decimal import Decimal
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock

class TestContractsCRUD:
    """Test basic CRUD operations for contracts"""
    
    @pytest.mark.api
    async def test_create_contract_success(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test successful contract creation"""
        contract_data = {
            "title": "Master Service Agreement",
            "type": "MSA",
            "status": "DRAFT",
            "clientId": test_client_entity.id,
            "counterparty": "Service Provider Inc.",
            "content": "This is a comprehensive master service agreement...",
            "value": "250000.00",
            "currency": "USD",
            "effectiveDate": "2024-01-01",
            "expirationDate": "2025-01-01",
            "priority": "HIGH",
            "tags": ["service", "technology", "annual"]
        }
        
        response = await async_client.post("/api/v1/contracts", json=contract_data, headers=auth_headers)
        
        data = api_test_utils.assert_api_success(response, 201)
        assert data["title"] == contract_data["title"]
        assert data["type"] == contract_data["type"]
        assert data["clientId"] == contract_data["clientId"]
        assert "id" in data
        assert "createdAt" in data
    
    @pytest.mark.api
    async def test_create_contract_with_ai_analysis(self, async_client: AsyncClient, auth_headers, test_client_entity, mock_ai_services, api_test_utils):
        """Test contract creation with AI analysis"""
        contract_data = {
            "title": "Software License Agreement",
            "type": "LICENSING",
            "status": "UNDER_REVIEW",
            "clientId": test_client_entity.id,
            "counterparty": "Software Vendor LLC",
            "content": "Software licensing agreement with broad indemnification clauses and unlimited liability exposure...",
            "value": "100000.00",
            "currency": "USD",
            "effectiveDate": "2024-01-01",
            "expirationDate": "2024-12-31",
            "priority": "HIGH",
            "enableAiAnalysis": True
        }
        
        with patch('app.services.ai_service.AIService.analyze_contract') as mock_analysis:
            mock_analysis.return_value = {
                "risk_score": 0.75,
                "risk_level": "HIGH",
                "summary": "High risk contract with broad liability clauses",
                "key_risks": ["unlimited liability", "broad indemnification"],
                "recommendations": ["Add liability caps", "Narrow indemnification scope"]
            }
            
            response = await async_client.post("/api/v1/contracts", json=contract_data, headers=auth_headers)
            
            data = api_test_utils.assert_api_success(response, 201)
            assert data["aiRiskScore"] == 0.75
            assert data["riskLevel"] == "HIGH"
            assert "High risk contract" in data["aiSummary"]
    
    @pytest.mark.api
    async def test_get_contract_success(self, async_client: AsyncClient, auth_headers, test_contract, api_test_utils):
        """Test successful contract retrieval"""
        response = await async_client.get(f"/api/v1/contracts/{test_contract.id}", headers=auth_headers)
        
        data = api_test_utils.assert_api_success(response)
        assert data["id"] == test_contract.id
        assert data["title"] == test_contract.title
        assert data["type"] == test_contract.type
    
    @pytest.mark.api
    async def test_get_contract_with_clauses(self, async_client: AsyncClient, auth_headers, test_contract, clean_db, api_test_utils):
        """Test contract retrieval with related clauses"""
        # Create sample clauses for the contract
        clause_data = {
            'contractId': test_contract.id,
            'text': 'Limitation of liability clause',
            'clauseType': 'liability',
            'riskRating': 'MEDIUM',
            'position': 1
        }
        await clean_db.clause.create(data=clause_data)
        
        response = await async_client.get(f"/api/v1/contracts/{test_contract.id}?include_clauses=true", headers=auth_headers)
        
        data = api_test_utils.assert_api_success(response)
        assert "clauses" in data
        assert len(data["clauses"]) > 0
        assert data["clauses"][0]["clauseType"] == "liability"
    
    @pytest.mark.api
    async def test_update_contract_success(self, async_client: AsyncClient, auth_headers, test_contract, api_test_utils):
        """Test successful contract update"""
        update_data = {
            "title": "Updated Service Agreement Title",
            "status": "EXECUTED",
            "signedDate": "2024-01-15",
            "priority": "LOW"
        }
        
        response = await async_client.put(
            f"/api/v1/contracts/{test_contract.id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        data = api_test_utils.assert_api_success(response)
        assert data["title"] == update_data["title"]
        assert data["status"] == update_data["status"]
        assert data["signedDate"] == update_data["signedDate"]
    
    @pytest.mark.api
    async def test_delete_contract_success(self, async_client: AsyncClient, auth_headers, test_contract, api_test_utils):
        """Test successful contract deletion"""
        response = await async_client.delete(f"/api/v1/contracts/{test_contract.id}", headers=auth_headers)
        
        api_test_utils.assert_api_success(response, 204)
        
        # Verify contract is deleted
        get_response = await async_client.get(f"/api/v1/contracts/{test_contract.id}", headers=auth_headers)
        api_test_utils.assert_api_error(get_response, 404)


class TestContractAIAnalysis:
    """Test AI-powered contract analysis features"""
    
    @pytest.mark.ai
    async def test_analyze_contract_endpoint(self, async_client: AsyncClient, auth_headers, test_contract, mock_ai_services, api_test_utils):
        """Test contract analysis endpoint"""
        with patch('app.services.ai_service.AIService.analyze_contract') as mock_analysis:
            mock_analysis.return_value = {
                "risk_score": 0.65,
                "risk_level": "MEDIUM",
                "summary": "Medium risk contract with standard terms",
                "key_risks": ["termination clause", "payment terms"],
                "recommendations": ["Review termination notice period", "Clarify payment schedule"],
                "confidence": 0.92
            }
            
            response = await async_client.post(f"/api/v1/contracts/{test_contract.id}/analyze", headers=auth_headers)
            
            data = api_test_utils.assert_api_success(response)
            assert data["risk_score"] == 0.65
            assert data["risk_level"] == "MEDIUM"
            assert "confidence" in data
            assert len(data["key_risks"]) > 0
            assert len(data["recommendations"]) > 0
    
    @pytest.mark.ai
    async def test_analyze_contract_content_extraction(self, async_client: AsyncClient, auth_headers, mock_ai_services, api_test_utils):
        """Test contract content analysis and key term extraction"""
        analysis_data = {
            "content": "This agreement contains liability limitations of $1,000,000 and a 30-day termination clause.",
            "analysis_type": "key_terms"
        }
        
        with patch('app.services.ai_service.AIService.extract_key_terms') as mock_extraction:
            mock_extraction.return_value = {
                "liability_cap": "$1,000,000",
                "termination_notice": "30 days",
                "key_dates": [],
                "parties": [],
                "payment_terms": []
            }
            
            response = await async_client.post("/api/v1/contracts/analyze-content", json=analysis_data, headers=auth_headers)
            
            data = api_test_utils.assert_api_success(response)
            assert "liability_cap" in data
            assert data["liability_cap"] == "$1,000,000"
            assert data["termination_notice"] == "30 days"
    
    @pytest.mark.ai
    async def test_contract_risk_scoring(self, async_client: AsyncClient, auth_headers, test_contract, mock_ai_services, api_test_utils):
        """Test contract risk scoring functionality"""
        with patch('app.services.ai_service.AIService.calculate_risk_score') as mock_scoring:
            mock_scoring.return_value = {
                "overall_risk": 0.8,
                "risk_factors": {
                    "liability": 0.9,
                    "termination": 0.6,
                    "payment": 0.7,
                    "ip_rights": 0.8
                },
                "critical_issues": ["Unlimited liability exposure", "Broad indemnification"],
                "risk_level": "HIGH"
            }
            
            response = await async_client.post(f"/api/v1/contracts/{test_contract.id}/risk-score", headers=auth_headers)
            
            data = api_test_utils.assert_api_success(response)
            assert data["overall_risk"] == 0.8
            assert data["risk_level"] == "HIGH"
            assert "risk_factors" in data
            assert len(data["critical_issues"]) > 0


class TestContractListing:
    """Test contract listing, filtering, and search"""
    
    @pytest.mark.api
    async def test_list_contracts_success(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test successful contract listing"""
        response = await async_client.get("/api/v1/contracts", headers=auth_headers)
        
        data = api_test_utils.assert_api_success(response)
        api_test_utils.assert_pagination_response(response)
    
    @pytest.mark.api
    async def test_list_contracts_filter_by_status(self, async_client: AsyncClient, auth_headers, clean_db, test_client_entity, test_user, api_test_utils):
        """Test contract filtering by status"""
        # Create contracts with different statuses
        contracts_data = [
            {
                'title': 'Draft Contract',
                'type': 'NDA',
                'status': 'DRAFT',
                'clientId': test_client_entity.id,
                'content': 'Draft contract content',
                'value': 10000.00,
                'currency': 'USD',
                'createdById': test_user.id
            },
            {
                'title': 'Executed Contract',
                'type': 'MSA',
                'status': 'EXECUTED',
                'clientId': test_client_entity.id,
                'content': 'Executed contract content',
                'value': 50000.00,
                'currency': 'USD',
                'createdById': test_user.id
            }
        ]
        
        for contract_data in contracts_data:
            await clean_db.contract.create(data=contract_data)
        
        # Filter by DRAFT status
        response = await async_client.get("/api/v1/contracts?status=DRAFT", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        for contract in data["items"]:
            assert contract["status"] == "DRAFT"
    
    @pytest.mark.api
    async def test_list_contracts_filter_by_type(self, async_client: AsyncClient, auth_headers, clean_db, test_client_entity, test_user, api_test_utils):
        """Test contract filtering by type"""
        # Create contracts of different types
        nda_contract = {
            'title': 'NDA Contract',
            'type': 'NDA',
            'status': 'DRAFT',
            'clientId': test_client_entity.id,
            'content': 'NDA content',
            'value': 0.00,
            'currency': 'USD',
            'createdById': test_user.id
        }
        
        await clean_db.contract.create(data=nda_contract)
        
        # Filter by NDA type
        response = await async_client.get("/api/v1/contracts?type=NDA", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        for contract in data["items"]:
            assert contract["type"] == "NDA"
    
    @pytest.mark.api
    async def test_list_contracts_filter_by_client(self, async_client: AsyncClient, auth_headers, test_contract, api_test_utils):
        """Test contract filtering by client"""
        response = await async_client.get(f"/api/v1/contracts?client_id={test_contract.clientId}", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        for contract in data["items"]:
            assert contract["clientId"] == test_contract.clientId
    
    @pytest.mark.api
    async def test_list_contracts_search(self, async_client: AsyncClient, auth_headers, clean_db, test_client_entity, test_user, api_test_utils):
        """Test contract search functionality"""
        searchable_contract = {
            'title': 'Searchable Software License Agreement',
            'type': 'LICENSING',
            'status': 'DRAFT',
            'clientId': test_client_entity.id,
            'content': 'Software licensing with unique terms',
            'value': 75000.00,
            'currency': 'USD',
            'createdById': test_user.id
        }
        
        await clean_db.contract.create(data=searchable_contract)
        
        # Search for "Searchable"
        response = await async_client.get("/api/v1/contracts?search=Searchable", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        assert len(data["items"]) > 0
        assert any("Searchable" in contract["title"] for contract in data["items"])
    
    @pytest.mark.api
    async def test_list_contracts_sort_by_value(self, async_client: AsyncClient, auth_headers, clean_db, test_client_entity, test_user, api_test_utils):
        """Test contract sorting by value"""
        # Create contracts with different values
        contracts_data = [
            {
                'title': 'Low Value Contract',
                'type': 'NDA',
                'status': 'DRAFT',
                'clientId': test_client_entity.id,
                'content': 'Low value content',
                'value': 1000.00,
                'currency': 'USD',
                'createdById': test_user.id
            },
            {
                'title': 'High Value Contract',
                'type': 'MSA',
                'status': 'DRAFT',
                'clientId': test_client_entity.id,
                'content': 'High value content',
                'value': 100000.00,
                'currency': 'USD',
                'createdById': test_user.id
            }
        ]
        
        for contract_data in contracts_data:
            await clean_db.contract.create(data=contract_data)
        
        # Sort by value descending
        response = await async_client.get("/api/v1/contracts?sort=value&order=desc", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        values = [float(contract["value"]) for contract in data["items"]]
        assert values == sorted(values, reverse=True)


class TestContractValidation:
    """Test contract validation and business rules"""
    
    @pytest.mark.api
    async def test_contract_date_validation(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test contract date validation"""
        invalid_contract = {
            "title": "Invalid Date Contract",
            "type": "MSA",
            "clientId": test_client_entity.id,
            "effectiveDate": "2025-01-01",
            "expirationDate": "2024-01-01",  # Expiration before effective date
            "value": "100000.00",
            "currency": "USD"
        }
        
        response = await async_client.post("/api/v1/contracts", json=invalid_contract, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 422)
    
    @pytest.mark.api
    async def test_contract_value_validation(self, async_client: AsyncClient, auth_headers, test_client_entity, api_test_utils):
        """Test contract value validation"""
        invalid_contract = {
            "title": "Negative Value Contract",
            "type": "MSA",
            "clientId": test_client_entity.id,
            "value": "-100000.00",  # Negative value
            "currency": "USD"
        }
        
        response = await async_client.post("/api/v1/contracts", json=invalid_contract, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 422)
    
    @pytest.mark.api
    async def test_contract_required_fields(self, async_client: AsyncClient, auth_headers, api_test_utils):
        """Test contract required field validation"""
        incomplete_contract = {
            "title": "",  # Empty title
            "type": "MSA"
            # Missing clientId and other required fields
        }
        
        response = await async_client.post("/api/v1/contracts", json=incomplete_contract, headers=auth_headers)
        
        api_test_utils.assert_api_error(response, 422)


class TestContractFileHandling:
    """Test contract file upload and processing"""
    
    @pytest.mark.api
    async def test_upload_contract_file(self, async_client: AsyncClient, auth_headers, test_contract, sample_pdf_file, api_test_utils):
        """Test contract file upload"""
        with open(sample_pdf_file, "rb") as f:
            files = {"file": ("contract.pdf", f, "application/pdf")}
            
            response = await async_client.post(
                f"/api/v1/contracts/{test_contract.id}/upload", 
                files=files, 
                headers=auth_headers
            )
            
            data = api_test_utils.assert_api_success(response, 201)
            assert "file_id" in data
            assert data["filename"] == "contract.pdf"
            assert data["content_type"] == "application/pdf"
    
    @pytest.mark.api
    async def test_upload_invalid_file_type(self, async_client: AsyncClient, auth_headers, test_contract, temp_upload_dir, api_test_utils):
        """Test upload of invalid file type"""
        # Create a fake executable file
        invalid_file = temp_upload_dir / "malicious.exe"
        invalid_file.write_bytes(b"MZ fake executable")
        
        with open(invalid_file, "rb") as f:
            files = {"file": ("malicious.exe", f, "application/x-executable")}
            
            response = await async_client.post(
                f"/api/v1/contracts/{test_contract.id}/upload", 
                files=files, 
                headers=auth_headers
            )
            
            api_test_utils.assert_api_error(response, 400)


class TestContractStatistics:
    """Test contract statistics and analytics"""
    
    @pytest.mark.api
    async def test_contract_statistics(self, async_client: AsyncClient, auth_headers, clean_db, test_client_entity, test_user, api_test_utils):
        """Test contract statistics endpoint"""
        # Create various contracts for statistics
        contracts_data = [
            {
                'title': 'NDA 1',
                'type': 'NDA',
                'status': 'EXECUTED',
                'clientId': test_client_entity.id,
                'content': 'NDA content',
                'value': 0.00,
                'currency': 'USD',
                'riskLevel': 'LOW',
                'createdById': test_user.id
            },
            {
                'title': 'MSA 1',
                'type': 'MSA',
                'status': 'DRAFT',
                'clientId': test_client_entity.id,
                'content': 'MSA content',
                'value': 100000.00,
                'currency': 'USD',
                'riskLevel': 'HIGH',
                'createdById': test_user.id
            }
        ]
        
        for contract_data in contracts_data:
            await clean_db.contract.create(data=contract_data)
        
        response = await async_client.get("/api/v1/contracts/statistics", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        # Should include various statistics
        assert "total" in data
        assert "by_type" in data
        assert "by_status" in data
        assert "by_risk_level" in data
        assert "total_value" in data
        assert "average_value" in data