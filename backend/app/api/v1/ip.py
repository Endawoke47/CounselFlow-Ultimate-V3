"""
CounselFlow Ultimate V3 - IP Management API Routes
Enterprise Intellectual Property Portfolio Management with AI Integration
"""

from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.schemas.user import UserRole
from app.schemas.ip import (
    IPAssetCreate, IPAssetUpdate, IPAssetResponse, IPAssetListResponse,
    IPSearchRequest, IPSearchResponse, IPValuationRequest, IPValuationResponse,
    IPMetrics, IPBulkAction, IPAssetType, IPAssetStatus, IPPriority,
    IPSearchFilters, IPPortfolioAnalysis, RenewalStatus
)
from app.services.ip_service import IPService
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


def get_ip_service(prisma: Prisma = Depends(get_prisma)) -> IPService:
    """Dependency to get IP service"""
    return IPService(prisma)


@router.post("/", response_model=IPAssetResponse, status_code=status.HTTP_201_CREATED)
async def create_ip_asset(
    asset_data: IPAssetCreate,
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Create a new IP asset"""
    
    # Check permissions - legal roles can create IP assets
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create IP assets"
        )
    
    try:
        ip_asset = await ip_service.create_ip_asset(asset_data, current_user.id)
        
        logger.info(
            "IP asset created via API",
            asset_id=ip_asset.id,
            name=ip_asset.name,
            type=ip_asset.type,
            created_by=current_user.id
        )
        
        return ip_asset
        
    except Exception as e:
        logger.error("Failed to create IP asset via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create IP asset"
        )


@router.get("/", response_model=IPAssetListResponse)
async def get_ip_assets(
    # Pagination
    skip: int = Query(0, ge=0, description="Number of assets to skip"),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE, description="Number of assets to return"),
    
    # Sorting
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Basic filters
    type: Optional[List[IPAssetType]] = Query(None, description="Filter by IP asset type"),
    status: Optional[List[IPAssetStatus]] = Query(None, description="Filter by asset status"),
    priority: Optional[List[IPPriority]] = Query(None, description="Filter by priority"),
    jurisdiction: Optional[List[str]] = Query(None, description="Filter by jurisdiction"),
    
    # Assignment filters
    owner_id: Optional[str] = Query(None, description="Filter by owner (client)"),
    responsible_attorney_id: Optional[str] = Query(None, description="Filter by responsible attorney"),
    
    # Search
    search: Optional[str] = Query(None, description="Search in name, description, inventors"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    
    # Business filters
    technology_area: Optional[List[str]] = Query(None, description="Filter by technology area"),
    business_unit: Optional[List[str]] = Query(None, description="Filter by business unit"),
    commercial_value: Optional[List[str]] = Query(None, description="Filter by commercial value"),
    
    # Date filters
    expiring_within_days: Optional[int] = Query(None, ge=0, le=365, description="Assets expiring within N days"),
    renewal_due_within_days: Optional[int] = Query(None, ge=0, le=365, description="Renewals due within N days"),
    
    # Financial filters
    estimated_value_min: Optional[float] = Query(None, ge=0, description="Minimum estimated value"),
    estimated_value_max: Optional[float] = Query(None, ge=0, description="Maximum estimated value"),
    
    # AI filters
    ai_valuation_min: Optional[float] = Query(None, ge=0, description="Minimum AI valuation"),
    ai_valuation_max: Optional[float] = Query(None, ge=0, description="Maximum AI valuation"),
    ai_risk_score_min: Optional[float] = Query(None, ge=0, le=10, description="Minimum AI risk score"),
    ai_risk_score_max: Optional[float] = Query(None, ge=0, le=10, description="Maximum AI risk score"),
    
    # Status filters
    has_licenses: Optional[bool] = Query(None, description="Filter by license status"),
    
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Get list of IP assets with advanced filtering"""
    try:
        # Create search filters
        filters = IPSearchFilters(
            type=type,
            status=status,
            priority=priority,
            jurisdiction=jurisdiction,
            owner_id=owner_id,
            responsible_attorney_id=responsible_attorney_id,
            search_text=search,
            tags=tags,
            technology_area=technology_area,
            business_unit=business_unit,
            commercial_value=commercial_value,
            expiring_within_days=expiring_within_days,
            renewal_due_within_days=renewal_due_within_days,
            estimated_value_min=estimated_value_min,
            estimated_value_max=estimated_value_max,
            ai_valuation_min=ai_valuation_min,
            ai_valuation_max=ai_valuation_max,
            ai_risk_score_min=ai_risk_score_min,
            ai_risk_score_max=ai_risk_score_max,
            has_licenses=has_licenses
        )
        
        # Add tenant filtering for non-admin users
        if current_user.role != UserRole.ADMIN and current_user.tenant_id:
            # This would require adding tenant_id to the IPAsset model
            pass
        
        assets, total = await ip_service.search_ip_assets(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return IPAssetListResponse(
            assets=assets,
            total=total,
            page=skip // limit + 1,
            page_size=limit,
            has_next=(skip + limit) < total,
            has_previous=skip > 0
        )
        
    except Exception as e:
        logger.error("Failed to get IP assets", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve IP assets"
        )


@router.get("/{asset_id}", response_model=IPAssetResponse)
async def get_ip_asset(
    asset_id: str,
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Get IP asset by ID"""
    try:
        asset = await ip_service.get_ip_asset(asset_id)
        
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="IP asset not found"
            )
        
        # Check access permissions (simplified - in production, implement proper access control)
        # Users should only see IP assets they're authorized to view
        
        return asset
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get IP asset", error=str(e), asset_id=asset_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve IP asset"
        )


@router.put("/{asset_id}", response_model=IPAssetResponse)
async def update_ip_asset(
    asset_id: str,
    asset_data: IPAssetUpdate,
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Update IP asset"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update IP assets"
        )
    
    try:
        asset = await ip_service.update_ip_asset(
            asset_id=asset_id,
            asset_data=asset_data,
            updated_by=current_user.id
        )
        
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="IP asset not found"
            )
        
        logger.info(
            "IP asset updated via API",
            asset_id=asset_id,
            updated_by=current_user.id
        )
        
        return asset
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update IP asset", error=str(e), asset_id=asset_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update IP asset"
        )


@router.delete("/{asset_id}")
async def delete_ip_asset(
    asset_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Delete IP asset (soft delete)"""
    
    # Only admins and legal ops can delete IP assets
    if current_user.role not in [UserRole.ADMIN, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete IP assets"
        )
    
    try:
        # Check if asset exists
        asset = await prisma.ipasset.find_unique(where={"id": asset_id})
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="IP asset not found"
            )
        
        # Soft delete by updating status
        await prisma.ipasset.update(
            where={"id": asset_id},
            data={"status": IPAssetStatus.ABANDONED}
        )
        
        logger.info(
            "IP asset deleted via API",
            asset_id=asset_id,
            deleted_by=current_user.id
        )
        
        return {"message": "IP asset deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete IP asset", error=str(e), asset_id=asset_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete IP asset"
        )


@router.post("/search/prior-art", response_model=IPSearchResponse)
async def search_prior_art(
    search_request: IPSearchRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Perform AI-powered prior art search"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform patent searches"
        )
    
    try:
        search_result = await ip_service.perform_prior_art_search(
            search_request=search_request,
            searched_by=current_user.id
        )
        
        logger.info(
            "Prior art search performed via API",
            search_type=search_request.search_type,
            keywords=search_request.keywords,
            searched_by=current_user.id,
            results_count=len(search_result.results)
        )
        
        return search_result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to perform prior art search", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform prior art search"
        )


@router.post("/{asset_id}/valuation", response_model=IPValuationResponse)
async def valuate_ip_asset(
    asset_id: str,
    valuation_request: IPValuationRequest,
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Perform AI-powered IP asset valuation"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.EXTERNAL_COUNSEL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform IP valuations"
        )
    
    try:
        # Ensure asset_id matches
        valuation_request.asset_id = asset_id
        
        valuation_result = await ip_service.valuate_ip_asset(
            valuation_request=valuation_request
        )
        
        logger.info(
            "IP valuation performed via API",
            asset_id=asset_id,
            valuation_method=valuation_request.valuation_method,
            estimated_value=str(valuation_result.estimated_value),
            requested_by=current_user.id
        )
        
        return valuation_result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to perform IP valuation", error=str(e), asset_id=asset_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform IP valuation"
        )


@router.get("/metrics/overview", response_model=IPMetrics)
async def get_ip_metrics(
    owner_id: Optional[str] = Query(None, description="Filter metrics by owner (client)"),
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Get IP portfolio metrics and analytics"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view IP metrics"
        )
    
    try:
        metrics = await ip_service.get_ip_metrics(owner_id=owner_id)
        
        logger.info(
            "IP metrics accessed",
            requested_by=current_user.id,
            owner_filter=owner_id
        )
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to get IP metrics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve IP metrics"
        )


@router.post("/bulk-actions")
async def bulk_update_ip_assets(
    bulk_action: IPBulkAction,
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Perform bulk actions on IP assets"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform bulk IP asset actions"
        )
    
    try:
        results = await ip_service.bulk_update_assets(
            bulk_action=bulk_action,
            updated_by=current_user.id
        )
        
        logger.info(
            "Bulk IP asset action performed",
            action=bulk_action.action,
            asset_count=len(bulk_action.asset_ids),
            success_count=len(results["success"]),
            performed_by=current_user.id
        )
        
        return results
        
    except Exception as e:
        logger.error("Failed to perform bulk IP asset action", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk action"
        )


@router.get("/portfolio/analysis", response_model=IPPortfolioAnalysis)
async def get_portfolio_analysis(
    portfolio_id: Optional[str] = Query(None, description="Portfolio ID (defaults to all assets)"),
    include_market_analysis: bool = Query(True, description="Include market trend analysis"),
    include_competitive_analysis: bool = Query(True, description="Include competitive positioning"),
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Get comprehensive IP portfolio analysis"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view portfolio analysis"
        )
    
    try:
        analysis = await ip_service.analyze_portfolio(
            portfolio_id=portfolio_id or "default",
            include_market_analysis=include_market_analysis,
            include_competitive_analysis=include_competitive_analysis
        )
        
        logger.info(
            "IP portfolio analysis accessed",
            portfolio_id=portfolio_id,
            requested_by=current_user.id
        )
        
        return analysis
        
    except Exception as e:
        logger.error("Failed to get portfolio analysis", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve portfolio analysis"
        )


@router.get("/{asset_id}/renewal-alerts")
async def get_ip_renewal_alerts(
    asset_id: str,
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Get IP asset renewal alerts and recommendations"""
    try:
        asset = await ip_service.get_ip_asset(asset_id)
        
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="IP asset not found"
            )
        
        alerts = []
        recommendations = []
        
        if asset.days_until_renewal and asset.days_until_renewal <= 90:
            severity = "CRITICAL" if asset.days_until_renewal <= 30 else "WARNING"
            alerts.append({
                "type": "RENEWAL_DUE",
                "message": f"Renewal due in {asset.days_until_renewal} days",
                "severity": severity,
                "action_required": True,
                "due_date": asset.renewal_date.isoformat() if asset.renewal_date else None
            })
            
            recommendations.append({
                "type": "SCHEDULE_RENEWAL",
                "title": "Schedule renewal process",
                "description": "Initiate renewal proceedings to maintain protection",
                "priority": "HIGH" if asset.days_until_renewal <= 30 else "MEDIUM"
            })
        
        if asset.days_until_expiry and asset.days_until_expiry <= 180:
            alerts.append({
                "type": "EXPIRY_WARNING",
                "message": f"Asset expires in {asset.days_until_expiry} days",
                "severity": "WARNING",
                "action_required": True
            })
            
            recommendations.append({
                "type": "RENEWAL_STRATEGY",
                "title": "Evaluate renewal strategy",
                "description": "Assess commercial value and strategic importance for renewal decision",
                "priority": "HIGH"
            })
        
        if asset.is_expired:
            alerts.append({
                "type": "EXPIRED",
                "message": "IP asset has expired",
                "severity": "CRITICAL",
                "action_required": True
            })
        
        # Check renewal fee status
        if asset.renewal_fee_amount and asset.next_renewal_fee_due:
            days_until_fee_due = (asset.next_renewal_fee_due - date.today()).days
            if days_until_fee_due <= 60:
                alerts.append({
                    "type": "RENEWAL_FEE_DUE",
                    "message": f"Renewal fee of {asset.renewal_fee_amount} due in {days_until_fee_due} days",
                    "severity": "WARNING" if days_until_fee_due > 30 else "CRITICAL",
                    "action_required": True
                })
        
        return {
            "asset_id": asset_id,
            "alerts": alerts,
            "recommendations": recommendations,
            "renewal_status": asset.renewal_status,
            "next_renewal_date": asset.renewal_date.isoformat() if asset.renewal_date else None,
            "next_fee_due_date": asset.next_renewal_fee_due.isoformat() if asset.next_renewal_fee_due else None,
            "estimated_renewal_cost": str(asset.renewal_fee_amount) if asset.renewal_fee_amount else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get IP renewal alerts", error=str(e), asset_id=asset_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve renewal alerts"
        )


@router.get("/dashboard/summary")
async def get_ip_dashboard_summary(
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Get IP portfolio dashboard summary for home page"""
    try:
        # Get basic metrics
        metrics = await ip_service.get_ip_metrics()
        
        # Get quick stats for dashboard
        summary = {
            "total_ip_assets": metrics.total_ip_assets,
            "active_assets": metrics.assets_by_status.get("ACTIVE", 0),
            "pending_applications": metrics.assets_by_status.get("PENDING", 0),
            "expiring_soon": metrics.expiring_next_90_days,
            "renewals_due": metrics.overdue_renewals,
            "total_portfolio_value": str(metrics.total_portfolio_value),
            "high_value_assets": metrics.high_value_assets,
            "by_type": {
                "patents": metrics.assets_by_type.get("PATENT", 0),
                "trademarks": metrics.assets_by_type.get("TRADEMARK", 0),
                "copyrights": metrics.assets_by_type.get("COPYRIGHT", 0),
                "trade_secrets": metrics.assets_by_type.get("TRADE_SECRET", 0),
                "designs": metrics.assets_by_type.get("DESIGN", 0)
            },
            "geographic_distribution": metrics.assets_by_jurisdiction,
            "ai_insights": {
                "analyzed_assets": metrics.ai_analyzed_assets,
                "average_valuation": str(metrics.average_ai_valuation) if metrics.average_ai_valuation else None,
                "pending_actions": metrics.ai_recommended_actions
            },
            "performance_indicators": {
                "filing_rate_monthly": metrics.filing_rate_monthly,
                "grant_rate_percentage": metrics.grant_rate_percentage,
                "abandonment_rate_percentage": metrics.abandonment_rate_percentage
            }
        }
        
        return summary
        
    except Exception as e:
        logger.error("Failed to get IP dashboard summary", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dashboard summary"
        )


@router.get("/expiring-soon")
async def get_expiring_ip_assets(
    days: int = Query(90, ge=1, le=365, description="Number of days to look ahead"),
    current_user = Depends(get_current_active_user),
    ip_service: IPService = Depends(get_ip_service)
):
    """Get IP assets expiring within specified days"""
    try:
        # Use search filters to find expiring assets
        filters = IPSearchFilters(
            expiring_within_days=days,
            status=[IPAssetStatus.ACTIVE]  # Only active assets
        )
        
        assets, total = await ip_service.search_ip_assets(
            filters=filters,
            skip=0,
            limit=100,  # Reasonable limit for expiring assets
            sort_by="expiry_date",
            sort_order="asc"
        )
        
        # Group by urgency
        urgent = []  # <= 30 days
        warning = []  # 31-90 days
        notice = []  # 91+ days
        
        for asset in assets:
            if asset.days_until_expiry:
                if asset.days_until_expiry <= 30:
                    urgent.append(asset)
                elif asset.days_until_expiry <= 90:
                    warning.append(asset)
                else:
                    notice.append(asset)
        
        return {
            "total_expiring": total,
            "urgent_action_required": len(urgent),
            "warning_level": len(warning),
            "notice_level": len(notice),
            "urgent_assets": urgent[:10],  # Top 10 most urgent
            "warning_assets": warning[:10],
            "notice_assets": notice[:10]
        }
        
    except Exception as e:
        logger.error("Failed to get expiring IP assets", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve expiring IP assets"
        )