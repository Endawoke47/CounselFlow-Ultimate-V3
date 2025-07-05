"""
CounselFlow Ultimate V3 - Admin API Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from prisma import Prisma
import structlog

from app.core.database import get_prisma, get_connection_pool_status
from app.core.redis import get_redis_status
from app.api.v1.auth import get_current_active_user
from app.schemas.user import UserRole

logger = structlog.get_logger()
router = APIRouter()


@router.get("/system/status")
async def get_system_status(
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get system status (admin only)"""
    
    # Check admin permissions
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        # Get database status
        db_pool_status = await get_connection_pool_status()
        
        # Get Redis status
        redis_status = await get_redis_status()
        
        # Get basic system metrics
        total_users = await prisma.user.count()
        active_users = await prisma.user.count(where={"active": True})
        
        return {
            "system": "healthy",
            "database": {
                "status": "connected",
                "pool": db_pool_status
            },
            "redis": redis_status,
            "metrics": {
                "total_users": total_users,
                "active_users": active_users
            },
            "version": "3.0.0"
        }
        
    except Exception as e:
        logger.error("Failed to get system status", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve system status"
        )


@router.get("/audit/logs")
async def get_audit_logs(
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get audit logs (admin only)"""
    
    # Check admin permissions
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    try:
        logs = await prisma.auditlog.find_many(
            take=50,
            order_by={"timestamp": "desc"}
        )
        return logs
    except Exception as e:
        logger.error("Failed to get audit logs", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve audit logs"
        )