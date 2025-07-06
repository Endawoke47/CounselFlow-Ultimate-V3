"""
CounselFlow Ultimate V3 - AI Services Tests
==========================================

Comprehensive tests for AI-powered legal analysis, document generation, and orchestration.
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient
from app.services.ai_service import AIService
from app.services.ai_orchestrator import AIOrchestrator

class TestAIService:
    """Test core AI service functionality"""
    
    @pytest.mark.ai
    async def test_analyze_contract_openai(self, clean_db, mock_openai):
        """Test contract analysis using OpenAI"""
        ai_service = AIService(clean_db)
        
        # Mock OpenAI response
        mock_openai.chat.completions.create.return_value.choices = [
            MagicMock(message=MagicMock(content='{"risk_score": 0.7, "risk_level": "HIGH", "summary": "High risk contract with liability issues", "key_risks": ["unlimited liability", "broad indemnification"], "recommendations": ["Add liability caps", "Narrow indemnification scope"]}'))
        ]
        
        with patch('app.services.ai_service.openai', mock_openai):
            result = await ai_service.analyze_contract(
                content="Software license agreement with unlimited liability and broad indemnification clauses.",
                contract_type="LICENSING"
            )
        
        assert result["risk_score"] == 0.7
        assert result["risk_level"] == "HIGH"
        assert "liability" in result["summary"]
        assert len(result["key_risks"]) > 0
        assert len(result["recommendations"]) > 0
    
    @pytest.mark.ai
    async def test_analyze_contract_anthropic(self, clean_db, mock_anthropic):
        """Test contract analysis using Anthropic Claude"""
        ai_service = AIService(clean_db)
        
        # Mock Anthropic response
        mock_anthropic.messages.create.return_value.content = [
            MagicMock(text='{"risk_score": 0.5, "risk_level": "MEDIUM", "summary": "Medium risk contract with standard terms", "key_risks": ["termination clause", "payment terms"], "recommendations": ["Review termination notice", "Clarify payment schedule"]}')
        ]
        
        with patch('app.services.ai_service.anthropic', mock_anthropic):
            result = await ai_service.analyze_contract(
                content="Standard service agreement with 30-day termination clause.",
                contract_type="MSA",
                provider="anthropic"
            )
        
        assert result["risk_score"] == 0.5
        assert result["risk_level"] == "MEDIUM"
        assert "standard terms" in result["summary"]
    
    @pytest.mark.ai
    async def test_generate_document_success(self, clean_db, mock_openai):
        """Test document generation functionality"""
        ai_service = AIService(clean_db)
        
        # Mock OpenAI response for document generation
        mock_openai.chat.completions.create.return_value.choices = [
            MagicMock(message=MagicMock(content="MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into between Company A and Company B...\n\nTERM: This Agreement shall remain in effect for 3 years."))
        ]
        
        with patch('app.services.ai_service.openai', mock_openai):
            result = await ai_service.generate_document(
                document_type="NDA",
                parties=["Company A", "Company B"],
                key_terms={"duration": "3 years", "territory": "global"}
            )
        
        assert "NON-DISCLOSURE AGREEMENT" in result["content"]
        assert "Company A" in result["content"]
        assert "Company B" in result["content"]
        assert "3 years" in result["content"]
    
    @pytest.mark.ai
    async def test_extract_key_terms(self, clean_db, mock_openai):
        """Test key terms extraction from contract"""
        ai_service = AIService(clean_db)
        
        # Mock OpenAI response for key terms extraction
        mock_openai.chat.completions.create.return_value.choices = [
            MagicMock(message=MagicMock(content='{"liability_cap": "$1,000,000", "termination_notice": "30 days", "payment_terms": "Net 30", "governing_law": "Delaware", "parties": ["Acme Corp", "Service Provider Inc."]}'))
        ]
        
        with patch('app.services.ai_service.openai', mock_openai):
            result = await ai_service.extract_key_terms(
                content="This agreement limits liability to $1,000,000 and requires 30-day notice for termination. Payment terms are Net 30. Governed by Delaware law."
            )
        
        assert result["liability_cap"] == "$1,000,000"
        assert result["termination_notice"] == "30 days"
        assert result["payment_terms"] == "Net 30"
        assert result["governing_law"] == "Delaware"
    
    @pytest.mark.ai
    async def test_legal_research(self, clean_db, mock_openai):
        """Test legal research functionality"""
        ai_service = AIService(clean_db)
        
        # Mock OpenAI response for legal research
        mock_openai.chat.completions.create.return_value.choices = [
            MagicMock(message=MagicMock(content='{"relevant_cases": ["Smith v. Jones (2023)", "Contract Corp v. Legal Inc (2022)"], "key_principles": ["Good faith interpretation", "Commercial reasonableness"], "jurisdiction_notes": "Recent trends favor narrow interpretation of liability clauses", "recommendations": ["Review recent precedents", "Consider jurisdiction-specific variations"]}'))
        ]
        
        with patch('app.services.ai_service.openai', mock_openai):
            result = await ai_service.legal_research(
                query="liability clauses in software licensing agreements",
                jurisdiction="US",
                practice_area="contract_law"
            )
        
        assert len(result["relevant_cases"]) > 0
        assert len(result["key_principles"]) > 0
        assert "liability clauses" in result["jurisdiction_notes"]
    
    @pytest.mark.ai
    async def test_ai_service_error_handling(self, clean_db, mock_openai):
        """Test AI service error handling"""
        ai_service = AIService(clean_db)
        
        # Mock OpenAI to raise an exception
        mock_openai.chat.completions.create.side_effect = Exception("API Error")
        
        with patch('app.services.ai_service.openai', mock_openai):
            with pytest.raises(Exception) as exc_info:
                await ai_service.analyze_contract(
                    content="Test contract content",
                    contract_type="MSA"
                )
            
            assert "API Error" in str(exc_info.value)
    
    @pytest.mark.ai
    async def test_ai_service_fallback_provider(self, clean_db, mock_openai, mock_anthropic):
        """Test AI service fallback to secondary provider"""
        ai_service = AIService(clean_db)
        
        # Mock OpenAI to fail
        mock_openai.chat.completions.create.side_effect = Exception("OpenAI API Error")
        
        # Mock Anthropic to succeed
        mock_anthropic.messages.create.return_value.content = [
            MagicMock(text='{"risk_score": 0.6, "risk_level": "MEDIUM", "summary": "Fallback analysis successful"}')
        ]
        
        with patch('app.services.ai_service.openai', mock_openai), \
             patch('app.services.ai_service.anthropic', mock_anthropic):
            
            result = await ai_service.analyze_contract_with_fallback(
                content="Test contract content",
                contract_type="MSA"
            )
        
        assert result["summary"] == "Fallback analysis successful"


class TestAIOrchestrator:
    """Test AI orchestrator for coordinating multiple AI services"""
    
    @pytest.mark.ai
    async def test_orchestrator_route_to_best_provider(self, clean_db):
        """Test orchestrator routing to the best AI provider"""
        orchestrator = AIOrchestrator(clean_db)
        
        # Mock provider selection logic
        with patch.object(orchestrator, '_select_best_provider', return_value='openai'), \
             patch.object(orchestrator, '_execute_with_provider') as mock_execute:
            
            mock_execute.return_value = {"result": "success", "provider": "openai"}
            
            result = await orchestrator.analyze_contract(
                content="Test contract",
                contract_type="MSA"
            )
            
            assert result["provider"] == "openai"
            mock_execute.assert_called_once()
    
    @pytest.mark.ai
    async def test_orchestrator_load_balancing(self, clean_db):
        """Test orchestrator load balancing across providers"""
        orchestrator = AIOrchestrator(clean_db)
        
        # Track provider usage
        provider_usage = {"openai": 0, "anthropic": 0, "google": 0}
        
        def mock_select_provider(*args, **kwargs):
            # Simple round-robin for testing
            providers = list(provider_usage.keys())
            min_usage = min(provider_usage.values())
            for provider in providers:
                if provider_usage[provider] == min_usage:
                    provider_usage[provider] += 1
                    return provider
        
        with patch.object(orchestrator, '_select_best_provider', side_effect=mock_select_provider), \
             patch.object(orchestrator, '_execute_with_provider') as mock_execute:
            
            mock_execute.return_value = {"result": "success"}
            
            # Execute multiple requests
            for _ in range(6):
                await orchestrator.analyze_contract(
                    content="Test contract",
                    contract_type="MSA"
                )
            
            # Should distribute load evenly
            assert all(count == 2 for count in provider_usage.values())
    
    @pytest.mark.ai
    async def test_orchestrator_quality_scoring(self, clean_db):
        """Test orchestrator quality scoring and provider selection"""
        orchestrator = AIOrchestrator(clean_db)
        
        # Mock quality metrics
        quality_scores = {
            'openai': {'accuracy': 0.95, 'speed': 0.8, 'cost': 0.7},
            'anthropic': {'accuracy': 0.92, 'speed': 0.9, 'cost': 0.8},
            'google': {'accuracy': 0.88, 'speed': 0.95, 'cost': 0.9}
        }
        
        with patch.object(orchestrator, '_get_provider_quality_scores', return_value=quality_scores):
            best_provider = orchestrator._select_best_provider(
                task_type="contract_analysis",
                priority="accuracy"
            )
            
            assert best_provider == "openai"  # Highest accuracy
            
            best_provider = orchestrator._select_best_provider(
                task_type="contract_analysis",
                priority="speed"
            )
            
            assert best_provider == "google"  # Highest speed


class TestAIAPIEndpoints:
    """Test AI-related API endpoints"""
    
    @pytest.mark.api
    @pytest.mark.ai
    async def test_ai_analyze_contract_endpoint(self, async_client: AsyncClient, auth_headers, test_contract, mock_ai_services, api_test_utils):
        """Test AI contract analysis API endpoint"""
        with patch('app.services.ai_service.AIService.analyze_contract') as mock_analysis:
            mock_analysis.return_value = {
                "risk_score": 0.75,
                "risk_level": "HIGH",
                "summary": "High risk contract with multiple issues",
                "key_risks": ["unlimited liability", "broad indemnification"],
                "recommendations": ["Add liability caps", "Narrow indemnification"],
                "confidence": 0.92
            }
            
            response = await async_client.post(
                f"/api/v1/ai/contracts/{test_contract.id}/analyze",
                headers=auth_headers
            )
            
            data = api_test_utils.assert_api_success(response)
            assert data["risk_score"] == 0.75
            assert data["risk_level"] == "HIGH"
            assert "confidence" in data
    
    @pytest.mark.api
    @pytest.mark.ai
    async def test_ai_generate_document_endpoint(self, async_client: AsyncClient, auth_headers, mock_ai_services, api_test_utils):
        """Test AI document generation API endpoint"""
        generation_data = {
            "document_type": "NDA",
            "parties": ["Company A", "Company B"],
            "key_terms": {
                "duration": "3 years",
                "territory": "global",
                "purpose": "software development"
            }
        }
        
        with patch('app.services.ai_service.AIService.generate_document') as mock_generation:
            mock_generation.return_value = {
                "content": "MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is between Company A and Company B...",
                "clauses_included": ["confidentiality", "return_of_materials", "term"],
                "suggestions": ["Consider adding specific penalties clause"],
                "confidence": 0.88
            }
            
            response = await async_client.post(
                "/api/v1/ai/generate-document",
                json=generation_data,
                headers=auth_headers
            )
            
            data = api_test_utils.assert_api_success(response)
            assert "MUTUAL NON-DISCLOSURE AGREEMENT" in data["content"]
            assert len(data["clauses_included"]) > 0
    
    @pytest.mark.api
    @pytest.mark.ai
    async def test_ai_legal_research_endpoint(self, async_client: AsyncClient, auth_headers, mock_ai_services, api_test_utils):
        """Test AI legal research API endpoint"""
        research_data = {
            "query": "contract interpretation precedents",
            "jurisdiction": "US",
            "practice_area": "contract_law",
            "date_range": "2020-2024"
        }
        
        with patch('app.services.ai_service.AIService.legal_research') as mock_research:
            mock_research.return_value = {
                "relevant_cases": [
                    "Smith v. Jones (2023)",
                    "Contract Corp v. Legal Inc (2022)"
                ],
                "key_principles": [
                    "Good faith interpretation",
                    "Commercial reasonableness"
                ],
                "jurisdiction_notes": "Recent trends favor narrow interpretation",
                "recommendations": ["Review recent precedents"],
                "confidence": 0.85
            }
            
            response = await async_client.post(
                "/api/v1/ai/legal-research",
                json=research_data,
                headers=auth_headers
            )
            
            data = api_test_utils.assert_api_success(response)
            assert len(data["relevant_cases"]) > 0
            assert len(data["key_principles"]) > 0
    
    @pytest.mark.api
    @pytest.mark.ai
    async def test_ai_extract_terms_endpoint(self, async_client: AsyncClient, auth_headers, mock_ai_services, api_test_utils):
        """Test AI key terms extraction API endpoint"""
        extraction_data = {
            "content": "This software license agreement has a liability cap of $500,000 and requires 60-day termination notice.",
            "document_type": "LICENSING"
        }
        
        with patch('app.services.ai_service.AIService.extract_key_terms') as mock_extraction:
            mock_extraction.return_value = {
                "liability_cap": "$500,000",
                "termination_notice": "60 days",
                "parties": [],
                "payment_terms": [],
                "governing_law": "Not specified",
                "key_dates": []
            }
            
            response = await async_client.post(
                "/api/v1/ai/extract-terms",
                json=extraction_data,
                headers=auth_headers
            )
            
            data = api_test_utils.assert_api_success(response)
            assert data["liability_cap"] == "$500,000"
            assert data["termination_notice"] == "60 days"
    
    @pytest.mark.api
    @pytest.mark.ai
    async def test_ai_chat_endpoint(self, async_client: AsyncClient, auth_headers, mock_ai_services, api_test_utils):
        """Test AI legal assistant chat endpoint"""
        chat_data = {
            "message": "What are the key considerations for software licensing agreements?",
            "context": {
                "practice_area": "intellectual_property",
                "jurisdiction": "US"
            }
        }
        
        with patch('app.services.ai_service.AIService.chat_response') as mock_chat:
            mock_chat.return_value = {
                "response": "Key considerations for software licensing agreements include: 1) Scope of license, 2) Liability limitations, 3) Intellectual property rights...",
                "suggested_actions": [
                    "Review license scope carefully",
                    "Negotiate liability caps"
                ],
                "related_topics": [
                    "intellectual_property",
                    "contract_negotiation"
                ]
            }
            
            response = await async_client.post(
                "/api/v1/ai/chat",
                json=chat_data,
                headers=auth_headers
            )
            
            data = api_test_utils.assert_api_success(response)
            assert "software licensing agreements" in data["response"]
            assert len(data["suggested_actions"]) > 0


class TestAITaskTracking:
    """Test AI task tracking and analytics"""
    
    @pytest.mark.ai
    async def test_ai_task_creation(self, clean_db, test_user):
        """Test AI task creation and tracking"""
        ai_service = AIService(clean_db)
        
        # Create an AI task
        task_data = {
            'type': 'CONTRACT_ANALYSIS',
            'status': 'COMPLETED',
            'inputData': {'contract_content': 'Test contract'},
            'result': {'risk_score': 0.7},
            'confidence': 0.9,
            'tokens': 1500,
            'model': 'GPT-4',
            'processingTime': 2500,
            'userId': test_user.id
        }
        
        task = await clean_db.aitask.create(data=task_data)
        
        assert task.type == 'CONTRACT_ANALYSIS'
        assert task.status == 'COMPLETED'
        assert task.confidence == 0.9
        assert task.userId == test_user.id
    
    @pytest.mark.api
    @pytest.mark.ai
    async def test_ai_analytics_endpoint(self, async_client: AsyncClient, auth_headers, clean_db, test_user, api_test_utils):
        """Test AI analytics and usage statistics endpoint"""
        # Create sample AI tasks for analytics
        tasks_data = [
            {
                'type': 'CONTRACT_ANALYSIS',
                'status': 'COMPLETED',
                'confidence': 0.95,
                'tokens': 1200,
                'model': 'GPT-4',
                'processingTime': 2000,
                'userId': test_user.id
            },
            {
                'type': 'DOCUMENT_GENERATION',
                'status': 'COMPLETED',
                'confidence': 0.88,
                'tokens': 800,
                'model': 'Claude-3',
                'processingTime': 1500,
                'userId': test_user.id
            }
        ]
        
        for task_data in tasks_data:
            await clean_db.aitask.create(data=task_data)
        
        response = await async_client.get("/api/v1/ai/analytics", headers=auth_headers)
        data = api_test_utils.assert_api_success(response)
        
        assert "total_tasks" in data
        assert "average_confidence" in data
        assert "by_type" in data
        assert "by_model" in data
        assert "performance_metrics" in data