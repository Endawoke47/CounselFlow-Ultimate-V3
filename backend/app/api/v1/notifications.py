"""
CounselFlow Ultimate V3 - Notifications API Routes
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
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE),
    unread_only: bool = Query(False),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get user notifications"""
    try:
        where_clause = {"user_id": current_user.id}
        if unread_only:
            where_clause["is_read"] = False
        
        notifications = await prisma.notification.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"}
        )
        return notifications
    except Exception as e:
        logger.error("Failed to get notifications", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve notifications"
        )


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Mark notification as read"""
    try:
        notification = await prisma.notification.update(
            where={
                "id": notification_id,
                "user_id": current_user.id
            },
            data={"is_read": True}
        )
        return notification
    except Exception as e:
        logger.error("Failed to mark notification as read", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification"
        )