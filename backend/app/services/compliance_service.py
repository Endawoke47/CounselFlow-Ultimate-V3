"""
CounselFlow Ultimate V3 - Risk & Compliance Service
Comprehensive enterprise risk management and regulatory compliance
"""

import asyncio
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
import structlog
from prisma import Prisma

from app.schemas.compliance import (
    RiskAssessmentCreate, RiskAssessmentUpdate, RiskAssessmentResponse,
    ComplianceRequirement, ControlAssessment, ComplianceIncident,
    RiskRegister, ComplianceMetrics, ComplianceDashboard,
    ComplianceSearchFilters, ComplianceBulkAction, ComplianceReportRequest,
    RiskCategory, RiskLevel, ComplianceStatus, ControlStatus, IncidentSeverity,
    IncidentStatus, ComplianceFramework
)
from app.services.ai_orchestrator import ai_orchestrator
from app.core.config import Constants

logger = structlog.get_logger()


class ComplianceService:
    """Service layer for risk management and regulatory compliance"""
    
    def __init__(self, prisma: Prisma):
        self.prisma = prisma
    
    # Risk Assessment Methods
    
    async def create_risk_assessment(
        self, 
        assessment_data: RiskAssessmentCreate, 
        created_by: str
    ) -> RiskAssessmentResponse:
        """Create a new risk assessment"""
        try:
            # Calculate risk score
            risk_score = assessment_data.likelihood * assessment_data.impact
            
            # Create risk assessment in database
            assessment = await self.prisma.riskassessment.create(
                data={
                    "title": assessment_data.title,
                    "description": assessment_data.description,
                    "category": assessment_data.category,
                    "subcategory": assessment_data.subcategory,
                    "risk_level": assessment_data.risk_level,
                    "likelihood": assessment_data.likelihood,
                    "impact": assessment_data.impact,
                    "risk_score": risk_score,
                    "business_unit": assessment_data.business_unit,
                    "process_area": assessment_data.process_area,
                    "regulatory_requirements": assessment_data.regulatory_requirements or [],
                    "risk_drivers": assessment_data.risk_drivers or [],
                    "potential_impacts": assessment_data.potential_impacts or [],
                    "existing_controls": assessment_data.existing_controls or [],
                    "risk_owner_id": assessment_data.risk_owner_id,
                    "responsible_manager_id": assessment_data.responsible_manager_id,
                    "assessment_date": assessment_data.assessment_date,
                    "next_review_date": assessment_data.next_review_date,
                    "estimated_financial_impact": float(assessment_data.estimated_financial_impact) if assessment_data.estimated_financial_impact else None,
                    "currency": assessment_data.currency,
                    "tags": assessment_data.tags or [],
                    "metadata": assessment_data.metadata or {},
                    "created_by": created_by
                },
                include={
                    "risk_owner": True,
                    "responsible_manager": True
                }
            )
            
            # Log risk assessment creation
            logger.info(
                "Risk assessment created",
                assessment_id=assessment.id,
                title=assessment.title,
                category=assessment.category,
                risk_level=assessment.risk_level,
                risk_score=risk_score,
                created_by=created_by
            )
            
            # Convert to response model
            return await self._to_risk_assessment_response(assessment)
            
        except Exception as e:
            logger.error("Failed to create risk assessment", error=str(e))
            raise
    
    async def get_risk_assessment(self, assessment_id: str) -> Optional[RiskAssessmentResponse]:
        """Get risk assessment by ID"""
        try:
            assessment = await self.prisma.riskassessment.find_unique(
                where={"id": assessment_id},
                include={
                    "risk_owner": True,
                    "responsible_manager": True,
                    "mitigations": True,
                    "incidents": True
                }
            )
            
            if not assessment:
                return None
            
            return await self._to_risk_assessment_response(assessment)
            
        except Exception as e:
            logger.error("Failed to get risk assessment", error=str(e), assessment_id=assessment_id)
            raise
    
    async def update_risk_assessment(
        self,
        assessment_id: str,
        assessment_data: RiskAssessmentUpdate,
        updated_by: str
    ) -> Optional[RiskAssessmentResponse]:
        """Update risk assessment"""
        try:
            # Prepare update data
            update_data = {}
            for field, value in assessment_data.dict(exclude_unset=True).items():
                if field == "estimated_financial_impact" and value is not None:
                    update_data[field] = float(value)
                else:
                    update_data[field] = value
            
            # Recalculate risk score if likelihood or impact changed
            if "likelihood" in update_data or "impact" in update_data:
                current = await self.prisma.riskassessment.find_unique(where={"id": assessment_id})
                if current:
                    likelihood = update_data.get("likelihood", current.likelihood)
                    impact = update_data.get("impact", current.impact)
                    update_data["risk_score"] = likelihood * impact
            
            if update_data:
                update_data["updated_by"] = updated_by
                
                assessment = await self.prisma.riskassessment.update(
                    where={"id": assessment_id},
                    data=update_data,
                    include={
                        "risk_owner": True,
                        "responsible_manager": True
                    }
                )
                
                logger.info(
                    "Risk assessment updated",
                    assessment_id=assessment_id,
                    updated_fields=list(update_data.keys()),
                    updated_by=updated_by
                )
                
                return await self._to_risk_assessment_response(assessment)
            
            return await self.get_risk_assessment(assessment_id)
            
        except Exception as e:
            logger.error("Failed to update risk assessment", error=str(e), assessment_id=assessment_id)
            raise
    
    # Compliance Requirements Methods
    
    async def create_compliance_requirement(
        self, 
        requirement_data: ComplianceRequirement, 
        created_by: str
    ) -> ComplianceRequirement:
        """Create a new compliance requirement"""
        try:
            requirement = await self.prisma.compliancerequirement.create(
                data={
                    "framework": requirement_data.framework,
                    "requirement_id": requirement_data.requirement_id,
                    "title": requirement_data.title,
                    "description": requirement_data.description,
                    "category": requirement_data.category,
                    "subcategory": requirement_data.subcategory,
                    "criticality": requirement_data.criticality,
                    "status": requirement_data.status,
                    "compliance_percentage": requirement_data.compliance_percentage,
                    "owner_id": requirement_data.owner_id,
                    "responsible_team": requirement_data.responsible_team,
                    "evidence_required": requirement_data.evidence_required or [],
                    "documentation_links": requirement_data.documentation_links or [],
                    "last_assessment_date": requirement_data.last_assessment_date,
                    "next_assessment_date": requirement_data.next_assessment_date,
                    "assessment_frequency": requirement_data.assessment_frequency,
                    "gaps_identified": requirement_data.gaps_identified or [],
                    "remediation_plan": requirement_data.remediation_plan,
                    "remediation_due_date": requirement_data.remediation_due_date,
                    "implementation_cost": float(requirement_data.implementation_cost) if requirement_data.implementation_cost else None,
                    "maintenance_effort_hours": requirement_data.maintenance_effort_hours,
                    "tags": requirement_data.tags or [],
                    "metadata": requirement_data.metadata or {},
                    "created_by": created_by
                }
            )
            
            logger.info(
                "Compliance requirement created",
                requirement_id=requirement.id,
                framework=requirement.framework,
                title=requirement.title,
                created_by=created_by
            )
            
            return ComplianceRequirement.from_orm(requirement)
            
        except Exception as e:
            logger.error("Failed to create compliance requirement", error=str(e))
            raise
    
    # Control Assessment Methods
    
    async def create_control_assessment(
        self, 
        control_data: ControlAssessment, 
        created_by: str
    ) -> ControlAssessment:
        """Create a new control assessment"""
        try:
            control = await self.prisma.controlassessment.create(
                data={
                    "control_id": control_data.control_id,
                    "title": control_data.title,
                    "description": control_data.description,
                    "control_type": control_data.control_type,
                    "control_category": control_data.control_category,
                    "framework": control_data.framework,
                    "status": control_data.status,
                    "effectiveness_rating": control_data.effectiveness_rating,
                    "test_date": control_data.test_date,
                    "next_test_date": control_data.next_test_date,
                    "test_procedures": control_data.test_procedures or [],
                    "test_results": control_data.test_results,
                    "exceptions_noted": control_data.exceptions_noted or [],
                    "control_owner_id": control_data.control_owner_id,
                    "tester_id": control_data.tester_id,
                    "risks_addressed": control_data.risks_addressed or [],
                    "related_requirements": control_data.related_requirements or [],
                    "deficiencies": control_data.deficiencies or [],
                    "remediation_actions": control_data.remediation_actions or [],
                    "remediation_due_date": control_data.remediation_due_date,
                    "is_automated": control_data.is_automated,
                    "automation_tool": control_data.automation_tool,
                    "monitoring_frequency": control_data.monitoring_frequency,
                    "tags": control_data.tags or [],
                    "metadata": control_data.metadata or {},
                    "created_by": created_by
                }
            )
            
            logger.info(
                "Control assessment created",
                control_id=control.id,
                control_name=control.control_id,
                title=control.title,
                created_by=created_by
            )
            
            return ControlAssessment.from_orm(control)
            
        except Exception as e:
            logger.error("Failed to create control assessment", error=str(e))
            raise
    
    # Incident Management Methods
    
    async def create_compliance_incident(
        self, 
        incident_data: ComplianceIncident, 
        created_by: str
    ) -> ComplianceIncident:
        """Create a new compliance incident"""
        try:
            incident = await self.prisma.complianceincident.create(
                data={
                    "title": incident_data.title,
                    "description": incident_data.description,
                    "incident_type": incident_data.incident_type,
                    "severity": incident_data.severity,
                    "status": incident_data.status,
                    "discovered_date": incident_data.discovered_date,
                    "reported_date": incident_data.reported_date,
                    "occurrence_date": incident_data.occurrence_date,
                    "resolution_date": incident_data.resolution_date,
                    "affected_systems": incident_data.affected_systems or [],
                    "affected_data_types": incident_data.affected_data_types or [],
                    "estimated_records_affected": incident_data.estimated_records_affected,
                    "estimated_financial_impact": float(incident_data.estimated_financial_impact) if incident_data.estimated_financial_impact else None,
                    "actual_financial_impact": float(incident_data.actual_financial_impact) if incident_data.actual_financial_impact else None,
                    "regulatory_frameworks": [f.value for f in incident_data.regulatory_frameworks] if incident_data.regulatory_frameworks else [],
                    "notification_required": incident_data.notification_required,
                    "notification_deadline": incident_data.notification_deadline,
                    "authorities_notified": incident_data.authorities_notified or [],
                    "root_cause": incident_data.root_cause,
                    "contributing_factors": incident_data.contributing_factors or [],
                    "investigation_findings": incident_data.investigation_findings,
                    "immediate_actions": incident_data.immediate_actions or [],
                    "corrective_actions": incident_data.corrective_actions or [],
                    "preventive_measures": incident_data.preventive_measures or [],
                    "incident_manager_id": incident_data.incident_manager_id,
                    "assigned_to_id": incident_data.assigned_to_id,
                    "legal_counsel_id": incident_data.legal_counsel_id,
                    "external_counsel_engaged": incident_data.external_counsel_engaged,
                    "forensics_firm_engaged": incident_data.forensics_firm_engaged,
                    "pr_firm_engaged": incident_data.pr_firm_engaged,
                    "lessons_learned": incident_data.lessons_learned,
                    "process_improvements": incident_data.process_improvements or [],
                    "tags": incident_data.tags or [],
                    "metadata": incident_data.metadata or {},
                    "created_by": created_by
                }
            )
            
            logger.info(
                "Compliance incident created",
                incident_id=incident.id,
                title=incident.title,
                severity=incident.severity,
                created_by=created_by
            )
            
            return ComplianceIncident.from_orm(incident)
            
        except Exception as e:
            logger.error("Failed to create compliance incident", error=str(e))
            raise
    
    # Search and Analytics Methods
    
    async def search_risk_assessments(
        self,
        filters: ComplianceSearchFilters,
        skip: int = 0,
        limit: int = Constants.DEFAULT_PAGE_SIZE,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[RiskAssessmentResponse], int]:
        """Search risk assessments with advanced filtering"""
        try:
            # Build where clause
            where_clause = await self._build_risk_where_clause(filters)
            
            # Build order by clause
            order_by = {sort_by: sort_order}
            
            # Execute queries
            assessments_query = self.prisma.riskassessment.find_many(
                where=where_clause,
                include={
                    "risk_owner": True,
                    "responsible_manager": True
                },
                skip=skip,
                take=limit,
                order_by=order_by
            )
            
            count_query = self.prisma.riskassessment.count(where=where_clause)
            
            assessments, total = await asyncio.gather(assessments_query, count_query)
            
            # Convert to response models
            assessment_responses = []
            for assessment in assessments:
                assessment_responses.append(await self._to_risk_assessment_response(assessment))
            
            return assessment_responses, total
            
        except Exception as e:
            logger.error("Failed to search risk assessments", error=str(e))
            raise
    
    async def get_compliance_metrics(self) -> ComplianceMetrics:
        """Get comprehensive compliance and risk metrics"""
        try:
            # Risk assessment metrics
            total_risk_assessments = await self.prisma.riskassessment.count()
            
            # Count risks by category
            risks_by_category = {}
            for category in RiskCategory:
                count = await self.prisma.riskassessment.count(
                    where={"category": category.value}
                )
                risks_by_category[category.value] = count
            
            # Count risks by level
            risks_by_level = {}
            for level in RiskLevel:
                count = await self.prisma.riskassessment.count(
                    where={"risk_level": level.value}
                )
                risks_by_level[level.value] = count
            
            # Overdue risk reviews
            today = date.today()
            overdue_risk_reviews = await self.prisma.riskassessment.count(
                where={
                    "next_review_date": {"lt": today}
                }
            )
            
            # Compliance requirements metrics
            total_requirements = await self.prisma.compliancerequirement.count()
            compliant_requirements = await self.prisma.compliancerequirement.count(
                where={"status": ComplianceStatus.COMPLIANT.value}
            )
            non_compliant_requirements = await self.prisma.compliancerequirement.count(
                where={"status": ComplianceStatus.NON_COMPLIANT.value}
            )
            
            compliance_percentage = (compliant_requirements / total_requirements * 100) if total_requirements > 0 else 0
            
            # Requirements by framework
            requirements_by_framework = {}
            for framework in ComplianceFramework:
                count = await self.prisma.compliancerequirement.count(
                    where={"framework": framework.value}
                )
                requirements_by_framework[framework.value] = count
            
            # Control metrics
            total_controls = await self.prisma.controlassessment.count()
            effective_controls = await self.prisma.controlassessment.count(
                where={"status": ControlStatus.EFFECTIVE.value}
            )
            ineffective_controls = await self.prisma.controlassessment.count(
                where={"status": ControlStatus.INEFFECTIVE.value}
            )
            controls_needing_remediation = await self.prisma.controlassessment.count(
                where={"status": ControlStatus.REMEDIATION_REQUIRED.value}
            )
            
            control_effectiveness_percentage = (effective_controls / total_controls * 100) if total_controls > 0 else 0
            
            # Incident metrics
            total_incidents = await self.prisma.complianceincident.count()
            open_incidents = await self.prisma.complianceincident.count(
                where={"status": {"in": [IncidentStatus.OPEN.value, IncidentStatus.INVESTIGATING.value]}}
            )
            
            # Incidents by severity
            incidents_by_severity = {}
            for severity in IncidentSeverity:
                count = await self.prisma.complianceincident.count(
                    where={"severity": severity.value}
                )
                incidents_by_severity[severity.value] = count
            
            # Incidents this quarter
            quarter_start = date.today().replace(month=((date.today().month - 1) // 3) * 3 + 1, day=1)
            incidents_this_quarter = await self.prisma.complianceincident.count(
                where={"discovered_date": {"gte": quarter_start}}
            )
            
            # Financial metrics
            risk_financial_aggregates = await self.prisma.riskassessment.aggregate(
                _sum={"estimated_financial_impact": True}
            )
            
            requirement_cost_aggregates = await self.prisma.compliancerequirement.aggregate(
                _sum={"implementation_cost": True}
            )
            
            incident_cost_aggregates = await self.prisma.complianceincident.aggregate(
                _sum={"actual_financial_impact": True}
            )
            
            total_estimated_risk_exposure = Decimal(str(risk_financial_aggregates._sum.estimated_financial_impact or 0))
            total_remediation_costs = Decimal(str(requirement_cost_aggregates._sum.implementation_cost or 0))
            cost_of_incidents = Decimal(str(incident_cost_aggregates._sum.actual_financial_impact or 0))
            
            return ComplianceMetrics(
                total_risk_assessments=total_risk_assessments,
                risks_by_category=risks_by_category,
                risks_by_level=risks_by_level,
                overdue_risk_reviews=overdue_risk_reviews,
                total_requirements=total_requirements,
                compliant_requirements=compliant_requirements,
                non_compliant_requirements=non_compliant_requirements,
                compliance_percentage=compliance_percentage,
                requirements_by_framework=requirements_by_framework,
                total_controls=total_controls,
                effective_controls=effective_controls,
                ineffective_controls=ineffective_controls,
                controls_needing_remediation=controls_needing_remediation,
                control_effectiveness_percentage=control_effectiveness_percentage,
                total_incidents=total_incidents,
                open_incidents=open_incidents,
                incidents_by_severity=incidents_by_severity,
                average_resolution_time_days=0.0,  # Would calculate from resolved incidents
                incidents_this_quarter=incidents_this_quarter,
                total_estimated_risk_exposure=total_estimated_risk_exposure,
                total_remediation_costs=total_remediation_costs,
                compliance_program_costs=Decimal('0'),  # Would track program costs
                cost_of_incidents=cost_of_incidents,
                risk_trend="STABLE",  # Would calculate based on historical data
                compliance_trend="STABLE",
                incident_trend="STABLE",
                high_risk_areas=["Cybersecurity", "Data Privacy", "Financial Reporting"],
                emerging_risks=["AI Governance", "Supply Chain", "Climate Risk"],
                compliance_gaps=["Third-party risk", "Data retention", "Access controls"],
                recommended_actions=[
                    "Complete overdue risk assessments",
                    "Remediate control deficiencies",
                    "Update compliance frameworks"
                ]
            )
            
        except Exception as e:
            logger.error("Failed to get compliance metrics", error=str(e))
            raise
    
    async def get_compliance_dashboard(self) -> ComplianceDashboard:
        """Get executive compliance dashboard summary"""
        try:
            # Get basic metrics
            metrics = await self.get_compliance_metrics()
            
            # Calculate overall compliance score
            compliance_score = metrics.compliance_percentage
            control_score = metrics.control_effectiveness_percentage
            overall_score = (compliance_score + control_score) / 2
            
            # Determine risk maturity level
            if overall_score >= 90:
                maturity_level = "OPTIMIZED"
            elif overall_score >= 75:
                maturity_level = "QUANTIFIED"
            elif overall_score >= 60:
                maturity_level = "DEFINED"
            elif overall_score >= 40:
                maturity_level = "MANAGED"
            else:
                maturity_level = "INITIAL"
            
            # Count critical items
            critical_risks = metrics.risks_by_level.get("CRITICAL", 0) + metrics.risks_by_level.get("VERY_HIGH", 0)
            
            # Recent activity (placeholder - would calculate from actual data)
            new_risks_identified = 5
            assessments_completed = 12
            controls_tested = 8
            incidents_resolved = 3
            
            # Urgent actions
            urgent_actions = []
            if metrics.overdue_risk_reviews > 0:
                urgent_actions.append({
                    "type": "OVERDUE_REVIEWS",
                    "title": f"{metrics.overdue_risk_reviews} overdue risk reviews",
                    "priority": "HIGH",
                    "action_url": "/compliance/risks?overdue=true"
                })
            
            if metrics.controls_needing_remediation > 0:
                urgent_actions.append({
                    "type": "CONTROL_REMEDIATION",
                    "title": f"{metrics.controls_needing_remediation} controls need remediation",
                    "priority": "HIGH",
                    "action_url": "/compliance/controls?status=remediation_required"
                })
            
            if metrics.open_incidents > 0:
                urgent_actions.append({
                    "type": "OPEN_INCIDENTS",
                    "title": f"{metrics.open_incidents} open compliance incidents",
                    "priority": "CRITICAL",
                    "action_url": "/compliance/incidents?status=open"
                })
            
            # Upcoming deadlines (placeholder)
            upcoming_deadlines = [
                {
                    "type": "REGULATORY_FILING",
                    "title": "SOX 404 Assessment Due",
                    "due_date": (date.today() + timedelta(days=15)).isoformat(),
                    "days_remaining": 15
                },
                {
                    "type": "AUDIT_PREPARATION",
                    "title": "External Audit Preparation",
                    "due_date": (date.today() + timedelta(days=30)).isoformat(),
                    "days_remaining": 30
                }
            ]
            
            # Board attention items
            board_attention_items = []
            if critical_risks > 0:
                board_attention_items.append({
                    "type": "CRITICAL_RISKS",
                    "title": f"{critical_risks} critical risks identified",
                    "description": "Requires board-level risk discussion"
                })
            
            return ComplianceDashboard(
                overall_compliance_score=overall_score,
                risk_maturity_level=maturity_level,
                critical_risks=critical_risks,
                overdue_assessments=metrics.overdue_risk_reviews,
                control_deficiencies=metrics.controls_needing_remediation,
                open_incidents=metrics.open_incidents,
                frameworks_assessed=len(metrics.requirements_by_framework),
                frameworks_compliant=metrics.compliant_requirements,
                regulatory_actions_required=metrics.non_compliant_requirements,
                new_risks_identified=new_risks_identified,
                assessments_completed=assessments_completed,
                controls_tested=controls_tested,
                incidents_resolved=incidents_resolved,
                urgent_actions=urgent_actions,
                upcoming_deadlines=upcoming_deadlines,
                board_attention_items=board_attention_items,
                compliance_score_trend="STABLE",
                risk_exposure_trend="STABLE",
                incident_frequency_trend="DECREASING"
            )
            
        except Exception as e:
            logger.error("Failed to get compliance dashboard", error=str(e))
            raise
    
    # Bulk Operations
    
    async def bulk_update_items(
        self,
        bulk_action: ComplianceBulkAction,
        updated_by: str
    ) -> Dict[str, List[str]]:
        """Perform bulk actions on compliance items"""
        try:
            results = {"success": [], "failed": []}
            
            for item_id in bulk_action.item_ids:
                try:
                    if bulk_action.action == "assign":
                        await self._bulk_assign_item(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "update_status":
                        await self._bulk_update_status(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "add_tags":
                        await self._bulk_add_tags(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "schedule_review":
                        await self._bulk_schedule_review(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "bulk_assess":
                        await self._bulk_assess_item(item_id, bulk_action.parameters, updated_by)
                    else:
                        raise ValueError(f"Unknown bulk action: {bulk_action.action}")
                    
                    results["success"].append(item_id)
                    
                except Exception as e:
                    logger.error(
                        "Failed bulk action on compliance item",
                        error=str(e),
                        item_id=item_id,
                        action=bulk_action.action
                    )
                    results["failed"].append(item_id)
            
            logger.info(
                "Bulk compliance action completed",
                action=bulk_action.action,
                total=len(bulk_action.item_ids),
                success=len(results["success"]),
                failed=len(results["failed"])
            )
            
            return results
            
        except Exception as e:
            logger.error("Failed to perform bulk compliance action", error=str(e))
            raise
    
    # Helper Methods
    
    async def _to_risk_assessment_response(self, assessment) -> RiskAssessmentResponse:
        """Convert database assessment to response model"""
        # Calculate derived fields
        days_until_review = None
        is_overdue_review = False
        
        if assessment.next_review_date:
            days_until_review = (assessment.next_review_date - date.today()).days
            is_overdue_review = days_until_review < 0
        
        # Get related data names
        risk_owner_name = None
        if hasattr(assessment, 'risk_owner') and assessment.risk_owner:
            risk_owner_name = f"{assessment.risk_owner.first_name} {assessment.risk_owner.last_name}"
        
        responsible_manager_name = None
        if hasattr(assessment, 'responsible_manager') and assessment.responsible_manager:
            responsible_manager_name = f"{assessment.responsible_manager.first_name} {assessment.responsible_manager.last_name}"
        
        # Count related items
        mitigation_count = len(assessment.mitigations) if hasattr(assessment, 'mitigations') else 0
        incident_count = len(assessment.incidents) if hasattr(assessment, 'incidents') else 0
        
        return RiskAssessmentResponse(
            id=assessment.id,
            title=assessment.title,
            description=assessment.description,
            category=assessment.category,
            subcategory=assessment.subcategory,
            risk_level=assessment.risk_level,
            likelihood=assessment.likelihood,
            impact=assessment.impact,
            risk_score=assessment.risk_score,
            business_unit=assessment.business_unit,
            process_area=assessment.process_area,
            regulatory_requirements=assessment.regulatory_requirements or [],
            risk_drivers=assessment.risk_drivers or [],
            potential_impacts=assessment.potential_impacts or [],
            existing_controls=assessment.existing_controls or [],
            risk_owner_id=assessment.risk_owner_id,
            responsible_manager_id=assessment.responsible_manager_id,
            assessment_date=assessment.assessment_date,
            next_review_date=assessment.next_review_date,
            estimated_financial_impact=Decimal(str(assessment.estimated_financial_impact)) if assessment.estimated_financial_impact else None,
            currency=assessment.currency,
            tags=assessment.tags or [],
            metadata=assessment.metadata or {},
            # Calculated fields
            days_until_review=days_until_review,
            is_overdue_review=is_overdue_review,
            # Related data
            risk_owner_name=risk_owner_name,
            responsible_manager_name=responsible_manager_name,
            mitigation_count=mitigation_count,
            incident_count=incident_count,
            # Timestamps
            created_at=assessment.created_at,
            updated_at=assessment.updated_at,
            last_reviewed_at=assessment.last_reviewed_at
        )
    
    async def _build_risk_where_clause(self, filters: ComplianceSearchFilters) -> Dict[str, Any]:
        """Build where clause for risk assessment search"""
        where_clause = {}
        
        if filters.risk_category:
            where_clause["category"] = {"in": [cat.value for cat in filters.risk_category]}
        
        if filters.risk_level:
            where_clause["risk_level"] = {"in": [level.value for level in filters.risk_level]}
        
        if filters.risk_owner_id:
            where_clause["risk_owner_id"] = filters.risk_owner_id
        
        if filters.assessment_date_from or filters.assessment_date_to:
            date_filter = {}
            if filters.assessment_date_from:
                date_filter["gte"] = filters.assessment_date_from
            if filters.assessment_date_to:
                date_filter["lte"] = filters.assessment_date_to
            where_clause["assessment_date"] = date_filter
        
        if filters.due_date_from or filters.due_date_to:
            date_filter = {}
            if filters.due_date_from:
                date_filter["gte"] = filters.due_date_from
            if filters.due_date_to:
                date_filter["lte"] = filters.due_date_to
            where_clause["next_review_date"] = date_filter
        
        if filters.business_unit:
            where_clause["business_unit"] = {"in": filters.business_unit}
        
        if filters.process_area:
            where_clause["process_area"] = {"in": filters.process_area}
        
        if filters.overdue_only:
            where_clause["next_review_date"] = {"lt": date.today()}
        
        if filters.search_text:
            where_clause["OR"] = [
                {"title": {"contains": filters.search_text, "mode": "insensitive"}},
                {"description": {"contains": filters.search_text, "mode": "insensitive"}}
            ]
        
        if filters.tags:
            where_clause["tags"] = {"hasSome": filters.tags}
        
        return where_clause
    
    # Bulk action helper methods
    
    async def _bulk_assign_item(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk assign risk assessment"""
        update_data = {}
        if "risk_owner_id" in parameters:
            update_data["risk_owner_id"] = parameters["risk_owner_id"]
        if "responsible_manager_id" in parameters:
            update_data["responsible_manager_id"] = parameters["responsible_manager_id"]
        
        if update_data:
            await self.prisma.riskassessment.update(
                where={"id": item_id},
                data={**update_data, "updated_by": updated_by}
            )
    
    async def _bulk_update_status(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk update status"""
        if "risk_level" in parameters:
            await self.prisma.riskassessment.update(
                where={"id": item_id},
                data={"risk_level": parameters["risk_level"], "updated_by": updated_by}
            )
    
    async def _bulk_add_tags(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk add tags"""
        if "tags" in parameters:
            assessment = await self.prisma.riskassessment.find_unique(where={"id": item_id})
            if assessment:
                existing_tags = set(assessment.tags or [])
                new_tags = set(parameters["tags"])
                combined_tags = list(existing_tags.union(new_tags))
                
                await self.prisma.riskassessment.update(
                    where={"id": item_id},
                    data={"tags": combined_tags, "updated_by": updated_by}
                )
    
    async def _bulk_schedule_review(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk schedule review"""
        if "next_review_date" in parameters:
            await self.prisma.riskassessment.update(
                where={"id": item_id},
                data={"next_review_date": parameters["next_review_date"], "updated_by": updated_by}
            )
    
    async def _bulk_assess_item(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk assess item"""
        update_data = {"last_reviewed_at": datetime.utcnow(), "updated_by": updated_by}
        
        if "likelihood" in parameters:
            update_data["likelihood"] = parameters["likelihood"]
        if "impact" in parameters:
            update_data["impact"] = parameters["impact"]
        
        # Recalculate risk score if needed
        if "likelihood" in parameters or "impact" in parameters:
            current = await self.prisma.riskassessment.find_unique(where={"id": item_id})
            if current:
                likelihood = parameters.get("likelihood", current.likelihood)
                impact = parameters.get("impact", current.impact)
                update_data["risk_score"] = likelihood * impact
        
        await self.prisma.riskassessment.update(
            where={"id": item_id},
            data=update_data
        )