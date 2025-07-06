"""
CounselFlow Ultimate V3 - Clients API Routes
Complete CRUD operations for client management
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.schemas.client import (
    ClientCreate, ClientUpdate, ClientResponse, ClientSearch, 
    ClientStats, ClientSummary, ClientStatus, RiskLevel
)
from app.schemas.user import UserRole, Permission
from app.services.client_service import ClientService, get_client_service
from app.services.rbac_service import require_permission

logger = structlog.get_logger()
router = APIRouter()


@router.get("/", response_model=dict)
@require_permission(Permission.CLIENT_READ)
async def get_clients(
    query: Optional[str] = Query(None, description="Search term for client name, email, or industry"),
    status: Optional[ClientStatus] = Query(None, description="Filter by client status"),
    risk_level: Optional[RiskLevel] = Query(None, description="Filter by risk level"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    limit: int = Query(50, ge=1, le=200, description="Number of clients to return"),
    offset: int = Query(0, ge=0, description="Number of clients to skip"),
    current_user = Depends(get_current_active_user),
    client_service: ClientService = Depends(get_client_service)
):
    """Get list of clients with filtering and pagination"""
    
    try:
        search_params = ClientSearch(
            query=query,
            status=status,
            risk_level=risk_level,
            industry=industry,
            limit=limit,
            offset=offset
        )
        
        result = await client_service.list_clients(
            search_params=search_params,
            user_id=current_user.id,
            user_role=UserRole(current_user.role)
        )
        
        logger.info(
            "Clients retrieved successfully",
            user_id=current_user.id,
            count=len(result["clients"]),
            total=result["total"]
        )
        
        return result
        
    except Exception as e:
        logger.error("Failed to get clients", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve clients"
        )


@router.get("/{client_id}", response_model=ClientResponse)
@require_permission(Permission.CLIENT_READ)
async def get_client(
    client_id: str,
    current_user = Depends(get_current_active_user),
    client_service: ClientService = Depends(get_client_service)
):
    """Get client by ID"""
    
    try:
        client = await client_service.get_client(
            client_id=client_id,
            user_id=current_user.id,
            user_role=UserRole(current_user.role)
        )
        
        logger.info(
            "Client retrieved successfully",
            client_id=client_id,
            user_id=current_user.id
        )
        
        return client
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to get client",
            error=str(e),
            client_id=client_id,
            user_id=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve client"
        )


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
@require_permission(Permission.CLIENT_CREATE)
async def create_client(
    client_data: ClientCreate,
    current_user = Depends(get_current_active_user),
    client_service: ClientService = Depends(get_client_service)
):
    """Create a new client"""
    
    try:
        client = await client_service.create_client(
            client_data=client_data,
            created_by_user_id=current_user.id
        )
        
        logger.info(
            "Client created successfully",
            client_id=client.id,
            client_name=client.name,
            created_by=current_user.id
        )
        
        return client
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to create client",
            error=str(e),
            client_name=client_data.name,
            created_by=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create client"
        )


@router.put("/{client_id}", response_model=ClientResponse)
@require_permission(Permission.CLIENT_UPDATE)
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    current_user = Depends(get_current_active_user),
    client_service: ClientService = Depends(get_client_service)
):
    """Update client by ID"""
    
    try:
        client = await client_service.update_client(
            client_id=client_id,
            client_data=client_data,
            updated_by_user_id=current_user.id,
            user_role=UserRole(current_user.role)
        )
        
        logger.info(
            "Client updated successfully",
            client_id=client_id,
            updated_by=current_user.id
        )
        
        return client
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to update client",
            error=str(e),
            client_id=client_id,
            updated_by=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update client"
        )


@router.delete("/{client_id}")
@require_permission(Permission.CLIENT_DELETE)
async def delete_client(
    client_id: str,
    current_user = Depends(get_current_active_user),
    client_service: ClientService = Depends(get_client_service)
):
    """Delete client by ID (soft delete)"""
    
    try:
        success = await client_service.delete_client(
            client_id=client_id,
            deleted_by_user_id=current_user.id,
            user_role=UserRole(current_user.role)
        )
        
        if success:
            logger.info(
                "Client deleted successfully",
                client_id=client_id,
                deleted_by=current_user.id
            )
            return {"message": "Client deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete client"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to delete client",
            error=str(e),
            client_id=client_id,
            deleted_by=current_user.id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete client"
        )