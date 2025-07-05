"""
CounselFlow Ultimate V3 - AI Orchestrator API
Advanced multi-LLM AI services for legal workflows
"""

from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status
from pydantic import BaseModel, Field
import structlog

from app.services.ai_orchestrator import ai_orchestrator, AIProvider
from app.core.config import settings

logger = structlog.get_logger()

router = APIRouter()


# Request/Response Models
class ContractAnalysisRequest(BaseModel):
    contract_text: str = Field(..., description="Contract text to analyze")
    analysis_type: str = Field(default="risk_assessment", description="Type of analysis")
    use_consensus: bool = Field(default=False, description="Use multi-provider consensus")


class DocumentGenerationRequest(BaseModel):
    document_type: str = Field(..., description="Type of document to generate")
    parameters: Dict[str, Any] = Field(..., description="Document parameters")
    use_consensus: bool = Field(default=False, description="Use multi-provider consensus")


class LegalResearchRequest(BaseModel):
    topic: str = Field(..., description="Legal topic to research")
    jurisdiction: str = Field(default="US", description="Legal jurisdiction")
    research_depth: str = Field(default="comprehensive", description="Research depth")


class LitigationStrategyRequest(BaseModel):
    case_details: Dict[str, Any] = Field(..., description="Case details")
    analysis_type: str = Field(default="comprehensive", description="Analysis type")


class LegalMemoRequest(BaseModel):
    memo_request: Dict[str, Any] = Field(..., description="Memo requirements")


class AITextGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Text prompt")
    provider: Optional[str] = Field(None, description="Preferred AI provider")
    model: Optional[str] = Field(None, description="Specific model")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens")
    temperature: Optional[float] = Field(None, description="Temperature for generation")


class AIProviderStatus(BaseModel):
    provider: str
    available: bool
    configured: bool
    model: Optional[str] = None


class AIServiceMetrics(BaseModel):
    total_requests: int
    active_providers: List[str]
    average_response_time: float
    success_rate: float


# API Endpoints
@router.get("/status", summary="Get AI Orchestrator Status")
async def get_ai_status():
    """Get the status of all AI providers and services"""
    try:
        provider_status = ai_orchestrator.get_provider_status()
        available_providers = ai_orchestrator.get_available_providers()
        
        return {
            "initialized": ai_orchestrator.is_initialized,
            "available_providers": [p.value for p in available_providers],
            "provider_status": provider_status,
            "default_provider": ai_orchestrator.default_provider.value,
            "services_configured": settings.ai_services_configured
        }
    except Exception as e:
        logger.error("Failed to get AI status", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve AI orchestrator status"
        )


@router.get("/health", summary="AI Services Health Check")
async def health_check():
    """Perform a health check on AI services"""
    try:
        from app.services.ai_orchestrator import check_ai_health
        
        is_healthy = await check_ai_health()
        
        return {
            "healthy": is_healthy,
            "timestamp": "2024-01-20T10:30:00Z",
            "services": "operational" if is_healthy else "degraded"
        }
    except Exception as e:
        logger.error("AI health check failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI services health check failed"
        )


@router.post("/generate-text", summary="Generate Text with AI")
async def generate_text(request: AITextGenerationRequest):
    """Generate text using AI providers"""
    try:
        if not ai_orchestrator.is_initialized:
            await ai_orchestrator.initialize()
        
        provider = None
        if request.provider:
            try:
                provider = AIProvider(request.provider)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid provider: {request.provider}"
                )
        
        response = await ai_orchestrator.generate_text(
            prompt=request.prompt,
            provider=provider,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        
        return {
            "content": response.content,
            "provider": response.provider.value,
            "model": response.model,
            "tokens_used": response.tokens_used,
            "processing_time": response.processing_time
        }
        
    except Exception as e:
        logger.error("Text generation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text generation failed: {str(e)}"
        )


@router.post("/analyze-contract", summary="Analyze Contract with AI")
async def analyze_contract(request: ContractAnalysisRequest):
    """Analyze contract using AI with optional consensus"""
    try:
        if not ai_orchestrator.is_initialized:
            await ai_orchestrator.initialize()
        
        # Validate analysis type
        valid_types = ["risk_assessment", "clause_extraction", "compliance_check", "legal_strategy"]
        if request.analysis_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid analysis type. Must be one of: {valid_types}"
            )
        
        analysis_result = await ai_orchestrator.analyze_contract(
            contract_text=request.contract_text,
            analysis_type=request.analysis_type,
            use_consensus=request.use_consensus
        )
        
        return analysis_result
        
    except Exception as e:
        logger.error("Contract analysis failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contract analysis failed: {str(e)}"
        )


@router.post("/generate-document", summary="Generate Legal Document")
async def generate_document(request: DocumentGenerationRequest):
    """Generate legal document using AI"""
    try:
        if not ai_orchestrator.is_initialized:
            await ai_orchestrator.initialize()
        
        # Validate document type
        valid_types = [
            "nda", "service_agreement", "privacy_policy", 
            "employment_agreement", "license_agreement", "partnership_agreement"
        ]
        if request.document_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document type. Must be one of: {valid_types}"
            )
        
        document_result = await ai_orchestrator.generate_document(
            document_type=request.document_type,
            parameters=request.parameters,
            use_consensus=request.use_consensus
        )
        
        return document_result
        
    except Exception as e:
        logger.error("Document generation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document generation failed: {str(e)}"
        )


@router.post("/research-legal-topic", summary="Conduct Legal Research")
async def research_legal_topic(request: LegalResearchRequest):
    """Conduct AI-powered legal research"""
    try:
        if not ai_orchestrator.is_initialized:
            await ai_orchestrator.initialize()
        
        research_result = await ai_orchestrator.research_legal_topic(
            topic=request.topic,
            jurisdiction=request.jurisdiction,
            research_depth=request.research_depth
        )
        
        return research_result
        
    except Exception as e:
        logger.error("Legal research failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Legal research failed: {str(e)}"
        )


@router.post("/analyze-litigation-strategy", summary="Analyze Litigation Strategy")
async def analyze_litigation_strategy(request: LitigationStrategyRequest):
    """Analyze litigation strategy using AI"""
    try:
        if not ai_orchestrator.is_initialized:
            await ai_orchestrator.initialize()
        
        strategy_result = await ai_orchestrator.analyze_litigation_strategy(
            case_details=request.case_details,
            analysis_type=request.analysis_type
        )
        
        return strategy_result
        
    except Exception as e:
        logger.error("Litigation strategy analysis failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Litigation strategy analysis failed: {str(e)}"
        )


@router.post("/generate-legal-memo", summary="Generate Legal Memorandum")
async def generate_legal_memo(request: LegalMemoRequest):
    """Generate legal memorandum using AI"""
    try:
        if not ai_orchestrator.is_initialized:
            await ai_orchestrator.initialize()
        
        memo_result = await ai_orchestrator.generate_legal_memo(
            memo_request=request.memo_request
        )
        
        return memo_result
        
    except Exception as e:
        logger.error("Legal memo generation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Legal memo generation failed: {str(e)}"
        )


@router.get("/providers", summary="Get Available AI Providers")
async def get_providers():
    """Get list of available AI providers"""
    try:
        available_providers = ai_orchestrator.get_available_providers()
        provider_status = ai_orchestrator.get_provider_status()
        
        return {
            "available_providers": [
                {
                    "name": provider.value,
                    "available": True,
                    "configured": provider_status[provider.value]["configured"]
                }
                for provider in available_providers
            ],
            "default_provider": ai_orchestrator.default_provider.value,
            "total_providers": len(available_providers)
        }
        
    except Exception as e:
        logger.error("Failed to get providers", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve AI providers"
        )


@router.get("/capabilities", summary="Get AI Orchestrator Capabilities")
async def get_capabilities():
    """Get comprehensive list of AI orchestrator capabilities"""
    return {
        "contract_analysis": {
            "types": ["risk_assessment", "clause_extraction", "compliance_check", "legal_strategy"],
            "supports_consensus": True,
            "description": "Comprehensive contract analysis with risk assessment and compliance checking"
        },
        "document_generation": {
            "types": ["nda", "service_agreement", "privacy_policy", "employment_agreement", "license_agreement", "partnership_agreement"],
            "supports_consensus": True,
            "description": "AI-powered legal document generation with multiple templates"
        },
        "legal_research": {
            "jurisdictions": ["US", "UK", "EU", "CA", "AU"],
            "depth_levels": ["basic", "comprehensive", "detailed"],
            "description": "AI-powered legal research with case law and regulatory analysis"
        },
        "litigation_strategy": {
            "analysis_types": ["comprehensive", "risk_focused", "settlement_oriented"],
            "description": "Strategic litigation analysis and recommendations"
        },
        "legal_memorandum": {
            "formats": ["standard", "executive", "detailed"],
            "description": "Professional legal memorandum generation"
        },
        "ai_providers": {
            "supported": ["openai", "anthropic", "google"],
            "consensus_available": True,
            "description": "Multi-LLM support with consensus capabilities"
        }
    }


@router.post("/batch-analysis", summary="Batch AI Analysis")
async def batch_analysis(
    requests: List[Dict[str, Any]],
    background_tasks: BackgroundTasks
):
    """Submit multiple AI analysis requests for batch processing"""
    try:
        if len(requests) > 50:  # Limit batch size
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch size cannot exceed 50 requests"
            )
        
        # Generate batch ID
        import uuid
        batch_id = str(uuid.uuid4())
        
        # Add to background tasks for processing
        # In a production system, this would use a proper task queue like Celery
        background_tasks.add_task(process_batch_analysis, batch_id, requests)
        
        return {
            "batch_id": batch_id,
            "status": "submitted",
            "request_count": len(requests),
            "estimated_completion": "5-10 minutes"
        }
        
    except Exception as e:
        logger.error("Batch analysis submission failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch analysis submission failed: {str(e)}"
        )


async def process_batch_analysis(batch_id: str, requests: List[Dict[str, Any]]):
    """Process batch analysis requests (background task)"""
    import asyncio
    
    try:
        logger.info("Starting batch analysis", batch_id=batch_id, request_count=len(requests))
        
        # In a real implementation, this would:
        # 1. Process each request
        # 2. Store results in database
        # 3. Send notifications when complete
        # 4. Handle failures gracefully
        
        for i, request in enumerate(requests):
            logger.info("Processing batch request", batch_id=batch_id, request_index=i)
            # Process individual request here
            await asyncio.sleep(1)  # Simulate processing time
        
        logger.info("Batch analysis completed", batch_id=batch_id)
        
    except Exception as e:
        logger.error("Batch analysis failed", batch_id=batch_id, error=str(e))


# Initialize AI orchestrator on startup
@router.on_event("startup")
async def startup_ai_orchestrator():
    """Initialize AI orchestrator on API startup"""
    try:
        await ai_orchestrator.initialize()
        logger.info("AI Orchestrator initialized successfully")
    except Exception as e:
        logger.error("Failed to initialize AI Orchestrator", error=str(e))