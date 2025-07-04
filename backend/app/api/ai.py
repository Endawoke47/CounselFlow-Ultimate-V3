from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import get_current_user
from ..models.user import User
from ..services.ai_service import ai_service

router = APIRouter()

class ContractAnalysisRequest(BaseModel):
    contract_text: str

class ContractAnalysisResponse(BaseModel):
    analysis: Dict[str, Any]
    success: bool
    message: str

class DocumentGenerationRequest(BaseModel):
    template_type: str
    parameters: Dict[str, Any]

class DocumentGenerationResponse(BaseModel):
    generated_document: str
    success: bool
    message: str

class LegalResearchRequest(BaseModel):
    query: str

class LegalResearchResponse(BaseModel):
    research_results: str
    success: bool
    message: str

@router.post("/analyze-contract", response_model=ContractAnalysisResponse)
async def analyze_contract(
    request: ContractAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze contract text and identify key clauses, risks, and issues"""
    try:
        if not request.contract_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contract text cannot be empty"
            )
        
        analysis = await ai_service.analyze_contract(request.contract_text)
        
        # Log the analysis for audit purposes
        # TODO: Create audit log entry
        
        return ContractAnalysisResponse(
            analysis=analysis,
            success=True,
            message="Contract analysis completed successfully"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze contract"
        )

@router.post("/generate-document", response_model=DocumentGenerationResponse)
async def generate_document(
    request: DocumentGenerationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate legal document from template and parameters"""
    try:
        valid_templates = ["nda", "service_agreement", "employment_contract"]
        
        if request.template_type not in valid_templates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid template type. Must be one of: {', '.join(valid_templates)}"
            )
        
        if not request.parameters:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parameters are required for document generation"
            )
        
        generated_doc = await ai_service.generate_document(
            request.template_type,
            request.parameters
        )
        
        # Log the generation for audit purposes
        # TODO: Create audit log entry
        
        return DocumentGenerationResponse(
            generated_document=generated_doc,
            success=True,
            message="Document generated successfully"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate document"
        )

@router.post("/legal-research", response_model=LegalResearchResponse)
async def legal_research(
    request: LegalResearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perform legal research and provide insights"""
    try:
        if not request.query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Research query cannot be empty"
            )
        
        research_results = await ai_service.legal_research(request.query)
        
        return LegalResearchResponse(
            research_results=research_results,
            success=True,
            message="Legal research completed successfully"
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform legal research"
        )

@router.get("/templates")
async def get_available_templates(current_user: User = Depends(get_current_user)):
    """Get list of available document templates"""
    templates = [
        {
            "id": "nda",
            "name": "Non-Disclosure Agreement",
            "description": "Confidentiality agreement between parties",
            "required_fields": [
                "disclosing_party",
                "receiving_party", 
                "purpose",
                "duration",
                "jurisdiction"
            ]
        },
        {
            "id": "service_agreement",
            "name": "Service Agreement", 
            "description": "Agreement for provision of services",
            "required_fields": [
                "provider",
                "client",
                "services",
                "payment_terms",
                "duration",
                "jurisdiction"
            ]
        },
        {
            "id": "employment_contract",
            "name": "Employment Contract",
            "description": "Contract between employer and employee",
            "required_fields": [
                "employer",
                "employee",
                "position",
                "start_date",
                "salary",
                "benefits",
                "jurisdiction"
            ]
        }
    ]
    
    return {"templates": templates}