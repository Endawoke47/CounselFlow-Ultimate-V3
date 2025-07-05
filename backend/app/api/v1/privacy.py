"""
CounselFlow Ultimate V3 - Privacy API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


@router.get("/assessments")
async def get_privacy_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of privacy impact assessments"""
    try:
        assessments = await prisma.privacyimpactassessment.find_many(
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"}
        )
        return assessments
    except Exception as e:
        logger.error("Failed to get privacy assessments", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve privacy assessments"
        )


@router.get("/assessments/{assessment_id}")
async def get_privacy_assessment(
    assessment_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get privacy assessment by ID"""
    try:
        assessment = await prisma.privacyimpactassessment.find_unique(where={"id": assessment_id})
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Privacy assessment not found"
            )
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get privacy assessment", error=str(e), assessment_id=assessment_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve privacy assessment"
        )