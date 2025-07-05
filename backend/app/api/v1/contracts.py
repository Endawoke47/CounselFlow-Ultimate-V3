"""
CounselFlow Ultimate V3 - Contracts API Routes
Enterprise Contract Lifecycle Management with AI Integration
"""

from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.schemas.user import UserRole
from app.schemas.contract import (
    ContractCreate, ContractUpdate, ContractResponse, ContractListResponse,
    ContractAnalysisRequest, ContractAnalysisResponse, ContractSearchFilters,
    ContractMetrics, ContractBulkAction, ContractStatus, ContractType,
    ContractPriority, RiskLevel
)
from app.services.contract_service import ContractService
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


def get_contract_service(prisma: Prisma = Depends(get_prisma)) -> ContractService:
    """Dependency to get contract service"""
    return ContractService(prisma)


@router.post("/", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(
    contract_data: ContractCreate,
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Create a new contract"""
    
    # Check permissions - legal roles can create contracts
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create contracts"
        )
    
    try:
        contract = await contract_service.create_contract(contract_data, current_user.id)
        
        logger.info(
            "Contract created via API",
            contract_id=contract.id,
            contract_number=contract.contract_number,
            created_by=current_user.id
        )
        
        return contract
        
    except Exception as e:
        logger.error("Failed to create contract via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create contract"
        )


@router.get("/", response_model=ContractListResponse)
async def get_contracts(
    # Pagination
    skip: int = Query(0, ge=0, description="Number of contracts to skip"),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE, description="Number of contracts to return"),
    
    # Sorting
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Basic filters
    status: Optional[List[ContractStatus]] = Query(None, description="Filter by contract status"),
    type: Optional[List[ContractType]] = Query(None, description="Filter by contract type"),
    priority: Optional[List[ContractPriority]] = Query(None, description="Filter by priority"),
    risk_level: Optional[List[RiskLevel]] = Query(None, description="Filter by risk level"),
    
    # Assignment filters
    client_id: Optional[str] = Query(None, description="Filter by client"),
    assigned_attorney_id: Optional[str] = Query(None, description="Filter by assigned attorney"),
    
    # Search
    search: Optional[str] = Query(None, description="Search in title, description, counterparty"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    
    # Date filters
    expiring_within_days: Optional[int] = Query(None, ge=0, le=365, description="Contracts expiring within N days"),
    
    # AI filters
    ai_risk_score_min: Optional[float] = Query(None, ge=0, le=10, description="Minimum AI risk score"),
    ai_risk_score_max: Optional[float] = Query(None, ge=0, le=10, description="Maximum AI risk score"),
    has_ai_analysis: Optional[bool] = Query(None, description="Filter by AI analysis status"),
    
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Get list of contracts with advanced filtering"""
    try:
        # Create search filters
        filters = ContractSearchFilters(
            status=status,
            type=type,
            priority=priority,
            risk_level=risk_level,
            client_id=client_id,
            assigned_attorney_id=assigned_attorney_id,
            search_text=search,
            tags=tags,
            expiring_within_days=expiring_within_days,
            ai_risk_score_min=ai_risk_score_min,
            ai_risk_score_max=ai_risk_score_max,
            has_ai_analysis=has_ai_analysis
        )
        
        # Add tenant filtering for non-admin users
        if current_user.role != UserRole.ADMIN and current_user.tenant_id:
            # This would require adding tenant_id to the Contract model
            pass
        
        contracts, total = await contract_service.search_contracts(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return ContractListResponse(
            contracts=contracts,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            has_next=(skip + limit) < total,
            has_previous=skip > 0
        )
        
    except Exception as e:
        logger.error("Failed to get contracts", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contracts"
        )


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: str,
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Get contract by ID"""
    try:
        contract = await contract_service.get_contract(contract_id)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found"
            )
        
        # Check access permissions (simplified - in production, implement proper access control)
        # Users should only see contracts they're authorized to view
        
        return contract
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get contract", error=str(e), contract_id=contract_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contract"
        )


@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: str,
    contract_data: ContractUpdate,
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Update contract"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update contracts"
        )
    
    try:
        contract = await contract_service.update_contract(
            contract_id=contract_id,
            contract_data=contract_data,
            updated_by=current_user.id
        )
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found"
            )
        
        logger.info(
            "Contract updated via API",
            contract_id=contract_id,
            updated_by=current_user.id
        )
        
        return contract
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update contract", error=str(e), contract_id=contract_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update contract"
        )


@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Delete contract (soft delete)"""
    
    # Only admins and legal ops can delete contracts
    if current_user.role not in [UserRole.ADMIN, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete contracts"
        )
    
    try:
        # Check if contract exists
        contract = await prisma.contract.find_unique(where={"id": contract_id})
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found"
            )
        
        # Soft delete by updating status
        await prisma.contract.update(
            where={"id": contract_id},
            data={"status": ContractStatus.CANCELLED}
        )
        
        logger.info(
            "Contract deleted via API",
            contract_id=contract_id,
            deleted_by=current_user.id
        )
        
        return {"message": "Contract deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete contract", error=str(e), contract_id=contract_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete contract"
        )


@router.post("/{contract_id}/analyze", response_model=ContractAnalysisResponse)
async def analyze_contract(
    contract_id: str,
    analysis_request: ContractAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Analyze contract using AI"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to analyze contracts"
        )
    
    try:
        analysis_result = await contract_service.analyze_contract(
            contract_id=contract_id,
            analysis_request=analysis_request
        )
        
        logger.info(
            "Contract analyzed via API",
            contract_id=contract_id,
            analysis_type=analysis_request.analysis_type,
            analyzed_by=current_user.id
        )
        
        return analysis_result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to analyze contract", error=str(e), contract_id=contract_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze contract"
        )


@router.get("/metrics/overview", response_model=ContractMetrics)
async def get_contract_metrics(
    client_id: Optional[str] = Query(None, description="Filter metrics by client"),
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Get contract metrics and analytics"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view contract metrics"
        )
    
    try:
        metrics = await contract_service.get_contract_metrics(client_id=client_id)
        
        logger.info(
            "Contract metrics accessed",
            requested_by=current_user.id,
            client_filter=client_id
        )
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to get contract metrics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve contract metrics"
        )


@router.post("/bulk-actions")
async def bulk_update_contracts(
    bulk_action: ContractBulkAction,
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Perform bulk actions on contracts"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform bulk contract actions"
        )
    
    try:
        results = await contract_service.bulk_update_contracts(
            bulk_action=bulk_action,
            updated_by=current_user.id
        )
        
        logger.info(
            "Bulk contract action performed",
            action=bulk_action.action,
            contract_count=len(bulk_action.contract_ids),
            success_count=len(results["success"]),
            performed_by=current_user.id
        )
        
        return results
        
    except Exception as e:
        logger.error("Failed to perform bulk contract action", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk action"
        )


@router.get("/{contract_id}/expiry-alerts")
async def get_contract_expiry_alerts(
    contract_id: str,
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Get contract expiry alerts and renewal recommendations"""
    try:
        contract = await contract_service.get_contract(contract_id)
        
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found"
            )
        
        alerts = []
        recommendations = []
        
        if contract.is_expiring_soon:
            alerts.append({
                "type": "EXPIRING_SOON",
                "message": f"Contract expires in {contract.days_until_expiry} days",
                "severity": "WARNING",
                "action_required": True
            })
            
            recommendations.append({
                "type": "RENEWAL_REVIEW",
                "title": "Review renewal terms",
                "description": "Consider reviewing contract terms before renewal",
                "priority": "HIGH"
            })
        
        if contract.is_expired:
            alerts.append({
                "type": "EXPIRED",
                "message": "Contract has expired",
                "severity": "CRITICAL",
                "action_required": True
            })
        
        if contract.auto_renewal and contract.renewal_notice_days:
            notice_date = contract.expiry_date - timedelta(days=contract.renewal_notice_days)
            if date.today() >= notice_date:
                alerts.append({
                    "type": "RENEWAL_NOTICE",
                    "message": f"Renewal notice period has started ({contract.renewal_notice_days} days)",
                    "severity": "INFO",
                    "action_required": False
                })
        
        return {
            "contract_id": contract_id,
            "alerts": alerts,
            "recommendations": recommendations,
            "auto_renewal_enabled": contract.auto_renewal,
            "next_review_date": contract.renewal_date
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get contract expiry alerts", error=str(e), contract_id=contract_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expiry alerts"
        )


@router.get("/dashboard/summary")
async def get_contract_dashboard_summary(
    current_user = Depends(get_current_active_user),
    contract_service: ContractService = Depends(get_contract_service)
):
    """Get contract dashboard summary for home page"""
    try:
        # Get basic metrics
        metrics = await contract_service.get_contract_metrics()
        
        # Get quick stats for dashboard
        summary = {
            "total_contracts": metrics.total_contracts,
            "active_contracts": metrics.contracts_by_status.get("ACTIVE", 0),
            "pending_approval": metrics.pending_approval_count,
            "expiring_soon": metrics.expiring_soon_count,
            "high_risk_contracts": metrics.high_risk_count,
            "total_value": str(metrics.total_contract_value),
            "recent_activity": {
                "created_this_month": metrics.contracts_created_this_month,
                "executed_this_month": metrics.contracts_executed_this_month
            },
            "ai_insights": {
                "analyzed_contracts": metrics.ai_analyzed_count,
                "average_risk_score": metrics.average_risk_score
            }
        }
        
        return summary
        
    except Exception as e:
        logger.error("Failed to get contract dashboard summary", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard summary"
        )