"""
CounselFlow Ultimate V3 - Matter Management Schemas
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from enum import Enum
from decimal import Decimal


class MatterType(str, Enum):
    LITIGATION = "LITIGATION"
    CORPORATE = "CORPORATE"
    EMPLOYMENT = "EMPLOYMENT"
    INTELLECTUAL_PROPERTY = "INTELLECTUAL_PROPERTY"
    REAL_ESTATE = "REAL_ESTATE"
    TAX = "TAX"
    REGULATORY = "REGULATORY"
    MERGERS_ACQUISITIONS = "MERGERS_ACQUISITIONS"
    BANKRUPTCY = "BANKRUPTCY"
    IMMIGRATION = "IMMIGRATION"
    CRIMINAL = "CRIMINAL"
    FAMILY = "FAMILY"
    COMPLIANCE = "COMPLIANCE"
    ARBITRATION = "ARBITRATION"
    MEDIATION = "MEDIATION"
    OTHER = "OTHER"


class MatterStatus(str, Enum):
    INTAKE = "INTAKE"
    OPEN = "OPEN"
    ACTIVE = "ACTIVE"
    ON_HOLD = "ON_HOLD"
    PENDING_CLOSURE = "PENDING_CLOSURE"
    CLOSED = "CLOSED"
    CANCELLED = "CANCELLED"
    SETTLED = "SETTLED"
    WON = "WON"
    LOST = "LOST"
    DISMISSED = "DISMISSED"


class MatterPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"
    CRITICAL = "CRITICAL"


class BillingType(str, Enum):
    HOURLY = "HOURLY"
    FIXED_FEE = "FIXED_FEE"
    CONTINGENCY = "CONTINGENCY"
    RETAINER = "RETAINER"
    BLENDED_RATE = "BLENDED_RATE"
    CAPPED_FEE = "CAPPED_FEE"
    SUCCESS_FEE = "SUCCESS_FEE"
    PRO_BONO = "PRO_BONO"


class RiskLevel(str, Enum):
    VERY_LOW = "VERY_LOW"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"
    CRITICAL = "CRITICAL"


class MatterBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    matter_number: Optional[str] = Field(None, max_length=50)
    
    # Classification
    type: MatterType
    status: MatterStatus = MatterStatus.INTAKE
    priority: MatterPriority = MatterPriority.MEDIUM
    practice_area: Optional[str] = Field(None, max_length=100)
    jurisdiction: str = Field(..., max_length=100)
    court: Optional[str] = Field(None, max_length=255)
    
    # Client and relationships
    client_id: str
    opposing_party: Optional[str] = Field(None, max_length=255)
    opposing_counsel: Optional[str] = Field(None, max_length=255)
    
    # Assignment
    lead_attorney_id: Optional[str] = None
    assigned_attorneys: Optional[List[str]] = Field(default_factory=list)
    paralegal_id: Optional[str] = None
    
    # Dates
    opened_date: date = Field(default_factory=date.today)
    target_resolution_date: Optional[date] = None
    statute_limitations_date: Optional[date] = None
    
    # Financial
    billing_type: BillingType = BillingType.HOURLY
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    budget_amount: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    
    # Risk and compliance
    risk_level: RiskLevel = RiskLevel.MEDIUM
    conflict_checked: bool = False
    insurance_coverage: Optional[str] = Field(None, max_length=255)
    
    # Organization
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Case details
    case_summary: Optional[str] = Field(None, max_length=5000)
    legal_issues: Optional[List[str]] = Field(default_factory=list)
    key_facts: Optional[List[str]] = Field(default_factory=list)
    
    @validator('target_resolution_date')
    def validate_target_date(cls, v, values):
        if v and 'opened_date' in values and values['opened_date']:
            if v <= values['opened_date']:
                raise ValueError('Target resolution date must be after opened date')
        return v


class MatterCreate(MatterBase):
    pass


class MatterUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    
    type: Optional[MatterType] = None
    status: Optional[MatterStatus] = None
    priority: Optional[MatterPriority] = None
    practice_area: Optional[str] = Field(None, max_length=100)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    court: Optional[str] = Field(None, max_length=255)
    
    opposing_party: Optional[str] = Field(None, max_length=255)
    opposing_counsel: Optional[str] = Field(None, max_length=255)
    
    lead_attorney_id: Optional[str] = None
    assigned_attorneys: Optional[List[str]] = None
    paralegal_id: Optional[str] = None
    
    target_resolution_date: Optional[date] = None
    statute_limitations_date: Optional[date] = None
    
    billing_type: Optional[BillingType] = None
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    budget_amount: Optional[Decimal] = Field(None, ge=0)
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    
    risk_level: Optional[RiskLevel] = None
    conflict_checked: Optional[bool] = None
    insurance_coverage: Optional[str] = Field(None, max_length=255)
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    
    case_summary: Optional[str] = Field(None, max_length=5000)
    legal_issues: Optional[List[str]] = None
    key_facts: Optional[List[str]] = None


class MatterResponse(MatterBase):
    id: str
    
    # Calculated fields
    days_open: int = 0
    days_until_target: Optional[int] = None
    days_until_statute: Optional[int] = None
    is_overdue: bool = False
    is_statute_approaching: bool = False
    
    # Related data
    client_name: Optional[str] = None
    lead_attorney_name: Optional[str] = None
    assigned_attorney_names: Optional[List[str]] = Field(default_factory=list)
    paralegal_name: Optional[str] = None
    
    # Financial tracking
    total_billed: Decimal = Field(default=Decimal('0'))
    total_costs: Decimal = Field(default=Decimal('0'))
    hours_worked: float = 0.0
    budget_utilization: Optional[float] = None  # Percentage
    
    # Activity metrics
    task_count: int = 0
    open_task_count: int = 0
    document_count: int = 0
    time_entry_count: int = 0
    
    # AI insights
    ai_risk_assessment: Optional[str] = None
    ai_outcome_prediction: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    complexity_score: Optional[float] = Field(None, ge=0, le=10)
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    closed_date: Optional[datetime] = None
    last_activity_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class MatterListResponse(BaseModel):
    matters: List[MatterResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool


class TimeEntry(BaseModel):
    id: Optional[str] = None
    matter_id: str
    attorney_id: str
    
    # Time details
    date: date
    hours: float = Field(..., ge=0.1, le=24.0)
    description: str = Field(..., min_length=1, max_length=1000)
    task_type: str = Field(..., max_length=100)  # "Research", "Drafting", "Court Appearance", etc.
    
    # Billing
    billable: bool = True
    hourly_rate: Optional[Decimal] = Field(None, ge=0)
    amount: Optional[Decimal] = Field(None, ge=0)
    
    # Status
    status: str = Field(default="DRAFT", max_length=50)  # DRAFT, SUBMITTED, APPROVED, BILLED
    billed_date: Optional[date] = None
    
    # Metadata
    notes: Optional[str] = Field(None, max_length=500)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class Expense(BaseModel):
    id: Optional[str] = None
    matter_id: str
    
    # Expense details
    date: date
    amount: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    category: str = Field(..., max_length=100)  # "Travel", "Filing Fees", "Expert Witness", etc.
    description: str = Field(..., min_length=1, max_length=500)
    
    # Reimbursement
    billable_to_client: bool = True
    reimbursable: bool = False
    receipt_required: bool = True
    receipt_url: Optional[str] = None
    
    # Status
    status: str = Field(default="PENDING", max_length=50)  # PENDING, APPROVED, REJECTED, REIMBURSED
    approved_by: Optional[str] = None
    approved_date: Optional[date] = None
    
    # Vendor
    vendor_name: Optional[str] = Field(None, max_length=255)
    vendor_invoice_number: Optional[str] = Field(None, max_length=100)
    
    # Metadata
    notes: Optional[str] = Field(None, max_length=500)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    submitted_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class MatterTask(BaseModel):
    id: Optional[str] = None
    matter_id: str
    
    # Task details
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    task_type: str = Field(..., max_length=100)  # "Deadline", "Court Filing", "Research", etc.
    
    # Assignment
    assigned_to_id: Optional[str] = None
    assigned_by_id: Optional[str] = None
    
    # Dates
    due_date: Optional[date] = None
    completed_date: Optional[date] = None
    
    # Status and priority
    status: str = Field(default="PENDING", max_length=50)  # PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    priority: MatterPriority = MatterPriority.MEDIUM
    
    # Progress
    estimated_hours: Optional[float] = Field(None, ge=0)
    actual_hours: Optional[float] = Field(None, ge=0)
    completion_percentage: int = Field(default=0, ge=0, le=100)
    
    # Dependencies
    depends_on_task_ids: Optional[List[str]] = Field(default_factory=list)
    blocks_task_ids: Optional[List[str]] = Field(default_factory=list)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class MatterSearchFilters(BaseModel):
    """Filters for matter search"""
    type: Optional[List[MatterType]] = None
    status: Optional[List[MatterStatus]] = None
    priority: Optional[List[MatterPriority]] = None
    billing_type: Optional[List[BillingType]] = None
    risk_level: Optional[List[RiskLevel]] = None
    
    client_id: Optional[str] = None
    lead_attorney_id: Optional[str] = None
    assigned_attorney_id: Optional[str] = None
    
    # Date filters
    opened_date_from: Optional[date] = None
    opened_date_to: Optional[date] = None
    target_date_from: Optional[date] = None
    target_date_to: Optional[date] = None
    
    # Financial filters
    estimated_value_min: Optional[Decimal] = None
    estimated_value_max: Optional[Decimal] = None
    budget_amount_min: Optional[Decimal] = None
    budget_amount_max: Optional[Decimal] = None
    
    # Status filters
    overdue_only: Optional[bool] = None
    statute_approaching: Optional[bool] = None
    conflict_checked: Optional[bool] = None
    
    # Geographic
    jurisdiction: Optional[List[str]] = None
    practice_area: Optional[List[str]] = None
    
    # Search
    search_text: Optional[str] = None
    tags: Optional[List[str]] = None
    
    # AI filters
    complexity_score_min: Optional[float] = Field(None, ge=0, le=10)
    complexity_score_max: Optional[float] = Field(None, ge=0, le=10)


class MatterMetrics(BaseModel):
    """Matter management metrics and KPIs"""
    total_matters: int
    matters_by_status: Dict[str, int]
    matters_by_type: Dict[str, int]
    matters_by_priority: Dict[str, int]
    matters_by_risk_level: Dict[str, int]
    
    # Financial metrics
    total_estimated_value: Decimal
    total_budget_amount: Decimal
    total_billed_amount: Decimal
    total_costs: Decimal
    average_matter_value: Decimal
    
    # Time metrics
    total_hours_worked: float
    average_hours_per_matter: float
    billable_hours_percentage: float
    
    # Performance metrics
    overdue_matters: int
    statute_approaching_matters: int
    matters_opened_this_month: int
    matters_closed_this_month: int
    average_resolution_days: float
    
    # Efficiency metrics
    budget_utilization_average: float
    on_time_completion_rate: float
    client_satisfaction_score: Optional[float] = None
    
    # Risk metrics
    high_risk_matters: int
    conflict_check_compliance: float
    
    # AI insights
    ai_analyzed_matters: int
    average_complexity_score: Optional[float] = None
    outcome_prediction_accuracy: Optional[float] = None
    
    class Config:
        from_attributes = True


class MatterBulkAction(BaseModel):
    matter_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., description="Action: 'assign', 'update_status', 'add_tags', 'set_priority', 'update_risk_level'")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class MatterAnalysisRequest(BaseModel):
    """Request for AI-powered matter analysis"""
    matter_id: str
    analysis_type: str = Field(..., description="Type: 'risk_assessment', 'outcome_prediction', 'cost_analysis', 'timeline_analysis'")
    include_similar_cases: bool = True
    include_opposing_counsel_history: bool = True
    include_jurisdiction_trends: bool = True
    
    # Context
    additional_context: Optional[str] = Field(None, max_length=1000)
    focus_areas: Optional[List[str]] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class MatterAnalysisResponse(BaseModel):
    """Response from AI-powered matter analysis"""
    matter_id: str
    analysis_type: str
    analysis_date: datetime
    
    # Risk assessment results
    risk_score: Optional[float] = Field(None, ge=0, le=10)
    risk_factors: Optional[List[str]] = None
    mitigation_strategies: Optional[List[str]] = None
    
    # Outcome prediction
    predicted_outcome: Optional[str] = None
    confidence_level: Optional[float] = Field(None, ge=0, le=1)
    outcome_probabilities: Optional[Dict[str, float]] = None
    
    # Cost analysis
    estimated_total_cost: Optional[Decimal] = None
    cost_breakdown: Optional[Dict[str, Decimal]] = None
    budget_recommendations: Optional[List[str]] = None
    
    # Timeline analysis
    estimated_duration_days: Optional[int] = None
    critical_milestones: Optional[List[Dict[str, Any]]] = None
    timeline_risks: Optional[List[str]] = None
    
    # Benchmarking
    similar_cases_analyzed: int = 0
    industry_benchmarks: Optional[Dict[str, Any]] = None
    
    # AI insights
    key_insights: List[str]
    recommendations: List[str]
    confidence_score: float = Field(..., ge=0, le=1)
    
    # Metadata
    analysis_duration_seconds: float
    data_sources_used: List[str]
    model_version: str
    
    class Config:
        from_attributes = True


class MatterDashboardSummary(BaseModel):
    """Matter dashboard summary for quick overview"""
    total_active_matters: int
    overdue_matters: int
    statute_deadlines_approaching: int
    high_priority_matters: int
    
    # Recent activity
    matters_opened_this_week: int
    matters_closed_this_week: int
    
    # Financial snapshot
    total_portfolio_value: Decimal
    total_hours_this_month: float
    average_utilization_rate: float
    
    # Alerts
    urgent_deadlines: List[Dict[str, Any]]
    conflict_check_required: int
    budget_overruns: int
    
    # Performance indicators
    on_track_matters: int
    at_risk_matters: int
    client_satisfaction_trend: Optional[str] = None
    
    class Config:
        from_attributes = True