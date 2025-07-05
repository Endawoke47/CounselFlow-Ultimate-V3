"""
CounselFlow Ultimate V3 - Tasks API Routes
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
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of tasks"""
    try:
        tasks = await prisma.task.find_many(
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"}
        )
        return tasks
    except Exception as e:
        logger.error("Failed to get tasks", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve tasks"
        )


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get task by ID"""
    try:
        task = await prisma.task.find_unique(where={"id": task_id})
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get task", error=str(e), task_id=task_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve task"
        )