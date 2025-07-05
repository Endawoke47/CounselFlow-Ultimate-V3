"""
CounselFlow Ultimate V3 - Documents API Routes
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
async def get_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get list of documents"""
    try:
        documents = await prisma.document.find_many(
            skip=skip,
            take=limit,
            order_by={"created_at": "desc"}
        )
        return documents
    except Exception as e:
        logger.error("Failed to get documents", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve documents"
        )


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get document by ID"""
    try:
        document = await prisma.document.find_unique(where={"id": document_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        return document
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get document", error=str(e), document_id=document_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document"
        )