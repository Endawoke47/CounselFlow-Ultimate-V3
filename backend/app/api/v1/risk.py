"""
CounselFlow Ultimate V3 - Risk & Compliance API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


@router.get("/events")
async def get_risk_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of risk events"""
    try:
        events = await prisma.riskevent.find_many(
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"}
        )
        return events
    except Exception as e:
        logger.error("Failed to get risk events", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve risk events"
        )


@router.get("/compliance")
async def get_compliance_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of compliance items"""
    try:
        items = await prisma.complianceitem.find_many(
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"}
        )
        return items
    except Exception as e:
        logger.error("Failed to get compliance items", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve compliance items"
        )