"""
CounselFlow Ultimate V3 - Client Service
Complete CRUD operations for client management
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import structlog
from fastapi import HTTPException, status
from prisma import Prisma

from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse, ClientSearch
from app.schemas.user import UserRole, Permission
from app.core.database import get_prisma

logger = structlog.get_logger()


class ClientService:
    """Service for client management operations"""
    
    def __init__(self, prisma: Prisma):
        self.prisma = prisma
    
    async def create_client(
        self,
        client_data: ClientCreate,
        created_by_user_id: str
    ) -> ClientResponse:
        """Create a new client"""
        
        try:
            # Check if client already exists (by name or email)
            existing_client = await self.prisma.client.find_first(
                where={
                    "OR": [
                        {"name": client_data.name},
                        {"email": client_data.email} if client_data.email else {"id": "never_match"}
                    ]
                }
            )
            
            if existing_client:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Client with this name or email already exists"
                )
            
            # Create client
            client = await self.prisma.client.create(
                data={
                    "name": client_data.name,
                    "email": client_data.email,
                    "phone": client_data.phone,
                    "address": client_data.address,
                    "industry": client_data.industry,
                    "website": client_data.website,
                    "description": client_data.description,
                    "status": client_data.status or "ACTIVE",
                    "risk_level": client_data.risk_level or "MEDIUM",
                    "billing_contact": client_data.billing_contact,
                    "primary_contact": client_data.primary_contact,
                    "business_unit": client_data.business_unit,
                    "annual_revenue": client_data.annual_revenue,
                    "employee_count": client_data.employee_count,
                    "jurisdiction": client_data.jurisdiction,
                    "created_by": created_by_user_id,
                    "tenant_id": client_data.tenant_id
                }
            )
            
            logger.info(
                "Client created successfully",
                client_id=client.id,
                client_name=client.name,
                created_by=created_by_user_id
            )
            
            return ClientResponse.from_orm(client)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Failed to create client",
                error=str(e),
                client_name=client_data.name,
                created_by=created_by_user_id
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create client"
            )
    
    async def get_client(
        self,
        client_id: str,
        user_id: str,
        user_role: UserRole
    ) -> ClientResponse:
        """Get client by ID with access control"""
        
        try:
            where_clause = {"id": client_id}
            
            # Add tenant filtering for non-admin users
            if user_role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
                # Get user's tenant_id (simplified - in real implementation would query user)
                where_clause["tenant_id"] = "default_tenant"
            
            client = await self.prisma.client.find_unique(
                where=where_clause,
                include={
                    "matters": True,
                    "contracts": True
                }
            )
            
            if not client:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Client not found"
                )
            
            return ClientResponse.from_orm(client)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Failed to get client",
                error=str(e),
                client_id=client_id,
                user_id=user_id
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve client"
            )
    
    async def list_clients(
        self,
        search_params: ClientSearch,
        user_id: str,
        user_role: UserRole
    ) -> Dict[str, Any]:
        """List clients with filtering and pagination"""
        
        try:
            where_clause = {}
            
            # Add tenant filtering for non-admin users
            if user_role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
                where_clause["tenant_id"] = "default_tenant"
            
            # Apply search filters
            if search_params.query:
                where_clause["OR"] = [
                    {"name": {"contains": search_params.query, "mode": "insensitive"}},
                    {"email": {"contains": search_params.query, "mode": "insensitive"}},
                    {"industry": {"contains": search_params.query, "mode": "insensitive"}}
                ]
            
            if search_params.status:
                where_clause["status"] = search_params.status
            
            if search_params.risk_level:
                where_clause["risk_level"] = search_params.risk_level
            
            if search_params.industry:
                where_clause["industry"] = {"contains": search_params.industry, "mode": "insensitive"}
            
            # Get total count
            total_count = await self.prisma.client.count(where=where_clause)
            
            # Get clients with pagination
            clients = await self.prisma.client.find_many(
                where=where_clause,
                skip=search_params.offset,
                take=search_params.limit,
                order_by={"created_at": "desc"},
                include={
                    "_count": {
                        "select": {
                            "matters": True,
                            "contracts": True
                        }
                    }
                }
            )
            
            return {
                "clients": [ClientResponse.from_orm(client) for client in clients],
                "total": total_count,
                "offset": search_params.offset,
                "limit": search_params.limit,
                "has_more": (search_params.offset + search_params.limit) < total_count
            }
            
        except Exception as e:
            logger.error(
                "Failed to list clients",
                error=str(e),
                user_id=user_id
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve clients"
            )
    
    async def update_client(
        self,
        client_id: str,
        client_data: ClientUpdate,
        updated_by_user_id: str,
        user_role: UserRole
    ) -> ClientResponse:
        """Update client"""
        
        try:
            where_clause = {"id": client_id}
            
            # Add tenant filtering for non-admin users
            if user_role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
                where_clause["tenant_id"] = "default_tenant"
            
            # Check if client exists
            existing_client = await self.prisma.client.find_unique(where=where_clause)
            if not existing_client:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Client not found"
                )
            
            # Prepare update data
            update_data = {}
            for field, value in client_data.dict(exclude_unset=True).items():
                if value is not None:
                    update_data[field] = value
            
            if not update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid fields to update"
                )
            
            update_data["updated_at"] = datetime.utcnow()
            
            # Update client
            updated_client = await self.prisma.client.update(
                where={"id": client_id},
                data=update_data,
                include={
                    "matters": True,
                    "contracts": True
                }
            )
            
            logger.info(
                "Client updated successfully",
                client_id=client_id,
                updated_fields=list(update_data.keys()),
                updated_by=updated_by_user_id
            )
            
            return ClientResponse.from_orm(updated_client)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Failed to update client",
                error=str(e),
                client_id=client_id,
                updated_by=updated_by_user_id
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update client"
            )
    
    async def delete_client(
        self,
        client_id: str,
        deleted_by_user_id: str,
        user_role: UserRole
    ) -> bool:
        """Soft delete client"""
        
        try:
            where_clause = {"id": client_id}
            
            # Add tenant filtering for non-admin users
            if user_role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
                where_clause["tenant_id"] = "default_tenant"
            
            # Check if client exists
            existing_client = await self.prisma.client.find_unique(where=where_clause)
            if not existing_client:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Client not found"
                )
            
            # Check if client has active matters or contracts
            active_matters = await self.prisma.matter.count(
                where={
                    "client_id": client_id,
                    "status": {"in": ["OPEN", "IN_PROGRESS"]}
                }
            )
            
            active_contracts = await self.prisma.contract.count(
                where={
                    "client_id": client_id,
                    "status": {"in": ["DRAFT", "IN_REVIEW", "ACTIVE"]}
                }
            )
            
            if active_matters > 0 or active_contracts > 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot delete client with active matters ({active_matters}) or contracts ({active_contracts})"
                )
            
            # Soft delete by updating status
            await self.prisma.client.update(
                where={"id": client_id},
                data={
                    "status": "INACTIVE",
                    "deleted_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            )
            
            logger.info(
                "Client soft deleted successfully",
                client_id=client_id,
                deleted_by=deleted_by_user_id
            )
            
            return True
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Failed to delete client",
                error=str(e),
                client_id=client_id,
                deleted_by=deleted_by_user_id
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete client"
            )
    
    async def get_client_stats(
        self,
        client_id: str,
        user_id: str,
        user_role: UserRole
    ) -> Dict[str, Any]:
        """Get client statistics and metrics"""
        
        try:
            where_clause = {"id": client_id}
            
            # Add tenant filtering for non-admin users
            if user_role not in [UserRole.SUPER_ADMIN, UserRole.ADMIN]:
                where_clause["tenant_id"] = "default_tenant"
            
            # Get client with counts
            client = await self.prisma.client.find_unique(
                where=where_clause,
                include={
                    "_count": {
                        "select": {
                            "matters": True,
                            "contracts": True
                        }
                    }
                }
            )
            
            if not client:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Client not found"
                )
            
            # Get matter statistics
            matter_stats = await self.prisma.matter.group_by(
                by=["status"],
                where={"client_id": client_id},
                _count={"id": True}
            )
            
            # Get contract statistics
            contract_stats = await self.prisma.contract.group_by(
                by=["status"],
                where={"client_id": client_id},
                _count={"id": True}
            )
            
            return {
                "client_id": client_id,
                "client_name": client.name,
                "total_matters": client._count.matters,
                "total_contracts": client._count.contracts,
                "matter_breakdown": {stat.status: stat._count.id for stat in matter_stats},
                "contract_breakdown": {stat.status: stat._count.id for stat in contract_stats}
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Failed to get client stats",
                error=str(e),
                client_id=client_id,
                user_id=user_id
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve client statistics"
            )


# Dependency injection
async def get_client_service() -> ClientService:
    """Get client service instance"""
    prisma = await get_prisma()
    return ClientService(prisma)