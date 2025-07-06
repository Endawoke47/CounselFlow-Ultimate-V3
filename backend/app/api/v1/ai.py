"""
CounselFlow Ultimate V3 - AI Services API Routes
Complete AI-powered legal analysis and document generation
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, validator
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.schemas.user import UserRole, Permission
from app.services.ai_orchestrator import ai_orchestrator, AIProvider
from app.services.rbac_service import require_permission

logger = structlog.get_logger()
router = APIRouter()


class AnalyzeContractRequest(BaseModel):
    contract_text: str
    analysis_type: str = "comprehensive"
    use_consensus: bool = False
    provider: Optional[AIProvider] = None

    @validator('contract_text')
    def validate_contract_text(cls, v):
        if len(v.strip()) < 100:
            raise ValueError('Contract text must be at least 100 characters')
        return v

    @validator('analysis_type')
    def validate_analysis_type(cls, v):
        valid_types = ["comprehensive", "risk_assessment", "clause_extraction", "compliance_check"]
        if v not in valid_types:
            raise ValueError(f'Analysis type must be one of: {", ".join(valid_types)}')
        return v


class GenerateDocumentRequest(BaseModel):
    document_type: str
    template_data: Dict[str, Any]
    use_consensus: bool = False
    provider: Optional[AIProvider] = None

    @validator('document_type')
    def validate_document_type(cls, v):
        valid_types = ["nda", "service_agreement", "employment_contract", "privacy_policy", "terms_of_service"]
        if v not in valid_types:
            raise ValueError(f'Document type must be one of: {", ".join(valid_types)}')
        return v


class LegalResearchRequest(BaseModel):
    query: str
    jurisdiction: Optional[str] = "US"
    practice_area: Optional[str] = None
    use_consensus: bool = False

    @validator('query')
    def validate_query(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Query must be at least 10 characters')
        return v


@router.post("/analyze-contract", response_model=dict)
@require_permission(Permission.AI_ADVANCED)
async def analyze_contract(
    request_data: AnalyzeContractRequest,
    current_user = Depends(get_current_active_user)
):
    """Analyze contract using AI with risk assessment and clause extraction"""
    
    try:
        # Call AI orchestrator for contract analysis
        analysis_result = await ai_orchestrator.analyze_contract(
            contract_text=request_data.contract_text,
            analysis_type=request_data.analysis_type,
            use_consensus=request_data.use_consensus,
            provider=request_data.provider
        )
        
        logger.info(
            "Contract analysis completed",
            user_id=current_user.id,
            analysis_type=request_data.analysis_type,
            use_consensus=request_data.use_consensus,
            contract_length=len(request_data.contract_text)
        )
        
        return {
            "analysis": analysis_result,
            "metadata": {
                "user_id": current_user.id,
                "analysis_type": request_data.analysis_type,
                "timestamp": analysis_result.get("timestamp"),
                "provider": analysis_result.get("provider"),
                "use_consensus": request_data.use_consensus
            }
        }
        
    except Exception as e:
        logger.error(
            "Contract analysis failed",
            error=str(e),
            user_id=current_user.id,
            analysis_type=request_data.analysis_type
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI contract analysis failed: {str(e)}"
        )


@router.post("/generate-document", response_model=dict)
@require_permission(Permission.AI_ADVANCED)
async def generate_document(
    request_data: GenerateDocumentRequest,
    current_user = Depends(get_current_active_user)
):
    """Generate legal document using AI"""
    
    try:
        # Call AI orchestrator for document generation
        generation_result = await ai_orchestrator.generate_document(
            document_type=request_data.document_type,
            template_data=request_data.template_data,
            use_consensus=request_data.use_consensus,
            provider=request_data.provider
        )
        
        logger.info(
            "Document generation completed",
            user_id=current_user.id,
            document_type=request_data.document_type,
            use_consensus=request_data.use_consensus
        )
        
        return {
            "document": generation_result,
            "metadata": {
                "user_id": current_user.id,
                "document_type": request_data.document_type,
                "timestamp": generation_result.get("timestamp"),
                "provider": generation_result.get("provider"),
                "use_consensus": request_data.use_consensus
            }
        }
        
    except Exception as e:
        logger.error(
            "Document generation failed",
            error=str(e),
            user_id=current_user.id,
            document_type=request_data.document_type
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI document generation failed: {str(e)}"
        )


@router.post("/legal-research", response_model=dict)
@require_permission(Permission.AI_ADVANCED)
async def legal_research(
    request_data: LegalResearchRequest,
    current_user = Depends(get_current_active_user)
):
    """Conduct AI-powered legal research"""
    
    try:
        # Call AI orchestrator for legal research
        research_result = await ai_orchestrator.research_legal_topic(
            query=request_data.query,
            jurisdiction=request_data.jurisdiction,
            practice_area=request_data.practice_area,
            use_consensus=request_data.use_consensus
        )
        
        logger.info(
            "Legal research completed",
            user_id=current_user.id,
            query=request_data.query[:100],  # Log truncated query
            jurisdiction=request_data.jurisdiction,
            use_consensus=request_data.use_consensus
        )
        
        return {
            "research": research_result,
            "metadata": {
                "user_id": current_user.id,
                "query": request_data.query,
                "jurisdiction": request_data.jurisdiction,
                "practice_area": request_data.practice_area,
                "timestamp": research_result.get("timestamp"),
                "use_consensus": request_data.use_consensus
            }
        }
        
    except Exception as e:
        logger.error(
            "Legal research failed",
            error=str(e),
            user_id=current_user.id,
            query=request_data.query[:100]
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI legal research failed: {str(e)}"
        )


@router.post("/analyze-litigation", response_model=dict)
@require_permission(Permission.LITIGATION_MANAGE)
async def analyze_litigation_strategy(
    case_description: str,
    case_type: Optional[str] = "general",
    jurisdiction: Optional[str] = "US",
    use_consensus: bool = False,
    current_user = Depends(get_current_active_user)
):
    """Analyze litigation strategy using AI"""
    
    try:
        # Call AI orchestrator for litigation analysis
        strategy_result = await ai_orchestrator.analyze_litigation_strategy(
            case_description=case_description,
            case_type=case_type,
            jurisdiction=jurisdiction,
            use_consensus=use_consensus
        )
        
        logger.info(
            "Litigation strategy analysis completed",
            user_id=current_user.id,
            case_type=case_type,
            jurisdiction=jurisdiction,
            use_consensus=use_consensus
        )
        
        return {
            "strategy": strategy_result,
            "metadata": {
                "user_id": current_user.id,
                "case_type": case_type,
                "jurisdiction": jurisdiction,
                "timestamp": strategy_result.get("timestamp"),
                "use_consensus": use_consensus
            }
        }
        
    except Exception as e:
        logger.error(
            "Litigation strategy analysis failed",
            error=str(e),
            user_id=current_user.id,
            case_type=case_type
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI litigation analysis failed: {str(e)}"
        )


@router.get("/models", response_model=dict)
@require_permission(Permission.AI_BASIC)
async def get_available_models(
    current_user = Depends(get_current_active_user)
):
    """Get available AI models and their capabilities"""
    
    try:
        models = [
            {
                "name": "gpt-4",
                "provider": "openai",
                "status": "available",
                "capabilities": ["analysis", "generation", "research"],
                "description": "Most capable model for complex legal analysis"
            },
            {
                "name": "claude-3-sonnet",
                "provider": "anthropic", 
                "status": "available",
                "capabilities": ["analysis", "generation", "research"],
                "description": "Excellent for detailed legal reasoning and analysis"
            },
            {
                "name": "gemini-pro",
                "provider": "google",
                "status": "available", 
                "capabilities": ["analysis", "generation"],
                "description": "Strong performance for document generation"
            }
        ]
        
        return {
            "models": models,
            "consensus_available": True,
            "default_provider": "openai"
        }
        
    except Exception as e:
        logger.error("Failed to get AI models", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve AI models"
        )


@router.get("/usage-stats", response_model=dict)
@require_permission(Permission.ANALYTICS_VIEW)
async def get_ai_usage_stats(
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get AI usage statistics"""
    
    try:
        # Get AI usage stats from database
        ai_tasks = await prisma.aitask.find_many(
            where={"user_id": current_user.id},
            order_by={"created_at": "desc"},
            take=100
        )
        
        # Calculate statistics
        total_tasks = len(ai_tasks)
        successful_tasks = len([t for t in ai_tasks if t.status == "COMPLETED"])
        
        # Group by task type
        task_type_counts = {}
        total_tokens = 0
        
        for task in ai_tasks:
            task_type = task.task_type
            task_type_counts[task_type] = task_type_counts.get(task_type, 0) + 1
            if task.tokens_used:
                total_tokens += task.tokens_used
        
        return {
            "user_id": current_user.id,
            "total_tasks": total_tasks,
            "successful_tasks": successful_tasks,
            "success_rate": successful_tasks / total_tasks if total_tasks > 0 else 0,
            "total_tokens_used": total_tokens,
            "task_breakdown": task_type_counts,
            "recent_tasks": [
                {
                    "id": task.id,
                    "task_type": task.task_type,
                    "status": task.status,
                    "created_at": task.created_at.isoformat(),
                    "tokens_used": task.tokens_used
                }
                for task in ai_tasks[:10]
            ]
        }
        
    except Exception as e:
        logger.error(
            "Failed to get AI usage stats",
            error=str(e),
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve AI usage statistics"
        )