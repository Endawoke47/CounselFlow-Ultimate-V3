"""
CounselFlow Ultimate V3 - Intellectual Property Schemas
"""

from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator, Field
from enum import Enum
from decimal import Decimal


class IPAssetType(str, Enum):
    PATENT = "PATENT"
    TRADEMARK = "TRADEMARK"
    COPYRIGHT = "COPYRIGHT"
    TRADE_SECRET = "TRADE_SECRET"
    DESIGN = "DESIGN"
    DOMAIN = "DOMAIN"
    SOFTWARE = "SOFTWARE"


class IPAssetStatus(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    ABANDONED = "ABANDONED"
    REJECTED = "REJECTED"
    LICENSED = "LICENSED"
    SOLD = "SOLD"
    UNDER_REVIEW = "UNDER_REVIEW"


class IPPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class LicenseType(str, Enum):
    EXCLUSIVE = "EXCLUSIVE"
    NON_EXCLUSIVE = "NON_EXCLUSIVE"
    SOLE = "SOLE"
    COMPULSORY = "COMPULSORY"


class RenewalStatus(str, Enum):
    NOT_REQUIRED = "NOT_REQUIRED"
    UPCOMING = "UPCOMING"
    OVERDUE = "OVERDUE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class IPAssetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    type: IPAssetType
    status: IPAssetStatus = IPAssetStatus.PENDING
    priority: IPPriority = IPPriority.MEDIUM
    
    # Ownership
    owner_id: str  # Client ID
    inventors: Optional[List[str]] = Field(default_factory=list)
    assignees: Optional[List[str]] = Field(default_factory=list)
    
    # Registration details
    registration_number: Optional[str] = Field(None, max_length=100)
    application_number: Optional[str] = Field(None, max_length=100)
    application_date: Optional[date] = None
    registration_date: Optional[date] = None
    publication_date: Optional[date] = None
    
    # Expiry and renewal
    expiry_date: Optional[date] = None
    renewal_date: Optional[date] = None
    next_renewal_fee_due: Optional[date] = None
    renewal_fee_amount: Optional[Decimal] = Field(None, ge=0)
    
    # Geographic coverage
    jurisdiction: str = Field(default="US", max_length=100)
    countries: Optional[List[str]] = Field(default_factory=list)
    
    # Business details
    technology_area: Optional[str] = Field(None, max_length=200)
    business_unit: Optional[str] = Field(None, max_length=100)
    commercial_value: Optional[str] = Field(None, max_length=50)
    strategic_importance: Optional[str] = Field(None, max_length=50)
    
    # Legal representation
    responsible_attorney_id: Optional[str] = None
    external_counsel: Optional[str] = Field(None, max_length=255)
    prosecution_status: Optional[str] = Field(None, max_length=100)
    
    # Financial
    filing_cost: Optional[Decimal] = Field(None, ge=0)
    maintenance_cost_annual: Optional[Decimal] = Field(None, ge=0)
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    
    # Metadata
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator('expiry_date')
    def validate_expiry_date(cls, v, values):
        if v and 'registration_date' in values and values['registration_date']:
            if v <= values['registration_date']:
                raise ValueError('Expiry date must be after registration date')
        return v


class IPAssetCreate(IPAssetBase):
    pass


class IPAssetUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    type: Optional[IPAssetType] = None
    status: Optional[IPAssetStatus] = None
    priority: Optional[IPPriority] = None
    
    inventors: Optional[List[str]] = None
    assignees: Optional[List[str]] = None
    
    registration_number: Optional[str] = Field(None, max_length=100)
    application_number: Optional[str] = Field(None, max_length=100)
    application_date: Optional[date] = None
    registration_date: Optional[date] = None
    publication_date: Optional[date] = None
    
    expiry_date: Optional[date] = None
    renewal_date: Optional[date] = None
    next_renewal_fee_due: Optional[date] = None
    renewal_fee_amount: Optional[Decimal] = Field(None, ge=0)
    
    jurisdiction: Optional[str] = Field(None, max_length=100)
    countries: Optional[List[str]] = None
    
    technology_area: Optional[str] = Field(None, max_length=200)
    business_unit: Optional[str] = Field(None, max_length=100)
    commercial_value: Optional[str] = Field(None, max_length=50)
    strategic_importance: Optional[str] = Field(None, max_length=50)
    
    responsible_attorney_id: Optional[str] = None
    external_counsel: Optional[str] = Field(None, max_length=255)
    prosecution_status: Optional[str] = Field(None, max_length=100)
    
    filing_cost: Optional[Decimal] = Field(None, ge=0)
    maintenance_cost_annual: Optional[Decimal] = Field(None, ge=0)
    estimated_value: Optional[Decimal] = Field(None, ge=0)
    
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class IPAssetResponse(IPAssetBase):
    id: str
    
    # Calculated fields
    days_until_expiry: Optional[int] = None
    days_until_renewal: Optional[int] = None
    is_expired: bool = False
    is_expiring_soon: bool = False
    renewal_status: RenewalStatus = RenewalStatus.NOT_REQUIRED
    
    # Related data
    owner_name: Optional[str] = None
    responsible_attorney_name: Optional[str] = None
    license_count: int = 0
    document_count: int = 0
    
    # Portfolio metrics
    portfolio_position: Optional[str] = None  # "Core", "Supporting", "Defensive"
    competitive_landscape: Optional[str] = None
    
    # AI insights
    ai_valuation: Optional[Decimal] = None
    ai_risk_score: Optional[float] = Field(None, ge=0, le=10)
    ai_recommendations: Optional[List[str]] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    last_reviewed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class IPAssetListResponse(BaseModel):
    assets: List[IPAssetResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool


class IPLicense(BaseModel):
    id: Optional[str] = None
    ip_asset_id: str
    licensee_name: str = Field(..., min_length=1, max_length=255)
    license_type: LicenseType
    
    # Terms
    start_date: date
    end_date: Optional[date] = None
    territory: str = Field(..., max_length=200)
    field_of_use: Optional[str] = Field(None, max_length=500)
    
    # Financial terms
    license_fee: Optional[Decimal] = Field(None, ge=0)
    royalty_rate: Optional[float] = Field(None, ge=0, le=1)  # As percentage
    minimum_royalty: Optional[Decimal] = Field(None, ge=0)
    advance_payment: Optional[Decimal] = Field(None, ge=0)
    
    # Status
    status: str = Field(default="ACTIVE", max_length=50)
    is_sublicensable: bool = False
    
    # Legal
    governing_law: Optional[str] = Field(None, max_length=100)
    contract_id: Optional[str] = None  # Link to contract
    
    # Metadata
    notes: Optional[str] = Field(None, max_length=1000)
    tags: Optional[List[str]] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class IPRenewal(BaseModel):
    id: Optional[str] = None
    ip_asset_id: str
    
    # Renewal details
    renewal_date: date
    renewal_fee: Decimal = Field(..., ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    renewal_period_years: int = Field(..., ge=1, le=20)
    
    # Status
    status: str = Field(default="PENDING", max_length=50)
    payment_due_date: Optional[date] = None
    payment_date: Optional[date] = None
    confirmation_number: Optional[str] = Field(None, max_length=100)
    
    # Automation
    auto_renew: bool = False
    reminder_days_before: int = Field(default=90, ge=1, le=365)
    
    # Notes
    notes: Optional[str] = Field(None, max_length=1000)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    processed_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class IPSearchRequest(BaseModel):
    """Prior art and patent search request"""
    search_type: str = Field(..., description="Type of search: 'prior_art', 'freedom_to_operate', 'landscape'")
    technology_description: str = Field(..., min_length=10, max_length=2000)
    keywords: List[str] = Field(..., min_items=1)
    classification_codes: Optional[List[str]] = Field(default_factory=list)
    jurisdiction: Optional[List[str]] = Field(default_factory=list)
    date_range_start: Optional[date] = None
    date_range_end: Optional[date] = None
    assignee_filter: Optional[List[str]] = Field(default_factory=list)
    inventor_filter: Optional[List[str]] = Field(default_factory=list)
    status_filter: Optional[List[str]] = Field(default_factory=list)
    
    # AI-enhanced search
    use_ai_expansion: bool = True
    semantic_search: bool = True
    include_non_patent_literature: bool = True
    
    # Scope
    max_results: int = Field(default=100, ge=1, le=1000)
    relevance_threshold: float = Field(default=0.7, ge=0.1, le=1.0)


class IPSearchResult(BaseModel):
    id: str
    title: str
    abstract: Optional[str] = None
    inventors: List[str]
    assignee: Optional[str] = None
    publication_number: str
    publication_date: date
    application_date: Optional[date] = None
    jurisdiction: str
    status: str
    classification_codes: List[str]
    relevance_score: float = Field(..., ge=0, le=1)
    
    # Analysis
    key_claims: Optional[List[str]] = None
    technical_similarity: Optional[float] = Field(None, ge=0, le=1)
    potential_conflict: Optional[str] = Field(None, description="LOW, MEDIUM, HIGH")
    
    # Links
    patent_office_url: Optional[str] = None
    pdf_url: Optional[str] = None


class IPSearchResponse(BaseModel):
    search_id: str
    search_type: str
    query: IPSearchRequest
    
    results: List[IPSearchResult]
    total_found: int
    search_time_seconds: float
    
    # AI insights
    ai_summary: Optional[str] = None
    key_findings: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    risk_assessment: Optional[str] = None
    
    # Metadata
    searched_at: datetime
    searched_by: str
    databases_searched: List[str]
    
    class Config:
        from_attributes = True


class IPPortfolioAnalysis(BaseModel):
    """IP portfolio analysis and insights"""
    portfolio_id: str
    analysis_date: datetime
    
    # Portfolio overview
    total_assets: int
    assets_by_type: Dict[str, int]
    assets_by_status: Dict[str, int]
    assets_by_jurisdiction: Dict[str, int]
    
    # Financial metrics
    total_estimated_value: Decimal
    annual_maintenance_costs: Decimal
    roi_metrics: Dict[str, float]
    
    # Risk analysis
    expiring_assets_12_months: int
    high_value_at_risk: Decimal
    renewal_cost_forecast: Dict[str, Decimal]  # By year
    
    # Technology coverage
    technology_areas: Dict[str, int]
    coverage_gaps: List[str]
    competitive_positioning: Dict[str, Any]
    
    # Recommendations
    monetization_opportunities: List[str]
    cost_optimization_suggestions: List[str]
    strategic_recommendations: List[str]
    
    # AI insights
    ai_valuation_confidence: Optional[float] = Field(None, ge=0, le=1)
    market_trend_analysis: Optional[str] = None
    competitive_threat_level: Optional[str] = None
    
    class Config:
        from_attributes = True


class IPMetrics(BaseModel):
    """IP portfolio metrics and KPIs"""
    total_ip_assets: int
    assets_by_type: Dict[str, int]
    assets_by_status: Dict[str, int]
    assets_by_priority: Dict[str, int]
    
    # Financial metrics
    total_portfolio_value: Decimal
    total_annual_costs: Decimal
    average_asset_value: Decimal
    
    # Renewal metrics
    expiring_next_30_days: int
    expiring_next_90_days: int
    expiring_next_year: int
    overdue_renewals: int
    
    # Geographic distribution
    assets_by_jurisdiction: Dict[str, int]
    international_coverage_percentage: float
    
    # Technology metrics
    technology_coverage: Dict[str, int]
    high_value_assets: int
    licensed_assets: int
    
    # Performance indicators
    filing_rate_monthly: float
    grant_rate_percentage: float
    abandonment_rate_percentage: float
    
    # AI metrics
    ai_analyzed_assets: int
    average_ai_valuation: Optional[Decimal] = None
    ai_recommended_actions: int
    
    class Config:
        from_attributes = True


class IPSearchFilters(BaseModel):
    """Filters for IP asset search"""
    type: Optional[List[IPAssetType]] = None
    status: Optional[List[IPAssetStatus]] = None
    priority: Optional[List[IPPriority]] = None
    jurisdiction: Optional[List[str]] = None
    
    owner_id: Optional[str] = None
    responsible_attorney_id: Optional[str] = None
    
    # Date filters
    application_date_from: Optional[date] = None
    application_date_to: Optional[date] = None
    registration_date_from: Optional[date] = None
    registration_date_to: Optional[date] = None
    expiry_date_from: Optional[date] = None
    expiry_date_to: Optional[date] = None
    
    # Business filters
    technology_area: Optional[List[str]] = None
    business_unit: Optional[List[str]] = None
    commercial_value: Optional[List[str]] = None
    strategic_importance: Optional[List[str]] = None
    
    # Financial filters
    estimated_value_min: Optional[Decimal] = None
    estimated_value_max: Optional[Decimal] = None
    
    # Status filters
    expiring_within_days: Optional[int] = None
    renewal_due_within_days: Optional[int] = None
    has_licenses: Optional[bool] = None
    
    # Search
    search_text: Optional[str] = None
    tags: Optional[List[str]] = None
    
    # AI filters
    ai_valuation_min: Optional[Decimal] = None
    ai_valuation_max: Optional[Decimal] = None
    ai_risk_score_min: Optional[float] = Field(None, ge=0, le=10)
    ai_risk_score_max: Optional[float] = Field(None, ge=0, le=10)


class IPBulkAction(BaseModel):
    asset_ids: List[str] = Field(..., min_items=1)
    action: str = Field(..., description="Action: 'assign', 'update_status', 'add_tags', 'set_priority', 'schedule_renewal'")
    parameters: Dict[str, Any] = Field(default_factory=dict)


class IPValuationRequest(BaseModel):
    """AI-powered IP asset valuation request"""
    asset_id: str
    valuation_method: str = Field(default="market_comparable", description="market_comparable, cost_approach, income_approach, hybrid")
    include_market_analysis: bool = True
    include_competitive_analysis: bool = True
    include_licensing_potential: bool = True
    
    # Context
    business_context: Optional[str] = Field(None, max_length=1000)
    intended_use: Optional[str] = Field(None, description="licensing, sale, internal_use, litigation")
    
    # Market data
    comparable_transactions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    licensing_deals: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


class IPValuationResponse(BaseModel):
    """AI-powered IP asset valuation response"""
    asset_id: str
    valuation_date: datetime
    valuation_method: str
    
    # Valuation results
    estimated_value: Decimal
    valuation_range_low: Decimal
    valuation_range_high: Decimal
    confidence_level: float = Field(..., ge=0, le=1)
    
    # Analysis components
    market_factors: Dict[str, Any]
    competitive_positioning: Dict[str, Any]
    technology_strength: Dict[str, Any]
    commercial_potential: Dict[str, Any]
    
    # Insights
    key_value_drivers: List[str]
    risk_factors: List[str]
    monetization_opportunities: List[str]
    
    # AI analysis
    ai_confidence: float = Field(..., ge=0, le=1)
    comparable_patents: List[str]
    market_trends: List[str]
    
    # Metadata
    analysis_duration_seconds: float
    data_sources_used: List[str]
    model_version: str
    
    class Config:
        from_attributes = True