"""
CounselFlow Ultimate V3 - Risk & Compliance Schemas
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from enum import Enum
from decimal import Decimal


class ComplianceFramework(str, Enum):
    SOX = "SOX"  # Sarbanes-Oxley
    GDPR = "GDPR"  # General Data Protection Regulation
    CCPA = "CCPA"  # California Consumer Privacy Act
    HIPAA = "HIPAA"  # Health Insurance Portability and Accountability Act
    PCI_DSS = "PCI_DSS"  # Payment Card Industry Data Security Standard
    ISO27001 = "ISO27001"  # Information Security Management
    NIST = "NIST"  # National Institute of Standards and Technology
    FFIEC = "FFIEC"  # Federal Financial Institutions Examination Council
    FISMA = "FISMA"  # Federal Information Security Management Act
    COPPA = "COPPA"  # Children's Online Privacy Protection Act
    FERPA = "FERPA"  # Family Educational Rights and Privacy Act
    GLBA = "GLBA"  # Gramm-Leach-Bliley Act
    COSO = "COSO"  # Committee of Sponsoring Organizations
    COBIT = "COBIT"  # Control Objectives for Information and Related Technologies
    CUSTOM = "CUSTOM"


class RiskCategory(str, Enum):
    LEGAL = "LEGAL"
    FINANCIAL = "FINANCIAL"
    OPERATIONAL = "OPERATIONAL"
    STRATEGIC = "STRATEGIC"
    REGULATORY = "REGULATORY"
    TECHNOLOGY = "TECHNOLOGY"
    REPUTATION = "REPUTATION"
    CYBERSECURITY = "CYBERSECURITY"
    DATA_PRIVACY = "DATA_PRIVACY"
    THIRD_PARTY = "THIRD_PARTY"
    ENVIRONMENTAL = "ENVIRONMENTAL"
    HUMAN_RESOURCES = "HUMAN_RESOURCES"


class RiskLevel(str, Enum):
    VERY_LOW = "VERY_LOW"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"
    CRITICAL = "CRITICAL"


class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT"
    UNDER_REVIEW = "UNDER_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    PENDING_ASSESSMENT = "PENDING_ASSESSMENT"


class ControlStatus(str, Enum):
    EFFECTIVE = "EFFECTIVE"
    INEFFECTIVE = "INEFFECTIVE"
    NEEDS_IMPROVEMENT = "NEEDS_IMPROVEMENT"
    NOT_TESTED = "NOT_TESTED"
    TESTING_IN_PROGRESS = "TESTING_IN_PROGRESS"
    REMEDIATION_REQUIRED = "REMEDIATION_REQUIRED"


class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    ESCALATED = "ESCALATED"


class RiskAssessmentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    # Risk classification
    category: RiskCategory
    subcategory: Optional[str] = Field(None, max_length=100)
    risk_level: RiskLevel
    
    # Assessment details
    likelihood: int = Field(..., ge=1, le=5, description="Probability of occurrence (1-5)")
    impact: int = Field(..., ge=1, le=5, description="Potential impact severity (1-5)")
    risk_score: Optional[float] = Field(None, ge=1, le=25, description="Calculated risk score")
    
    # Business context
    business_unit: Optional[str] = Field(None, max_length=100)
    process_area: Optional[str] = Field(None, max_length=100)
    regulatory_requirements: Optional[List[str]] = Field(default_factory=list)
    
    # Risk details
    risk_drivers: Optional[List[str]] = Field(default_factory=list)
    potential_impacts: Optional[List[str]] = Field(default_factory=list)
    existing_controls: Optional[List[str]] = Field(default_factory=list)
    
    # Management
    risk_owner_id: Optional[str] = None
    responsible_manager_id: Optional[str] = None
    
    # Dates
    assessment_date: date = Field(default_factory=date.today)
    next_review_date: Optional[date] = None
    
    # Financial impact
    estimated_financial_impact: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator('risk_score', always=True)
    def calculate_risk_score(cls, v, values):
        if 'likelihood' in values and 'impact' in values:
            return float(values['likelihood'] * values['impact'])
        return v


class RiskAssessmentCreate(RiskAssessmentBase):
    pass


class RiskAssessmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    category: Optional[RiskCategory] = None
    subcategory: Optional[str] = Field(None, max_length=100)
    risk_level: Optional[RiskLevel] = None
    
    likelihood: Optional[int] = Field(None, ge=1, le=5)
    impact: Optional[int] = Field(None, ge=1, le=5)
    
    business_unit: Optional[str] = Field(None, max_length=100)
    process_area: Optional[str] = Field(None, max_length=100)
    regulatory_requirements: Optional[List[str]] = None
    
    risk_drivers: Optional[List[str]] = None
    potential_impacts: Optional[List[str]] = None
    existing_controls: Optional[List[str]] = None
    
    risk_owner_id: Optional[str] = None
    responsible_manager_id: Optional[str] = None
    
    next_review_date: Optional[date] = None
    estimated_financial_impact: Optional[Decimal] = Field(None, ge=0)
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class RiskAssessmentResponse(RiskAssessmentBase):
    id: str
    
    # Calculated fields
    days_until_review: Optional[int] = None
    is_overdue_review: bool = False
    residual_risk_level: Optional[RiskLevel] = None
    
    # Related data
    risk_owner_name: Optional[str] = None
    responsible_manager_name: Optional[str] = None
    mitigation_count: int = 0
    incident_count: int = 0
    
    # AI insights
    ai_risk_prediction: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    trend_analysis: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_reviewed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ComplianceRequirement(BaseModel):
    id: Optional[str] = None
    
    # Requirement details
    framework: ComplianceFramework
    requirement_id: str = Field(..., max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    # Classification
    category: str = Field(..., max_length=100)
    subcategory: Optional[str] = Field(None, max_length=100)
    criticality: str = Field(default="MEDIUM", max_length=20)
    
    # Compliance details
    status: ComplianceStatus = ComplianceStatus.PENDING_ASSESSMENT
    compliance_percentage: Optional[int] = Field(None, ge=0, le=100)
    
    # Responsible parties
    owner_id: Optional[str] = None
    responsible_team: Optional[str] = Field(None, max_length=100)
    
    # Evidence and documentation
    evidence_required: Optional[List[str]] = Field(default_factory=list)
    documentation_links: Optional[List[str]] = Field(default_factory=list)
    
    # Assessment details
    last_assessment_date: Optional[date] = None
    next_assessment_date: Optional[date] = None
    assessment_frequency: Optional[str] = Field(None, max_length=50)  # "ANNUAL", "QUARTERLY", etc.
    
    # Remediation
    gaps_identified: Optional[List[str]] = Field(default_factory=list)
    remediation_plan: Optional[str] = Field(None, max_length=2000)
    remediation_due_date: Optional[date] = None
    
    # Cost and effort
    implementation_cost: Optional[Decimal] = Field(None, ge=0)
    maintenance_effort_hours: Optional[float] = Field(None, ge=0)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class ControlAssessment(BaseModel):
    id: Optional[str] = None
    
    # Control details
    control_id: str = Field(..., max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    # Classification
    control_type: str = Field(..., max_length=50)  # "PREVENTIVE", "DETECTIVE", "CORRECTIVE"
    control_category: str = Field(..., max_length=100)
    framework: Optional[ComplianceFramework] = None
    
    # Assessment
    status: ControlStatus = ControlStatus.NOT_TESTED
    effectiveness_rating: Optional[int] = Field(None, ge=1, le=5)
    test_date: Optional[date] = None
    next_test_date: Optional[date] = None
    
    # Testing details
    test_procedures: Optional[List[str]] = Field(default_factory=list)
    test_results: Optional[str] = Field(None, max_length=2000)
    exceptions_noted: Optional[List[str]] = Field(default_factory=list)
    
    # Responsible parties
    control_owner_id: Optional[str] = None
    tester_id: Optional[str] = None
    
    # Risk mitigation
    risks_addressed: Optional[List[str]] = Field(default_factory=list)
    related_requirements: Optional[List[str]] = Field(default_factory=list)
    
    # Remediation
    deficiencies: Optional[List[str]] = Field(default_factory=list)
    remediation_actions: Optional[List[str]] = Field(default_factory=list)
    remediation_due_date: Optional[date] = None
    
    # Automation
    is_automated: bool = False
    automation_tool: Optional[str] = Field(None, max_length=100)
    monitoring_frequency: Optional[str] = Field(None, max_length=50)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class ComplianceIncident(BaseModel):
    id: Optional[str] = None
    
    # Incident details
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=2000)
    incident_type: str = Field(..., max_length=100)
    
    # Severity and impact
    severity: IncidentSeverity
    status: IncidentStatus = IncidentStatus.OPEN
    
    # Discovery and timeline
    discovered_date: date
    reported_date: Optional[date] = None
    occurrence_date: Optional[date] = None
    resolution_date: Optional[date] = None
    
    # Impact assessment
    affected_systems: Optional[List[str]] = Field(default_factory=list)
    affected_data_types: Optional[List[str]] = Field(default_factory=list)
    estimated_records_affected: Optional[int] = Field(None, ge=0)
    
    # Financial impact
    estimated_financial_impact: Optional[Decimal] = Field(None, ge=0)
    actual_financial_impact: Optional[Decimal] = Field(None, ge=0)
    
    # Regulatory implications
    regulatory_frameworks: Optional[List[ComplianceFramework]] = Field(default_factory=list)
    notification_required: bool = False
    notification_deadline: Optional[date] = None
    authorities_notified: Optional[List[str]] = Field(default_factory=list)
    
    # Investigation
    root_cause: Optional[str] = Field(None, max_length=1000)
    contributing_factors: Optional[List[str]] = Field(default_factory=list)
    investigation_findings: Optional[str] = Field(None, max_length=2000)
    
    # Response and remediation
    immediate_actions: Optional[List[str]] = Field(default_factory=list)
    corrective_actions: Optional[List[str]] = Field(default_factory=list)
    preventive_measures: Optional[List[str]] = Field(default_factory=list)
    
    # Responsible parties
    incident_manager_id: Optional[str] = None
    assigned_to_id: Optional[str] = None
    legal_counsel_id: Optional[str] = None
    
    # External parties
    external_counsel_engaged: bool = False
    forensics_firm_engaged: bool = False
    pr_firm_engaged: bool = False
    
    # Lessons learned
    lessons_learned: Optional[str] = Field(None, max_length=2000)
    process_improvements: Optional[List[str]] = Field(default_factory=list)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class RiskRegister(BaseModel):
    """Risk register entry for enterprise risk management"""
    id: Optional[str] = None
    
    # Register details
    register_name: str = Field(..., min_length=1, max_length=255)
    business_unit: str = Field(..., max_length=100)
    risk_assessment_id: Optional[str] = None
    
    # Risk treatment
    treatment_strategy: str = Field(..., max_length=50)  # "ACCEPT", "MITIGATE", "TRANSFER", "AVOID"
    treatment_description: Optional[str] = Field(None, max_length=1000)
    
    # Monitoring
    key_risk_indicators: Optional[List[str]] = Field(default_factory=list)
    monitoring_frequency: str = Field(default="MONTHLY", max_length=50)
    escalation_threshold: Optional[float] = Field(None, ge=0, le=10)
    
    # Reporting
    board_level_risk: bool = False
    executive_attention_required: bool = False
    regulatory_reporting_required: bool = False
    
    # Timeline
    review_frequency: str = Field(default="QUARTERLY", max_length=50)
    last_review_date: Optional[date] = None
    next_review_date: Optional[date] = None
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class ComplianceMetrics(BaseModel):
    """Risk & compliance metrics and KPIs"""
    
    # Risk assessment metrics
    total_risk_assessments: int
    risks_by_category: Dict[str, int]
    risks_by_level: Dict[str, int]
    overdue_risk_reviews: int
    
    # Compliance metrics
    total_requirements: int
    compliant_requirements: int
    non_compliant_requirements: int
    compliance_percentage: float
    requirements_by_framework: Dict[str, int]
    
    # Control metrics
    total_controls: int
    effective_controls: int
    ineffective_controls: int
    controls_needing_remediation: int
    control_effectiveness_percentage: float
    
    # Incident metrics
    total_incidents: int
    open_incidents: int
    incidents_by_severity: Dict[str, int]
    average_resolution_time_days: float
    incidents_this_quarter: int
    
    # Financial metrics
    total_estimated_risk_exposure: Decimal
    total_remediation_costs: Decimal
    compliance_program_costs: Decimal
    cost_of_incidents: Decimal
    
    # Trend analysis
    risk_trend: str  # "INCREASING", "DECREASING", "STABLE"
    compliance_trend: str
    incident_trend: str
    
    # AI insights
    high_risk_areas: List[str]
    emerging_risks: List[str]
    compliance_gaps: List[str]
    recommended_actions: List[str]
    
    class Config:
        from_attributes = True


class ComplianceDashboard(BaseModel):
    """Executive compliance dashboard summary"""
    
    # Overall health score
    overall_compliance_score: float = Field(..., ge=0, le=100)
    risk_maturity_level: str  # "INITIAL", "MANAGED", "DEFINED", "QUANTIFIED", "OPTIMIZED"
    
    # Key metrics
    critical_risks: int
    overdue_assessments: int
    control_deficiencies: int
    open_incidents: int
    
    # Regulatory status
    frameworks_assessed: int
    frameworks_compliant: int
    regulatory_actions_required: int
    
    # Recent activity
    new_risks_identified: int
    assessments_completed: int
    controls_tested: int
    incidents_resolved: int
    
    # Alerts and priorities
    urgent_actions: List[Dict[str, Any]]
    upcoming_deadlines: List[Dict[str, Any]]
    board_attention_items: List[Dict[str, Any]]
    
    # Trends
    compliance_score_trend: str  # "UP", "DOWN", "STABLE"
    risk_exposure_trend: str
    incident_frequency_trend: str
    
    class Config:
        from_attributes = True


class ComplianceSearchFilters(BaseModel):
    """Filters for compliance and risk search"""
    
    # Risk filters
    risk_category: Optional[List[RiskCategory]] = None
    risk_level: Optional[List[RiskLevel]] = None
    risk_owner_id: Optional[str] = None
    
    # Compliance filters
    framework: Optional[List[ComplianceFramework]] = None
    compliance_status: Optional[List[ComplianceStatus]] = None
    
    # Control filters
    control_status: Optional[List[ControlStatus]] = None
    control_type: Optional[List[str]] = None
    
    # Incident filters
    incident_severity: Optional[List[IncidentSeverity]] = None
    incident_status: Optional[List[IncidentStatus]] = None
    
    # Date filters
    assessment_date_from: Optional[date] = None
    assessment_date_to: Optional[date] = None
    due_date_from: Optional[date] = None
    due_date_to: Optional[date] = None
    
    # Business filters
    business_unit: Optional[List[str]] = None
    process_area: Optional[List[str]] = None
    
    # Status filters
    overdue_only: Optional[bool] = None
    requires_attention: Optional[bool] = None
    
    # Search
    search_text: Optional[str] = None
    tags: Optional[List[str]] = None


class ComplianceBulkAction(BaseModel):
    item_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., description="Action: 'assign', 'update_status', 'add_tags', 'schedule_review', 'bulk_assess'")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ComplianceReportRequest(BaseModel):
    """Request for compliance reporting"""
    report_type: str = Field(..., description="Type: 'risk_register', 'compliance_status', 'control_testing', 'incident_summary'")
    frameworks: Optional[List[ComplianceFramework]] = Field(default_factory=list)
    business_units: Optional[List[str]] = Field(default_factory=list)
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None
    include_detailed_findings: bool = True
    include_recommendations: bool = True
    format: str = Field(default="PDF", description="Output format: PDF, EXCEL, CSV")
    
    class Config:
        from_attributes = True