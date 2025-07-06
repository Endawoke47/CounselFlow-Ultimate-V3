"""
CounselFlow Ultimate V3 - Matter Management API Routes
Enterprise Legal Matter and Case Management with AI Integration
"""

from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.schemas.user import UserRole, Permission
from app.schemas.matter import (
    MatterCreate, MatterUpdate, MatterResponse, MatterListResponse,
    MatterAnalysisRequest, MatterAnalysisResponse, MatterSearchFilters,
    MatterMetrics, MatterBulkAction, MatterType, MatterStatus, MatterPriority,
    BillingType, RiskLevel, MatterDashboardSummary
)
from app.services.matter_service import MatterService
from app.services.rbac_service import require_permission
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


def get_matter_service(prisma: Prisma = Depends(get_prisma)) -> MatterService:
    """Dependency to get matter service"""
    return MatterService(prisma)


@router.post("/", response_model=MatterResponse, status_code=status.HTTP_201_CREATED)
@require_permission(Permission.MATTER_CREATE)
async def create_matter(
    matter_data: MatterCreate,
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Create a new legal matter"""
    
    try:
        matter = await matter_service.create_matter(matter_data, current_user.id)
        
        logger.info(
            "Matter created via API",
            matter_id=matter.id,
            matter_number=matter.matter_number,
            title=matter.title,
            type=matter.type,
            created_by=current_user.id
        )
        
        return matter
        
    except Exception as e:
        logger.error("Failed to create matter via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create matter"
        )


@router.get("/", response_model=MatterListResponse)
@require_permission(Permission.MATTER_READ)
async def get_matters(
    # Pagination
    skip: int = Query(0, ge=0, description="Number of matters to skip"),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE, description="Number of matters to return"),
    
    # Sorting
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Basic filters
    type: Optional[List[MatterType]] = Query(None, description="Filter by matter type"),
    status: Optional[List[MatterStatus]] = Query(None, description="Filter by matter status"),
    priority: Optional[List[MatterPriority]] = Query(None, description="Filter by priority"),
    billing_type: Optional[List[BillingType]] = Query(None, description="Filter by billing type"),
    risk_level: Optional[List[RiskLevel]] = Query(None, description="Filter by risk level"),
    
    # Assignment filters
    client_id: Optional[str] = Query(None, description="Filter by client"),
    lead_attorney_id: Optional[str] = Query(None, description="Filter by lead attorney"),
    assigned_attorney_id: Optional[str] = Query(None, description="Filter by assigned attorney"),
    
    # Search
    search: Optional[str] = Query(None, description="Search in title, description, opposing party"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    
    # Geographic and practice filters
    jurisdiction: Optional[List[str]] = Query(None, description="Filter by jurisdiction"),
    practice_area: Optional[List[str]] = Query(None, description="Filter by practice area"),
    
    # Date filters
    opened_date_from: Optional[date] = Query(None, description="Matters opened from date"),
    opened_date_to: Optional[date] = Query(None, description="Matters opened to date"),
    target_date_from: Optional[date] = Query(None, description="Target resolution from date"),
    target_date_to: Optional[date] = Query(None, description="Target resolution to date"),
    
    # Financial filters
    estimated_value_min: Optional[float] = Query(None, ge=0, description="Minimum estimated value"),
    estimated_value_max: Optional[float] = Query(None, ge=0, description="Maximum estimated value"),
    budget_amount_min: Optional[float] = Query(None, ge=0, description="Minimum budget amount"),
    budget_amount_max: Optional[float] = Query(None, ge=0, description="Maximum budget amount"),
    
    # Status filters
    overdue_only: Optional[bool] = Query(None, description="Show only overdue matters"),
    statute_approaching: Optional[bool] = Query(None, description="Show matters with approaching statute of limitations"),
    conflict_checked: Optional[bool] = Query(None, description="Filter by conflict check status"),
    
    # AI filters
    complexity_score_min: Optional[float] = Query(None, ge=0, le=10, description="Minimum complexity score"),
    complexity_score_max: Optional[float] = Query(None, ge=0, le=10, description="Maximum complexity score"),
    
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Get list of matters with advanced filtering"""
    try:
        # Create search filters
        filters = MatterSearchFilters(
            type=type,
            status=status,
            priority=priority,
            billing_type=billing_type,
            risk_level=risk_level,
            client_id=client_id,
            lead_attorney_id=lead_attorney_id,
            assigned_attorney_id=assigned_attorney_id,
            search_text=search,
            tags=tags,
            jurisdiction=jurisdiction,
            practice_area=practice_area,
            opened_date_from=opened_date_from,
            opened_date_to=opened_date_to,
            target_date_from=target_date_from,
            target_date_to=target_date_to,
            estimated_value_min=estimated_value_min,
            estimated_value_max=estimated_value_max,
            budget_amount_min=budget_amount_min,
            budget_amount_max=budget_amount_max,
            overdue_only=overdue_only,
            statute_approaching=statute_approaching,
            conflict_checked=conflict_checked,
            complexity_score_min=complexity_score_min,
            complexity_score_max=complexity_score_max
        )
        
        # Add tenant filtering for non-admin users
        if current_user.role != UserRole.ADMIN and current_user.tenant_id:
            # This would require adding tenant_id to the Matter model
            pass
        
        matters, total = await matter_service.search_matters(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return MatterListResponse(
            matters=matters,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            has_next=(skip + limit) < total,
            has_previous=skip > 0
        )
        
    except Exception as e:
        logger.error("Failed to get matters", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve matters"
        )


@router.get("/{matter_id}", response_model=MatterResponse)
@require_permission(Permission.MATTER_READ)
async def get_matter(
    matter_id: str,
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Get matter by ID"""
    try:
        matter = await matter_service.get_matter(matter_id)
        
        if not matter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matter not found"
            )
        
        # Check access permissions (simplified - in production, implement proper access control)
        # Users should only see matters they're authorized to view
        
        return matter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get matter", error=str(e), matter_id=matter_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve matter"
        )


@router.put("/{matter_id}", response_model=MatterResponse)
@require_permission(Permission.MATTER_UPDATE)
async def update_matter(
    matter_id: str,
    matter_data: MatterUpdate,
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Update matter"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update matters"
        )
    
    try:
        matter = await matter_service.update_matter(
            matter_id=matter_id,
            matter_data=matter_data,
            updated_by=current_user.id
        )
        
        if not matter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matter not found"
            )
        
        logger.info(
            "Matter updated via API",
            matter_id=matter_id,
            updated_by=current_user.id
        )
        
        return matter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update matter", error=str(e), matter_id=matter_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update matter"
        )


@router.delete("/{matter_id}")
@require_permission(Permission.MATTER_DELETE)
async def delete_matter(
    matter_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Delete matter (soft delete)"""
    
    # Only admins and legal ops can delete matters
    if current_user.role not in [UserRole.ADMIN, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete matters"
        )
    
    try:
        # Check if matter exists
        matter = await prisma.matter.find_unique(where={"id": matter_id})
        if not matter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matter not found"
            )
        
        # Soft delete by updating status
        await prisma.matter.update(
            where={"id": matter_id},
            data={"status": MatterStatus.CANCELLED}
        )
        
        logger.info(
            "Matter deleted via API",
            matter_id=matter_id,
            deleted_by=current_user.id
        )
        
        return {"message": "Matter deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete matter", error=str(e), matter_id=matter_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete matter"
        )


@router.post("/{matter_id}/analyze", response_model=MatterAnalysisResponse)
@require_permission(Permission.AI_ADVANCED)
async def analyze_matter(
    matter_id: str,
    analysis_request: MatterAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Analyze matter using AI"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to analyze matters"
        )
    
    try:
        # Ensure matter_id matches
        analysis_request.matter_id = matter_id
        
        analysis_result = await matter_service.analyze_matter(
            matter_id=matter_id,
            analysis_request=analysis_request
        )
        
        logger.info(
            "Matter analyzed via API",
            matter_id=matter_id,
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
        logger.error("Failed to analyze matter", error=str(e), matter_id=matter_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze matter"
        )


@router.get("/metrics/overview", response_model=MatterMetrics)
async def get_matter_metrics(
    client_id: Optional[str] = Query(None, description="Filter metrics by client"),
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Get matter management metrics and analytics"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view matter metrics"
        )
    
    try:
        metrics = await matter_service.get_matter_metrics(client_id=client_id)
        
        logger.info(
            "Matter metrics accessed",
            requested_by=current_user.id,
            client_filter=client_id
        )
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to get matter metrics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve matter metrics"
        )


@router.post("/bulk-actions")
async def bulk_update_matters(
    bulk_action: MatterBulkAction,
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Perform bulk actions on matters"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform bulk matter actions"
        )
    
    try:
        results = await matter_service.bulk_update_matters(
            bulk_action=bulk_action,
            updated_by=current_user.id
        )
        
        logger.info(
            "Bulk matter action performed",
            action=bulk_action.action,
            matter_count=len(bulk_action.matter_ids),
            success_count=len(results["success"]),
            performed_by=current_user.id
        )
        
        return results
        
    except Exception as e:
        logger.error("Failed to perform bulk matter action", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk action"
        )


@router.get("/{matter_id}/deadline-alerts")
async def get_matter_deadline_alerts(
    matter_id: str,
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Get matter deadline alerts and recommendations"""
    try:
        matter = await matter_service.get_matter(matter_id)
        
        if not matter:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Matter not found"
            )
        
        alerts = []
        recommendations = []
        
        # Check target resolution date
        if matter.target_resolution_date and matter.days_until_target is not None:
            if matter.days_until_target <= 7:
                severity = "CRITICAL" if matter.days_until_target <= 0 else "WARNING"
                alerts.append({
                    "type": "TARGET_DEADLINE",
                    "message": f"Target resolution {'overdue by' if matter.days_until_target < 0 else 'due in'} {abs(matter.days_until_target)} days",
                    "severity": severity,
                    "action_required": True,
                    "due_date": matter.target_resolution_date.isoformat()
                })
                
                if matter.days_until_target <= 0:
                    recommendations.append({
                        "type": "EXPEDITE_RESOLUTION",
                        "title": "Expedite matter resolution",
                        "description": "Matter is past target resolution date - immediate action required",
                        "priority": "CRITICAL"
                    })
                else:
                    recommendations.append({
                        "type": "PREPARE_RESOLUTION",
                        "title": "Prepare for resolution",
                        "description": "Target resolution date approaching - finalize strategy",
                        "priority": "HIGH"
                    })
        
        # Check statute of limitations
        if matter.statute_limitations_date and matter.days_until_statute is not None:
            if matter.days_until_statute <= 60:
                severity = "CRITICAL" if matter.days_until_statute <= 30 else "WARNING"
                alerts.append({
                    "type": "STATUTE_DEADLINE",
                    "message": f"Statute of limitations in {matter.days_until_statute} days",
                    "severity": severity,
                    "action_required": True,
                    "due_date": matter.statute_limitations_date.isoformat()
                })
                
                recommendations.append({
                    "type": "FILING_URGENCY",
                    "title": "Urgent filing required",
                    "description": f"Statute of limitations expires in {matter.days_until_statute} days",
                    "priority": "CRITICAL" if matter.days_until_statute <= 30 else "HIGH"
                })
        
        # Check conflict check status
        if not matter.conflict_checked and matter.status in ["ACTIVE", "OPEN"]:
            alerts.append({
                "type": "CONFLICT_CHECK_REQUIRED",
                "message": "Conflict check not completed",
                "severity": "WARNING",
                "action_required": True
            })
            
            recommendations.append({
                "type": "COMPLETE_CONFLICT_CHECK",
                "title": "Complete conflict check",
                "description": "Perform comprehensive conflict check before proceeding",
                "priority": "HIGH"
            })
        
        return {
            "matter_id": matter_id,
            "alerts": alerts,
            "recommendations": recommendations,
            "target_resolution_date": matter.target_resolution_date.isoformat() if matter.target_resolution_date else None,
            "statute_limitations_date": matter.statute_limitations_date.isoformat() if matter.statute_limitations_date else None,
            "days_until_target": matter.days_until_target,
            "days_until_statute": matter.days_until_statute,
            "is_overdue": matter.is_overdue,
            "statute_approaching": matter.is_statute_approaching
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get matter deadline alerts", error=str(e), matter_id=matter_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deadline alerts"
        )


@router.get("/dashboard/summary", response_model=MatterDashboardSummary)
async def get_matter_dashboard_summary(
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Get matter dashboard summary for home page"""
    try:
        summary = await matter_service.get_dashboard_summary()
        
        logger.info(
            "Matter dashboard summary accessed",
            requested_by=current_user.id
        )
        
        return summary
        
    except Exception as e:
        logger.error("Failed to get matter dashboard summary", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard summary"
        )


@router.get("/overdue")
async def get_overdue_matters(
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Get overdue matters requiring immediate attention"""
    try:
        # Use search filters to find overdue matters
        filters = MatterSearchFilters(
            overdue_only=True,
            status=[MatterStatus.ACTIVE, MatterStatus.OPEN]
        )
        
        matters, total = await matter_service.search_matters(
            filters=filters,
            skip=0,
            limit=50,  # Reasonable limit for overdue matters
            sort_by="target_resolution_date",
            sort_order="asc"
        )
        
        # Group by urgency
        critical = []  # Overdue by >30 days
        urgent = []    # Overdue by 8-30 days
        warning = []   # Overdue by 1-7 days
        
        for matter in matters:
            if matter.days_until_target is not None and matter.days_until_target < 0:
                days_overdue = abs(matter.days_until_target)
                if days_overdue > 30:
                    critical.append(matter)
                elif days_overdue > 7:
                    urgent.append(matter)
                else:
                    warning.append(matter)
        
        return {
            "total_overdue": total,
            "critical_overdue": len(critical),
            "urgent_overdue": len(urgent),
            "warning_overdue": len(warning),
            "critical_matters": critical[:10],  # Top 10 most critical
            "urgent_matters": urgent[:10],
            "warning_matters": warning[:10]
        }
        
    except Exception as e:
        logger.error("Failed to get overdue matters", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve overdue matters"
        )


@router.get("/statute-deadlines")
async def get_statute_deadline_matters(
    days: int = Query(60, ge=1, le=365, description="Number of days to look ahead"),
    current_user = Depends(get_current_active_user),
    matter_service: MatterService = Depends(get_matter_service)
):
    """Get matters with approaching statute of limitations deadlines"""
    try:
        # Use search filters to find matters with approaching statute deadlines
        filters = MatterSearchFilters(
            statute_approaching=True,
            status=[MatterStatus.ACTIVE, MatterStatus.OPEN]
        )
        
        matters, total = await matter_service.search_matters(
            filters=filters,
            skip=0,
            limit=100,  # Reasonable limit
            sort_by="statute_limitations_date",
            sort_order="asc"
        )
        
        # Group by urgency
        immediate = []  # <= 7 days
        urgent = []     # 8-30 days  
        warning = []    # 31-60 days
        
        for matter in matters:
            if matter.days_until_statute is not None:
                if matter.days_until_statute <= 7:
                    immediate.append(matter)
                elif matter.days_until_statute <= 30:
                    urgent.append(matter)
                else:
                    warning.append(matter)
        
        return {
            "total_approaching": total,
            "immediate_action_required": len(immediate),
            "urgent_attention": len(urgent),
            "warning_level": len(warning),
            "immediate_matters": immediate,
            "urgent_matters": urgent[:20],
            "warning_matters": warning[:20]
        }
        
    except Exception as e:
        logger.error("Failed to get statute deadline matters", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statute deadline matters"
        )