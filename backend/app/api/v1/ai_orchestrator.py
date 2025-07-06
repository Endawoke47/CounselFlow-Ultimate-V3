"""
CounselFlow Ultimate V3 - AI Orchestrator API
Advanced multi-LLM AI services for legal workflows
"""

from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status, Request
from pydantic import BaseModel, Field, validator
import structlog
import asyncio
from datetime import datetime
import uuid

from app.services.ai_orchestrator import AIOrchestrator, AIProvider
from app.core.config import settings
from app.middleware.rate_limiting import rate_limit

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
    prompt: str = Field(..., description="Text prompt", min_length=1, max_length=50000)
    provider: Optional[str] = Field(None, description="Preferred AI provider")
    model: Optional[str] = Field(None, description="Specific model")
    max_tokens: Optional[int] = Field(1000, description="Maximum tokens", ge=1, le=4000)
    temperature: Optional[float] = Field(0.7, description="Generation temperature", ge=0.0, le=2.0)
    use_cache: bool = Field(True, description="Use response caching")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    
    @validator('provider')
    def validate_provider(cls, v):
        if v and v not in [provider.value for provider in AIProvider]:
            raise ValueError(f"Invalid provider. Must be one of: {[p.value for p in AIProvider]}")
        return v


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


class AIHealthResponse(BaseModel):
    overall_status: str
    providers: Dict[str, Dict[str, Any]]
    cache_size: int
    total_requests: int
    total_errors: int
    timestamp: str


class AIMetricsResponse(BaseModel):
    request_counts: Dict[str, int]
    error_counts: Dict[str, int]
    error_rates: Dict[str, float]
    circuit_breaker_states: Dict[str, str]
    health_status: Dict[str, bool]
    cache_metrics: Dict[str, Any]
    last_health_checks: Dict[str, Optional[str]]


# Global AI orchestrator instance
ai_orchestrator: Optional[AIOrchestrator] = None


async def get_ai_orchestrator() -> AIOrchestrator:
    """Dependency to get AI orchestrator instance"""
    global ai_orchestrator
    if ai_orchestrator is None:
        ai_orchestrator = AIOrchestrator()
        await ai_orchestrator.initialize()
    elif not ai_orchestrator.is_initialized:
        await ai_orchestrator.initialize()
    return ai_orchestrator


# API Endpoints
@router.get("/health", response_model=AIHealthResponse, summary="AI Services Health Check")
async def get_ai_health(orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)):
    """Comprehensive health check for all AI providers"""
    try:
        health_data = await orchestrator.health_check()
        return AIHealthResponse(**health_data)
    except Exception as e:
        logger.error("AI health check failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI health check failed: {str(e)}"
        )


@router.get("/metrics", response_model=AIMetricsResponse, summary="AI Services Metrics")
async def get_ai_metrics(orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)):
    """Get comprehensive metrics for AI services"""
    try:
        metrics_data = await orchestrator.get_metrics()
        return AIMetricsResponse(**metrics_data)
    except Exception as e:
        logger.error("AI metrics retrieval failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Metrics retrieval failed: {str(e)}"
        )


@router.get("/status", summary="Get AI Orchestrator Status")
async def get_ai_status(orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)):
    """Get the basic status of AI orchestrator"""
    try:
        return {
            "initialized": orchestrator.is_initialized,
            "available_providers": [p.value for p in orchestrator.providers.keys()],
            "healthy_providers": [p.value for p, status in orchestrator.health_status.items() if status],
            "default_provider": orchestrator.default_provider.value,
            "cache_size": len(orchestrator.response_cache),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("Failed to get AI status", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve AI orchestrator status"
        )


@router.post("/generate-text", summary="Generate Text with AI")
async def generate_text(
    request: AITextGenerationRequest,
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)
):
    """Generate text using AI providers with enhanced error handling"""
    request_id = str(uuid.uuid4())
    
    try:
        logger.info(
            "Text generation request received",
            request_id=request_id,
            provider=request.provider,
            prompt_length=len(request.prompt),
            max_tokens=request.max_tokens
        )
        
        provider = None
        if request.provider:
            try:
                provider = AIProvider(request.provider)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid provider: {request.provider}. Valid options: {[p.value for p in AIProvider]}"
                )
        
        response = await orchestrator.generate_text(
            prompt=request.prompt,
            provider=provider,
            model=request.model,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            use_cache=request.use_cache,
            context=request.context
        )
        
        result = {
            "request_id": request_id,
            "content": response.content,
            "provider": response.provider.value,
            "model": response.model,
            "tokens_used": response.tokens_used,
            "processing_time": response.processing_time,
            "cached": response.cached,
            "timestamp": response.timestamp.isoformat(),
            "metadata": response.metadata
        }
        
        logger.info(
            "Text generation completed successfully",
            request_id=request_id,
            provider=response.provider.value,
            tokens_used=response.tokens_used,
            processing_time=response.processing_time,
            cached=response.cached
        )
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(
            "Text generation failed",
            request_id=request_id,
            error=str(e),
            provider=request.provider
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Text generation failed: {str(e)}"
        )


@router.post("/analyze-contract", summary="Analyze Contract with AI")
async def analyze_contract(
    request: ContractAnalysisRequest,
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)
):
    """Analyze contract using AI with enhanced error handling"""
    request_id = str(uuid.uuid4())
    
    try:
        logger.info(
            "Contract analysis request received",
            request_id=request_id,
            analysis_type=request.analysis_type,
            contract_length=len(request.contract_text),
            use_consensus=request.use_consensus
        )
        
        # Validate analysis type
        valid_types = ["risk_assessment", "clause_extraction", "compliance_check", "legal_strategy", "general_review"]
        if request.analysis_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid analysis type. Must be one of: {valid_types}"
            )
        
        # Validate contract text length
        if len(request.contract_text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contract text is too short for meaningful analysis (minimum 100 characters)"
            )
        
        analysis_result = await orchestrator.analyze_contract(
            contract_text=request.contract_text,
            analysis_type=request.analysis_type,
            use_consensus=request.use_consensus
        )
        
        result = {
            "request_id": request_id,
            "analysis_result": analysis_result,
            "analysis_type": request.analysis_type,
            "use_consensus": request.use_consensus,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(
            "Contract analysis completed successfully",
            request_id=request_id,
            analysis_type=request.analysis_type,
            use_consensus=request.use_consensus
        )
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(
            "Contract analysis failed",
            request_id=request_id,
            error=str(e),
            analysis_type=request.analysis_type
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Contract analysis failed: {str(e)}"
        )


# Background task for batch processing
@router.post("/batch-process", summary="Batch Process AI Requests")
async def batch_process_requests(
    requests: List[Dict[str, Any]],
    background_tasks: BackgroundTasks,
    orchestrator: AIOrchestrator = Depends(get_ai_orchestrator)
):
    """Process multiple AI requests in the background"""
    batch_id = str(uuid.uuid4())
    
    try:
        logger.info(
            "Batch processing request received",
            batch_id=batch_id,
            request_count=len(requests)
        )
        
        # Validate batch size
        if len(requests) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch size cannot exceed 100 requests"
            )
        
        # Add background task
        background_tasks.add_task(
            process_batch_requests,
            batch_id,
            requests,
            orchestrator
        )
        
        return {
            "batch_id": batch_id,
            "status": "processing",
            "request_count": len(requests),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error("Batch processing failed", batch_id=batch_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch processing failed: {str(e)}"
        )


async def process_batch_requests(
    batch_id: str,
    requests: List[Dict[str, Any]],
    orchestrator: AIOrchestrator
):
    """Process batch requests in background"""
    try:
        logger.info("Processing batch requests", batch_id=batch_id, count=len(requests))
        
        results = []
        for i, request_data in enumerate(requests):
            try:
                # Process individual request based on type
                request_type = request_data.get("type", "generate_text")
                
                if request_type == "generate_text":
                    result = await orchestrator.generate_text(
                        prompt=request_data.get("prompt", ""),
                        max_tokens=request_data.get("max_tokens", 1000),
                        temperature=request_data.get("temperature", 0.7)
                    )
                    results.append({
                        "index": i,
                        "success": True,
                        "result": {
                            "content": result.content,
                            "provider": result.provider.value,
                            "tokens_used": result.tokens_used
                        }
                    })
                else:
                    results.append({
                        "index": i,
                        "success": False,
                        "error": f"Unsupported request type: {request_type}"
                    })
                    
            except Exception as e:
                results.append({
                    "index": i,
                    "success": False,
                    "error": str(e)
                })
        
        logger.info("Batch processing completed", batch_id=batch_id, results_count=len(results))
        # In a real implementation, you would store results in a database or cache
        
    except Exception as e:
        logger.error("Batch processing failed", batch_id=batch_id, error=str(e))


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