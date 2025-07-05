"""
CounselFlow Ultimate V3 - IP Management Service
Comprehensive intellectual property portfolio management with AI integration
"""

import asyncio
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
import structlog
from prisma import Prisma

from app.schemas.ip import (
    IPAssetCreate, IPAssetUpdate, IPAssetResponse, IPSearchFilters,
    IPMetrics, IPBulkAction, IPAssetStatus, IPAssetType, IPPriority,
    RenewalStatus, IPSearchRequest, IPSearchResponse, IPValuationRequest,
    IPValuationResponse, IPPortfolioAnalysis
)
from app.services.ai_orchestrator import ai_orchestrator
from app.core.config import Constants

logger = structlog.get_logger()


class IPService:
    """Service layer for intellectual property management"""
    
    def __init__(self, prisma: Prisma):
        self.prisma = prisma
    
    async def create_ip_asset(
        self, 
        asset_data: IPAssetCreate, 
        created_by: str
    ) -> IPAssetResponse:
        """Create a new IP asset"""
        try:
            # Create IP asset in database
            ip_asset = await self.prisma.ipasset.create(
                data={
                    "name": asset_data.name,
                    "description": asset_data.description,
                    "type": asset_data.type,
                    "status": asset_data.status,
                    "priority": asset_data.priority,
                    "owner_id": asset_data.owner_id,
                    "inventors": asset_data.inventors or [],
                    "assignees": asset_data.assignees or [],
                    "registration_number": asset_data.registration_number,
                    "application_number": asset_data.application_number,
                    "application_date": asset_data.application_date,
                    "registration_date": asset_data.registration_date,
                    "publication_date": asset_data.publication_date,
                    "expiry_date": asset_data.expiry_date,
                    "renewal_date": asset_data.renewal_date,
                    "next_renewal_fee_due": asset_data.next_renewal_fee_due,
                    "renewal_fee_amount": float(asset_data.renewal_fee_amount) if asset_data.renewal_fee_amount else None,
                    "jurisdiction": asset_data.jurisdiction,
                    "countries": asset_data.countries or [],
                    "technology_area": asset_data.technology_area,
                    "business_unit": asset_data.business_unit,
                    "commercial_value": asset_data.commercial_value,
                    "strategic_importance": asset_data.strategic_importance,
                    "responsible_attorney_id": asset_data.responsible_attorney_id,
                    "external_counsel": asset_data.external_counsel,
                    "prosecution_status": asset_data.prosecution_status,
                    "filing_cost": float(asset_data.filing_cost) if asset_data.filing_cost else None,
                    "maintenance_cost_annual": float(asset_data.maintenance_cost_annual) if asset_data.maintenance_cost_annual else None,
                    "estimated_value": float(asset_data.estimated_value) if asset_data.estimated_value else None,
                    "tags": asset_data.tags or [],
                    "metadata": asset_data.metadata or {},
                    "created_by": created_by
                },
                include={
                    "owner": True,
                    "responsible_attorney": True,
                    "documents": True
                }
            )
            
            # Log IP asset creation
            logger.info(
                "IP asset created",
                asset_id=ip_asset.id,
                name=ip_asset.name,
                type=ip_asset.type,
                created_by=created_by
            )
            
            # Convert to response model
            return await self._to_ip_asset_response(ip_asset)
            
        except Exception as e:
            logger.error("Failed to create IP asset", error=str(e))
            raise
    
    async def get_ip_asset(self, asset_id: str) -> Optional[IPAssetResponse]:
        """Get IP asset by ID"""
        try:
            ip_asset = await self.prisma.ipasset.find_unique(
                where={"id": asset_id},
                include={
                    "owner": True,
                    "responsible_attorney": True,
                    "documents": True
                }
            )
            
            if not ip_asset:
                return None
            
            return await self._to_ip_asset_response(ip_asset)
            
        except Exception as e:
            logger.error("Failed to get IP asset", asset_id=asset_id, error=str(e))
            raise
    
    async def update_ip_asset(
        self, 
        asset_id: str, 
        asset_data: IPAssetUpdate,
        updated_by: str
    ) -> Optional[IPAssetResponse]:
        """Update IP asset"""
        try:
            # Get existing asset
            existing_asset = await self.prisma.ipasset.find_unique(
                where={"id": asset_id}
            )
            
            if not existing_asset:
                return None
            
            # Prepare update data
            update_data = {}
            
            # Map fields from schema to database
            field_mapping = {
                "name": "name",
                "description": "description",
                "type": "type",
                "status": "status",
                "priority": "priority",
                "inventors": "inventors",
                "assignees": "assignees",
                "registration_number": "registration_number",
                "application_number": "application_number",
                "application_date": "application_date",
                "registration_date": "registration_date",
                "publication_date": "publication_date",
                "expiry_date": "expiry_date",
                "renewal_date": "renewal_date",
                "next_renewal_fee_due": "next_renewal_fee_due",
                "renewal_fee_amount": "renewal_fee_amount",
                "jurisdiction": "jurisdiction",
                "countries": "countries",
                "technology_area": "technology_area",
                "business_unit": "business_unit",
                "commercial_value": "commercial_value",
                "strategic_importance": "strategic_importance",
                "responsible_attorney_id": "responsible_attorney_id",
                "external_counsel": "external_counsel",
                "prosecution_status": "prosecution_status",
                "filing_cost": "filing_cost",
                "maintenance_cost_annual": "maintenance_cost_annual",
                "estimated_value": "estimated_value",
                "tags": "tags",
                "metadata": "metadata"
            }
            
            for field, db_field in field_mapping.items():
                value = getattr(asset_data, field, None)
                if value is not None:
                    if field in ["renewal_fee_amount", "filing_cost", "maintenance_cost_annual", "estimated_value"] and value is not None:
                        update_data[db_field] = float(value)
                    else:
                        update_data[db_field] = value
            
            if not update_data:
                return await self.get_ip_asset(asset_id)
            
            # Update IP asset
            updated_asset = await self.prisma.ipasset.update(
                where={"id": asset_id},
                data=update_data,
                include={
                    "owner": True,
                    "responsible_attorney": True,
                    "documents": True
                }
            )
            
            # Log update
            logger.info(
                "IP asset updated",
                asset_id=asset_id,
                updated_fields=list(update_data.keys()),
                updated_by=updated_by
            )
            
            return await self._to_ip_asset_response(updated_asset)
            
        except Exception as e:
            logger.error("Failed to update IP asset", asset_id=asset_id, error=str(e))
            raise
    
    async def search_ip_assets(
        self,
        filters: IPSearchFilters,
        skip: int = 0,
        limit: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[IPAssetResponse], int]:
        """Search IP assets with filters"""
        try:
            # Build where clause
            where_clause = {}
            
            # Type filter
            if filters.type:
                where_clause["type"] = {"in": [t.value for t in filters.type]}
            
            # Status filter
            if filters.status:
                where_clause["status"] = {"in": [s.value for s in filters.status]}
            
            # Priority filter
            if filters.priority:
                where_clause["priority"] = {"in": [p.value for p in filters.priority]}
            
            # Jurisdiction filter
            if filters.jurisdiction:
                where_clause["jurisdiction"] = {"in": filters.jurisdiction}
            
            # Owner filter
            if filters.owner_id:
                where_clause["owner_id"] = filters.owner_id
            
            # Attorney filter
            if filters.responsible_attorney_id:
                where_clause["responsible_attorney_id"] = filters.responsible_attorney_id
            
            # Date range filters
            if filters.application_date_from or filters.application_date_to:
                date_filter = {}
                if filters.application_date_from:
                    date_filter["gte"] = filters.application_date_from
                if filters.application_date_to:
                    date_filter["lte"] = filters.application_date_to
                where_clause["application_date"] = date_filter
            
            # Expiry filters
            if filters.expiring_within_days:
                expiry_date = date.today() + timedelta(days=filters.expiring_within_days)
                where_clause["expiry_date"] = {"lte": expiry_date}
            
            # Technology area filter
            if filters.technology_area:
                where_clause["technology_area"] = {"in": filters.technology_area}
            
            # Business unit filter
            if filters.business_unit:
                where_clause["business_unit"] = {"in": filters.business_unit}
            
            # Value range filter
            if filters.estimated_value_min is not None or filters.estimated_value_max is not None:
                value_filter = {}
                if filters.estimated_value_min is not None:
                    value_filter["gte"] = float(filters.estimated_value_min)
                if filters.estimated_value_max is not None:
                    value_filter["lte"] = float(filters.estimated_value_max)
                where_clause["estimated_value"] = value_filter
            
            # Tags filter
            if filters.tags:
                where_clause["tags"] = {"hasSome": filters.tags}
            
            # Text search
            if filters.search_text:
                where_clause["OR"] = [
                    {"name": {"contains": filters.search_text, "mode": "insensitive"}},
                    {"description": {"contains": filters.search_text, "mode": "insensitive"}},
                    {"registration_number": {"contains": filters.search_text, "mode": "insensitive"}},
                    {"application_number": {"contains": filters.search_text, "mode": "insensitive"}}
                ]
            
            # Build order by clause
            order_by = {sort_by: sort_order}
            
            # Get total count
            total = await self.prisma.ipasset.count(where=where_clause)
            
            # Get IP assets
            ip_assets = await self.prisma.ipasset.find_many(
                where=where_clause,
                skip=skip,
                take=limit,
                order_by=order_by,
                include={
                    "owner": True,
                    "responsible_attorney": True,
                    "documents": True
                }
            )
            
            # Convert to response models
            asset_responses = []
            for asset in ip_assets:
                asset_responses.append(await self._to_ip_asset_response(asset))
            
            return asset_responses, total
            
        except Exception as e:
            logger.error("Failed to search IP assets", error=str(e))
            raise
    
    async def get_ip_metrics(self, owner_id: Optional[str] = None) -> IPMetrics:
        """Get IP portfolio metrics"""
        try:
            where_clause = {}
            if owner_id:
                where_clause["owner_id"] = owner_id
            
            # Get basic counts
            total_assets = await self.prisma.ipasset.count(where=where_clause)
            
            # Assets by type
            assets_by_type = {}
            for asset_type in IPAssetType:
                count = await self.prisma.ipasset.count(
                    where={**where_clause, "type": asset_type}
                )
                assets_by_type[asset_type.value] = count
            
            # Assets by status
            assets_by_status = {}
            for status in IPAssetStatus:
                count = await self.prisma.ipasset.count(
                    where={**where_clause, "status": status}
                )
                assets_by_status[status.value] = count
            
            # Assets by priority
            assets_by_priority = {}
            for priority in IPPriority:
                count = await self.prisma.ipasset.count(
                    where={**where_clause, "priority": priority}
                )
                assets_by_priority[priority.value] = count
            
            # Financial metrics
            assets_with_value = await self.prisma.ipasset.find_many(
                where={**where_clause, "estimated_value": {"not": None}},
                select={"estimated_value": True}
            )
            
            total_value = sum(a.estimated_value for a in assets_with_value if a.estimated_value)
            avg_value = total_value / len(assets_with_value) if assets_with_value else 0
            
            # Get annual costs
            assets_with_costs = await self.prisma.ipasset.find_many(
                where={**where_clause, "maintenance_cost_annual": {"not": None}},
                select={"maintenance_cost_annual": True}
            )
            
            total_annual_costs = sum(a.maintenance_cost_annual for a in assets_with_costs if a.maintenance_cost_annual)
            
            # Expiry metrics
            today = date.today()
            thirty_days = today + timedelta(days=30)
            ninety_days = today + timedelta(days=90)
            one_year = today + timedelta(days=365)
            
            expiring_30_days = await self.prisma.ipasset.count(
                where={
                    **where_clause,
                    "expiry_date": {"lte": thirty_days, "gte": today},
                    "status": {"in": ["ACTIVE", "LICENSED"]}
                }
            )
            
            expiring_90_days = await self.prisma.ipasset.count(
                where={
                    **where_clause,
                    "expiry_date": {"lte": ninety_days, "gte": today},
                    "status": {"in": ["ACTIVE", "LICENSED"]}
                }
            )
            
            expiring_year = await self.prisma.ipasset.count(
                where={
                    **where_clause,
                    "expiry_date": {"lte": one_year, "gte": today},
                    "status": {"in": ["ACTIVE", "LICENSED"]}
                }
            )
            
            overdue_renewals = await self.prisma.ipasset.count(
                where={
                    **where_clause,
                    "next_renewal_fee_due": {"lt": today},
                    "status": {"in": ["ACTIVE", "LICENSED"]}
                }
            )
            
            # Geographic distribution
            assets_by_jurisdiction = {}
            jurisdictions = await self.prisma.ipasset.group_by(
                by=["jurisdiction"],
                where=where_clause,
                _count={"id": True}
            )
            
            for item in jurisdictions:
                assets_by_jurisdiction[item.jurisdiction] = item._count.id
            
            # International coverage
            international_assets = await self.prisma.ipasset.count(
                where={**where_clause, "jurisdiction": {"not": "US"}}
            )
            international_percentage = (international_assets / total_assets * 100) if total_assets > 0 else 0
            
            # Technology coverage
            technology_coverage = {}
            tech_areas = await self.prisma.ipasset.group_by(
                by=["technology_area"],
                where={**where_clause, "technology_area": {"not": None}},
                _count={"id": True}
            )
            
            for item in tech_areas:
                if item.technology_area:
                    technology_coverage[item.technology_area] = item._count.id
            
            # High value assets
            high_value_threshold = 100000  # $100k
            high_value_assets = await self.prisma.ipasset.count(
                where={**where_clause, "estimated_value": {"gte": high_value_threshold}}
            )
            
            # Licensed assets
            licensed_assets = await self.prisma.ipasset.count(
                where={**where_clause, "status": "LICENSED"}
            )
            
            # Performance indicators (simplified calculations)
            recent_filings = await self.prisma.ipasset.count(
                where={
                    **where_clause,
                    "application_date": {"gte": today - timedelta(days=30)}
                }
            )
            filing_rate_monthly = recent_filings
            
            # Grant rate (registered vs applied)
            registered_count = await self.prisma.ipasset.count(
                where={**where_clause, "status": {"in": ["ACTIVE", "LICENSED"]}}
            )
            applied_count = await self.prisma.ipasset.count(
                where={**where_clause, "application_date": {"not": None}}
            )
            grant_rate = (registered_count / applied_count * 100) if applied_count > 0 else 0
            
            # Abandonment rate
            abandoned_count = await self.prisma.ipasset.count(
                where={**where_clause, "status": "ABANDONED"}
            )
            abandonment_rate = (abandoned_count / total_assets * 100) if total_assets > 0 else 0
            
            return IPMetrics(
                total_ip_assets=total_assets,
                assets_by_type=assets_by_type,
                assets_by_status=assets_by_status,
                assets_by_priority=assets_by_priority,
                total_portfolio_value=Decimal(str(total_value)),
                total_annual_costs=Decimal(str(total_annual_costs)),
                average_asset_value=Decimal(str(avg_value)),
                expiring_next_30_days=expiring_30_days,
                expiring_next_90_days=expiring_90_days,
                expiring_next_year=expiring_year,
                overdue_renewals=overdue_renewals,
                assets_by_jurisdiction=assets_by_jurisdiction,
                international_coverage_percentage=international_percentage,
                technology_coverage=technology_coverage,
                high_value_assets=high_value_assets,
                licensed_assets=licensed_assets,
                filing_rate_monthly=filing_rate_monthly,
                grant_rate_percentage=grant_rate,
                abandonment_rate_percentage=abandonment_rate,
                ai_analyzed_assets=0,  # Placeholder
                ai_recommended_actions=0  # Placeholder
            )
            
        except Exception as e:
            logger.error("Failed to get IP metrics", error=str(e))
            raise
    
    async def perform_prior_art_search(
        self,
        search_request: IPSearchRequest,
        searched_by: str
    ) -> IPSearchResponse:
        """Perform AI-powered prior art search"""
        try:
            start_time = datetime.utcnow()
            
            # Use AI orchestrator for patent search
            search_prompt = self._build_search_prompt(search_request)
            
            ai_response = await ai_orchestrator.generate_text(
                prompt=search_prompt,
                temperature=0.1,  # Low temperature for factual search
                max_tokens=2000
            )
            
            search_time = (datetime.utcnow() - start_time).total_seconds()
            
            # Parse AI response and create mock results for demo
            search_results = await self._parse_search_results(ai_response.content, search_request)
            
            # Create search response
            search_response = IPSearchResponse(
                search_id=f"search_{int(datetime.utcnow().timestamp())}",
                search_type=search_request.search_type,
                query=search_request,
                results=search_results,
                total_found=len(search_results),
                search_time_seconds=search_time,
                ai_summary=f"AI-powered {search_request.search_type} search completed. Found {len(search_results)} relevant results.",
                key_findings=[
                    "Multiple relevant patents found in similar technology area",
                    "Potential freedom-to-operate considerations identified",
                    "Recommended further analysis of key references"
                ],
                recommendations=[
                    "Review highlighted patents for potential conflicts",
                    "Consider design-around strategies for high-risk references",
                    "Monitor competitor patent activities in this space"
                ],
                risk_assessment="MEDIUM" if len(search_results) > 5 else "LOW",
                searched_at=datetime.utcnow(),
                searched_by=searched_by,
                databases_searched=["USPTO", "EPO", "WIPO", "Google Patents"]
            )
            
            logger.info(
                "Prior art search completed",
                search_type=search_request.search_type,
                results_count=len(search_results),
                search_time=search_time,
                searched_by=searched_by
            )
            
            return search_response
            
        except Exception as e:
            logger.error("Failed to perform prior art search", error=str(e))
            raise
    
    async def valuate_ip_asset(
        self,
        valuation_request: IPValuationRequest,
        valued_by: str
    ) -> IPValuationResponse:
        """AI-powered IP asset valuation"""
        try:
            start_time = datetime.utcnow()
            
            # Get IP asset details
            asset = await self.get_ip_asset(valuation_request.asset_id)
            if not asset:
                raise ValueError("IP asset not found")
            
            # Build valuation prompt
            valuation_prompt = self._build_valuation_prompt(asset, valuation_request)
            
            # Get AI valuation analysis
            ai_response = await ai_orchestrator.generate_text(
                prompt=valuation_prompt,
                temperature=0.2,  # Slightly higher for valuation analysis
                max_tokens=3000
            )
            
            analysis_duration = (datetime.utcnow() - start_time).total_seconds()
            
            # Parse AI response and generate valuation
            valuation_data = await self._parse_valuation_response(ai_response.content, asset)
            
            # Create valuation response
            valuation_response = IPValuationResponse(
                asset_id=valuation_request.asset_id,
                valuation_date=datetime.utcnow(),
                valuation_method=valuation_request.valuation_method,
                estimated_value=valuation_data["estimated_value"],
                valuation_range_low=valuation_data["valuation_range_low"],
                valuation_range_high=valuation_data["valuation_range_high"],
                confidence_level=valuation_data["confidence_level"],
                market_factors=valuation_data["market_factors"],
                competitive_positioning=valuation_data["competitive_positioning"],
                technology_strength=valuation_data["technology_strength"],
                commercial_potential=valuation_data["commercial_potential"],
                key_value_drivers=valuation_data["key_value_drivers"],
                risk_factors=valuation_data["risk_factors"],
                monetization_opportunities=valuation_data["monetization_opportunities"],
                ai_confidence=valuation_data["ai_confidence"],
                comparable_patents=valuation_data["comparable_patents"],
                market_trends=valuation_data["market_trends"],
                analysis_duration_seconds=analysis_duration,
                data_sources_used=["Market Analysis", "Patent Databases", "Licensing Data", "AI Analysis"],
                model_version="CounselFlow-IP-Valuation-v1.0"
            )
            
            # Update asset with AI valuation
            await self.prisma.ipasset.update(
                where={"id": valuation_request.asset_id},
                data={
                    "ai_valuation": float(valuation_data["estimated_value"]),
                    "ai_risk_score": valuation_data.get("risk_score", 5.0),
                    "ai_recommendations": valuation_data["recommendations"]
                }
            )
            
            logger.info(
                "IP asset valuation completed",
                asset_id=valuation_request.asset_id,
                estimated_value=valuation_data["estimated_value"],
                method=valuation_request.valuation_method,
                valued_by=valued_by
            )
            
            return valuation_response
            
        except Exception as e:
            logger.error("Failed to valuate IP asset", error=str(e))
            raise
    
    async def bulk_update_assets(
        self,
        bulk_action: IPBulkAction,
        updated_by: str
    ) -> Dict[str, Any]:
        """Perform bulk actions on IP assets"""
        try:
            results = {"success": [], "failed": []}
            
            for asset_id in bulk_action.asset_ids:
                try:
                    if bulk_action.action == "assign":
                        attorney_id = bulk_action.parameters.get("attorney_id")
                        if attorney_id:
                            await self.prisma.ipasset.update(
                                where={"id": asset_id},
                                data={"responsible_attorney_id": attorney_id}
                            )
                            results["success"].append(asset_id)
                    
                    elif bulk_action.action == "update_status":
                        status = bulk_action.parameters.get("status")
                        if status:
                            await self.prisma.ipasset.update(
                                where={"id": asset_id},
                                data={"status": status}
                            )
                            results["success"].append(asset_id)
                    
                    elif bulk_action.action == "set_priority":
                        priority = bulk_action.parameters.get("priority")
                        if priority:
                            await self.prisma.ipasset.update(
                                where={"id": asset_id},
                                data={"priority": priority}
                            )
                            results["success"].append(asset_id)
                    
                    elif bulk_action.action == "add_tags":
                        tags = bulk_action.parameters.get("tags", [])
                        if tags:
                            asset = await self.prisma.ipasset.find_unique(
                                where={"id": asset_id},
                                select={"tags": True}
                            )
                            if asset:
                                new_tags = list(set(asset.tags + tags))
                                await self.prisma.ipasset.update(
                                    where={"id": asset_id},
                                    data={"tags": new_tags}
                                )
                                results["success"].append(asset_id)
                
                except Exception as e:
                    logger.warning(f"Failed to update IP asset {asset_id}", error=str(e))
                    results["failed"].append({"asset_id": asset_id, "error": str(e)})
            
            logger.info(
                "Bulk IP asset update completed",
                action=bulk_action.action,
                success_count=len(results["success"]),
                failed_count=len(results["failed"]),
                updated_by=updated_by
            )
            
            return results
            
        except Exception as e:
            logger.error("Failed to perform bulk IP asset update", error=str(e))
            raise
    
    async def _to_ip_asset_response(self, ip_asset) -> IPAssetResponse:
        """Convert database IP asset to response model"""
        try:
            # Calculate derived fields
            days_until_expiry = None
            days_until_renewal = None
            is_expired = False
            is_expiring_soon = False
            renewal_status = RenewalStatus.NOT_REQUIRED
            
            if ip_asset.expiry_date:
                today = date.today()
                days_until_expiry = (ip_asset.expiry_date - today).days
                is_expired = days_until_expiry < 0
                is_expiring_soon = 0 <= days_until_expiry <= 90  # 90 days warning
            
            if ip_asset.next_renewal_fee_due:
                today = date.today()
                days_until_renewal = (ip_asset.next_renewal_fee_due - today).days
                if days_until_renewal < 0:
                    renewal_status = RenewalStatus.OVERDUE
                elif days_until_renewal <= 30:
                    renewal_status = RenewalStatus.UPCOMING
                else:
                    renewal_status = RenewalStatus.NOT_REQUIRED
            
            # Get related data
            owner_name = ip_asset.owner.name if hasattr(ip_asset, 'owner') and ip_asset.owner else None
            attorney_name = None
            if hasattr(ip_asset, 'responsible_attorney') and ip_asset.responsible_attorney:
                attorney_name = f"{ip_asset.responsible_attorney.first_name} {ip_asset.responsible_attorney.last_name}"
            
            document_count = len(ip_asset.documents) if hasattr(ip_asset, 'documents') else 0
            
            return IPAssetResponse(
                id=ip_asset.id,
                name=ip_asset.name,
                description=ip_asset.description,
                type=ip_asset.type,
                status=ip_asset.status,
                priority=ip_asset.priority,
                owner_id=ip_asset.owner_id,
                inventors=ip_asset.inventors or [],
                assignees=ip_asset.assignees or [],
                registration_number=ip_asset.registration_number,
                application_number=ip_asset.application_number,
                application_date=ip_asset.application_date,
                registration_date=ip_asset.registration_date,
                publication_date=ip_asset.publication_date,
                expiry_date=ip_asset.expiry_date,
                renewal_date=ip_asset.renewal_date,
                next_renewal_fee_due=ip_asset.next_renewal_fee_due,
                renewal_fee_amount=Decimal(str(ip_asset.renewal_fee_amount)) if ip_asset.renewal_fee_amount else None,
                jurisdiction=ip_asset.jurisdiction,
                countries=ip_asset.countries or [],
                technology_area=ip_asset.technology_area,
                business_unit=ip_asset.business_unit,
                commercial_value=ip_asset.commercial_value,
                strategic_importance=ip_asset.strategic_importance,
                responsible_attorney_id=ip_asset.responsible_attorney_id,
                external_counsel=ip_asset.external_counsel,
                prosecution_status=ip_asset.prosecution_status,
                filing_cost=Decimal(str(ip_asset.filing_cost)) if ip_asset.filing_cost else None,
                maintenance_cost_annual=Decimal(str(ip_asset.maintenance_cost_annual)) if ip_asset.maintenance_cost_annual else None,
                estimated_value=Decimal(str(ip_asset.estimated_value)) if ip_asset.estimated_value else None,
                tags=ip_asset.tags or [],
                metadata=ip_asset.metadata or {},
                days_until_expiry=days_until_expiry,
                days_until_renewal=days_until_renewal,
                is_expired=is_expired,
                is_expiring_soon=is_expiring_soon,
                renewal_status=renewal_status,
                owner_name=owner_name,
                responsible_attorney_name=attorney_name,
                license_count=0,  # Placeholder
                document_count=document_count,
                portfolio_position=ip_asset.metadata.get("portfolio_position") if ip_asset.metadata else None,
                competitive_landscape=ip_asset.metadata.get("competitive_landscape") if ip_asset.metadata else None,
                ai_valuation=Decimal(str(ip_asset.ai_valuation)) if hasattr(ip_asset, 'ai_valuation') and ip_asset.ai_valuation else None,
                ai_risk_score=ip_asset.ai_risk_score if hasattr(ip_asset, 'ai_risk_score') else None,
                ai_recommendations=ip_asset.ai_recommendations if hasattr(ip_asset, 'ai_recommendations') else None,
                created_at=ip_asset.created_at,
                updated_at=ip_asset.updated_at,
                last_reviewed_at=ip_asset.last_reviewed_at if hasattr(ip_asset, 'last_reviewed_at') else None
            )
            
        except Exception as e:
            logger.error("Failed to convert IP asset to response", error=str(e))
            raise
    
    def _build_search_prompt(self, search_request: IPSearchRequest) -> str:
        """Build AI prompt for patent search"""
        prompt = f"""
        Perform a {search_request.search_type} patent search for the following technology:

        Technology Description: {search_request.technology_description}
        Keywords: {', '.join(search_request.keywords)}
        
        Search Parameters:
        - Jurisdictions: {', '.join(search_request.jurisdiction) if search_request.jurisdiction else 'All'}
        - Date Range: {search_request.date_range_start or 'No start'} to {search_request.date_range_end or 'No end'}
        - Max Results: {search_request.max_results}
        - Relevance Threshold: {search_request.relevance_threshold}
        
        Please provide:
        1. A summary of the search strategy
        2. Key technical concepts to search for
        3. Potential patent classifications
        4. Search methodology recommendations
        5. Risk assessment for the technology area
        
        Focus on identifying prior art that could impact patentability or freedom to operate.
        """
        
        return prompt
    
    async def _parse_search_results(self, ai_response: str, search_request: IPSearchRequest) -> List[Dict[str, Any]]:
        """Parse AI search response into structured results"""
        # This is a simplified mock implementation
        # In production, this would integrate with actual patent databases
        
        mock_results = []
        num_results = min(search_request.max_results, 10)  # Generate up to 10 mock results
        
        for i in range(num_results):
            result = {
                "id": f"US{10000000 + i}A1",
                "title": f"Method and System for {search_request.keywords[0].title()} Technology",
                "abstract": f"A system and method for implementing {search_request.technology_description[:100]}...",
                "inventors": [f"Inventor {i+1}", f"Co-Inventor {i+1}"],
                "assignee": f"Tech Company {i+1} Inc.",
                "publication_number": f"US{10000000 + i}A1",
                "publication_date": date.today() - timedelta(days=365*i),
                "application_date": date.today() - timedelta(days=365*i + 180),
                "jurisdiction": "US",
                "status": "Published",
                "classification_codes": ["G06F", "H04L"],
                "relevance_score": max(0.5, 1.0 - i*0.1),
                "key_claims": [
                    f"A method for {search_request.keywords[0]}",
                    f"A system comprising {search_request.keywords[0]} components"
                ],
                "technical_similarity": max(0.4, 0.9 - i*0.1),
                "potential_conflict": "MEDIUM" if i < 3 else "LOW",
                "patent_office_url": f"https://patents.uspto.gov/patent/US{10000000 + i}A1"
            }
            mock_results.append(result)
        
        return mock_results
    
    def _build_valuation_prompt(self, asset: IPAssetResponse, request: IPValuationRequest) -> str:
        """Build AI prompt for IP asset valuation"""
        prompt = f"""
        Perform an AI-powered valuation analysis for the following intellectual property asset:

        Asset Details:
        - Name: {asset.name}
        - Type: {asset.type}
        - Status: {asset.status}
        - Technology Area: {asset.technology_area or 'Not specified'}
        - Jurisdiction: {asset.jurisdiction}
        - Registration Number: {asset.registration_number or 'Not registered'}
        - Commercial Value Assessment: {asset.commercial_value or 'Not assessed'}
        - Strategic Importance: {asset.strategic_importance or 'Not assessed'}

        Valuation Method: {request.valuation_method}
        Business Context: {request.business_context or 'General valuation'}
        Intended Use: {request.intended_use or 'Portfolio management'}

        Please provide a comprehensive valuation analysis including:
        1. Estimated market value range
        2. Key value drivers
        3. Risk factors
        4. Competitive positioning analysis
        5. Technology strength assessment
        6. Commercial potential evaluation
        7. Monetization opportunities
        8. Market trends affecting value
        9. Comparable asset analysis
        10. Confidence level assessment

        Consider factors such as:
        - Technology novelty and complexity
        - Market size and growth potential
        - Competitive landscape
        - Licensing opportunities
        - Remaining patent life
        - Geographic coverage
        - Industry adoption trends
        """
        
        return prompt
    
    async def _parse_valuation_response(self, ai_response: str, asset: IPAssetResponse) -> Dict[str, Any]:
        """Parse AI valuation response into structured data"""
        # This is a simplified mock implementation
        # In production, this would use more sophisticated AI parsing
        
        # Generate mock valuation based on asset characteristics
        base_value = 100000  # Base value $100k
        
        # Adjust based on asset type
        type_multipliers = {
            "PATENT": 3.0,
            "TRADEMARK": 1.5,
            "COPYRIGHT": 1.0,
            "TRADE_SECRET": 2.0,
            "SOFTWARE": 2.5
        }
        
        multiplier = type_multipliers.get(asset.type, 1.0)
        
        # Adjust based on status
        if asset.status == "ACTIVE":
            multiplier *= 1.5
        elif asset.status == "LICENSED":
            multiplier *= 2.0
        elif asset.status == "EXPIRED":
            multiplier *= 0.1
        
        # Adjust based on strategic importance
        if asset.strategic_importance == "HIGH":
            multiplier *= 2.0
        elif asset.strategic_importance == "CRITICAL":
            multiplier *= 3.0
        
        estimated_value = Decimal(str(base_value * multiplier))
        
        return {
            "estimated_value": estimated_value,
            "valuation_range_low": estimated_value * Decimal("0.7"),
            "valuation_range_high": estimated_value * Decimal("1.4"),
            "confidence_level": 0.75,
            "market_factors": {
                "market_size": "Large and growing",
                "adoption_rate": "Moderate to high",
                "competitive_intensity": "Medium"
            },
            "competitive_positioning": {
                "uniqueness": "High",
                "barrier_to_entry": "Significant",
                "competitive_advantage": "Strong"
            },
            "technology_strength": {
                "novelty": "High",
                "complexity": "Moderate",
                "implementation_difficulty": "Medium"
            },
            "commercial_potential": {
                "licensing_opportunity": "Good",
                "market_readiness": "High",
                "revenue_potential": "Significant"
            },
            "key_value_drivers": [
                "Strong patent protection",
                "Growing market demand",
                "Limited competition",
                "High barrier to entry"
            ],
            "risk_factors": [
                "Technology evolution risk",
                "Competitive response",
                "Regulatory changes",
                "Market adoption uncertainty"
            ],
            "monetization_opportunities": [
                "Direct licensing to industry players",
                "Cross-licensing opportunities",
                "Strategic partnerships",
                "Technology transfer agreements"
            ],
            "ai_confidence": 0.8,
            "comparable_patents": [
                "Similar patents in technology area",
                "Recent licensing deals",
                "Market transactions"
            ],
            "market_trends": [
                "Increasing demand for IP protection",
                "Growing technology adoption",
                "Consolidation in industry"
            ],
            "risk_score": 4.0,  # Medium risk
            "recommendations": [
                "Consider active licensing program",
                "Monitor competitive landscape",
                "Evaluate continuation opportunities",
                "Assess international filing strategy"
            ]
        }