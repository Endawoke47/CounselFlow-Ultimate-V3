"""
CounselFlow Ultimate V3 - Data Privacy & PIA Schemas
Enterprise Privacy Impact Assessment and Data Protection Management
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from enum import Enum
from decimal import Decimal


class DataCategory(str, Enum):
    PERSONAL_DATA = "PERSONAL_DATA"
    SENSITIVE_DATA = "SENSITIVE_DATA"
    SPECIAL_CATEGORY = "SPECIAL_CATEGORY"
    BIOMETRIC_DATA = "BIOMETRIC_DATA"
    HEALTH_DATA = "HEALTH_DATA"
    FINANCIAL_DATA = "FINANCIAL_DATA"
    LOCATION_DATA = "LOCATION_DATA"
    BEHAVIORAL_DATA = "BEHAVIORAL_DATA"
    COMMUNICATION_DATA = "COMMUNICATION_DATA"
    IDENTIFICATION_DATA = "IDENTIFICATION_DATA"
    EMPLOYMENT_DATA = "EMPLOYMENT_DATA"
    CRIMINAL_DATA = "CRIMINAL_DATA"


class LegalBasis(str, Enum):
    CONSENT = "CONSENT"
    CONTRACT = "CONTRACT"
    LEGAL_OBLIGATION = "LEGAL_OBLIGATION"
    VITAL_INTERESTS = "VITAL_INTERESTS"
    PUBLIC_TASK = "PUBLIC_TASK"
    LEGITIMATE_INTERESTS = "LEGITIMATE_INTERESTS"
    EXPLICIT_CONSENT = "EXPLICIT_CONSENT"  # For special category data
    EMPLOYMENT_LAW = "EMPLOYMENT_LAW"
    SUBSTANTIAL_PUBLIC_INTEREST = "SUBSTANTIAL_PUBLIC_INTEREST"


class ProcessingPurpose(str, Enum):
    CUSTOMER_SERVICE = "CUSTOMER_SERVICE"
    MARKETING = "MARKETING"
    ANALYTICS = "ANALYTICS"
    LEGAL_COMPLIANCE = "LEGAL_COMPLIANCE"
    SECURITY = "SECURITY"
    EMPLOYMENT_MANAGEMENT = "EMPLOYMENT_MANAGEMENT"
    PRODUCT_DELIVERY = "PRODUCT_DELIVERY"
    PAYMENT_PROCESSING = "PAYMENT_PROCESSING"
    FRAUD_PREVENTION = "FRAUD_PREVENTION"
    RESEARCH = "RESEARCH"
    PROFILING = "PROFILING"
    AUTOMATED_DECISION_MAKING = "AUTOMATED_DECISION_MAKING"


class DataTransferMechanism(str, Enum):
    ADEQUACY_DECISION = "ADEQUACY_DECISION"
    STANDARD_CONTRACTUAL_CLAUSES = "STANDARD_CONTRACTUAL_CLAUSES"
    BINDING_CORPORATE_RULES = "BINDING_CORPORATE_RULES"
    CERTIFICATION = "CERTIFICATION"
    CODE_OF_CONDUCT = "CODE_OF_CONDUCT"
    DEROGATIONS = "DEROGATIONS"
    NO_TRANSFER = "NO_TRANSFER"


class PIAStatus(str, Enum):
    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REQUIRES_REVISION = "REQUIRES_REVISION"
    DPO_REVIEW = "DPO_REVIEW"
    AUTHORITY_CONSULTATION = "AUTHORITY_CONSULTATION"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


class SubjectRightType(str, Enum):
    ACCESS = "ACCESS"
    RECTIFICATION = "RECTIFICATION"
    ERASURE = "ERASURE"
    RESTRICTION = "RESTRICTION"
    PORTABILITY = "PORTABILITY"
    OBJECTION = "OBJECTION"
    AUTOMATED_DECISION_OBJECTION = "AUTOMATED_DECISION_OBJECTION"
    WITHDRAW_CONSENT = "WITHDRAW_CONSENT"


class RequestStatus(str, Enum):
    RECEIVED = "RECEIVED"
    UNDER_REVIEW = "UNDER_REVIEW"
    INFORMATION_REQUESTED = "INFORMATION_REQUESTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    REJECTED = "REJECTED"
    PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED"
    EXTENDED = "EXTENDED"


class BreachType(str, Enum):
    CONFIDENTIALITY_BREACH = "CONFIDENTIALITY_BREACH"
    INTEGRITY_BREACH = "INTEGRITY_BREACH"
    AVAILABILITY_BREACH = "AVAILABILITY_BREACH"
    COMBINED_BREACH = "COMBINED_BREACH"


class BreachSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class BreachStatus(str, Enum):
    DETECTED = "DETECTED"
    INVESTIGATING = "INVESTIGATING"
    CONTAINED = "CONTAINED"
    AUTHORITY_NOTIFIED = "AUTHORITY_NOTIFIED"
    SUBJECTS_NOTIFIED = "SUBJECTS_NOTIFIED"
    REMEDIATED = "REMEDIATED"
    CLOSED = "CLOSED"


class DataProcessingActivityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    # Controller and processor information
    data_controller: str = Field(..., max_length=255)
    data_controller_contact: Optional[str] = Field(None, max_length=255)
    data_processor: Optional[str] = Field(None, max_length=255)
    dpo_involved: bool = False
    
    # Processing details
    categories_of_data: List[DataCategory]
    special_categories: Optional[List[str]] = Field(default_factory=list)
    purposes: List[ProcessingPurpose]
    legal_basis: List[LegalBasis]
    legitimate_interests_details: Optional[str] = Field(None, max_length=1000)
    
    # Data subjects
    categories_of_subjects: List[str] = Field(..., min_items=1)
    number_of_subjects: Optional[int] = Field(None, ge=0)
    
    # Recipients and transfers
    recipients: Optional[List[str]] = Field(default_factory=list)
    third_country_transfers: bool = False
    third_countries: Optional[List[str]] = Field(default_factory=list)
    transfer_mechanisms: Optional[List[DataTransferMechanism]] = Field(default_factory=list)
    
    # Retention and security
    retention_period: Optional[str] = Field(None, max_length=255)
    retention_criteria: Optional[str] = Field(None, max_length=1000)
    technical_measures: Optional[List[str]] = Field(default_factory=list)
    organizational_measures: Optional[List[str]] = Field(default_factory=list)
    
    # Risk assessment
    risk_level: RiskLevel = RiskLevel.LOW
    high_risk_factors: Optional[List[str]] = Field(default_factory=list)
    
    # PIA requirement
    pia_required: bool = False
    pia_conducted: bool = False
    pia_date: Optional[date] = None
    
    # Automated processing
    automated_decision_making: bool = False
    profiling: bool = False
    automated_processing_details: Optional[str] = Field(None, max_length=1000)
    
    # Compliance
    source_of_data: Optional[List[str]] = Field(default_factory=list)
    consent_mechanism: Optional[str] = Field(None, max_length=500)
    data_minimization_measures: Optional[List[str]] = Field(default_factory=list)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class DataProcessingActivityCreate(DataProcessingActivityBase):
    pass


class DataProcessingActivityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    data_controller: Optional[str] = Field(None, max_length=255)
    data_controller_contact: Optional[str] = Field(None, max_length=255)
    data_processor: Optional[str] = Field(None, max_length=255)
    dpo_involved: Optional[bool] = None
    
    categories_of_data: Optional[List[DataCategory]] = None
    special_categories: Optional[List[str]] = None
    purposes: Optional[List[ProcessingPurpose]] = None
    legal_basis: Optional[List[LegalBasis]] = None
    legitimate_interests_details: Optional[str] = Field(None, max_length=1000)
    
    categories_of_subjects: Optional[List[str]] = None
    number_of_subjects: Optional[int] = Field(None, ge=0)
    
    recipients: Optional[List[str]] = None
    third_country_transfers: Optional[bool] = None
    third_countries: Optional[List[str]] = None
    transfer_mechanisms: Optional[List[DataTransferMechanism]] = None
    
    retention_period: Optional[str] = Field(None, max_length=255)
    retention_criteria: Optional[str] = Field(None, max_length=1000)
    technical_measures: Optional[List[str]] = None
    organizational_measures: Optional[List[str]] = None
    
    risk_level: Optional[RiskLevel] = None
    high_risk_factors: Optional[List[str]] = None
    
    pia_required: Optional[bool] = None
    pia_conducted: Optional[bool] = None
    pia_date: Optional[date] = None
    
    automated_decision_making: Optional[bool] = None
    profiling: Optional[bool] = None
    automated_processing_details: Optional[str] = Field(None, max_length=1000)
    
    source_of_data: Optional[List[str]] = None
    consent_mechanism: Optional[str] = Field(None, max_length=500)
    data_minimization_measures: Optional[List[str]] = None
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class DataProcessingActivityResponse(DataProcessingActivityBase):
    id: str
    
    # Calculated fields
    compliance_score: Optional[float] = Field(None, ge=0, le=100)
    days_since_review: Optional[int] = None
    requires_attention: bool = False
    
    # Related data counts
    subject_requests_count: int = 0
    breach_incidents_count: int = 0
    pia_count: int = 0
    
    # AI insights
    ai_risk_assessment: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    compliance_gaps: Optional[List[str]] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_reviewed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class PrivacyImpactAssessmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    # Associated processing activity
    processing_activity_id: Optional[str] = None
    
    # Assessment details
    assessment_scope: str = Field(..., max_length=1000)
    data_flows_description: str = Field(..., max_length=2000)
    stakeholders_involved: List[str] = Field(..., min_items=1)
    
    # Risk identification
    privacy_risks_identified: List[str] = Field(..., min_items=1)
    risk_sources: List[str] = Field(default_factory=list)
    affected_data_subjects: List[str] = Field(..., min_items=1)
    
    # Risk assessment
    likelihood_score: int = Field(..., ge=1, le=5)
    impact_score: int = Field(..., ge=1, le=5)
    overall_risk_level: RiskLevel
    
    # Mitigation measures
    existing_measures: List[str] = Field(default_factory=list)
    proposed_measures: List[str] = Field(..., min_items=1)
    residual_risk_level: RiskLevel
    
    # Consultation and review
    dpo_consulted: bool = False
    stakeholder_consultation: bool = False
    consultation_details: Optional[str] = Field(None, max_length=1000)
    
    # Authority consultation
    authority_consultation_required: bool = False
    authority_consulted: bool = False
    authority_response: Optional[str] = Field(None, max_length=1000)
    
    # Implementation
    implementation_plan: Optional[str] = Field(None, max_length=2000)
    implementation_deadline: Optional[date] = None
    monitoring_measures: Optional[List[str]] = Field(default_factory=list)
    
    # Review and updates
    review_frequency: str = Field(default="ANNUAL", max_length=50)
    next_review_date: Optional[date] = None
    
    # Status and approvals
    status: PIAStatus = PIAStatus.DRAFT
    approved_by: Optional[str] = None
    approval_date: Optional[date] = None
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator('overall_risk_level', always=True)
    def calculate_overall_risk(cls, v, values):
        if 'likelihood_score' in values and 'impact_score' in values:
            risk_score = values['likelihood_score'] * values['impact_score']
            if risk_score >= 20:
                return RiskLevel.VERY_HIGH
            elif risk_score >= 15:
                return RiskLevel.HIGH
            elif risk_score >= 9:
                return RiskLevel.MEDIUM
            else:
                return RiskLevel.LOW
        return v


class PrivacyImpactAssessmentCreate(PrivacyImpactAssessmentBase):
    pass


class PrivacyImpactAssessmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    processing_activity_id: Optional[str] = None
    
    assessment_scope: Optional[str] = Field(None, max_length=1000)
    data_flows_description: Optional[str] = Field(None, max_length=2000)
    stakeholders_involved: Optional[List[str]] = None
    
    privacy_risks_identified: Optional[List[str]] = None
    risk_sources: Optional[List[str]] = None
    affected_data_subjects: Optional[List[str]] = None
    
    likelihood_score: Optional[int] = Field(None, ge=1, le=5)
    impact_score: Optional[int] = Field(None, ge=1, le=5)
    
    existing_measures: Optional[List[str]] = None
    proposed_measures: Optional[List[str]] = None
    residual_risk_level: Optional[RiskLevel] = None
    
    dpo_consulted: Optional[bool] = None
    stakeholder_consultation: Optional[bool] = None
    consultation_details: Optional[str] = Field(None, max_length=1000)
    
    authority_consultation_required: Optional[bool] = None
    authority_consulted: Optional[bool] = None
    authority_response: Optional[str] = Field(None, max_length=1000)
    
    implementation_plan: Optional[str] = Field(None, max_length=2000)
    implementation_deadline: Optional[date] = None
    monitoring_measures: Optional[List[str]] = None
    
    review_frequency: Optional[str] = Field(None, max_length=50)
    next_review_date: Optional[date] = None
    
    status: Optional[PIAStatus] = None
    approved_by: Optional[str] = None
    approval_date: Optional[date] = None
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class PrivacyImpactAssessmentResponse(PrivacyImpactAssessmentBase):
    id: str
    
    # Calculated fields
    risk_score: Optional[float] = None
    days_until_review: Optional[int] = None
    is_overdue_review: bool = False
    completion_percentage: Optional[float] = Field(None, ge=0, le=100)
    
    # Related data
    processing_activity_name: Optional[str] = None
    approver_name: Optional[str] = None
    
    # AI insights
    ai_risk_analysis: Optional[str] = None
    ai_mitigation_suggestions: Optional[List[str]] = None
    regulatory_compliance_check: Optional[Dict[str, str]] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    conducted_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DataSubjectRequest(BaseModel):
    id: Optional[str] = None
    
    # Request details
    request_type: SubjectRightType
    subject_name: str = Field(..., max_length=255)
    subject_email: Optional[str] = Field(None, max_length=255)
    subject_identifier: Optional[str] = Field(None, max_length=100)
    
    # Request specifics
    request_description: str = Field(..., max_length=2000)
    data_categories_requested: Optional[List[DataCategory]] = Field(default_factory=list)
    specific_data_requested: Optional[str] = Field(None, max_length=1000)
    
    # Processing details
    status: RequestStatus = RequestStatus.RECEIVED
    priority: str = Field(default="NORMAL", max_length=20)
    assigned_to_id: Optional[str] = None
    
    # Timeline
    received_date: date = Field(default_factory=date.today)
    due_date: Optional[date] = None
    extended_due_date: Optional[date] = None
    completed_date: Optional[date] = None
    
    # Response
    response_method: Optional[str] = Field(None, max_length=100)
    response_details: Optional[str] = Field(None, max_length=2000)
    rejection_reason: Optional[str] = Field(None, max_length=1000)
    
    # Verification
    identity_verified: bool = False
    verification_method: Optional[str] = Field(None, max_length=255)
    verification_documents: Optional[List[str]] = Field(default_factory=list)
    
    # Processing activities affected
    processing_activities_affected: Optional[List[str]] = Field(default_factory=list)
    systems_searched: Optional[List[str]] = Field(default_factory=list)
    
    # Fees and complexity
    fee_charged: Optional[Decimal] = Field(None, ge=0)
    complexity_level: str = Field(default="SIMPLE", max_length=20)
    
    # Communication
    communication_log: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    @validator('due_date', always=True)
    def calculate_due_date(cls, v, values):
        if v is None and 'received_date' in values:
            # Default to 30 days from received date
            return values['received_date'] + timedelta(days=30)
        return v
    
    class Config:
        from_attributes = True


class DataBreachIncident(BaseModel):
    id: Optional[str] = None
    
    # Incident details
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=2000)
    breach_type: BreachType
    severity: BreachSeverity
    status: BreachStatus = BreachStatus.DETECTED
    
    # Discovery and timeline
    discovered_date: datetime
    occurred_date: Optional[datetime] = None
    contained_date: Optional[datetime] = None
    resolution_date: Optional[datetime] = None
    
    # Affected data
    categories_affected: List[DataCategory]
    estimated_records_affected: Optional[int] = Field(None, ge=0)
    confirmed_records_affected: Optional[int] = Field(None, ge=0)
    special_categories_affected: Optional[List[str]] = Field(default_factory=list)
    
    # Data subjects affected
    subject_categories_affected: List[str] = Field(..., min_items=1)
    geographical_scope: Optional[List[str]] = Field(default_factory=list)
    vulnerable_subjects_affected: bool = False
    
    # Cause and impact
    root_cause: Optional[str] = Field(None, max_length=1000)
    contributing_factors: Optional[List[str]] = Field(default_factory=list)
    likelihood_of_harm: RiskLevel
    impact_assessment: Optional[str] = Field(None, max_length=2000)
    
    # Notification requirements
    authority_notification_required: bool = False
    authority_notified: bool = False
    authority_notification_date: Optional[datetime] = None
    authority_reference: Optional[str] = Field(None, max_length=100)
    
    subject_notification_required: bool = False
    subjects_notified: bool = False
    subject_notification_date: Optional[datetime] = None
    notification_method: Optional[str] = Field(None, max_length=255)
    
    # Response actions
    immediate_actions: List[str] = Field(default_factory=list)
    containment_measures: List[str] = Field(default_factory=list)
    recovery_actions: List[str] = Field(default_factory=list)
    preventive_measures: List[str] = Field(default_factory=list)
    
    # Investigation
    investigation_findings: Optional[str] = Field(None, max_length=2000)
    lessons_learned: Optional[str] = Field(None, max_length=1000)
    
    # Responsible parties
    incident_manager_id: Optional[str] = None
    dpo_notified: bool = False
    legal_counsel_involved: bool = False
    external_experts_engaged: bool = False
    
    # Financial impact
    estimated_cost: Optional[Decimal] = Field(None, ge=0)
    actual_cost: Optional[Decimal] = Field(None, ge=0)
    regulatory_fines: Optional[Decimal] = Field(None, ge=0)
    
    # Processing activities affected
    processing_activities_affected: Optional[List[str]] = Field(default_factory=list)
    systems_affected: Optional[List[str]] = Field(default_factory=list)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class PrivacyMetrics(BaseModel):
    """Privacy and data protection metrics"""
    
    # Processing activity metrics
    total_processing_activities: int
    high_risk_activities: int
    activities_requiring_pia: int
    activities_with_pia: int
    pia_completion_rate: float
    
    # Activities by category
    activities_by_legal_basis: Dict[str, int]
    activities_by_purpose: Dict[str, int]
    activities_by_risk_level: Dict[str, int]
    
    # PIA metrics
    total_pias: int
    pias_by_status: Dict[str, int]
    overdue_pia_reviews: int
    average_pia_completion_days: float
    
    # Data subject requests
    total_subject_requests: int
    requests_by_type: Dict[str, int]
    requests_by_status: Dict[str, int]
    average_response_time_days: float
    requests_this_month: int
    overdue_requests: int
    
    # Breach incidents
    total_breaches: int
    breaches_by_severity: Dict[str, int]
    breaches_by_type: Dict[str, int]
    open_breaches: int
    breaches_this_quarter: int
    average_containment_time_hours: float
    
    # Notifications
    authority_notifications_sent: int
    subject_notifications_sent: int
    notification_compliance_rate: float
    
    # Financial impact
    total_breach_costs: Decimal
    regulatory_fines_paid: Decimal
    privacy_program_costs: Decimal
    compliance_investment: Decimal
    
    # Compliance metrics
    overall_privacy_score: float
    gdpr_compliance_score: float
    ccpa_compliance_score: float
    data_minimization_score: float
    consent_management_score: float
    
    # Trends
    privacy_risk_trend: str  # "INCREASING", "DECREASING", "STABLE"
    request_volume_trend: str
    breach_frequency_trend: str
    
    # Recommendations
    high_priority_actions: List[str]
    compliance_gaps: List[str]
    emerging_privacy_risks: List[str]
    recommended_improvements: List[str]
    
    class Config:
        from_attributes = True


class PrivacyDashboard(BaseModel):
    """Executive privacy dashboard summary"""
    
    # Overall health
    privacy_health_score: float = Field(..., ge=0, le=100)
    privacy_maturity_level: str  # "BASIC", "DEVELOPING", "MANAGED", "ADVANCED", "OPTIMIZED"
    
    # Key alerts
    critical_breaches: int
    overdue_subject_requests: int
    missing_pias: int
    high_risk_activities: int
    
    # Regulatory status
    gdpr_compliance_status: str
    ccpa_compliance_status: str
    pending_authority_responses: int
    
    # Recent activity
    new_processing_activities: int
    completed_pias: int
    resolved_subject_requests: int
    contained_breaches: int
    
    # Urgent actions
    urgent_notifications_due: List[Dict[str, Any]]
    overdue_reviews: List[Dict[str, Any]]
    escalated_incidents: List[Dict[str, Any]]
    
    # Upcoming deadlines
    upcoming_pia_reviews: List[Dict[str, Any]]
    subject_request_deadlines: List[Dict[str, Any]]
    
    # Trends
    privacy_score_trend: str  # "IMPROVING", "DECLINING", "STABLE"
    request_volume_trend: str
    incident_trend: str
    
    class Config:
        from_attributes = True


class PrivacySearchFilters(BaseModel):
    """Filters for privacy data search"""
    
    # Processing activity filters
    data_categories: Optional[List[DataCategory]] = None
    legal_basis: Optional[List[LegalBasis]] = None
    purposes: Optional[List[ProcessingPurpose]] = None
    risk_level: Optional[List[RiskLevel]] = None
    pia_required: Optional[bool] = None
    pia_conducted: Optional[bool] = None
    
    # PIA filters
    pia_status: Optional[List[PIAStatus]] = None
    authority_consultation_required: Optional[bool] = None
    
    # Subject request filters
    request_type: Optional[List[SubjectRightType]] = None
    request_status: Optional[List[RequestStatus]] = None
    
    # Breach filters
    breach_type: Optional[List[BreachType]] = None
    breach_severity: Optional[List[BreachSeverity]] = None
    breach_status: Optional[List[BreachStatus]] = None
    
    # Date filters
    created_date_from: Optional[date] = None
    created_date_to: Optional[date] = None
    due_date_from: Optional[date] = None
    due_date_to: Optional[date] = None
    
    # Status filters
    overdue_only: Optional[bool] = None
    requires_attention: Optional[bool] = None
    high_priority_only: Optional[bool] = None
    
    # Text search
    search_text: Optional[str] = None
    tags: Optional[List[str]] = None


class PrivacyBulkAction(BaseModel):
    item_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., description="Action: 'assign', 'update_status', 'schedule_review', 'bulk_assess', 'approve'")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class PrivacyReportRequest(BaseModel):
    """Request for privacy reporting"""
    report_type: str = Field(..., description="Type: 'processing_register', 'pia_summary', 'subject_requests', 'breach_register'")
    include_high_risk_only: bool = False
    include_pending_items: bool = True
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None
    format: str = Field(default="PDF", description="Output format: PDF, EXCEL, CSV")
    
    class Config:
        from_attributes = True