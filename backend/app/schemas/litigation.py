"""
CounselFlow Ultimate V3 - Dispute Resolution & Litigation Schemas
Enterprise litigation and dispute management with AI-powered strategy analysis
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from enum import Enum
from decimal import Decimal


class DisputeType(str, Enum):
    CONTRACT_DISPUTE = "CONTRACT_DISPUTE"
    EMPLOYMENT_DISPUTE = "EMPLOYMENT_DISPUTE"
    INTELLECTUAL_PROPERTY = "INTELLECTUAL_PROPERTY"
    COMMERCIAL_LITIGATION = "COMMERCIAL_LITIGATION"
    PERSONAL_INJURY = "PERSONAL_INJURY"
    PRODUCT_LIABILITY = "PRODUCT_LIABILITY"
    SECURITIES_LITIGATION = "SECURITIES_LITIGATION"
    ENVIRONMENTAL_LAW = "ENVIRONMENTAL_LAW"
    REGULATORY_ENFORCEMENT = "REGULATORY_ENFORCEMENT"
    BANKRUPTCY = "BANKRUPTCY"
    REAL_ESTATE = "REAL_ESTATE"
    TAX_DISPUTE = "TAX_DISPUTE"
    FAMILY_LAW = "FAMILY_LAW"
    CRIMINAL_DEFENSE = "CRIMINAL_DEFENSE"
    ANTITRUST = "ANTITRUST"
    CLASS_ACTION = "CLASS_ACTION"


class LitigationStage(str, Enum):
    PRE_LITIGATION = "PRE_LITIGATION"
    PLEADINGS = "PLEADINGS"
    DISCOVERY = "DISCOVERY"
    MOTION_PRACTICE = "MOTION_PRACTICE"
    MEDIATION = "MEDIATION"
    ARBITRATION = "ARBITRATION"
    TRIAL_PREPARATION = "TRIAL_PREPARATION"
    TRIAL = "TRIAL"
    POST_TRIAL = "POST_TRIAL"
    APPEAL = "APPEAL"
    SETTLEMENT = "SETTLEMENT"
    CLOSED = "CLOSED"


class CaseStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    ON_HOLD = "ON_HOLD"
    SETTLED = "SETTLED"
    DISMISSED = "DISMISSED"
    JUDGMENT_ENTERED = "JUDGMENT_ENTERED"
    APPEAL_PENDING = "APPEAL_PENDING"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"


class LitigationRole(str, Enum):
    PLAINTIFF = "PLAINTIFF"
    DEFENDANT = "DEFENDANT"
    INTERVENOR = "INTERVENOR"
    THIRD_PARTY_DEFENDANT = "THIRD_PARTY_DEFENDANT"
    COUNTERCLAIM_PLAINTIFF = "COUNTERCLAIM_PLAINTIFF"
    CROSS_CLAIM_DEFENDANT = "CROSS_CLAIM_DEFENDANT"


class DiscoveryType(str, Enum):
    INTERROGATORIES = "INTERROGATORIES"
    DOCUMENT_PRODUCTION = "DOCUMENT_PRODUCTION"
    DEPOSITIONS = "DEPOSITIONS"
    REQUESTS_FOR_ADMISSION = "REQUESTS_FOR_ADMISSION"
    EXPERT_DISCOVERY = "EXPERT_DISCOVERY"
    E_DISCOVERY = "E_DISCOVERY"
    SITE_INSPECTION = "SITE_INSPECTION"
    MEDICAL_EXAMINATION = "MEDICAL_EXAMINATION"


class DiscoveryStatus(str, Enum):
    PENDING = "PENDING"
    SERVED = "SERVED"
    RESPONSES_DUE = "RESPONSES_DUE"
    RESPONSES_RECEIVED = "RESPONSES_RECEIVED"
    OBJECTIONS_PENDING = "OBJECTIONS_PENDING"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"
    WITHDRAWN = "WITHDRAWN"


class MotionType(str, Enum):
    MOTION_TO_DISMISS = "MOTION_TO_DISMISS"
    SUMMARY_JUDGMENT = "SUMMARY_JUDGMENT"
    PRELIMINARY_INJUNCTION = "PRELIMINARY_INJUNCTION"
    TEMPORARY_RESTRAINING_ORDER = "TEMPORARY_RESTRAINING_ORDER"
    MOTION_TO_COMPEL = "MOTION_TO_COMPEL"
    MOTION_IN_LIMINE = "MOTION_IN_LIMINE"
    MOTION_FOR_SANCTIONS = "MOTION_FOR_SANCTIONS"
    MOTION_TO_AMEND = "MOTION_TO_AMEND"
    MOTION_TO_STRIKE = "MOTION_TO_STRIKE"
    MOTION_FOR_PROTECTIVE_ORDER = "MOTION_FOR_PROTECTIVE_ORDER"
    MOTION_FOR_JUDGMENT = "MOTION_FOR_JUDGMENT"
    MOTION_FOR_NEW_TRIAL = "MOTION_FOR_NEW_TRIAL"


class MotionStatus(str, Enum):
    DRAFT = "DRAFT"
    FILED = "FILED"
    SERVED = "SERVED"
    RESPONSE_DUE = "RESPONSE_DUE"
    BRIEFING_COMPLETE = "BRIEFING_COMPLETE"
    HEARING_SCHEDULED = "HEARING_SCHEDULED"
    UNDER_ADVISEMENT = "UNDER_ADVISEMENT"
    GRANTED = "GRANTED"
    DENIED = "DENIED"
    GRANTED_IN_PART = "GRANTED_IN_PART"
    WITHDRAWN = "WITHDRAWN"


class SettlementStatus(str, Enum):
    NOT_PURSUED = "NOT_PURSUED"
    EARLY_DISCUSSIONS = "EARLY_DISCUSSIONS"
    FORMAL_NEGOTIATIONS = "FORMAL_NEGOTIATIONS"
    MEDIATION_SCHEDULED = "MEDIATION_SCHEDULED"
    ARBITRATION_SCHEDULED = "ARBITRATION_SCHEDULED"
    SETTLEMENT_REACHED = "SETTLEMENT_REACHED"
    SETTLEMENT_EXECUTED = "SETTLEMENT_EXECUTED"
    NEGOTIATIONS_FAILED = "NEGOTIATIONS_FAILED"


class ExpertWitnessType(str, Enum):
    TECHNICAL_EXPERT = "TECHNICAL_EXPERT"
    ECONOMIC_DAMAGES = "ECONOMIC_DAMAGES"
    MEDICAL_EXPERT = "MEDICAL_EXPERT"
    FINANCIAL_EXPERT = "FINANCIAL_EXPERT"
    INDUSTRY_EXPERT = "INDUSTRY_EXPERT"
    VALUATION_EXPERT = "VALUATION_EXPERT"
    PATENT_EXPERT = "PATENT_EXPERT"
    CONSTRUCTION_EXPERT = "CONSTRUCTION_EXPERT"
    COMPUTER_FORENSICS = "COMPUTER_FORENSICS"
    ACCIDENT_RECONSTRUCTION = "ACCIDENT_RECONSTRUCTION"
    REGULATORY_EXPERT = "REGULATORY_EXPERT"
    REBUTTAL_EXPERT = "REBUTTAL_EXPERT"


class LitigationCaseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    case_number: Optional[str] = Field(None, max_length=100)
    
    # Case classification
    dispute_type: DisputeType
    litigation_stage: LitigationStage = LitigationStage.PRE_LITIGATION
    status: CaseStatus = CaseStatus.ACTIVE
    
    # Court information
    court_name: Optional[str] = Field(None, max_length=255)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    judge_name: Optional[str] = Field(None, max_length=255)
    docket_number: Optional[str] = Field(None, max_length=100)
    
    # Case details
    description: Optional[str] = Field(None, max_length=2000)
    claims: List[str] = Field(default_factory=list)
    defenses: List[str] = Field(default_factory=list)
    legal_theories: List[str] = Field(default_factory=list)
    
    # Parties
    our_role: LitigationRole
    opposing_parties: List[str] = Field(..., min_items=1)
    opposing_counsel: List[str] = Field(default_factory=list)
    
    # Financial aspects
    amount_in_controversy: Optional[Decimal] = Field(None, ge=0)
    estimated_damages: Optional[Decimal] = Field(None, ge=0)
    litigation_budget: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    
    # Timeline
    filed_date: Optional[date] = None
    answer_due_date: Optional[date] = None
    discovery_cutoff: Optional[date] = None
    motion_cutoff: Optional[date] = None
    trial_date: Optional[date] = None
    statute_of_limitations: Optional[date] = None
    
    # Settlement
    settlement_status: SettlementStatus = SettlementStatus.NOT_PURSUED
    settlement_authority: Optional[Decimal] = Field(None, ge=0)
    settlement_offers: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Case management
    lead_attorney_id: Optional[str] = None
    assigned_attorneys: List[str] = Field(default_factory=list)
    paralegal_id: Optional[str] = None
    case_manager_id: Optional[str] = None
    
    # Risk assessment
    win_probability: Optional[float] = Field(None, ge=0, le=100)
    risk_assessment: Optional[str] = Field(None, max_length=1000)
    case_strategy: Optional[str] = Field(None, max_length=2000)
    
    # Key dates and deadlines
    critical_deadlines: List[Dict[str, Any]] = Field(default_factory=list)
    upcoming_hearings: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Document management
    key_documents: List[str] = Field(default_factory=list)
    privilege_log_maintained: bool = False
    
    # Expert witnesses
    expert_witnesses: List[Dict[str, Any]] = Field(default_factory=list)
    expert_disclosure_deadline: Optional[date] = None
    
    # Insurance and funding
    insurance_coverage: bool = False
    insurance_carrier: Optional[str] = Field(None, max_length=255)
    litigation_funding: bool = False
    funding_source: Optional[str] = Field(None, max_length=255)
    
    # Confidentiality
    confidential_case: bool = False
    protective_order_entered: bool = False
    seal_status: Optional[str] = Field(None, max_length=100)
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    case_notes: Optional[str] = Field(None, max_length=5000)


class LitigationCaseCreate(LitigationCaseBase):
    pass


class LitigationCaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    case_number: Optional[str] = Field(None, max_length=100)
    
    dispute_type: Optional[DisputeType] = None
    litigation_stage: Optional[LitigationStage] = None
    status: Optional[CaseStatus] = None
    
    court_name: Optional[str] = Field(None, max_length=255)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    judge_name: Optional[str] = Field(None, max_length=255)
    docket_number: Optional[str] = Field(None, max_length=100)
    
    description: Optional[str] = Field(None, max_length=2000)
    claims: Optional[List[str]] = None
    defenses: Optional[List[str]] = None
    legal_theories: Optional[List[str]] = None
    
    our_role: Optional[LitigationRole] = None
    opposing_parties: Optional[List[str]] = None
    opposing_counsel: Optional[List[str]] = None
    
    amount_in_controversy: Optional[Decimal] = Field(None, ge=0)
    estimated_damages: Optional[Decimal] = Field(None, ge=0)
    litigation_budget: Optional[Decimal] = Field(None, ge=0)
    
    filed_date: Optional[date] = None
    answer_due_date: Optional[date] = None
    discovery_cutoff: Optional[date] = None
    motion_cutoff: Optional[date] = None
    trial_date: Optional[date] = None
    statute_of_limitations: Optional[date] = None
    
    settlement_status: Optional[SettlementStatus] = None
    settlement_authority: Optional[Decimal] = Field(None, ge=0)
    settlement_offers: Optional[List[Dict[str, Any]]] = None
    
    lead_attorney_id: Optional[str] = None
    assigned_attorneys: Optional[List[str]] = None
    paralegal_id: Optional[str] = None
    case_manager_id: Optional[str] = None
    
    win_probability: Optional[float] = Field(None, ge=0, le=100)
    risk_assessment: Optional[str] = Field(None, max_length=1000)
    case_strategy: Optional[str] = Field(None, max_length=2000)
    
    critical_deadlines: Optional[List[Dict[str, Any]]] = None
    upcoming_hearings: Optional[List[Dict[str, Any]]] = None
    key_documents: Optional[List[str]] = None
    privilege_log_maintained: Optional[bool] = None
    
    expert_witnesses: Optional[List[Dict[str, Any]]] = None
    expert_disclosure_deadline: Optional[date] = None
    
    insurance_coverage: Optional[bool] = None
    insurance_carrier: Optional[str] = Field(None, max_length=255)
    litigation_funding: Optional[bool] = None
    funding_source: Optional[str] = Field(None, max_length=255)
    
    confidential_case: Optional[bool] = None
    protective_order_entered: Optional[bool] = None
    seal_status: Optional[str] = Field(None, max_length=100)
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    case_notes: Optional[str] = Field(None, max_length=5000)


class LitigationCaseResponse(LitigationCaseBase):
    id: str
    
    # Calculated fields
    days_to_trial: Optional[int] = None
    days_to_discovery_cutoff: Optional[int] = None
    is_trial_approaching: bool = False
    is_discovery_deadline_approaching: bool = False
    case_age_days: Optional[int] = None
    
    # Status indicators
    requires_immediate_attention: bool = False
    overdue_deadlines: List[Dict[str, Any]] = Field(default_factory=list)
    upcoming_critical_dates: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Related data counts
    pleadings_count: int = 0
    discovery_requests_count: int = 0
    motions_count: int = 0
    depositions_count: int = 0
    expert_witnesses_count: int = 0
    
    # Financial summary
    total_costs_incurred: Optional[Decimal] = None
    budget_utilization_percentage: Optional[float] = None
    projected_total_cost: Optional[Decimal] = None
    
    # AI insights
    ai_case_assessment: Optional[str] = None
    ai_strategy_recommendations: List[str] = Field(default_factory=list)
    ai_risk_factors: List[str] = Field(default_factory=list)
    ai_settlement_recommendation: Optional[str] = None
    
    # Performance metrics
    case_complexity_score: Optional[float] = Field(None, ge=0, le=10)
    settlement_likelihood: Optional[float] = Field(None, ge=0, le=100)
    trial_readiness_score: Optional[float] = Field(None, ge=0, le=100)
    
    # Team information
    lead_attorney_name: Optional[str] = None
    case_manager_name: Optional[str] = None
    team_members: List[Dict[str, str]] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_activity_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DiscoveryRequestBase(BaseModel):
    litigation_case_id: str
    
    # Request details
    discovery_type: DiscoveryType
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    # Parties
    requesting_party: str = Field(..., max_length=255)
    responding_party: str = Field(..., max_length=255)
    
    # Timeline
    date_served: Optional[date] = None
    response_due_date: Optional[date] = None
    extended_due_date: Optional[date] = None
    
    # Status and responses
    status: DiscoveryStatus = DiscoveryStatus.PENDING
    response_received: bool = False
    objections_filed: bool = False
    
    # Content details
    number_of_requests: Optional[int] = Field(None, ge=1)
    requests_list: List[str] = Field(default_factory=list)
    objections_summary: Optional[str] = Field(None, max_length=1000)
    
    # Compliance and follow-up
    meet_and_confer_required: bool = False
    meet_and_confer_completed: bool = False
    motion_to_compel_filed: bool = False
    
    # Document specifics (for document production)
    custodians: List[str] = Field(default_factory=list)
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None
    keywords: List[str] = Field(default_factory=list)
    
    # E-discovery specifics
    ediscovery_platform: Optional[str] = Field(None, max_length=100)
    data_volume_gb: Optional[float] = Field(None, ge=0)
    processing_status: Optional[str] = Field(None, max_length=100)
    
    # Costs
    estimated_cost: Optional[Decimal] = Field(None, ge=0)
    actual_cost: Optional[Decimal] = Field(None, ge=0)
    vendor: Optional[str] = Field(None, max_length=255)
    
    # Privilege review
    privilege_review_required: bool = False
    privilege_review_completed: bool = False
    privileged_documents_count: Optional[int] = Field(None, ge=0)
    
    # Quality and completeness
    completeness_certified: bool = False
    deficiencies_noted: List[str] = Field(default_factory=list)
    supplemental_production_required: bool = False
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = Field(None, max_length=2000)


class DiscoveryRequestCreate(DiscoveryRequestBase):
    pass


class DiscoveryRequestUpdate(BaseModel):
    discovery_type: Optional[DiscoveryType] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    requesting_party: Optional[str] = Field(None, max_length=255)
    responding_party: Optional[str] = Field(None, max_length=255)
    
    date_served: Optional[date] = None
    response_due_date: Optional[date] = None
    extended_due_date: Optional[date] = None
    
    status: Optional[DiscoveryStatus] = None
    response_received: Optional[bool] = None
    objections_filed: Optional[bool] = None
    
    number_of_requests: Optional[int] = Field(None, ge=1)
    requests_list: Optional[List[str]] = None
    objections_summary: Optional[str] = Field(None, max_length=1000)
    
    meet_and_confer_required: Optional[bool] = None
    meet_and_confer_completed: Optional[bool] = None
    motion_to_compel_filed: Optional[bool] = None
    
    custodians: Optional[List[str]] = None
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None
    keywords: Optional[List[str]] = None
    
    ediscovery_platform: Optional[str] = Field(None, max_length=100)
    data_volume_gb: Optional[float] = Field(None, ge=0)
    processing_status: Optional[str] = Field(None, max_length=100)
    
    estimated_cost: Optional[Decimal] = Field(None, ge=0)
    actual_cost: Optional[Decimal] = Field(None, ge=0)
    vendor: Optional[str] = Field(None, max_length=255)
    
    privilege_review_required: Optional[bool] = None
    privilege_review_completed: Optional[bool] = None
    privileged_documents_count: Optional[int] = Field(None, ge=0)
    
    completeness_certified: Optional[bool] = None
    deficiencies_noted: Optional[List[str]] = None
    supplemental_production_required: Optional[bool] = None
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    notes: Optional[str] = Field(None, max_length=2000)


class DiscoveryRequestResponse(DiscoveryRequestBase):
    id: str
    
    # Calculated fields
    days_until_due: Optional[int] = None
    is_overdue: bool = False
    response_time_days: Optional[int] = None
    
    # Related case information
    case_title: Optional[str] = None
    case_number: Optional[str] = None
    
    # Progress tracking
    completion_percentage: Optional[float] = Field(None, ge=0, le=100)
    milestones_completed: List[str] = Field(default_factory=list)
    next_action_required: Optional[str] = None
    
    # AI insights
    ai_complexity_assessment: Optional[str] = None
    ai_cost_prediction: Optional[Decimal] = None
    ai_timeline_estimate: Optional[int] = None
    ai_risk_assessment: List[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LegalMotionBase(BaseModel):
    litigation_case_id: str
    
    # Motion details
    motion_type: MotionType
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    # Parties
    moving_party: str = Field(..., max_length=255)
    opposing_party: str = Field(..., max_length=255)
    
    # Status and timeline
    status: MotionStatus = MotionStatus.DRAFT
    filed_date: Optional[date] = None
    response_due_date: Optional[date] = None
    hearing_date: Optional[date] = None
    decision_date: Optional[date] = None
    
    # Filing details
    court_filing_number: Optional[str] = Field(None, max_length=100)
    relief_sought: str = Field(..., max_length=1000)
    legal_basis: List[str] = Field(..., min_items=1)
    supporting_authorities: List[str] = Field(default_factory=list)
    
    # Documents
    motion_document_id: Optional[str] = None
    supporting_brief_id: Optional[str] = None
    supporting_exhibits: List[str] = Field(default_factory=list)
    declaration_affidavits: List[str] = Field(default_factory=list)
    
    # Opposition and reply
    opposition_filed: bool = False
    opposition_due_date: Optional[date] = None
    reply_brief_required: bool = False
    reply_brief_filed: bool = False
    reply_due_date: Optional[date] = None
    
    # Hearing details
    hearing_required: bool = True
    hearing_requested: bool = False
    oral_argument_time: Optional[int] = Field(None, ge=1, le=120)  # minutes
    tentative_ruling: Optional[str] = Field(None, max_length=1000)
    
    # Decision and outcome
    decision_granted: Optional[bool] = None
    decision_reasoning: Optional[str] = Field(None, max_length=2000)
    appeal_deadline: Optional[date] = None
    compliance_deadline: Optional[date] = None
    
    # Strategic considerations
    settlement_leverage: bool = False
    dispositive_motion: bool = False
    procedural_motion: bool = False
    emergency_motion: bool = False
    
    # Costs and fees
    filing_fee: Optional[Decimal] = Field(None, ge=0)
    attorney_fees_sought: Optional[Decimal] = Field(None, ge=0)
    costs_sought: Optional[Decimal] = Field(None, ge=0)
    fees_awarded: Optional[Decimal] = Field(None, ge=0)
    
    # Success likelihood
    estimated_success_probability: Optional[float] = Field(None, ge=0, le=100)
    risk_if_denied: Optional[str] = Field(None, max_length=500)
    strategic_importance: Optional[str] = Field(None, max_length=500)
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = Field(None, max_length=2000)


class LegalMotionCreate(LegalMotionBase):
    pass


class LegalMotionUpdate(BaseModel):
    motion_type: Optional[MotionType] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    moving_party: Optional[str] = Field(None, max_length=255)
    opposing_party: Optional[str] = Field(None, max_length=255)
    
    status: Optional[MotionStatus] = None
    filed_date: Optional[date] = None
    response_due_date: Optional[date] = None
    hearing_date: Optional[date] = None
    decision_date: Optional[date] = None
    
    court_filing_number: Optional[str] = Field(None, max_length=100)
    relief_sought: Optional[str] = Field(None, max_length=1000)
    legal_basis: Optional[List[str]] = None
    supporting_authorities: Optional[List[str]] = None
    
    motion_document_id: Optional[str] = None
    supporting_brief_id: Optional[str] = None
    supporting_exhibits: Optional[List[str]] = None
    declaration_affidavits: Optional[List[str]] = None
    
    opposition_filed: Optional[bool] = None
    opposition_due_date: Optional[date] = None
    reply_brief_required: Optional[bool] = None
    reply_brief_filed: Optional[bool] = None
    reply_due_date: Optional[date] = None
    
    hearing_required: Optional[bool] = None
    hearing_requested: Optional[bool] = None
    oral_argument_time: Optional[int] = Field(None, ge=1, le=120)
    tentative_ruling: Optional[str] = Field(None, max_length=1000)
    
    decision_granted: Optional[bool] = None
    decision_reasoning: Optional[str] = Field(None, max_length=2000)
    appeal_deadline: Optional[date] = None
    compliance_deadline: Optional[date] = None
    
    settlement_leverage: Optional[bool] = None
    dispositive_motion: Optional[bool] = None
    procedural_motion: Optional[bool] = None
    emergency_motion: Optional[bool] = None
    
    filing_fee: Optional[Decimal] = Field(None, ge=0)
    attorney_fees_sought: Optional[Decimal] = Field(None, ge=0)
    costs_sought: Optional[Decimal] = Field(None, ge=0)
    fees_awarded: Optional[Decimal] = Field(None, ge=0)
    
    estimated_success_probability: Optional[float] = Field(None, ge=0, le=100)
    risk_if_denied: Optional[str] = Field(None, max_length=500)
    strategic_importance: Optional[str] = Field(None, max_length=500)
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    notes: Optional[str] = Field(None, max_length=2000)


class LegalMotionResponse(LegalMotionBase):
    id: str
    
    # Calculated fields
    days_until_hearing: Optional[int] = None
    days_until_response_due: Optional[int] = None
    is_hearing_approaching: bool = False
    is_response_overdue: bool = False
    
    # Related case information
    case_title: Optional[str] = None
    case_number: Optional[str] = None
    
    # AI insights
    ai_success_prediction: Optional[float] = Field(None, ge=0, le=100)
    ai_strategic_analysis: Optional[str] = None
    ai_opposition_arguments: List[str] = Field(default_factory=list)
    ai_case_law_suggestions: List[str] = Field(default_factory=list)
    
    # Performance metrics
    briefing_completeness: Optional[float] = Field(None, ge=0, le=100)
    procedural_compliance: bool = True
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ExpertWitnessBase(BaseModel):
    litigation_case_id: str
    
    # Expert details
    expert_type: ExpertWitnessType
    name: str = Field(..., max_length=255)
    title: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    
    # Contact information
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=500)
    
    # Expertise and qualifications
    specialization: str = Field(..., max_length=500)
    credentials: List[str] = Field(default_factory=list)
    education: List[str] = Field(default_factory=list)
    publications: List[str] = Field(default_factory=list)
    prior_testimony_experience: bool = False
    
    # Engagement details
    engagement_status: str = Field(default="IDENTIFIED", max_length=50)
    retained_date: Optional[date] = None
    engagement_letter_signed: bool = False
    
    # Opinions and reports
    subject_matter: str = Field(..., max_length=1000)
    opinions_summary: Optional[str] = Field(None, max_length=2000)
    report_due_date: Optional[date] = None
    report_completed: bool = False
    supplemental_report_required: bool = False
    
    # Deposition and trial
    deposition_date: Optional[date] = None
    deposition_completed: bool = False
    trial_testimony_expected: bool = False
    trial_testimony_date: Optional[date] = None
    
    # Disclosure requirements
    disclosure_deadline: Optional[date] = None
    disclosed: bool = False
    disclosure_document_id: Optional[str] = None
    rebuttal_disclosure: bool = False
    
    # Challenges and disputes
    daubert_challenge_expected: bool = False
    daubert_motion_filed: bool = False
    daubert_hearing_date: Optional[date] = None
    qualification_disputed: bool = False
    
    # Financial
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    estimated_total_cost: Optional[Decimal] = Field(None, ge=0)
    retainer_amount: Optional[Decimal] = Field(None, ge=0)
    costs_incurred: Optional[Decimal] = Field(None, ge=0)
    
    # Work product
    materials_reviewed: List[str] = Field(default_factory=list)
    data_analyzed: List[str] = Field(default_factory=list)
    methodologies_used: List[str] = Field(default_factory=list)
    limitations_assumptions: List[str] = Field(default_factory=list)
    
    # Performance assessment
    reliability_rating: Optional[int] = Field(None, ge=1, le=5)
    communication_effectiveness: Optional[int] = Field(None, ge=1, le=5)
    jury_appeal: Optional[int] = Field(None, ge=1, le=5)
    
    # Metadata
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = Field(None, max_length=2000)


class ExpertWitnessCreate(ExpertWitnessBase):
    pass


class ExpertWitnessUpdate(BaseModel):
    expert_type: Optional[ExpertWitnessType] = None
    name: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    
    email: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address: Optional[str] = Field(None, max_length=500)
    
    specialization: Optional[str] = Field(None, max_length=500)
    credentials: Optional[List[str]] = None
    education: Optional[List[str]] = None
    publications: Optional[List[str]] = None
    prior_testimony_experience: Optional[bool] = None
    
    engagement_status: Optional[str] = Field(None, max_length=50)
    retained_date: Optional[date] = None
    engagement_letter_signed: Optional[bool] = None
    
    subject_matter: Optional[str] = Field(None, max_length=1000)
    opinions_summary: Optional[str] = Field(None, max_length=2000)
    report_due_date: Optional[date] = None
    report_completed: Optional[bool] = None
    supplemental_report_required: Optional[bool] = None
    
    deposition_date: Optional[date] = None
    deposition_completed: Optional[bool] = None
    trial_testimony_expected: Optional[bool] = None
    trial_testimony_date: Optional[date] = None
    
    disclosure_deadline: Optional[date] = None
    disclosed: Optional[bool] = None
    disclosure_document_id: Optional[str] = None
    rebuttal_disclosure: Optional[bool] = None
    
    daubert_challenge_expected: Optional[bool] = None
    daubert_motion_filed: Optional[bool] = None
    daubert_hearing_date: Optional[date] = None
    qualification_disputed: Optional[bool] = None
    
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    estimated_total_cost: Optional[Decimal] = Field(None, ge=0)
    retainer_amount: Optional[Decimal] = Field(None, ge=0)
    costs_incurred: Optional[Decimal] = Field(None, ge=0)
    
    materials_reviewed: Optional[List[str]] = None
    data_analyzed: Optional[List[str]] = None
    methodologies_used: Optional[List[str]] = None
    limitations_assumptions: Optional[List[str]] = None
    
    reliability_rating: Optional[int] = Field(None, ge=1, le=5)
    communication_effectiveness: Optional[int] = Field(None, ge=1, le=5)
    jury_appeal: Optional[int] = Field(None, ge=1, le=5)
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    notes: Optional[str] = Field(None, max_length=2000)


class ExpertWitnessResponse(ExpertWitnessBase):
    id: str
    
    # Calculated fields
    days_until_disclosure: Optional[int] = None
    days_until_report_due: Optional[int] = None
    is_disclosure_overdue: bool = False
    is_report_overdue: bool = False
    
    # Related case information
    case_title: Optional[str] = None
    case_number: Optional[str] = None
    
    # Performance metrics
    overall_effectiveness_score: Optional[float] = Field(None, ge=0, le=5)
    readiness_status: Optional[str] = None
    
    # AI insights
    ai_strength_assessment: List[str] = Field(default_factory=list)
    ai_vulnerability_analysis: List[str] = Field(default_factory=list)
    ai_preparation_recommendations: List[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_contact_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LitigationMetrics(BaseModel):
    """Litigation and dispute resolution metrics"""
    
    # Case metrics
    total_active_cases: int
    cases_by_type: Dict[str, int]
    cases_by_stage: Dict[str, int]
    cases_by_status: Dict[str, int]
    
    # Timeline metrics
    average_case_duration_days: float
    cases_approaching_trial: int
    overdue_discovery_responses: int
    critical_deadlines_next_30_days: int
    
    # Financial metrics
    total_amount_in_controversy: Decimal
    total_litigation_budgets: Decimal
    actual_costs_incurred: Decimal
    budget_utilization_percentage: float
    settlement_amounts_this_year: Decimal
    
    # Discovery metrics
    total_discovery_requests: int
    discovery_by_type: Dict[str, int]
    discovery_by_status: Dict[str, int]
    average_discovery_response_time: float
    ediscovery_data_volume_tb: float
    
    # Motion practice
    total_motions_filed: int
    motions_by_type: Dict[str, int]
    motions_by_status: Dict[str, int]
    motion_success_rate: float
    average_motion_resolution_time: float
    
    # Expert witnesses
    total_expert_witnesses: int
    experts_by_type: Dict[str, int]
    expert_disclosure_compliance_rate: float
    average_expert_cost: Decimal
    
    # Settlement metrics
    settlement_rate: float
    average_settlement_amount: Decimal
    mediation_success_rate: float
    arbitration_success_rate: float
    
    # Performance indicators
    trial_win_rate: float
    summary_judgment_success_rate: float
    appeal_success_rate: float
    cost_per_case_average: Decimal
    
    # Resource utilization
    attorney_utilization_by_practice_area: Dict[str, float]
    paralegal_case_load_average: float
    external_counsel_spend: Decimal
    
    # Risk indicators
    high_risk_cases: int
    cases_requiring_immediate_attention: int
    compliance_issues_identified: int
    potential_sanctions_risk: int
    
    # Trends and forecasting
    case_volume_trend: str  # "INCREASING", "DECREASING", "STABLE"
    cost_trend: str
    success_rate_trend: str
    settlement_trend: str
    
    # Efficiency metrics
    electronic_filing_percentage: float
    document_automation_usage: float
    ai_assisted_case_analysis_usage: float
    
    # Client satisfaction
    client_satisfaction_score: Optional[float] = Field(None, ge=0, le=5)
    repeat_client_rate: float
    referral_rate: float
    
    class Config:
        from_attributes = True


class LitigationDashboard(BaseModel):
    """Executive litigation dashboard summary"""
    
    # Overall health indicators
    litigation_health_score: float = Field(..., ge=0, le=100)
    case_management_efficiency: float = Field(..., ge=0, le=100)
    
    # Critical alerts
    emergency_motions_pending: int
    trials_starting_next_week: int
    overdue_expert_disclosures: int
    statute_of_limitations_expiring: int
    
    # Financial alerts
    cases_over_budget: int
    settlement_authority_exceeded: int
    high_cost_cases_requiring_review: int
    
    # Recent activity
    new_cases_filed: int
    motions_decided_this_week: int
    discovery_completed: int
    settlements_reached: int
    
    # Upcoming critical events
    trial_dates_next_30_days: List[Dict[str, Any]]
    motion_hearings_next_week: List[Dict[str, Any]]
    expert_disclosure_deadlines: List[Dict[str, Any]]
    discovery_cutoff_dates: List[Dict[str, Any]]
    
    # Performance trends
    win_rate_trend: str  # "IMPROVING", "DECLINING", "STABLE"
    cost_efficiency_trend: str
    settlement_rate_trend: str
    case_resolution_speed_trend: str
    
    # Resource allocation
    attorney_capacity_utilization: float
    paralegal_workload_distribution: Dict[str, int]
    external_counsel_dependency: float
    
    # Strategic insights
    most_profitable_case_types: List[str]
    highest_risk_jurisdictions: List[str]
    most_effective_strategies: List[str]
    
    class Config:
        from_attributes = True


class LitigationSearchFilters(BaseModel):
    """Filters for litigation search"""
    
    # Case filters
    dispute_types: Optional[List[DisputeType]] = None
    litigation_stages: Optional[List[LitigationStage]] = None
    case_statuses: Optional[List[CaseStatus]] = None
    our_roles: Optional[List[LitigationRole]] = None
    
    # Court and jurisdiction
    courts: Optional[List[str]] = None
    jurisdictions: Optional[List[str]] = None
    judges: Optional[List[str]] = None
    
    # Financial filters
    amount_in_controversy_min: Optional[Decimal] = None
    amount_in_controversy_max: Optional[Decimal] = None
    litigation_budget_min: Optional[Decimal] = None
    litigation_budget_max: Optional[Decimal] = None
    
    # Date filters
    filed_date_from: Optional[date] = None
    filed_date_to: Optional[date] = None
    trial_date_from: Optional[date] = None
    trial_date_to: Optional[date] = None
    
    # Assignment filters
    lead_attorney_id: Optional[str] = None
    assigned_attorney_ids: Optional[List[str]] = None
    case_manager_id: Optional[str] = None
    
    # Status indicators
    trial_approaching: Optional[bool] = None
    discovery_deadline_approaching: Optional[bool] = None
    requires_immediate_attention: Optional[bool] = None
    
    # Settlement filters
    settlement_statuses: Optional[List[SettlementStatus]] = None
    settlement_authority_min: Optional[Decimal] = None
    settlement_authority_max: Optional[Decimal] = None
    
    # Discovery filters
    discovery_types: Optional[List[DiscoveryType]] = None
    discovery_statuses: Optional[List[DiscoveryStatus]] = None
    ediscovery_cases_only: Optional[bool] = None
    
    # Motion filters
    motion_types: Optional[List[MotionType]] = None
    motion_statuses: Optional[List[MotionStatus]] = None
    dispositive_motions_only: Optional[bool] = None
    
    # Expert witness filters
    expert_types: Optional[List[ExpertWitnessType]] = None
    expert_disclosure_overdue: Optional[bool] = None
    
    # Risk and performance
    win_probability_min: Optional[float] = None
    win_probability_max: Optional[float] = None
    case_complexity_min: Optional[float] = None
    case_complexity_max: Optional[float] = None
    
    # Text search
    search_text: Optional[str] = None
    tags: Optional[List[str]] = None


class LitigationBulkAction(BaseModel):
    item_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., description="Action: 'assign', 'update_status', 'schedule_hearing', 'set_deadlines', 'bulk_update'")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class LitigationAnalysisRequest(BaseModel):
    case_id: str
    analysis_type: str = Field(..., description="Type: 'case_strategy', 'settlement_analysis', 'trial_readiness', 'risk_assessment'")
    include_financial_analysis: bool = True
    include_timeline_analysis: bool = True
    include_precedent_research: bool = False
    custom_parameters: Dict[str, Any] = Field(default_factory=dict)


class LitigationAnalysisResponse(BaseModel):
    case_id: str
    analysis_type: str
    
    # Strategic analysis
    case_strengths: List[str]
    case_weaknesses: List[str]
    key_risks: List[str]
    strategic_recommendations: List[str]
    
    # Outcome predictions
    trial_win_probability: Optional[float] = Field(None, ge=0, le=100)
    settlement_likelihood: Optional[float] = Field(None, ge=0, le=100)
    recommended_settlement_range: Optional[Dict[str, Decimal]] = None
    
    # Timeline analysis
    estimated_resolution_date: Optional[date] = None
    critical_path_activities: List[str]
    potential_delays: List[str]
    
    # Financial analysis
    projected_total_cost: Optional[Decimal] = None
    cost_benefit_analysis: Optional[str] = None
    budget_recommendations: List[str]
    
    # Legal research
    relevant_precedents: List[str] = Field(default_factory=list)
    applicable_statutes: List[str] = Field(default_factory=list)
    procedural_considerations: List[str] = Field(default_factory=list)
    
    # AI confidence and methodology
    confidence_score: float = Field(..., ge=0, le=100)
    analysis_methodology: str
    data_sources_used: List[str]
    limitations: List[str]
    
    # Generated timestamp
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        from_attributes = True