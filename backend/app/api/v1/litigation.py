"""
CounselFlow Ultimate V3 - Dispute Resolution & Litigation API Routes
Enterprise litigation case management with AI-powered strategy analysis
"""

from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.schemas.user import UserRole
from app.schemas.litigation import (
    LitigationCaseCreate, LitigationCaseUpdate, LitigationCaseResponse,
    DiscoveryRequestCreate, DiscoveryRequestUpdate, DiscoveryRequestResponse,
    LegalMotionCreate, LegalMotionUpdate, LegalMotionResponse,
    ExpertWitnessCreate, ExpertWitnessUpdate, ExpertWitnessResponse,
    LitigationMetrics, LitigationDashboard, LitigationSearchFilters,
    LitigationBulkAction, LitigationAnalysisRequest, LitigationAnalysisResponse,
    DisputeType, LitigationStage, CaseStatus, LitigationRole,
    DiscoveryType, DiscoveryStatus, MotionType, MotionStatus,
    SettlementStatus, ExpertWitnessType
)
from app.services.litigation_service import LitigationService
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


def get_litigation_service(prisma: Prisma = Depends(get_prisma)) -> LitigationService:
    """Dependency to get litigation service"""
    return LitigationService(prisma)


# Litigation Case Endpoints

@router.post("/cases", response_model=LitigationCaseResponse, status_code=status.HTTP_201_CREATED)
async def create_litigation_case(
    case_data: LitigationCaseCreate,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Create a new litigation case"""
    
    # Check permissions - legal roles can create litigation cases
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER, UserRole.ASSOCIATE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create litigation cases"
        )
    
    try:
        case = await litigation_service.create_litigation_case(case_data, current_user.id)
        
        logger.info(
            "Litigation case created via API",
            case_id=case.id,
            case_number=case.case_number,
            title=case.title,
            dispute_type=case.dispute_type,
            created_by=current_user.id
        )
        
        return case
        
    except Exception as e:
        logger.error("Failed to create litigation case via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create litigation case"
        )


@router.get("/cases")
async def get_litigation_cases(
    # Pagination
    skip: int = Query(0, ge=0, description="Number of cases to skip"),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE, description="Number of cases to return"),
    
    # Sorting
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Basic filters
    dispute_type: Optional[List[DisputeType]] = Query(None, description="Filter by dispute type"),
    litigation_stage: Optional[List[LitigationStage]] = Query(None, description="Filter by litigation stage"),
    case_status: Optional[List[CaseStatus]] = Query(None, description="Filter by case status"),
    our_role: Optional[List[LitigationRole]] = Query(None, description="Filter by our role"),
    
    # Attorney filters
    lead_attorney_id: Optional[str] = Query(None, description="Filter by lead attorney"),
    case_manager_id: Optional[str] = Query(None, description="Filter by case manager"),
    
    # Court filters
    court_name: Optional[str] = Query(None, description="Filter by court name"),
    jurisdiction: Optional[str] = Query(None, description="Filter by jurisdiction"),
    
    # Date filters
    filed_date_from: Optional[date] = Query(None, description="Cases filed from date"),
    filed_date_to: Optional[date] = Query(None, description="Cases filed to date"),
    trial_date_from: Optional[date] = Query(None, description="Trial date from"),
    trial_date_to: Optional[date] = Query(None, description="Trial date to"),
    
    # Financial filters
    amount_min: Optional[float] = Query(None, description="Minimum amount in controversy"),
    amount_max: Optional[float] = Query(None, description="Maximum amount in controversy"),
    
    # Status filters
    high_risk_only: Optional[bool] = Query(None, description="Show only high-risk cases"),
    approaching_trial: Optional[bool] = Query(None, description="Cases approaching trial (next 60 days)"),
    overdue_discovery: Optional[bool] = Query(None, description="Cases with overdue discovery"),
    
    # Search
    search: Optional[str] = Query(None, description="Search in title, description, and case number"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get list of litigation cases with advanced filtering"""
    try:
        # Create search filters
        filters = LitigationSearchFilters(
            dispute_type=dispute_type,
            litigation_stage=litigation_stage,
            case_status=case_status,
            our_role=our_role,
            lead_attorney_id=lead_attorney_id,
            case_manager_id=case_manager_id,
            court_name=court_name,
            jurisdiction=jurisdiction,
            filed_date_from=filed_date_from,
            filed_date_to=filed_date_to,
            trial_date_from=trial_date_from,
            trial_date_to=trial_date_to,
            amount_min=amount_min,
            amount_max=amount_max,
            high_risk_only=high_risk_only,
            approaching_trial=approaching_trial,
            overdue_discovery=overdue_discovery,
            search_text=search,
            tags=tags
        )
        
        cases, total = await litigation_service.search_litigation_cases(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return {
            "cases": cases,
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit,
            "has_next": (skip + limit) < total,
            "has_previous": skip > 0
        }
        
    except Exception as e:
        logger.error("Failed to get litigation cases", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve litigation cases"
        )


@router.get("/cases/{case_id}", response_model=LitigationCaseResponse)
async def get_litigation_case(
    case_id: str,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get litigation case by ID"""
    try:
        case = await litigation_service.get_litigation_case(case_id)
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Litigation case not found"
            )
        
        return case
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get litigation case", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve litigation case"
        )


@router.put("/cases/{case_id}", response_model=LitigationCaseResponse)
async def update_litigation_case(
    case_id: str,
    case_data: LitigationCaseUpdate,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Update litigation case"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER, UserRole.ASSOCIATE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update litigation cases"
        )
    
    try:
        case = await litigation_service.update_litigation_case(
            case_id=case_id,
            case_data=case_data,
            updated_by=current_user.id
        )
        
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Litigation case not found"
            )
        
        logger.info(
            "Litigation case updated via API",
            case_id=case_id,
            updated_by=current_user.id
        )
        
        return case
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update litigation case", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update litigation case"
        )


# Discovery Request Endpoints

@router.post("/cases/{case_id}/discovery", response_model=DiscoveryRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_discovery_request(
    case_id: str,
    request_data: DiscoveryRequestCreate,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Create a new discovery request"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER, UserRole.ASSOCIATE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create discovery requests"
        )
    
    try:
        # Set the case ID from the URL
        request_data.litigation_case_id = case_id
        
        request = await litigation_service.create_discovery_request(request_data, current_user.id)
        
        logger.info(
            "Discovery request created via API",
            request_id=request.id,
            case_id=case_id,
            discovery_type=request.discovery_type,
            created_by=current_user.id
        )
        
        return request
        
    except Exception as e:
        logger.error("Failed to create discovery request via API", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create discovery request"
        )


@router.get("/cases/{case_id}/discovery")
async def get_case_discovery_requests(
    case_id: str,
    discovery_type: Optional[List[DiscoveryType]] = Query(None, description="Filter by discovery type"),
    status: Optional[List[DiscoveryStatus]] = Query(None, description="Filter by status"),
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get discovery requests for a case"""
    try:
        # Build filters for case discovery
        filters = LitigationSearchFilters(
            case_id=case_id,
            discovery_type=discovery_type,
            discovery_status=status
        )
        
        requests, total = await litigation_service.search_discovery_requests(filters)
        
        return {
            "discovery_requests": requests,
            "total": total,
            "case_id": case_id
        }
        
    except Exception as e:
        logger.error("Failed to get case discovery requests", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve discovery requests"
        )


# Legal Motion Endpoints

@router.post("/cases/{case_id}/motions", response_model=LegalMotionResponse, status_code=status.HTTP_201_CREATED)
async def create_legal_motion(
    case_id: str,
    motion_data: LegalMotionCreate,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Create a new legal motion"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER, UserRole.ASSOCIATE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create legal motions"
        )
    
    try:
        # Set the case ID from the URL
        motion_data.litigation_case_id = case_id
        
        motion = await litigation_service.create_legal_motion(motion_data, current_user.id)
        
        logger.info(
            "Legal motion created via API",
            motion_id=motion.id,
            case_id=case_id,
            motion_type=motion.motion_type,
            created_by=current_user.id
        )
        
        return motion
        
    except Exception as e:
        logger.error("Failed to create legal motion via API", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create legal motion"
        )


@router.get("/cases/{case_id}/motions")
async def get_case_legal_motions(
    case_id: str,
    motion_type: Optional[List[MotionType]] = Query(None, description="Filter by motion type"),
    status: Optional[List[MotionStatus]] = Query(None, description="Filter by status"),
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get legal motions for a case"""
    try:
        # Build filters for case motions
        filters = LitigationSearchFilters(
            case_id=case_id,
            motion_type=motion_type,
            motion_status=status
        )
        
        motions, total = await litigation_service.search_legal_motions(filters)
        
        return {
            "legal_motions": motions,
            "total": total,
            "case_id": case_id
        }
        
    except Exception as e:
        logger.error("Failed to get case legal motions", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve legal motions"
        )


# Expert Witness Endpoints

@router.post("/cases/{case_id}/experts", response_model=ExpertWitnessResponse, status_code=status.HTTP_201_CREATED)
async def create_expert_witness(
    case_id: str,
    expert_data: ExpertWitnessCreate,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Create a new expert witness"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER, UserRole.ASSOCIATE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create expert witnesses"
        )
    
    try:
        # Set the case ID from the URL
        expert_data.litigation_case_id = case_id
        
        expert = await litigation_service.create_expert_witness(expert_data, current_user.id)
        
        logger.info(
            "Expert witness created via API",
            expert_id=expert.id,
            case_id=case_id,
            expert_type=expert.expert_type,
            name=expert.name,
            created_by=current_user.id
        )
        
        return expert
        
    except Exception as e:
        logger.error("Failed to create expert witness via API", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create expert witness"
        )


@router.get("/cases/{case_id}/experts")
async def get_case_expert_witnesses(
    case_id: str,
    expert_type: Optional[List[ExpertWitnessType]] = Query(None, description="Filter by expert type"),
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get expert witnesses for a case"""
    try:
        # Build filters for case experts
        filters = LitigationSearchFilters(
            case_id=case_id,
            expert_type=expert_type
        )
        
        experts, total = await litigation_service.search_expert_witnesses(filters)
        
        return {
            "expert_witnesses": experts,
            "total": total,
            "case_id": case_id
        }
        
    except Exception as e:
        logger.error("Failed to get case expert witnesses", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expert witnesses"
        )


# AI Analysis Endpoints

@router.post("/cases/{case_id}/analyze", response_model=LitigationAnalysisResponse)
async def analyze_litigation_case(
    case_id: str,
    analysis_request: LitigationAnalysisRequest,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Perform AI-powered litigation case analysis"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER, UserRole.ASSOCIATE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform case analysis"
        )
    
    try:
        analysis = await litigation_service.analyze_litigation_case(case_id, analysis_request)
        
        logger.info(
            "Case analysis performed via API",
            case_id=case_id,
            analysis_type=analysis_request.analysis_type,
            requested_by=current_user.id
        )
        
        return analysis
        
    except Exception as e:
        logger.error("Failed to analyze litigation case", error=str(e), case_id=case_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze litigation case"
        )


# Analytics and Reporting Endpoints

@router.get("/metrics/overview", response_model=LitigationMetrics)
async def get_litigation_metrics(
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get comprehensive litigation metrics"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view litigation metrics"
        )
    
    try:
        metrics = await litigation_service.get_litigation_metrics()
        
        logger.info(
            "Litigation metrics accessed",
            requested_by=current_user.id
        )
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to get litigation metrics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve litigation metrics"
        )


@router.get("/dashboard/summary", response_model=LitigationDashboard)
async def get_litigation_dashboard(
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get executive litigation dashboard summary"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view litigation dashboard"
        )
    
    try:
        dashboard = await litigation_service.get_litigation_dashboard()
        
        logger.info(
            "Litigation dashboard accessed",
            requested_by=current_user.id
        )
        
        return dashboard
        
    except Exception as e:
        logger.error("Failed to get litigation dashboard", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve litigation dashboard"
        )


# Bulk Operations

@router.post("/bulk-actions")
async def bulk_update_litigation_items(
    bulk_action: LitigationBulkAction,
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Perform bulk actions on litigation items"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.PARTNER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform bulk litigation actions"
        )
    
    try:
        results = await litigation_service.bulk_update_items(
            bulk_action=bulk_action,
            updated_by=current_user.id
        )
        
        logger.info(
            "Bulk litigation action performed",
            action=bulk_action.action,
            item_count=len(bulk_action.item_ids),
            success_count=len(results["success"]),
            performed_by=current_user.id
        )
        
        return results
        
    except Exception as e:
        logger.error("Failed to perform bulk litigation action", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk action"
        )


# Specialized Analysis Endpoints

@router.get("/cases/settlement-opportunities")
async def get_settlement_opportunities(
    days_ahead: int = Query(90, ge=30, le=365, description="Days to look ahead for opportunities"),
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get cases with settlement opportunities"""
    try:
        # This would analyze cases for settlement potential
        end_date = date.today() + timedelta(days=days_ahead)
        
        filters = LitigationSearchFilters(
            litigation_stage=[LitigationStage.DISCOVERY, LitigationStage.TRIAL_PREPARATION],
            settlement_status=[SettlementStatus.OPEN_TO_SETTLEMENT, SettlementStatus.NEGOTIATING]
        )
        
        cases, total = await litigation_service.search_litigation_cases(filters, limit=50)
        
        # Mock settlement analysis - would use AI in real implementation
        settlement_opportunities = []
        for case in cases[:10]:  # Top 10 opportunities
            settlement_opportunities.append({
                "case_id": case.id,
                "case_number": case.case_number,
                "title": case.title,
                "settlement_probability": 75.5,  # AI-calculated
                "recommended_settlement_range": {
                    "min": float(case.amount_in_controversy) * 0.3 if case.amount_in_controversy else 0,
                    "max": float(case.amount_in_controversy) * 0.6 if case.amount_in_controversy else 0
                },
                "key_settlement_factors": [
                    "Strong liability case for plaintiff",
                    "High litigation costs projected",
                    "Favorable jurisdiction for settlement"
                ],
                "next_settlement_opportunity": "Mediation scheduled in 30 days"
            })
        
        return {
            "settlement_opportunities": settlement_opportunities,
            "analysis_period_days": days_ahead,
            "total_cases_analyzed": total
        }
        
    except Exception as e:
        logger.error("Failed to get settlement opportunities", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve settlement opportunities"
        )


@router.get("/cases/trial-readiness")
async def get_trial_readiness_report(
    days_ahead: int = Query(120, ge=60, le=365, description="Days to look ahead for trials"),
    current_user = Depends(get_current_active_user),
    litigation_service: LitigationService = Depends(get_litigation_service)
):
    """Get trial readiness analysis for upcoming trials"""
    try:
        # Get cases approaching trial
        trial_date_cutoff = date.today() + timedelta(days=days_ahead)
        
        filters = LitigationSearchFilters(
            trial_date_to=trial_date_cutoff,
            litigation_stage=[LitigationStage.TRIAL_PREPARATION, LitigationStage.TRIAL]
        )
        
        cases, total = await litigation_service.search_litigation_cases(filters)
        
        # Mock trial readiness analysis
        trial_readiness = []
        for case in cases:
            readiness_score = 85.2  # AI-calculated based on multiple factors
            
            trial_readiness.append({
                "case_id": case.id,
                "case_number": case.case_number,
                "title": case.title,
                "trial_date": case.trial_date.isoformat() if case.trial_date else None,
                "days_to_trial": (case.trial_date - date.today()).days if case.trial_date else None,
                "readiness_score": readiness_score,
                "readiness_status": "READY" if readiness_score >= 80 else "NEEDS_ATTENTION",
                "completed_tasks": [
                    "Discovery completed",
                    "Expert witnesses retained",
                    "Witness list finalized"
                ],
                "pending_tasks": [
                    "Jury instructions draft",
                    "Exhibit list finalization",
                    "Pre-trial motions"
                ],
                "risk_factors": [
                    "Late expert disclosure possible",
                    "Key witness availability uncertain"
                ] if readiness_score < 80 else []
            })
        
        return {
            "trial_readiness": trial_readiness,
            "analysis_period_days": days_ahead,
            "total_upcoming_trials": total,
            "average_readiness_score": 82.7
        }
        
    except Exception as e:
        logger.error("Failed to get trial readiness report", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve trial readiness report"
        )