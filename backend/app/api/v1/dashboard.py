"""
CounselFlow Ultimate V3 - Dashboard Analytics API Routes
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from prisma import Prisma

from app.core.database import get_prisma
from app.api.v1.auth import get_current_user
from app.services.rbac_service import require_permission, Permission

logger = structlog.get_logger()
router = APIRouter()


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class DashboardStats(BaseModel):
    total_clients: int
    active_clients: int
    total_contracts: int
    active_contracts: int
    total_matters: int
    active_matters: int
    pending_tasks: int
    overdue_tasks: int
    contracts_expiring_soon: int
    high_risk_contracts: int


class MetricTrend(BaseModel):
    period: str
    value: int
    change_percentage: Optional[float] = None


class ClientMetrics(BaseModel):
    client_count_trend: List[MetricTrend]
    top_clients_by_value: List[Dict[str, Any]]
    client_risk_distribution: Dict[str, int]


class ContractMetrics(BaseModel):
    contract_value_trend: List[MetricTrend]
    contracts_by_status: Dict[str, int]
    contracts_by_type: Dict[str, int]
    upcoming_renewals: List[Dict[str, Any]]


class MatterMetrics(BaseModel):
    matter_count_trend: List[MetricTrend]
    matters_by_type: Dict[str, int]
    matters_by_priority: Dict[str, int]
    attorney_workload: List[Dict[str, Any]]


class AIMetrics(BaseModel):
    ai_usage_stats: Dict[str, int]
    contract_analysis_count: int
    document_generation_count: int
    average_analysis_time: float
    ai_accuracy_score: Optional[float] = None


class DashboardData(BaseModel):
    overview: DashboardStats
    client_metrics: ClientMetrics
    contract_metrics: ContractMetrics
    matter_metrics: MatterMetrics
    ai_metrics: AIMetrics
    last_updated: datetime


# =============================================================================
# DASHBOARD ENDPOINTS
# =============================================================================

@router.get("/overview", response_model=DashboardStats)
async def get_dashboard_overview(
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get dashboard overview statistics"""
    try:
        # In a real implementation, these would be actual database queries
        # For now, returning mock data with proper structure
        
        stats = DashboardStats(
            total_clients=156,
            active_clients=142,
            total_contracts=892,
            active_contracts=673,
            total_matters=234,
            active_matters=89,
            pending_tasks=45,
            overdue_tasks=8,
            contracts_expiring_soon=12,
            high_risk_contracts=23
        )
        
        logger.info(
            "Dashboard overview retrieved",
            user_id=current_user.id,
            stats=stats.dict()
        )
        
        return stats
        
    except Exception as e:
        logger.error("Failed to get dashboard overview", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve dashboard overview"
        )


@router.get("/metrics/clients", response_model=ClientMetrics)
async def get_client_metrics(
    days: int = Query(30, ge=7, le=365),
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get client analytics and metrics"""
    try:
        # Mock client metrics data
        client_metrics = ClientMetrics(
            client_count_trend=[
                MetricTrend(period="Week 1", value=140, change_percentage=2.5),
                MetricTrend(period="Week 2", value=143, change_percentage=2.1),
                MetricTrend(period="Week 3", value=148, change_percentage=3.5),
                MetricTrend(period="Week 4", value=156, change_percentage=5.4),
            ],
            top_clients_by_value=[
                {"name": "TechCorp Inc.", "value": 2500000, "contracts": 15},
                {"name": "Global Dynamics", "value": 1800000, "contracts": 12},
                {"name": "Innovation Labs", "value": 1200000, "contracts": 8},
                {"name": "Future Systems", "value": 950000, "contracts": 6},
                {"name": "Digital Solutions", "value": 750000, "contracts": 5},
            ],
            client_risk_distribution={
                "LOW": 89,
                "MEDIUM": 45,
                "HIGH": 18,
                "CRITICAL": 4
            }
        )
        
        logger.info(
            "Client metrics retrieved",
            user_id=current_user.id,
            days=days
        )
        
        return client_metrics
        
    except Exception as e:
        logger.error("Failed to get client metrics", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve client metrics"
        )


@router.get("/metrics/contracts", response_model=ContractMetrics)
async def get_contract_metrics(
    days: int = Query(30, ge=7, le=365),
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get contract analytics and metrics"""
    try:
        # Mock contract metrics data
        contract_metrics = ContractMetrics(
            contract_value_trend=[
                MetricTrend(period="Q1", value=12500000, change_percentage=8.2),
                MetricTrend(period="Q2", value=14200000, change_percentage=13.6),
                MetricTrend(period="Q3", value=15800000, change_percentage=11.3),
                MetricTrend(period="Q4", value=17200000, change_percentage=8.9),
            ],
            contracts_by_status={
                "DRAFT": 45,
                "UNDER_REVIEW": 23,
                "EXECUTED": 673,
                "EXPIRED": 89,
                "TERMINATED": 12
            },
            contracts_by_type={
                "SERVICE_AGREEMENT": 234,
                "NDA": 189,
                "EMPLOYMENT": 156,
                "VENDOR": 123,
                "LICENSING": 89,
                "OTHER": 101
            },
            upcoming_renewals=[
                {
                    "contract_id": "contract-123",
                    "title": "Software License Agreement",
                    "client": "TechCorp Inc.",
                    "renewal_date": "2024-02-15",
                    "value": 250000
                },
                {
                    "contract_id": "contract-456",
                    "title": "Service Level Agreement",
                    "client": "Global Dynamics",
                    "renewal_date": "2024-02-28",
                    "value": 180000
                }
            ]
        )
        
        logger.info(
            "Contract metrics retrieved",
            user_id=current_user.id,
            days=days
        )
        
        return contract_metrics
        
    except Exception as e:
        logger.error("Failed to get contract metrics", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve contract metrics"
        )


@router.get("/metrics/matters", response_model=MatterMetrics)
async def get_matter_metrics(
    days: int = Query(30, ge=7, le=365),
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get matter analytics and metrics"""
    try:
        # Mock matter metrics data
        matter_metrics = MatterMetrics(
            matter_count_trend=[
                MetricTrend(period="Jan", value=45, change_percentage=12.5),
                MetricTrend(period="Feb", value=52, change_percentage=15.6),
                MetricTrend(period="Mar", value=48, change_percentage=-7.7),
                MetricTrend(period="Apr", value=61, change_percentage=27.1),
            ],
            matters_by_type={
                "LITIGATION": 45,
                "CORPORATE": 67,
                "EMPLOYMENT": 34,
                "INTELLECTUAL_PROPERTY": 23,
                "COMPLIANCE": 28,
                "OTHER": 37
            },
            matters_by_priority={
                "LOW": 89,
                "MEDIUM": 78,
                "HIGH": 45,
                "URGENT": 18,
                "CRITICAL": 4
            },
            attorney_workload=[
                {
                    "attorney_id": "user-123",
                    "name": "Sarah Chen",
                    "active_matters": 12,
                    "billable_hours": 156.5,
                    "utilization": 85.2
                },
                {
                    "attorney_id": "user-456",
                    "name": "Michael Rodriguez",
                    "active_matters": 8,
                    "billable_hours": 142.0,
                    "utilization": 78.9
                }
            ]
        )
        
        logger.info(
            "Matter metrics retrieved",
            user_id=current_user.id,
            days=days
        )
        
        return matter_metrics
        
    except Exception as e:
        logger.error("Failed to get matter metrics", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve matter metrics"
        )


@router.get("/metrics/ai", response_model=AIMetrics)
@require_permission(Permission.AI_SERVICES_ACCESS)
async def get_ai_metrics(
    days: int = Query(30, ge=7, le=365),
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get AI usage analytics and metrics"""
    try:
        # Mock AI metrics data
        ai_metrics = AIMetrics(
            ai_usage_stats={
                "total_requests": 1247,
                "successful_requests": 1198,
                "failed_requests": 49,
                "average_daily_usage": 41.6
            },
            contract_analysis_count=456,
            document_generation_count=289,
            average_analysis_time=12.7,
            ai_accuracy_score=94.2
        )
        
        logger.info(
            "AI metrics retrieved",
            user_id=current_user.id,
            days=days
        )
        
        return ai_metrics
        
    except Exception as e:
        logger.error("Failed to get AI metrics", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve AI metrics"
        )


@router.get("/data", response_model=DashboardData)
async def get_complete_dashboard_data(
    days: int = Query(30, ge=7, le=365),
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get complete dashboard data in a single request"""
    try:
        # Get all metrics in parallel (in a real implementation)
        overview = await get_dashboard_overview(current_user, prisma)
        client_metrics = await get_client_metrics(days, current_user, prisma)
        contract_metrics = await get_contract_metrics(days, current_user, prisma)
        matter_metrics = await get_matter_metrics(days, current_user, prisma)
        
        # Check if user has AI access before fetching AI metrics
        try:
            ai_metrics = await get_ai_metrics(days, current_user, prisma)
        except HTTPException:
            # User doesn't have AI access, return empty metrics
            ai_metrics = AIMetrics(
                ai_usage_stats={},
                contract_analysis_count=0,
                document_generation_count=0,
                average_analysis_time=0.0
            )
        
        dashboard_data = DashboardData(
            overview=overview,
            client_metrics=client_metrics,
            contract_metrics=contract_metrics,
            matter_metrics=matter_metrics,
            ai_metrics=ai_metrics,
            last_updated=datetime.utcnow()
        )
        
        logger.info(
            "Complete dashboard data retrieved",
            user_id=current_user.id,
            days=days
        )
        
        return dashboard_data
        
    except Exception as e:
        logger.error("Failed to get complete dashboard data", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve dashboard data"
        )


@router.get("/alerts")
async def get_dashboard_alerts(
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get dashboard alerts and notifications"""
    try:
        # Mock alerts data
        alerts = [
            {
                "id": "alert-1",
                "type": "warning",
                "title": "Contracts Expiring Soon",
                "message": "12 contracts are expiring within the next 30 days",
                "action_url": "/contracts?filter=expiring",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": "alert-2",
                "type": "error",
                "title": "Overdue Tasks",
                "message": "8 tasks are overdue and require immediate attention",
                "action_url": "/tasks?filter=overdue",
                "created_at": datetime.utcnow().isoformat()
            },
            {
                "id": "alert-3",
                "type": "info",
                "title": "High Risk Contracts",
                "message": "23 contracts have been flagged as high risk by AI analysis",
                "action_url": "/contracts?filter=high-risk",
                "created_at": datetime.utcnow().isoformat()
            }
        ]
        
        logger.info(
            "Dashboard alerts retrieved",
            user_id=current_user.id,
            alert_count=len(alerts)
        )
        
        return {"alerts": alerts}
        
    except Exception as e:
        logger.error("Failed to get dashboard alerts", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve dashboard alerts"
        )


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user=Depends(get_current_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get recent system activity"""
    try:
        # Mock recent activity data
        activities = [
            {
                "id": "activity-1",
                "type": "contract_created",
                "description": "New contract created: Software License Agreement",
                "user": "Sarah Chen",
                "timestamp": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
                "metadata": {"contract_id": "contract-123", "client": "TechCorp Inc."}
            },
            {
                "id": "activity-2",
                "type": "matter_updated",
                "description": "Matter status updated: Employment Dispute Case",
                "user": "Michael Rodriguez",
                "timestamp": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
                "metadata": {"matter_id": "matter-456", "old_status": "ACTIVE", "new_status": "CLOSED_SETTLED"}
            },
            {
                "id": "activity-3",
                "type": "ai_analysis",
                "description": "AI contract analysis completed",
                "user": "System",
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "metadata": {"contract_id": "contract-789", "risk_score": 7.2}
            }
        ]
        
        logger.info(
            "Recent activity retrieved",
            user_id=current_user.id,
            activity_count=len(activities)
        )
        
        return {"activities": activities[:limit]}
        
    except Exception as e:
        logger.error("Failed to get recent activity", error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve recent activity"
        )