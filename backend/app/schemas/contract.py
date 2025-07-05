"""
CounselFlow Ultimate V3 - Contract Schemas
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from enum import Enum
from decimal import Decimal


class ContractType(str, Enum):
    NDA = "NDA"
    SERVICE_AGREEMENT = "SERVICE_AGREEMENT"
    EMPLOYMENT = "EMPLOYMENT"
    VENDOR = "VENDOR"
    PARTNERSHIP = "PARTNERSHIP"
    LICENSING = "LICENSING"
    LEASE = "LEASE"
    PURCHASE = "PURCHASE"
    CONSULTING = "CONSULTING"
    SOFTWARE_LICENSE = "SOFTWARE_LICENSE"
    OTHER = "OTHER"


class ContractStatus(str, Enum):
    DRAFT = "DRAFT"
    UNDER_REVIEW = "UNDER_REVIEW"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    EXECUTED = "EXECUTED"
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    TERMINATED = "TERMINATED"
    CANCELLED = "CANCELLED"
    RENEWED = "RENEWED"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ContractPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class ContractBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    type: ContractType
    status: ContractStatus = ContractStatus.DRAFT
    priority: ContractPriority = ContractPriority.MEDIUM
    
    # Parties
    client_id: str
    counterparty_name: str = Field(..., min_length=1, max_length=255)
    counterparty_contact: Optional[str] = Field(None, max_length=255)
    
    # Financial terms
    contract_value: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    
    # Dates
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    expiry_date: Optional[date] = None
    renewal_date: Optional[date] = None
    
    # Legal details
    governing_law: Optional[str] = Field(None, max_length=100)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    
    # Assignment
    assigned_attorney_id: Optional[str] = None
    responsible_team: Optional[str] = Field(None, max_length=100)
    
    # Auto-renewal
    auto_renewal: bool = False
    renewal_notice_days: Optional[int] = Field(None, ge=0, le=365)
    
    # Tags and metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v <= values['start_date']:
                raise ValueError('End date must be after start date')
        return v

    @validator('currency')
    def validate_currency(cls, v):
        return v.upper()


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    type: Optional[ContractType] = None
    status: Optional[ContractStatus] = None
    priority: Optional[ContractPriority] = None
    
    counterparty_name: Optional[str] = Field(None, min_length=1, max_length=255)
    counterparty_contact: Optional[str] = Field(None, max_length=255)
    
    contract_value: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    expiry_date: Optional[date] = None
    renewal_date: Optional[date] = None
    
    governing_law: Optional[str] = Field(None, max_length=100)
    jurisdiction: Optional[str] = Field(None, max_length=100)
    
    assigned_attorney_id: Optional[str] = None
    responsible_team: Optional[str] = Field(None, max_length=100)
    
    auto_renewal: Optional[bool] = None
    renewal_notice_days: Optional[int] = Field(None, ge=0, le=365)
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class ContractResponse(ContractBase):
    id: str
    contract_number: str
    
    # AI Analysis
    ai_risk_score: Optional[float] = Field(None, ge=0, le=10)
    risk_level: Optional[RiskLevel] = None
    ai_summary: Optional[str] = None
    ai_key_terms: Optional[Dict[str, Any]] = None
    ai_recommendations: Optional[List[str]] = None
    
    # Workflow
    approval_workflow_id: Optional[str] = None
    current_approver_id: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_reviewed_at: Optional[datetime] = None
    
    # Calculated fields
    days_until_expiry: Optional[int] = None
    is_expired: bool = False
    is_expiring_soon: bool = False
    
    # Related data
    client_name: Optional[str] = None
    assigned_attorney_name: Optional[str] = None
    document_count: int = 0
    task_count: int = 0
    
    class Config:
        from_attributes = True


class ContractListResponse(BaseModel):
    contracts: List[ContractResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool


class ContractAnalysisRequest(BaseModel):
    contract_id: str
    analysis_type: str = Field(default="comprehensive", description="Type of analysis to perform")
    include_ai_suggestions: bool = True
    include_risk_assessment: bool = True
    include_clause_analysis: bool = True


class ContractAnalysisResponse(BaseModel):
    contract_id: str
    analysis_type: str
    
    # Risk Assessment
    risk_score: Optional[float] = Field(None, ge=0, le=10)
    risk_level: Optional[RiskLevel] = None
    risk_factors: Optional[List[str]] = None
    
    # Key Terms
    key_terms: Optional[Dict[str, Any]] = None
    critical_clauses: Optional[List[str]] = None
    missing_clauses: Optional[List[str]] = None
    
    # AI Recommendations
    recommendations: Optional[List[str]] = None
    action_items: Optional[List[str]] = None
    
    # Compliance
    compliance_issues: Optional[List[str]] = None
    regulatory_considerations: Optional[List[str]] = None
    
    # Summary
    executive_summary: Optional[str] = None
    
    # Metadata
    analyzed_at: datetime
    analysis_model: str
    processing_time: Optional[float] = None
    
    class Config:
        from_attributes = True


class ContractTemplate(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    contract_type: ContractType
    template_content: str
    variables: Optional[List[str]] = Field(default_factory=list)
    is_active: bool = True
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ContractGenerationRequest(BaseModel):
    template_id: str
    variables: Dict[str, str]
    client_id: str
    title: str
    description: Optional[str] = None


class ContractWorkflowStep(BaseModel):
    id: Optional[str] = None
    step_name: str
    step_order: int
    assignee_id: Optional[str] = None
    assignee_role: Optional[str] = None
    is_required: bool = True
    completed: bool = False
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None
    comments: Optional[str] = None


class ContractApprovalWorkflow(BaseModel):
    id: Optional[str] = None
    contract_id: str
    workflow_name: str
    current_step: int = 0
    status: str = "PENDING"
    steps: List[ContractWorkflowStep]
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ContractRenewalRequest(BaseModel):
    contract_id: str
    new_end_date: date
    new_contract_value: Optional[Decimal] = None
    renewal_terms: Optional[str] = None
    notify_stakeholders: bool = True


class ContractTerminationRequest(BaseModel):
    contract_id: str
    termination_date: date
    termination_reason: str
    notice_period_days: Optional[int] = None
    penalty_amount: Optional[Decimal] = None
    termination_notes: Optional[str] = None


class ContractMetrics(BaseModel):
    total_contracts: int
    contracts_by_status: Dict[str, int]
    contracts_by_type: Dict[str, int]
    total_contract_value: Decimal
    average_contract_value: Decimal
    expiring_soon_count: int
    expired_count: int
    high_risk_count: int
    pending_approval_count: int
    
    # Time-based metrics
    contracts_created_this_month: int
    contracts_executed_this_month: int
    average_approval_time_days: Optional[float] = None
    
    # AI metrics
    ai_analyzed_count: int
    average_risk_score: Optional[float] = None
    
    class Config:
        from_attributes = True


class ContractSearchFilters(BaseModel):
    status: Optional[List[ContractStatus]] = None
    type: Optional[List[ContractType]] = None
    priority: Optional[List[ContractPriority]] = None
    risk_level: Optional[List[RiskLevel]] = None
    
    client_id: Optional[str] = None
    assigned_attorney_id: Optional[str] = None
    
    contract_value_min: Optional[Decimal] = None
    contract_value_max: Optional[Decimal] = None
    
    start_date_from: Optional[date] = None
    start_date_to: Optional[date] = None
    end_date_from: Optional[date] = None
    end_date_to: Optional[date] = None
    
    expiring_within_days: Optional[int] = None
    
    tags: Optional[List[str]] = None
    search_text: Optional[str] = None
    
    # AI-based filters
    ai_risk_score_min: Optional[float] = Field(None, ge=0, le=10)
    ai_risk_score_max: Optional[float] = Field(None, ge=0, le=10)
    
    has_ai_analysis: Optional[bool] = None
    pending_review: Optional[bool] = None


class ContractBulkAction(BaseModel):
    contract_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., description="Action to perform: 'assign', 'update_status', 'add_tags', 'remove_tags'")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ContractVersionHistory(BaseModel):
    id: str
    contract_id: str
    version_number: int
    changes_summary: str
    changed_by: str
    changed_at: datetime
    field_changes: Dict[str, Any]
    
    class Config:
        from_attributes = True