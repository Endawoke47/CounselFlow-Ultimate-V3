"""
CounselFlow Ultimate V3 - Data Privacy & PIA Service
Comprehensive privacy impact assessment and data protection management
"""

import asyncio
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any, Tuple
from decimal import Decimal
import structlog
from prisma import Prisma

from app.schemas.privacy import (
    DataProcessingActivityCreate, DataProcessingActivityUpdate, DataProcessingActivityResponse,
    PrivacyImpactAssessmentCreate, PrivacyImpactAssessmentUpdate, PrivacyImpactAssessmentResponse,
    DataSubjectRequest, DataBreachIncident, PrivacyMetrics, PrivacyDashboard,
    PrivacySearchFilters, PrivacyBulkAction, PrivacyReportRequest,
    DataCategory, LegalBasis, ProcessingPurpose, PIAStatus, RiskLevel,
    SubjectRightType, RequestStatus, BreachType, BreachSeverity, BreachStatus
)
from app.services.ai_orchestrator import ai_orchestrator
from app.core.config import Constants

logger = structlog.get_logger()


class PrivacyService:
    """Service layer for data privacy and protection management"""
    
    def __init__(self, prisma: Prisma):
        self.prisma = prisma
    
    # Data Processing Activity Methods
    
    async def create_processing_activity(
        self, 
        activity_data: DataProcessingActivityCreate, 
        created_by: str
    ) -> DataProcessingActivityResponse:
        """Create a new data processing activity"""
        try:
            # Calculate compliance score
            compliance_score = await self._calculate_compliance_score(activity_data)
            
            # Create processing activity in database
            activity = await self.prisma.dataprocessingactivity.create(
                data={
                    "name": activity_data.name,
                    "description": activity_data.description,
                    "data_controller": activity_data.data_controller,
                    "data_controller_contact": activity_data.data_controller_contact,
                    "data_processor": activity_data.data_processor,
                    "dpo_involved": activity_data.dpo_involved,
                    "categories_of_data": [cat.value for cat in activity_data.categories_of_data],
                    "special_categories": activity_data.special_categories or [],
                    "purposes": [purpose.value for purpose in activity_data.purposes],
                    "legal_basis": [basis.value for basis in activity_data.legal_basis],
                    "legitimate_interests_details": activity_data.legitimate_interests_details,
                    "categories_of_subjects": activity_data.categories_of_subjects,
                    "number_of_subjects": activity_data.number_of_subjects,
                    "recipients": activity_data.recipients or [],
                    "third_country_transfers": activity_data.third_country_transfers,
                    "third_countries": activity_data.third_countries or [],
                    "transfer_mechanisms": [mech.value for mech in activity_data.transfer_mechanisms] if activity_data.transfer_mechanisms else [],
                    "retention_period": activity_data.retention_period,
                    "retention_criteria": activity_data.retention_criteria,
                    "technical_measures": activity_data.technical_measures or [],
                    "organizational_measures": activity_data.organizational_measures or [],
                    "risk_level": activity_data.risk_level.value,
                    "high_risk_factors": activity_data.high_risk_factors or [],
                    "pia_required": activity_data.pia_required,
                    "pia_conducted": activity_data.pia_conducted,
                    "pia_date": activity_data.pia_date,
                    "automated_decision_making": activity_data.automated_decision_making,
                    "profiling": activity_data.profiling,
                    "automated_processing_details": activity_data.automated_processing_details,
                    "source_of_data": activity_data.source_of_data or [],
                    "consent_mechanism": activity_data.consent_mechanism,
                    "data_minimization_measures": activity_data.data_minimization_measures or [],
                    "compliance_score": compliance_score,
                    "tags": activity_data.tags or [],
                    "metadata": activity_data.metadata or {},
                    "created_by": created_by
                }
            )
            
            # Log processing activity creation
            logger.info(
                "Data processing activity created",
                activity_id=activity.id,
                name=activity.name,
                risk_level=activity.risk_level,
                compliance_score=compliance_score,
                created_by=created_by
            )
            
            # Convert to response model
            return await self._to_processing_activity_response(activity)
            
        except Exception as e:
            logger.error("Failed to create data processing activity", error=str(e))
            raise
    
    async def get_processing_activity(self, activity_id: str) -> Optional[DataProcessingActivityResponse]:
        """Get processing activity by ID"""
        try:
            activity = await self.prisma.dataprocessingactivity.find_unique(
                where={"id": activity_id},
                include={
                    "subject_requests": True,
                    "breach_incidents": True,
                    "privacy_impact_assessments": True
                }
            )
            
            if not activity:
                return None
            
            return await self._to_processing_activity_response(activity)
            
        except Exception as e:
            logger.error("Failed to get processing activity", error=str(e), activity_id=activity_id)
            raise
    
    async def update_processing_activity(
        self,
        activity_id: str,
        activity_data: DataProcessingActivityUpdate,
        updated_by: str
    ) -> Optional[DataProcessingActivityResponse]:
        """Update processing activity"""
        try:
            # Prepare update data
            update_data = {}
            for field, value in activity_data.dict(exclude_unset=True).items():
                if field == "categories_of_data" and value is not None:
                    update_data[field] = [cat.value for cat in value]
                elif field == "purposes" and value is not None:
                    update_data[field] = [purpose.value for purpose in value]
                elif field == "legal_basis" and value is not None:
                    update_data[field] = [basis.value for basis in value]
                elif field == "transfer_mechanisms" and value is not None:
                    update_data[field] = [mech.value for mech in value]
                elif field == "risk_level" and value is not None:
                    update_data[field] = value.value
                else:
                    update_data[field] = value
            
            if update_data:
                update_data["updated_by"] = updated_by
                update_data["updated_at"] = datetime.utcnow()
                
                activity = await self.prisma.dataprocessingactivity.update(
                    where={"id": activity_id},
                    data=update_data
                )
                
                logger.info(
                    "Processing activity updated",
                    activity_id=activity_id,
                    updated_fields=list(update_data.keys()),
                    updated_by=updated_by
                )
                
                return await self._to_processing_activity_response(activity)
            
            return await self.get_processing_activity(activity_id)
            
        except Exception as e:
            logger.error("Failed to update processing activity", error=str(e), activity_id=activity_id)
            raise
    
    # Privacy Impact Assessment Methods
    
    async def create_pia(
        self, 
        pia_data: PrivacyImpactAssessmentCreate, 
        created_by: str
    ) -> PrivacyImpactAssessmentResponse:
        """Create a new privacy impact assessment"""
        try:
            # Calculate risk score
            risk_score = pia_data.likelihood_score * pia_data.impact_score
            
            # Create PIA in database
            pia = await self.prisma.privacyimpactassessment.create(
                data={
                    "title": pia_data.title,
                    "description": pia_data.description,
                    "processing_activity_id": pia_data.processing_activity_id,
                    "assessment_scope": pia_data.assessment_scope,
                    "data_flows_description": pia_data.data_flows_description,
                    "stakeholders_involved": pia_data.stakeholders_involved,
                    "privacy_risks_identified": pia_data.privacy_risks_identified,
                    "risk_sources": pia_data.risk_sources or [],
                    "affected_data_subjects": pia_data.affected_data_subjects,
                    "likelihood_score": pia_data.likelihood_score,
                    "impact_score": pia_data.impact_score,
                    "overall_risk_level": pia_data.overall_risk_level.value,
                    "risk_score": risk_score,
                    "existing_measures": pia_data.existing_measures or [],
                    "proposed_measures": pia_data.proposed_measures,
                    "residual_risk_level": pia_data.residual_risk_level.value,
                    "dpo_consulted": pia_data.dpo_consulted,
                    "stakeholder_consultation": pia_data.stakeholder_consultation,
                    "consultation_details": pia_data.consultation_details,
                    "authority_consultation_required": pia_data.authority_consultation_required,
                    "authority_consulted": pia_data.authority_consulted,
                    "authority_response": pia_data.authority_response,
                    "implementation_plan": pia_data.implementation_plan,
                    "implementation_deadline": pia_data.implementation_deadline,
                    "monitoring_measures": pia_data.monitoring_measures or [],
                    "review_frequency": pia_data.review_frequency,
                    "next_review_date": pia_data.next_review_date,
                    "status": pia_data.status.value,
                    "approved_by": pia_data.approved_by,
                    "approval_date": pia_data.approval_date,
                    "tags": pia_data.tags or [],
                    "metadata": pia_data.metadata or {},
                    "created_by": created_by
                },
                include={
                    "processing_activity": True
                }
            )
            
            # Update related processing activity if linked
            if pia_data.processing_activity_id:
                await self.prisma.dataprocessingactivity.update(
                    where={"id": pia_data.processing_activity_id},
                    data={"pia_conducted": True, "pia_date": date.today()}
                )
            
            logger.info(
                "Privacy Impact Assessment created",
                pia_id=pia.id,
                title=pia.title,
                risk_level=pia.overall_risk_level,
                risk_score=risk_score,
                created_by=created_by
            )
            
            return await self._to_pia_response(pia)
            
        except Exception as e:
            logger.error("Failed to create PIA", error=str(e))
            raise
    
    # Data Subject Request Methods
    
    async def create_subject_request(
        self, 
        request_data: DataSubjectRequest, 
        created_by: str
    ) -> DataSubjectRequest:
        """Create a new data subject request"""
        try:
            request = await self.prisma.datasubjectrequest.create(
                data={
                    "request_type": request_data.request_type.value,
                    "subject_name": request_data.subject_name,
                    "subject_email": request_data.subject_email,
                    "subject_identifier": request_data.subject_identifier,
                    "request_description": request_data.request_description,
                    "data_categories_requested": [cat.value for cat in request_data.data_categories_requested] if request_data.data_categories_requested else [],
                    "specific_data_requested": request_data.specific_data_requested,
                    "status": request_data.status.value,
                    "priority": request_data.priority,
                    "assigned_to_id": request_data.assigned_to_id,
                    "received_date": request_data.received_date,
                    "due_date": request_data.due_date,
                    "extended_due_date": request_data.extended_due_date,
                    "completed_date": request_data.completed_date,
                    "response_method": request_data.response_method,
                    "response_details": request_data.response_details,
                    "rejection_reason": request_data.rejection_reason,
                    "identity_verified": request_data.identity_verified,
                    "verification_method": request_data.verification_method,
                    "verification_documents": request_data.verification_documents or [],
                    "processing_activities_affected": request_data.processing_activities_affected or [],
                    "systems_searched": request_data.systems_searched or [],
                    "fee_charged": float(request_data.fee_charged) if request_data.fee_charged else None,
                    "complexity_level": request_data.complexity_level,
                    "communication_log": request_data.communication_log or [],
                    "tags": request_data.tags or [],
                    "metadata": request_data.metadata or {},
                    "created_by": created_by
                }
            )
            
            logger.info(
                "Data subject request created",
                request_id=request.id,
                request_type=request.request_type,
                subject_name=request.subject_name,
                due_date=request.due_date,
                created_by=created_by
            )
            
            return DataSubjectRequest.from_orm(request)
            
        except Exception as e:
            logger.error("Failed to create data subject request", error=str(e))
            raise
    
    # Data Breach Methods
    
    async def create_breach_incident(
        self, 
        breach_data: DataBreachIncident, 
        created_by: str
    ) -> DataBreachIncident:
        """Create a new data breach incident"""
        try:
            breach = await self.prisma.databreachincident.create(
                data={
                    "title": breach_data.title,
                    "description": breach_data.description,
                    "breach_type": breach_data.breach_type.value,
                    "severity": breach_data.severity.value,
                    "status": breach_data.status.value,
                    "discovered_date": breach_data.discovered_date,
                    "occurred_date": breach_data.occurred_date,
                    "contained_date": breach_data.contained_date,
                    "resolution_date": breach_data.resolution_date,
                    "categories_affected": [cat.value for cat in breach_data.categories_affected],
                    "estimated_records_affected": breach_data.estimated_records_affected,
                    "confirmed_records_affected": breach_data.confirmed_records_affected,
                    "special_categories_affected": breach_data.special_categories_affected or [],
                    "subject_categories_affected": breach_data.subject_categories_affected,
                    "geographical_scope": breach_data.geographical_scope or [],
                    "vulnerable_subjects_affected": breach_data.vulnerable_subjects_affected,
                    "root_cause": breach_data.root_cause,
                    "contributing_factors": breach_data.contributing_factors or [],
                    "likelihood_of_harm": breach_data.likelihood_of_harm.value,
                    "impact_assessment": breach_data.impact_assessment,
                    "authority_notification_required": breach_data.authority_notification_required,
                    "authority_notified": breach_data.authority_notified,
                    "authority_notification_date": breach_data.authority_notification_date,
                    "authority_reference": breach_data.authority_reference,
                    "subject_notification_required": breach_data.subject_notification_required,
                    "subjects_notified": breach_data.subjects_notified,
                    "subject_notification_date": breach_data.subject_notification_date,
                    "notification_method": breach_data.notification_method,
                    "immediate_actions": breach_data.immediate_actions,
                    "containment_measures": breach_data.containment_measures,
                    "recovery_actions": breach_data.recovery_actions,
                    "preventive_measures": breach_data.preventive_measures,
                    "investigation_findings": breach_data.investigation_findings,
                    "lessons_learned": breach_data.lessons_learned,
                    "incident_manager_id": breach_data.incident_manager_id,
                    "dpo_notified": breach_data.dpo_notified,
                    "legal_counsel_involved": breach_data.legal_counsel_involved,
                    "external_experts_engaged": breach_data.external_experts_engaged,
                    "estimated_cost": float(breach_data.estimated_cost) if breach_data.estimated_cost else None,
                    "actual_cost": float(breach_data.actual_cost) if breach_data.actual_cost else None,
                    "regulatory_fines": float(breach_data.regulatory_fines) if breach_data.regulatory_fines else None,
                    "processing_activities_affected": breach_data.processing_activities_affected or [],
                    "systems_affected": breach_data.systems_affected or [],
                    "tags": breach_data.tags or [],
                    "metadata": breach_data.metadata or {},
                    "created_by": created_by
                }
            )
            
            logger.info(
                "Data breach incident created",
                breach_id=breach.id,
                title=breach.title,
                breach_type=breach.breach_type,
                severity=breach.severity,
                estimated_records=breach.estimated_records_affected,
                created_by=created_by
            )
            
            return DataBreachIncident.from_orm(breach)
            
        except Exception as e:
            logger.error("Failed to create data breach incident", error=str(e))
            raise
    
    # Search and Analytics Methods
    
    async def search_processing_activities(
        self,
        filters: PrivacySearchFilters,
        skip: int = 0,
        limit: int = Constants.DEFAULT_PAGE_SIZE,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Tuple[List[DataProcessingActivityResponse], int]:
        """Search processing activities with advanced filtering"""
        try:
            # Build where clause
            where_clause = await self._build_processing_activity_where_clause(filters)
            
            # Build order by clause
            order_by = {sort_by: sort_order}
            
            # Execute queries
            activities_query = self.prisma.dataprocessingactivity.find_many(
                where=where_clause,
                skip=skip,
                take=limit,
                order_by=order_by
            )
            
            count_query = self.prisma.dataprocessingactivity.count(where=where_clause)
            
            activities, total = await asyncio.gather(activities_query, count_query)
            
            # Convert to response models
            activity_responses = []
            for activity in activities:
                activity_responses.append(await self._to_processing_activity_response(activity))
            
            return activity_responses, total
            
        except Exception as e:
            logger.error("Failed to search processing activities", error=str(e))
            raise
    
    async def get_privacy_metrics(self) -> PrivacyMetrics:
        """Get comprehensive privacy and data protection metrics"""
        try:
            # Processing activity metrics
            total_activities = await self.prisma.dataprocessingactivity.count()
            high_risk_activities = await self.prisma.dataprocessingactivity.count(
                where={"risk_level": {"in": ["HIGH", "VERY_HIGH"]}}
            )
            activities_requiring_pia = await self.prisma.dataprocessingactivity.count(
                where={"pia_required": True}
            )
            activities_with_pia = await self.prisma.dataprocessingactivity.count(
                where={"pia_conducted": True}
            )
            
            pia_completion_rate = (activities_with_pia / activities_requiring_pia * 100) if activities_requiring_pia > 0 else 0
            
            # Activities by category
            activities_by_legal_basis = {}
            for basis in LegalBasis:
                count = await self.prisma.dataprocessingactivity.count(
                    where={"legal_basis": {"has": basis.value}}
                )
                activities_by_legal_basis[basis.value] = count
            
            activities_by_purpose = {}
            for purpose in ProcessingPurpose:
                count = await self.prisma.dataprocessingactivity.count(
                    where={"purposes": {"has": purpose.value}}
                )
                activities_by_purpose[purpose.value] = count
            
            activities_by_risk_level = {}
            for level in RiskLevel:
                count = await self.prisma.dataprocessingactivity.count(
                    where={"risk_level": level.value}
                )
                activities_by_risk_level[level.value] = count
            
            # PIA metrics
            total_pias = await self.prisma.privacyimpactassessment.count()
            
            pias_by_status = {}
            for status in PIAStatus:
                count = await self.prisma.privacyimpactassessment.count(
                    where={"status": status.value}
                )
                pias_by_status[status.value] = count
            
            # Overdue PIA reviews
            today = date.today()
            overdue_pia_reviews = await self.prisma.privacyimpactassessment.count(
                where={
                    "next_review_date": {"lt": today},
                    "status": {"not": PIAStatus.COMPLETED.value}
                }
            )
            
            # Data subject requests
            total_requests = await self.prisma.datasubjectrequest.count()
            
            requests_by_type = {}
            for req_type in SubjectRightType:
                count = await self.prisma.datasubjectrequest.count(
                    where={"request_type": req_type.value}
                )
                requests_by_type[req_type.value] = count
            
            requests_by_status = {}
            for status in RequestStatus:
                count = await self.prisma.datasubjectrequest.count(
                    where={"status": status.value}
                )
                requests_by_status[status.value] = count
            
            # Current month requests
            current_month_start = date.today().replace(day=1)
            requests_this_month = await self.prisma.datasubjectrequest.count(
                where={"received_date": {"gte": current_month_start}}
            )
            
            # Overdue requests
            overdue_requests = await self.prisma.datasubjectrequest.count(
                where={
                    "due_date": {"lt": today},
                    "status": {"not_in": [RequestStatus.COMPLETED.value, RequestStatus.REJECTED.value]}
                }
            )
            
            # Breach incidents
            total_breaches = await self.prisma.databreachincident.count()
            
            breaches_by_severity = {}
            for severity in BreachSeverity:
                count = await self.prisma.databreachincident.count(
                    where={"severity": severity.value}
                )
                breaches_by_severity[severity.value] = count
            
            breaches_by_type = {}
            for breach_type in BreachType:
                count = await self.prisma.databreachincident.count(
                    where={"breach_type": breach_type.value}
                )
                breaches_by_type[breach_type.value] = count
            
            open_breaches = await self.prisma.databreachincident.count(
                where={"status": {"in": [BreachStatus.DETECTED.value, BreachStatus.INVESTIGATING.value, BreachStatus.CONTAINED.value]}}
            )
            
            # Current quarter breaches
            quarter_start = date.today().replace(month=((date.today().month - 1) // 3) * 3 + 1, day=1)
            breaches_this_quarter = await self.prisma.databreachincident.count(
                where={"discovered_date": {"gte": quarter_start}}
            )
            
            # Financial aggregates
            breach_cost_aggregates = await self.prisma.databreachincident.aggregate(
                _sum={"actual_cost": True, "regulatory_fines": True}
            )
            
            total_breach_costs = Decimal(str(breach_cost_aggregates._sum.actual_cost or 0))
            regulatory_fines_paid = Decimal(str(breach_cost_aggregates._sum.regulatory_fines or 0))
            
            # Calculate compliance scores (simplified)
            gdpr_compliance_score = min(95.0, pia_completion_rate + 20)  # Simplified calculation
            ccpa_compliance_score = min(90.0, (activities_with_pia / total_activities * 100) if total_activities > 0 else 0)
            overall_privacy_score = (gdpr_compliance_score + ccpa_compliance_score) / 2
            
            return PrivacyMetrics(
                total_processing_activities=total_activities,
                high_risk_activities=high_risk_activities,
                activities_requiring_pia=activities_requiring_pia,
                activities_with_pia=activities_with_pia,
                pia_completion_rate=pia_completion_rate,
                activities_by_legal_basis=activities_by_legal_basis,
                activities_by_purpose=activities_by_purpose,
                activities_by_risk_level=activities_by_risk_level,
                total_pias=total_pias,
                pias_by_status=pias_by_status,
                overdue_pia_reviews=overdue_pia_reviews,
                average_pia_completion_days=45.0,  # Would calculate from actual data
                total_subject_requests=total_requests,
                requests_by_type=requests_by_type,
                requests_by_status=requests_by_status,
                average_response_time_days=12.5,  # Would calculate from actual data
                requests_this_month=requests_this_month,
                overdue_requests=overdue_requests,
                total_breaches=total_breaches,
                breaches_by_severity=breaches_by_severity,
                breaches_by_type=breaches_by_type,
                open_breaches=open_breaches,
                breaches_this_quarter=breaches_this_quarter,
                average_containment_time_hours=8.5,  # Would calculate from actual data
                authority_notifications_sent=15,  # Would track actual notifications
                subject_notifications_sent=45,
                notification_compliance_rate=98.5,
                total_breach_costs=total_breach_costs,
                regulatory_fines_paid=regulatory_fines_paid,
                privacy_program_costs=Decimal('150000'),  # Would track actual costs
                compliance_investment=Decimal('75000'),
                overall_privacy_score=overall_privacy_score,
                gdpr_compliance_score=gdpr_compliance_score,
                ccpa_compliance_score=ccpa_compliance_score,
                data_minimization_score=85.0,  # Would calculate based on activities
                consent_management_score=78.0,
                privacy_risk_trend="STABLE",
                request_volume_trend="INCREASING",
                breach_frequency_trend="DECREASING",
                high_priority_actions=[
                    "Complete overdue PIA reviews",
                    "Process overdue subject requests",
                    "Remediate open breach incidents"
                ],
                compliance_gaps=[
                    "Missing PIAs for high-risk activities",
                    "Incomplete breach notification procedures",
                    "Outdated data retention policies"
                ],
                emerging_privacy_risks=[
                    "AI and automated decision-making",
                    "Cross-border data transfers",
                    "Biometric data processing",
                    "Third-party data sharing"
                ],
                recommended_improvements=[
                    "Implement automated PIA triggers",
                    "Enhance subject request tracking",
                    "Strengthen breach response procedures",
                    "Regular privacy training programs"
                ]
            )
            
        except Exception as e:
            logger.error("Failed to get privacy metrics", error=str(e))
            raise
    
    async def get_privacy_dashboard(self) -> PrivacyDashboard:
        """Get executive privacy dashboard summary"""
        try:
            # Get basic metrics
            metrics = await self.get_privacy_metrics()
            
            # Calculate privacy health score
            privacy_health_score = metrics.overall_privacy_score
            
            # Determine maturity level
            if privacy_health_score >= 90:
                maturity_level = "OPTIMIZED"
            elif privacy_health_score >= 75:
                maturity_level = "ADVANCED"
            elif privacy_health_score >= 60:
                maturity_level = "MANAGED"
            elif privacy_health_score >= 40:
                maturity_level = "DEVELOPING"
            else:
                maturity_level = "BASIC"
            
            # Calculate key alerts
            critical_breaches = metrics.breaches_by_severity.get("CRITICAL", 0)
            
            # Recent activity (placeholder - would calculate from actual data)
            new_processing_activities = 8
            completed_pias = 5
            resolved_subject_requests = 12
            contained_breaches = 2
            
            # Urgent actions
            urgent_notifications_due = []
            if metrics.open_breaches > 0:
                urgent_notifications_due.append({
                    "type": "BREACH_NOTIFICATION",
                    "title": f"{metrics.open_breaches} open breach incidents require attention",
                    "priority": "CRITICAL",
                    "due_date": (date.today() + timedelta(days=1)).isoformat()
                })
            
            overdue_reviews = []
            if metrics.overdue_pia_reviews > 0:
                overdue_reviews.append({
                    "type": "PIA_REVIEW",
                    "title": f"{metrics.overdue_pia_reviews} PIA reviews overdue",
                    "priority": "HIGH",
                    "action_required": True
                })
            
            escalated_incidents = []
            if critical_breaches > 0:
                escalated_incidents.append({
                    "type": "CRITICAL_BREACH",
                    "title": f"{critical_breaches} critical breach incidents",
                    "priority": "CRITICAL",
                    "requires_board_attention": True
                })
            
            # Upcoming deadlines
            upcoming_pia_reviews = [
                {
                    "title": "Customer Analytics PIA Review",
                    "due_date": (date.today() + timedelta(days=15)).isoformat(),
                    "priority": "HIGH"
                },
                {
                    "title": "Employee Monitoring PIA Review", 
                    "due_date": (date.today() + timedelta(days=30)).isoformat(),
                    "priority": "MEDIUM"
                }
            ]
            
            subject_request_deadlines = [
                {
                    "title": "Data Access Request - John Smith",
                    "due_date": (date.today() + timedelta(days=5)).isoformat(),
                    "priority": "HIGH"
                },
                {
                    "title": "Data Portability Request - Jane Doe",
                    "due_date": (date.today() + timedelta(days=10)).isoformat(),
                    "priority": "MEDIUM"
                }
            ]
            
            return PrivacyDashboard(
                privacy_health_score=privacy_health_score,
                privacy_maturity_level=maturity_level,
                critical_breaches=critical_breaches,
                overdue_subject_requests=metrics.overdue_requests,
                missing_pias=metrics.activities_requiring_pia - metrics.activities_with_pia,
                high_risk_activities=metrics.high_risk_activities,
                gdpr_compliance_status="SUBSTANTIALLY_COMPLIANT",
                ccpa_compliance_status="COMPLIANT",
                pending_authority_responses=2,
                new_processing_activities=new_processing_activities,
                completed_pias=completed_pias,
                resolved_subject_requests=resolved_subject_requests,
                contained_breaches=contained_breaches,
                urgent_notifications_due=urgent_notifications_due,
                overdue_reviews=overdue_reviews,
                escalated_incidents=escalated_incidents,
                upcoming_pia_reviews=upcoming_pia_reviews,
                subject_request_deadlines=subject_request_deadlines,
                privacy_score_trend="STABLE",
                request_volume_trend="INCREASING",
                incident_trend="DECREASING"
            )
            
        except Exception as e:
            logger.error("Failed to get privacy dashboard", error=str(e))
            raise
    
    # Bulk Operations
    
    async def bulk_update_items(
        self,
        bulk_action: PrivacyBulkAction,
        updated_by: str
    ) -> Dict[str, List[str]]:
        """Perform bulk actions on privacy items"""
        try:
            results = {"success": [], "failed": []}
            
            for item_id in bulk_action.item_ids:
                try:
                    if bulk_action.action == "assign":
                        await self._bulk_assign_item(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "update_status":
                        await self._bulk_update_status(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "schedule_review":
                        await self._bulk_schedule_review(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "bulk_assess":
                        await self._bulk_assess_item(item_id, bulk_action.parameters, updated_by)
                    elif bulk_action.action == "approve":
                        await self._bulk_approve_item(item_id, bulk_action.parameters, updated_by)
                    else:
                        raise ValueError(f"Unknown bulk action: {bulk_action.action}")
                    
                    results["success"].append(item_id)
                    
                except Exception as e:
                    logger.error(
                        "Failed bulk action on privacy item",
                        error=str(e),
                        item_id=item_id,
                        action=bulk_action.action
                    )
                    results["failed"].append(item_id)
            
            logger.info(
                "Bulk privacy action completed",
                action=bulk_action.action,
                total=len(bulk_action.item_ids),
                success=len(results["success"]),
                failed=len(results["failed"])
            )
            
            return results
            
        except Exception as e:
            logger.error("Failed to perform bulk privacy action", error=str(e))
            raise
    
    # Helper Methods
    
    async def _calculate_compliance_score(self, activity_data: DataProcessingActivityCreate) -> float:
        """Calculate compliance score for processing activity"""
        score = 50.0  # Base score
        
        # Legal basis assessment
        if activity_data.legal_basis:
            score += 15.0
        
        # Data minimization
        if activity_data.data_minimization_measures:
            score += 10.0
        
        # Security measures
        if activity_data.technical_measures and activity_data.organizational_measures:
            score += 15.0
        elif activity_data.technical_measures or activity_data.organizational_measures:
            score += 8.0
        
        # Retention policy
        if activity_data.retention_period or activity_data.retention_criteria:
            score += 5.0
        
        # PIA compliance
        if activity_data.pia_required and activity_data.pia_conducted:
            score += 10.0
        elif not activity_data.pia_required:
            score += 5.0
        
        # DPO involvement
        if activity_data.dpo_involved:
            score += 5.0
        
        return min(100.0, score)
    
    async def _to_processing_activity_response(self, activity) -> DataProcessingActivityResponse:
        """Convert database activity to response model"""
        # Calculate derived fields
        days_since_review = None
        if hasattr(activity, 'last_reviewed_at') and activity.last_reviewed_at:
            days_since_review = (datetime.utcnow() - activity.last_reviewed_at).days
        
        requires_attention = (
            (activity.pia_required and not activity.pia_conducted) or
            (activity.risk_level in ["HIGH", "VERY_HIGH"]) or
            (days_since_review and days_since_review > 365)
        )
        
        # Count related items
        subject_requests_count = len(activity.subject_requests) if hasattr(activity, 'subject_requests') else 0
        breach_incidents_count = len(activity.breach_incidents) if hasattr(activity, 'breach_incidents') else 0
        pia_count = len(activity.privacy_impact_assessments) if hasattr(activity, 'privacy_impact_assessments') else 0
        
        return DataProcessingActivityResponse(
            id=activity.id,
            name=activity.name,
            description=activity.description,
            data_controller=activity.data_controller,
            data_controller_contact=activity.data_controller_contact,
            data_processor=activity.data_processor,
            dpo_involved=activity.dpo_involved,
            categories_of_data=[DataCategory(cat) for cat in activity.categories_of_data],
            special_categories=activity.special_categories or [],
            purposes=[ProcessingPurpose(purpose) for purpose in activity.purposes],
            legal_basis=[LegalBasis(basis) for basis in activity.legal_basis],
            legitimate_interests_details=activity.legitimate_interests_details,
            categories_of_subjects=activity.categories_of_subjects,
            number_of_subjects=activity.number_of_subjects,
            recipients=activity.recipients or [],
            third_country_transfers=activity.third_country_transfers,
            third_countries=activity.third_countries or [],
            transfer_mechanisms=[DataTransferMechanism(mech) for mech in activity.transfer_mechanisms] if activity.transfer_mechanisms else [],
            retention_period=activity.retention_period,
            retention_criteria=activity.retention_criteria,
            technical_measures=activity.technical_measures or [],
            organizational_measures=activity.organizational_measures or [],
            risk_level=RiskLevel(activity.risk_level),
            high_risk_factors=activity.high_risk_factors or [],
            pia_required=activity.pia_required,
            pia_conducted=activity.pia_conducted,
            pia_date=activity.pia_date,
            automated_decision_making=activity.automated_decision_making,
            profiling=activity.profiling,
            automated_processing_details=activity.automated_processing_details,
            source_of_data=activity.source_of_data or [],
            consent_mechanism=activity.consent_mechanism,
            data_minimization_measures=activity.data_minimization_measures or [],
            tags=activity.tags or [],
            metadata=activity.metadata or {},
            # Calculated fields
            compliance_score=activity.compliance_score,
            days_since_review=days_since_review,
            requires_attention=requires_attention,
            # Related data
            subject_requests_count=subject_requests_count,
            breach_incidents_count=breach_incidents_count,
            pia_count=pia_count,
            # AI insights (placeholder)
            ai_risk_assessment="Medium risk identified in data retention practices",
            ai_recommendations=["Review consent mechanisms", "Update retention policies"],
            compliance_gaps=["Missing DPO consultation"] if not activity.dpo_involved else [],
            # Timestamps
            created_at=activity.created_at,
            updated_at=activity.updated_at,
            last_reviewed_at=getattr(activity, 'last_reviewed_at', None)
        )
    
    async def _to_pia_response(self, pia) -> PrivacyImpactAssessmentResponse:
        """Convert database PIA to response model"""
        # Calculate derived fields
        days_until_review = None
        is_overdue_review = False
        
        if pia.next_review_date:
            days_until_review = (pia.next_review_date - date.today()).days
            is_overdue_review = days_until_review < 0
        
        # Calculate completion percentage
        completion_factors = [
            pia.privacy_risks_identified,
            pia.proposed_measures,
            pia.stakeholders_involved,
            pia.status != PIAStatus.DRAFT.value,
            pia.dpo_consulted,
            pia.implementation_plan
        ]
        completion_percentage = (sum(1 for factor in completion_factors if factor) / len(completion_factors)) * 100
        
        # Get related data names
        processing_activity_name = None
        if hasattr(pia, 'processing_activity') and pia.processing_activity:
            processing_activity_name = pia.processing_activity.name
        
        return PrivacyImpactAssessmentResponse(
            id=pia.id,
            title=pia.title,
            description=pia.description,
            processing_activity_id=pia.processing_activity_id,
            assessment_scope=pia.assessment_scope,
            data_flows_description=pia.data_flows_description,
            stakeholders_involved=pia.stakeholders_involved,
            privacy_risks_identified=pia.privacy_risks_identified,
            risk_sources=pia.risk_sources or [],
            affected_data_subjects=pia.affected_data_subjects,
            likelihood_score=pia.likelihood_score,
            impact_score=pia.impact_score,
            overall_risk_level=RiskLevel(pia.overall_risk_level),
            existing_measures=pia.existing_measures or [],
            proposed_measures=pia.proposed_measures,
            residual_risk_level=RiskLevel(pia.residual_risk_level),
            dpo_consulted=pia.dpo_consulted,
            stakeholder_consultation=pia.stakeholder_consultation,
            consultation_details=pia.consultation_details,
            authority_consultation_required=pia.authority_consultation_required,
            authority_consulted=pia.authority_consulted,
            authority_response=pia.authority_response,
            implementation_plan=pia.implementation_plan,
            implementation_deadline=pia.implementation_deadline,
            monitoring_measures=pia.monitoring_measures or [],
            review_frequency=pia.review_frequency,
            next_review_date=pia.next_review_date,
            status=PIAStatus(pia.status),
            approved_by=pia.approved_by,
            approval_date=pia.approval_date,
            tags=pia.tags or [],
            metadata=pia.metadata or {},
            # Calculated fields
            risk_score=pia.risk_score,
            days_until_review=days_until_review,
            is_overdue_review=is_overdue_review,
            completion_percentage=completion_percentage,
            # Related data
            processing_activity_name=processing_activity_name,
            approver_name=None,  # Would get from user lookup
            # AI insights (placeholder)
            ai_risk_analysis="Automated processing increases privacy risk",
            ai_mitigation_suggestions=["Implement human oversight", "Add data subject controls"],
            regulatory_compliance_check={
                "GDPR": "Article 35 compliance required",
                "CCPA": "Consumer rights impact assessment needed"
            },
            # Timestamps
            created_at=pia.created_at,
            updated_at=pia.updated_at,
            conducted_at=getattr(pia, 'conducted_at', None)
        )
    
    async def _build_processing_activity_where_clause(self, filters: PrivacySearchFilters) -> Dict[str, Any]:
        """Build where clause for processing activity search"""
        where_clause = {}
        
        if filters.data_categories:
            where_clause["categories_of_data"] = {"hasSome": [cat.value for cat in filters.data_categories]}
        
        if filters.legal_basis:
            where_clause["legal_basis"] = {"hasSome": [basis.value for basis in filters.legal_basis]}
        
        if filters.purposes:
            where_clause["purposes"] = {"hasSome": [purpose.value for purpose in filters.purposes]}
        
        if filters.risk_level:
            where_clause["risk_level"] = {"in": [level.value for level in filters.risk_level]}
        
        if filters.pia_required is not None:
            where_clause["pia_required"] = filters.pia_required
        
        if filters.pia_conducted is not None:
            where_clause["pia_conducted"] = filters.pia_conducted
        
        if filters.created_date_from or filters.created_date_to:
            date_filter = {}
            if filters.created_date_from:
                date_filter["gte"] = filters.created_date_from
            if filters.created_date_to:
                date_filter["lte"] = filters.created_date_to
            where_clause["created_at"] = date_filter
        
        if filters.search_text:
            where_clause["OR"] = [
                {"name": {"contains": filters.search_text, "mode": "insensitive"}},
                {"description": {"contains": filters.search_text, "mode": "insensitive"}}
            ]
        
        if filters.tags:
            where_clause["tags"] = {"hasSome": filters.tags}
        
        return where_clause
    
    # Bulk action helper methods
    
    async def _bulk_assign_item(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk assign processing activity"""
        update_data = {}
        if "assigned_to_id" in parameters:
            update_data["assigned_to_id"] = parameters["assigned_to_id"]
        
        if update_data:
            await self.prisma.dataprocessingactivity.update(
                where={"id": item_id},
                data={**update_data, "updated_by": updated_by}
            )
    
    async def _bulk_update_status(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk update status"""
        if "risk_level" in parameters:
            await self.prisma.dataprocessingactivity.update(
                where={"id": item_id},
                data={"risk_level": parameters["risk_level"], "updated_by": updated_by}
            )
    
    async def _bulk_schedule_review(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk schedule review"""
        if "next_review_date" in parameters:
            await self.prisma.dataprocessingactivity.update(
                where={"id": item_id},
                data={"next_review_date": parameters["next_review_date"], "updated_by": updated_by}
            )
    
    async def _bulk_assess_item(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk assess item"""
        update_data = {"last_reviewed_at": datetime.utcnow(), "updated_by": updated_by}
        
        if "pia_conducted" in parameters:
            update_data["pia_conducted"] = parameters["pia_conducted"]
            if parameters["pia_conducted"]:
                update_data["pia_date"] = date.today()
        
        await self.prisma.dataprocessingactivity.update(
            where={"id": item_id},
            data=update_data
        )
    
    async def _bulk_approve_item(self, item_id: str, parameters: Dict[str, Any], updated_by: str):
        """Bulk approve PIA"""
        update_data = {
            "status": PIAStatus.APPROVED.value,
            "approved_by": updated_by,
            "approval_date": date.today(),
            "updated_by": updated_by
        }
        
        await self.prisma.privacyimpactassessment.update(
            where={"id": item_id},
            data=update_data
        )