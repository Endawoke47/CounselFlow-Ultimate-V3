"""
CounselFlow Ultimate V3 - Contract Service Layer
Comprehensive contract lifecycle management with AI integration
"""

import asyncio
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
import structlog
from prisma import Prisma

from app.schemas.contract import (
    ContractCreate, ContractUpdate, ContractResponse, ContractAnalysisRequest,
    ContractAnalysisResponse, ContractStatus, RiskLevel, ContractType,
    ContractSearchFilters, ContractMetrics, ContractBulkAction
)
from app.services.ai_orchestrator import ai_orchestrator
from app.core.config import Constants

logger = structlog.get_logger()


class ContractService:
    """Service layer for contract lifecycle management"""
    
    def __init__(self, prisma: Prisma):
        self.prisma = prisma
    
    async def create_contract(
        self, 
        contract_data: ContractCreate, 
        created_by: str
    ) -> ContractResponse:
        """Create a new contract"""
        try:
            # Generate contract number
            contract_number = await self._generate_contract_number(contract_data.type)
            
            # Create contract in database
            contract = await self.prisma.contract.create(
                data={
                    "contract_number": contract_number,
                    "title": contract_data.title,
                    "description": contract_data.description,
                    "type": contract_data.type,
                    "status": contract_data.status,
                    "priority": contract_data.priority,
                    "client_id": contract_data.client_id,
                    "counterparty_name": contract_data.counterparty_name,
                    "counterparty_contact": contract_data.counterparty_contact,
                    "contract_value": float(contract_data.contract_value) if contract_data.contract_value else None,
                    "currency": contract_data.currency,
                    "start_date": contract_data.start_date,
                    "end_date": contract_data.end_date,
                    "expiry_date": contract_data.expiry_date,
                    "renewal_date": contract_data.renewal_date,
                    "governing_law": contract_data.governing_law,
                    "jurisdiction": contract_data.jurisdiction,
                    "assigned_attorney_id": contract_data.assigned_attorney_id,
                    "responsible_team": contract_data.responsible_team,
                    "auto_renewal": contract_data.auto_renewal,
                    "renewal_notice_days": contract_data.renewal_notice_days,
                    "tags": contract_data.tags or [],
                    "metadata": contract_data.metadata or {},
                    "created_by": created_by
                },
                include={
                    "client": True,
                    "assigned_attorney": True,
                    "documents": True,
                    "tasks": True
                }
            )
            
            # Log contract creation
            logger.info(
                "Contract created",
                contract_id=contract.id,
                contract_number=contract.contract_number,
                type=contract.type,
                created_by=created_by
            )
            
            # Convert to response model
            return await self._to_contract_response(contract)
            
        except Exception as e:
            logger.error("Failed to create contract", error=str(e))
            raise
    
    async def get_contract(self, contract_id: str) -> Optional[ContractResponse]:
        """Get contract by ID"""
        try:
            contract = await self.prisma.contract.find_unique(
                where={"id": contract_id},
                include={
                    "client": True,
                    "assigned_attorney": True,
                    "documents": True,
                    "tasks": True
                }
            )
            
            if not contract:
                return None
            
            return await self._to_contract_response(contract)
            
        except Exception as e:
            logger.error("Failed to get contract", contract_id=contract_id, error=str(e))
            raise
    
    async def update_contract(
        self, 
        contract_id: str, 
        contract_data: ContractUpdate,
        updated_by: str
    ) -> Optional[ContractResponse]:
        """Update contract"""
        try:
            # Get existing contract
            existing_contract = await self.prisma.contract.find_unique(
                where={"id": contract_id}
            )
            
            if not existing_contract:
                return None
            
            # Prepare update data
            update_data = {}
            
            # Map fields from schema to database
            field_mapping = {
                "title": "title",
                "description": "description", 
                "type": "type",
                "status": "status",
                "priority": "priority",
                "counterparty_name": "counterparty_name",
                "counterparty_contact": "counterparty_contact",
                "contract_value": "contract_value",
                "currency": "currency",
                "start_date": "start_date",
                "end_date": "end_date",
                "expiry_date": "expiry_date",
                "renewal_date": "renewal_date",
                "governing_law": "governing_law",
                "jurisdiction": "jurisdiction",
                "assigned_attorney_id": "assigned_attorney_id",
                "responsible_team": "responsible_team",
                "auto_renewal": "auto_renewal",
                "renewal_notice_days": "renewal_notice_days",
                "tags": "tags",
                "metadata": "metadata"
            }
            
            for field, db_field in field_mapping.items():
                value = getattr(contract_data, field, None)
                if value is not None:
                    if field == "contract_value" and value is not None:
                        update_data[db_field] = float(value)
                    else:
                        update_data[db_field] = value
            
            if not update_data:
                return await self.get_contract(contract_id)
            
            # Update contract
            updated_contract = await self.prisma.contract.update(
                where={"id": contract_id},
                data=update_data,
                include={
                    "client": True,
                    "assigned_attorney": True,
                    "documents": True,
                    "tasks": True
                }
            )
            
            # Log contract update
            logger.info(
                "Contract updated",
                contract_id=contract_id,
                updated_fields=list(update_data.keys()),
                updated_by=updated_by
            )
            
            return await self._to_contract_response(updated_contract)
            
        except Exception as e:
            logger.error("Failed to update contract", contract_id=contract_id, error=str(e))
            raise
    
    async def search_contracts(
        self,
        filters: ContractSearchFilters,
        skip: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[ContractResponse], int]:
        """Search contracts with filters"""
        try:
            # Build where clause
            where_clause = {}
            
            # Status filter
            if filters.status:
                where_clause["status"] = {"in": [s.value for s in filters.status]}
            
            # Type filter
            if filters.type:
                where_clause["type"] = {"in": [t.value for t in filters.type]}
            
            # Priority filter
            if filters.priority:
                where_clause["priority"] = {"in": [p.value for p in filters.priority]}
            
            # Risk level filter
            if filters.risk_level:
                where_clause["risk_level"] = {"in": [r.value for r in filters.risk_level]}
            
            # Client filter
            if filters.client_id:
                where_clause["client_id"] = filters.client_id
            
            # Assigned attorney filter
            if filters.assigned_attorney_id:
                where_clause["assigned_attorney_id"] = filters.assigned_attorney_id
            
            # Contract value range
            if filters.contract_value_min is not None or filters.contract_value_max is not None:
                value_filter = {}
                if filters.contract_value_min is not None:
                    value_filter["gte"] = float(filters.contract_value_min)
                if filters.contract_value_max is not None:
                    value_filter["lte"] = float(filters.contract_value_max)
                where_clause["contract_value"] = value_filter
            
            # Date range filters
            if filters.start_date_from or filters.start_date_to:
                date_filter = {}
                if filters.start_date_from:
                    date_filter["gte"] = filters.start_date_from
                if filters.start_date_to:
                    date_filter["lte"] = filters.start_date_to
                where_clause["start_date"] = date_filter
            
            # Expiring soon filter
            if filters.expiring_within_days:
                expiry_date = date.today() + timedelta(days=filters.expiring_within_days)
                where_clause["expiry_date"] = {"lte": expiry_date}
            
            # Tags filter
            if filters.tags:
                where_clause["tags"] = {"hasSome": filters.tags}
            
            # AI risk score filter
            if filters.ai_risk_score_min is not None or filters.ai_risk_score_max is not None:
                risk_filter = {}
                if filters.ai_risk_score_min is not None:
                    risk_filter["gte"] = filters.ai_risk_score_min
                if filters.ai_risk_score_max is not None:
                    risk_filter["lte"] = filters.ai_risk_score_max
                where_clause["ai_risk_score"] = risk_filter
            
            # Text search
            if filters.search_text:
                where_clause["OR"] = [
                    {"title": {"contains": filters.search_text, "mode": "insensitive"}},
                    {"description": {"contains": filters.search_text, "mode": "insensitive"}},
                    {"counterparty_name": {"contains": filters.search_text, "mode": "insensitive"}},
                    {"contract_number": {"contains": filters.search_text, "mode": "insensitive"}}
                ]
            
            # Build order by clause
            order_by = {sort_by: sort_order}
            
            # Get total count
            total = await self.prisma.contract.count(where=where_clause)
            
            # Get contracts
            contracts = await self.prisma.contract.find_many(
                where=where_clause,
                skip=skip,
                take=limit,
                order_by=order_by,
                include={
                    "client": True,
                    "assigned_attorney": True,
                    "documents": True,
                    "tasks": True
                }
            )
            
            # Convert to response models
            contract_responses = []
            for contract in contracts:
                contract_responses.append(await self._to_contract_response(contract))
            
            return contract_responses, total
            
        except Exception as e:
            logger.error("Failed to search contracts", error=str(e))
            raise
    
    async def analyze_contract(
        self, 
        contract_id: str, 
        analysis_request: ContractAnalysisRequest
    ) -> ContractAnalysisResponse:
        """Analyze contract using AI"""
        try:
            # Get contract
            contract = await self.prisma.contract.find_unique(
                where={"id": contract_id},
                include={"documents": True}
            )
            
            if not contract:
                raise ValueError("Contract not found")
            
            # Get contract text from documents
            contract_text = await self._extract_contract_text(contract)
            
            if not contract_text:
                raise ValueError("No contract text found for analysis")
            
            # Perform AI analysis
            start_time = datetime.utcnow()
            
            analysis_result = await ai_orchestrator.analyze_contract(
                contract_text=contract_text,
                analysis_type=analysis_request.analysis_type
            )
            
            processing_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Extract analysis components
            risk_score = analysis_result.get("risk_score")
            risk_level = self._determine_risk_level(risk_score) if risk_score else None
            
            # Update contract with AI analysis results
            await self.prisma.contract.update(
                where={"id": contract_id},
                data={
                    "ai_risk_score": risk_score,
                    "risk_level": risk_level,
                    "ai_summary": analysis_result.get("executive_summary"),
                    "ai_key_terms": analysis_result.get("key_terms", {}),
                    "ai_recommendations": analysis_result.get("recommendations", []),
                    "last_analyzed_at": datetime.utcnow()
                }
            )
            
            # Create analysis response
            analysis_response = ContractAnalysisResponse(
                contract_id=contract_id,
                analysis_type=analysis_request.analysis_type,
                risk_score=risk_score,
                risk_level=risk_level,
                risk_factors=analysis_result.get("risk_areas", []),
                key_terms=analysis_result.get("key_terms"),
                critical_clauses=analysis_result.get("critical_clauses", []),
                missing_clauses=analysis_result.get("missing_provisions", []),
                recommendations=analysis_result.get("recommendations", []),
                action_items=analysis_result.get("action_items", []),
                compliance_issues=analysis_result.get("compliance_issues", []),
                regulatory_considerations=analysis_result.get("regulatory_considerations", []),
                executive_summary=analysis_result.get("executive_summary"),
                analyzed_at=datetime.utcnow(),
                analysis_model=analysis_result.get("_metadata", {}).get("model", "unknown"),
                processing_time=processing_time
            )
            
            logger.info(
                "Contract analyzed",
                contract_id=contract_id,
                analysis_type=analysis_request.analysis_type,
                risk_score=risk_score,
                processing_time=processing_time
            )
            
            return analysis_response
            
        except Exception as e:
            logger.error("Failed to analyze contract", contract_id=contract_id, error=str(e))
            raise
    
    async def get_contract_metrics(self, client_id: Optional[str] = None) -> ContractMetrics:
        """Get contract analytics and metrics"""
        try:
            where_clause = {}
            if client_id:
                where_clause["client_id"] = client_id
            
            # Get basic counts
            total_contracts = await self.prisma.contract.count(where=where_clause)
            
            # Get contracts by status
            contracts_by_status = {}
            for status in ContractStatus:
                count = await self.prisma.contract.count(
                    where={**where_clause, "status": status}
                )
                contracts_by_status[status.value] = count
            
            # Get contracts by type
            contracts_by_type = {}
            for contract_type in ContractType:
                count = await self.prisma.contract.count(
                    where={**where_clause, "type": contract_type}
                )
                contracts_by_type[contract_type.value] = count
            
            # Get financial metrics
            contracts_with_value = await self.prisma.contract.find_many(
                where={**where_clause, "contract_value": {"not": None}},
                select={"contract_value": True}
            )
            
            total_value = sum(c.contract_value for c in contracts_with_value if c.contract_value)
            avg_value = total_value / len(contracts_with_value) if contracts_with_value else 0
            
            # Get expiring soon count
            thirty_days_from_now = date.today() + timedelta(days=30)
            expiring_soon = await self.prisma.contract.count(
                where={
                    **where_clause,
                    "expiry_date": {"lte": thirty_days_from_now},
                    "status": {"in": ["ACTIVE", "EXECUTED"]}
                }
            )
            
            # Get expired count
            expired = await self.prisma.contract.count(
                where={**where_clause, "status": "EXPIRED"}
            )
            
            # Get high risk count
            high_risk = await self.prisma.contract.count(
                where={**where_clause, "risk_level": {"in": ["HIGH", "CRITICAL"]}}
            )
            
            # Get pending approval count
            pending_approval = await self.prisma.contract.count(
                where={**where_clause, "status": "PENDING_APPROVAL"}
            )
            
            # Get monthly metrics
            this_month_start = date.today().replace(day=1)
            created_this_month = await self.prisma.contract.count(
                where={
                    **where_clause,
                    "created_at": {"gte": this_month_start}
                }
            )
            
            executed_this_month = await self.prisma.contract.count(
                where={
                    **where_clause,
                    "status": "EXECUTED",
                    "updated_at": {"gte": this_month_start}
                }
            )
            
            # Get AI metrics
            ai_analyzed = await self.prisma.contract.count(
                where={**where_clause, "ai_risk_score": {"not": None}}
            )
            
            # Get average risk score
            risk_scores = await self.prisma.contract.find_many(
                where={**where_clause, "ai_risk_score": {"not": None}},
                select={"ai_risk_score": True}
            )
            
            avg_risk_score = None
            if risk_scores:
                avg_risk_score = sum(r.ai_risk_score for r in risk_scores) / len(risk_scores)
            
            return ContractMetrics(
                total_contracts=total_contracts,
                contracts_by_status=contracts_by_status,
                contracts_by_type=contracts_by_type,
                total_contract_value=Decimal(str(total_value)),
                average_contract_value=Decimal(str(avg_value)),
                expiring_soon_count=expiring_soon,
                expired_count=expired,
                high_risk_count=high_risk,
                pending_approval_count=pending_approval,
                contracts_created_this_month=created_this_month,
                contracts_executed_this_month=executed_this_month,
                ai_analyzed_count=ai_analyzed,
                average_risk_score=avg_risk_score
            )
            
        except Exception as e:
            logger.error("Failed to get contract metrics", error=str(e))
            raise
    
    async def bulk_update_contracts(
        self, 
        bulk_action: ContractBulkAction, 
        updated_by: str
    ) -> Dict[str, Any]:
        """Perform bulk action on contracts"""
        try:
            results = {"success": [], "failed": []}
            
            for contract_id in bulk_action.contract_ids:
                try:
                    if bulk_action.action == "assign":
                        attorney_id = bulk_action.parameters.get("attorney_id")
                        if attorney_id:
                            await self.prisma.contract.update(
                                where={"id": contract_id},
                                data={"assigned_attorney_id": attorney_id}
                            )
                            results["success"].append(contract_id)
                    
                    elif bulk_action.action == "update_status":
                        status = bulk_action.parameters.get("status")
                        if status:
                            await self.prisma.contract.update(
                                where={"id": contract_id},
                                data={"status": status}
                            )
                            results["success"].append(contract_id)
                    
                    elif bulk_action.action == "add_tags":
                        tags = bulk_action.parameters.get("tags", [])
                        if tags:
                            contract = await self.prisma.contract.find_unique(
                                where={"id": contract_id},
                                select={"tags": True}
                            )
                            if contract:
                                new_tags = list(set(contract.tags + tags))
                                await self.prisma.contract.update(
                                    where={"id": contract_id},
                                    data={"tags": new_tags}
                                )
                                results["success"].append(contract_id)
                    
                except Exception as e:
                    logger.warning(f"Failed to update contract {contract_id}", error=str(e))
                    results["failed"].append({"contract_id": contract_id, "error": str(e)})
            
            logger.info(
                "Bulk contract update completed",
                action=bulk_action.action,
                success_count=len(results["success"]),
                failed_count=len(results["failed"]),
                updated_by=updated_by
            )
            
            return results
            
        except Exception as e:
            logger.error("Failed to perform bulk contract update", error=str(e))
            raise
    
    async def _generate_contract_number(self, contract_type: ContractType) -> str:
        """Generate unique contract number"""
        try:
            # Get contract type prefix
            type_prefixes = {
                ContractType.NDA: "NDA",
                ContractType.SERVICE_AGREEMENT: "SA",
                ContractType.EMPLOYMENT: "EMP",
                ContractType.VENDOR: "VEN",
                ContractType.PARTNERSHIP: "PAR",
                ContractType.LICENSING: "LIC",
                ContractType.LEASE: "LEA",
                ContractType.PURCHASE: "PUR",
                ContractType.CONSULTING: "CON",
                ContractType.SOFTWARE_LICENSE: "SWL",
                ContractType.OTHER: "OTH"
            }
            
            prefix = type_prefixes.get(contract_type, "CON")
            year = datetime.now().year
            
            # Get next sequential number for this type and year
            pattern = f"{prefix}-{year}-%"
            existing_contracts = await self.prisma.contract.find_many(
                where={"contract_number": {"startswith": f"{prefix}-{year}-"}},
                select={"contract_number": True}
            )
            
            next_number = len(existing_contracts) + 1
            return f"{prefix}-{year}-{next_number:04d}"
            
        except Exception as e:
            logger.error("Failed to generate contract number", error=str(e))
            # Fallback to timestamp-based number
            timestamp = int(datetime.now().timestamp())
            return f"CON-{timestamp}"
    
    async def _to_contract_response(self, contract) -> ContractResponse:
        """Convert database contract to response model"""
        try:
            # Calculate derived fields
            days_until_expiry = None
            is_expired = False
            is_expiring_soon = False
            
            if contract.expiry_date:
                today = date.today()
                days_until_expiry = (contract.expiry_date - today).days
                is_expired = days_until_expiry < 0
                is_expiring_soon = 0 <= days_until_expiry <= Constants.CONTRACT_EXPIRY_WARNING_DAYS
            
            # Get related data counts
            document_count = len(contract.documents) if hasattr(contract, 'documents') else 0
            task_count = len(contract.tasks) if hasattr(contract, 'tasks') else 0
            
            # Get related names
            client_name = contract.client.name if hasattr(contract, 'client') and contract.client else None
            attorney_name = None
            if hasattr(contract, 'assigned_attorney') and contract.assigned_attorney:
                attorney_name = f"{contract.assigned_attorney.first_name} {contract.assigned_attorney.last_name}"
            
            return ContractResponse(
                id=contract.id,
                contract_number=contract.contract_number,
                title=contract.title,
                description=contract.description,
                type=contract.type,
                status=contract.status,
                priority=contract.priority,
                client_id=contract.client_id,
                counterparty_name=contract.counterparty_name,
                counterparty_contact=contract.counterparty_contact,
                contract_value=Decimal(str(contract.contract_value)) if contract.contract_value else None,
                currency=contract.currency,
                start_date=contract.start_date,
                end_date=contract.end_date,
                expiry_date=contract.expiry_date,
                renewal_date=contract.renewal_date,
                governing_law=contract.governing_law,
                jurisdiction=contract.jurisdiction,
                assigned_attorney_id=contract.assigned_attorney_id,
                responsible_team=contract.responsible_team,
                auto_renewal=contract.auto_renewal,
                renewal_notice_days=contract.renewal_notice_days,
                tags=contract.tags or [],
                metadata=contract.metadata or {},
                ai_risk_score=contract.ai_risk_score,
                risk_level=contract.risk_level,
                ai_summary=contract.ai_summary,
                ai_key_terms=contract.ai_key_terms or {},
                ai_recommendations=contract.ai_recommendations or [],
                approval_workflow_id=contract.approval_workflow_id,
                current_approver_id=contract.current_approver_id,
                created_at=contract.created_at,
                updated_at=contract.updated_at,
                last_reviewed_at=contract.last_reviewed_at,
                days_until_expiry=days_until_expiry,
                is_expired=is_expired,
                is_expiring_soon=is_expiring_soon,
                client_name=client_name,
                assigned_attorney_name=attorney_name,
                document_count=document_count,
                task_count=task_count
            )
            
        except Exception as e:
            logger.error("Failed to convert contract to response", error=str(e))
            raise
    
    async def _extract_contract_text(self, contract) -> str:
        """Extract text content from contract documents"""
        try:
            # This is a placeholder - in a real implementation, you would:
            # 1. Get the contract documents
            # 2. Extract text from PDFs, DOCs, etc.
            # 3. Combine into a single text for analysis
            
            # For now, return a combination of contract fields
            text_parts = [
                f"Contract Title: {contract.title}",
                f"Type: {contract.type}",
                f"Counterparty: {contract.counterparty_name}"
            ]
            
            if contract.description:
                text_parts.append(f"Description: {contract.description}")
            
            if contract.governing_law:
                text_parts.append(f"Governing Law: {contract.governing_law}")
            
            return "\n\n".join(text_parts)
            
        except Exception as e:
            logger.error("Failed to extract contract text", error=str(e))
            return ""
    
    def _determine_risk_level(self, risk_score: float) -> RiskLevel:
        """Determine risk level from numeric score"""
        if risk_score >= Constants.RISK_SCORE_THRESHOLDS["critical"]:
            return RiskLevel.CRITICAL
        elif risk_score >= Constants.RISK_SCORE_THRESHOLDS["high"]:
            return RiskLevel.HIGH
        elif risk_score >= Constants.RISK_SCORE_THRESHOLDS["medium"]:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW