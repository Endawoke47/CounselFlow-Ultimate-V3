"""
CounselFlow Ultimate V3 - Disputes & Litigation API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


@router.get("/")
async def get_disputes(
    skip: int = Query(0, ge=0),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of disputes"""
    try:
        disputes = await prisma.dispute.find_many(
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"}
        )
        return disputes
    except Exception as e:
        logger.error("Failed to get disputes", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve disputes"
        )


@router.get("/{dispute_id}")
async def get_dispute(
    dispute_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get dispute by ID"""
    try:
        dispute = await prisma.dispute.find_unique(where={"id": dispute_id})
        if not dispute:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dispute not found"
            )
        return dispute
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get dispute", error=str(e), dispute_id=dispute_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dispute"
        )