"""
CounselFlow Ultimate V3 - Risk & Compliance API Routes
Enterprise Risk Management and Regulatory Compliance with AI Integration
"""

from typing import List, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from prisma import Prisma
import structlog

from app.core.database import get_prisma
from app.api.v1.auth import get_current_active_user
from app.schemas.user import UserRole
from app.schemas.compliance import (
    RiskAssessmentCreate, RiskAssessmentUpdate, RiskAssessmentResponse,
    ComplianceRequirement, ControlAssessment, ComplianceIncident,
    RiskRegister, ComplianceMetrics, ComplianceDashboard,
    ComplianceSearchFilters, ComplianceBulkAction, ComplianceReportRequest,
    RiskCategory, RiskLevel, ComplianceStatus, ControlStatus, IncidentSeverity,
    IncidentStatus, ComplianceFramework
)
from app.services.compliance_service import ComplianceService
from app.core.config import Constants

logger = structlog.get_logger()
router = APIRouter()


def get_compliance_service(prisma: Prisma = Depends(get_prisma)) -> ComplianceService:
    """Dependency to get compliance service"""
    return ComplianceService(prisma)


# Risk Assessment Endpoints

@router.post("/risks", response_model=RiskAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_risk_assessment(
    assessment_data: RiskAssessmentCreate,
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Create a new risk assessment"""
    
    # Check permissions - legal and compliance roles can create risk assessments
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create risk assessments"
        )
    
    try:
        assessment = await compliance_service.create_risk_assessment(assessment_data, current_user.id)
        
        logger.info(
            "Risk assessment created via API",
            assessment_id=assessment.id,
            title=assessment.title,
            category=assessment.category,
            risk_level=assessment.risk_level,
            created_by=current_user.id
        )
        
        return assessment
        
    except Exception as e:
        logger.error("Failed to create risk assessment via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create risk assessment"
        )


@router.get("/risks")
async def get_risk_assessments(
    # Pagination
    skip: int = Query(0, ge=0, description="Number of assessments to skip"),
    limit: int = Query(Constants.DEFAULT_PAGE_SIZE, ge=1, le=Constants.MAX_PAGE_SIZE, description="Number of assessments to return"),
    
    # Sorting
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    
    # Basic filters
    category: Optional[List[RiskCategory]] = Query(None, description="Filter by risk category"),
    risk_level: Optional[List[RiskLevel]] = Query(None, description="Filter by risk level"),
    risk_owner_id: Optional[str] = Query(None, description="Filter by risk owner"),
    
    # Business filters
    business_unit: Optional[List[str]] = Query(None, description="Filter by business unit"),
    process_area: Optional[List[str]] = Query(None, description="Filter by process area"),
    
    # Date filters
    assessment_date_from: Optional[date] = Query(None, description="Assessments from date"),
    assessment_date_to: Optional[date] = Query(None, description="Assessments to date"),
    due_date_from: Optional[date] = Query(None, description="Review due from date"),
    due_date_to: Optional[date] = Query(None, description="Review due to date"),
    
    # Status filters
    overdue_only: Optional[bool] = Query(None, description="Show only overdue reviews"),
    requires_attention: Optional[bool] = Query(None, description="Show items requiring attention"),
    
    # Search
    search: Optional[str] = Query(None, description="Search in title and description"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Get list of risk assessments with advanced filtering"""
    try:
        # Create search filters
        filters = ComplianceSearchFilters(
            risk_category=category,
            risk_level=risk_level,
            risk_owner_id=risk_owner_id,
            business_unit=business_unit,
            process_area=process_area,
            assessment_date_from=assessment_date_from,
            assessment_date_to=assessment_date_to,
            due_date_from=due_date_from,
            due_date_to=due_date_to,
            overdue_only=overdue_only,
            requires_attention=requires_attention,
            search_text=search,
            tags=tags
        )
        
        assessments, total = await compliance_service.search_risk_assessments(
            filters=filters,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        return {
            "assessments": assessments,
            "total": total,
            "page": skip // limit + 1,
            "page_size": limit,
            "has_next": (skip + limit) < total,
            "has_previous": skip > 0
        }
        
    except Exception as e:
        logger.error("Failed to get risk assessments", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve risk assessments"
        )


@router.get("/risks/{assessment_id}", response_model=RiskAssessmentResponse)
async def get_risk_assessment(
    assessment_id: str,
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Get risk assessment by ID"""
    try:
        assessment = await compliance_service.get_risk_assessment(assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Risk assessment not found"
            )
        
        return assessment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get risk assessment", error=str(e), assessment_id=assessment_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve risk assessment"
        )


@router.put("/risks/{assessment_id}", response_model=RiskAssessmentResponse)
async def update_risk_assessment(
    assessment_id: str,
    assessment_data: RiskAssessmentUpdate,
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Update risk assessment"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update risk assessments"
        )
    
    try:
        assessment = await compliance_service.update_risk_assessment(
            assessment_id=assessment_id,
            assessment_data=assessment_data,
            updated_by=current_user.id
        )
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Risk assessment not found"
            )
        
        logger.info(
            "Risk assessment updated via API",
            assessment_id=assessment_id,
            updated_by=current_user.id
        )
        
        return assessment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update risk assessment", error=str(e), assessment_id=assessment_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update risk assessment"
        )


# Compliance Requirements Endpoints

@router.post("/requirements", response_model=ComplianceRequirement, status_code=status.HTTP_201_CREATED)
async def create_compliance_requirement(
    requirement_data: ComplianceRequirement,
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Create a new compliance requirement"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create compliance requirements"
        )
    
    try:
        requirement = await compliance_service.create_compliance_requirement(requirement_data, current_user.id)
        
        logger.info(
            "Compliance requirement created via API",
            requirement_id=requirement.id,
            framework=requirement.framework,
            title=requirement.title,
            created_by=current_user.id
        )
        
        return requirement
        
    except Exception as e:
        logger.error("Failed to create compliance requirement via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create compliance requirement"
        )


# Control Assessment Endpoints

@router.post("/controls", response_model=ControlAssessment, status_code=status.HTTP_201_CREATED)
async def create_control_assessment(
    control_data: ControlAssessment,
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Create a new control assessment"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create control assessments"
        )
    
    try:
        control = await compliance_service.create_control_assessment(control_data, current_user.id)
        
        logger.info(
            "Control assessment created via API",
            control_id=control.id,
            control_name=control.control_id,
            title=control.title,
            created_by=current_user.id
        )
        
        return control
        
    except Exception as e:
        logger.error("Failed to create control assessment via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create control assessment"
        )


# Incident Management Endpoints

@router.post("/incidents", response_model=ComplianceIncident, status_code=status.HTTP_201_CREATED)
async def create_compliance_incident(
    incident_data: ComplianceIncident,
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Create a new compliance incident"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create compliance incidents"
        )
    
    try:
        incident = await compliance_service.create_compliance_incident(incident_data, current_user.id)
        
        logger.info(
            "Compliance incident created via API",
            incident_id=incident.id,
            title=incident.title,
            severity=incident.severity,
            created_by=current_user.id
        )
        
        return incident
        
    except Exception as e:
        logger.error("Failed to create compliance incident via API", error=str(e), user_id=current_user.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create compliance incident"
        )


# Analytics and Reporting Endpoints

@router.get("/metrics/overview", response_model=ComplianceMetrics)
async def get_compliance_metrics(
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Get comprehensive compliance and risk metrics"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view compliance metrics"
        )
    
    try:
        metrics = await compliance_service.get_compliance_metrics()
        
        logger.info(
            "Compliance metrics accessed",
            requested_by=current_user.id
        )
        
        return metrics
        
    except Exception as e:
        logger.error("Failed to get compliance metrics", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve compliance metrics"
        )


@router.get("/dashboard/summary", response_model=ComplianceDashboard)
async def get_compliance_dashboard(
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Get executive compliance dashboard summary"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view compliance dashboard"
        )
    
    try:
        dashboard = await compliance_service.get_compliance_dashboard()
        
        logger.info(
            "Compliance dashboard accessed",
            requested_by=current_user.id
        )
        
        return dashboard
        
    except Exception as e:
        logger.error("Failed to get compliance dashboard", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve compliance dashboard"
        )


# Bulk Operations

@router.post("/bulk-actions")
async def bulk_update_compliance_items(
    bulk_action: ComplianceBulkAction,
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Perform bulk actions on compliance items"""
    
    # Check permissions
    if current_user.role not in [UserRole.ADMIN, UserRole.IN_HOUSE_COUNSEL, UserRole.LEGAL_OPS, UserRole.COMPLIANCE_OFFICER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform bulk compliance actions"
        )
    
    try:
        results = await compliance_service.bulk_update_items(
            bulk_action=bulk_action,
            updated_by=current_user.id
        )
        
        logger.info(
            "Bulk compliance action performed",
            action=bulk_action.action,
            item_count=len(bulk_action.item_ids),
            success_count=len(results["success"]),
            performed_by=current_user.id
        )
        
        return results
        
    except Exception as e:
        logger.error("Failed to perform bulk compliance action", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bulk action"
        )


# Risk Analysis Endpoints

@router.get("/risks/heat-map")
async def get_risk_heat_map(
    business_unit: Optional[str] = Query(None, description="Filter by business unit"),
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Get risk heat map data for visualization"""
    try:
        # Build filters for heat map
        filters = ComplianceSearchFilters(
            business_unit=[business_unit] if business_unit else None
        )
        
        # Get all risk assessments for heat map
        assessments, _ = await compliance_service.search_risk_assessments(
            filters=filters,
            skip=0,
            limit=1000,  # Large limit for heat map
            sort_by="risk_score",
            sort_order="desc"
        )
        
        # Group risks by likelihood and impact for heat map
        heat_map_data = {}
        for assessment in assessments:
            key = f"{assessment.likelihood}-{assessment.impact}"
            if key not in heat_map_data:
                heat_map_data[key] = {
                    "likelihood": assessment.likelihood,
                    "impact": assessment.impact,
                    "count": 0,
                    "risks": []
                }
            heat_map_data[key]["count"] += 1
            heat_map_data[key]["risks"].append({
                "id": assessment.id,
                "title": assessment.title,
                "category": assessment.category,
                "risk_level": assessment.risk_level,
                "risk_score": assessment.risk_score
            })
        
        return {
            "heat_map": list(heat_map_data.values()),
            "total_risks": len(assessments),
            "business_unit": business_unit
        }
        
    except Exception as e:
        logger.error("Failed to get risk heat map", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve risk heat map"
        )


@router.get("/risks/trending")
async def get_risk_trending(
    days: int = Query(90, ge=30, le=365, description="Number of days to analyze"),
    current_user = Depends(get_current_active_user),
    compliance_service: ComplianceService = Depends(get_compliance_service)
):
    """Get risk trending analysis"""
    try:
        # This would analyze risk trends over time
        # For now, return mock trending data
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        trending_data = {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "risk_trends": {
                "new_risks_identified": 15,
                "risks_mitigated": 8,
                "risks_escalated": 3,
                "average_risk_score": 12.5
            },
            "category_trends": {
                "CYBERSECURITY": {"trend": "INCREASING", "change": "+15%"},
                "DATA_PRIVACY": {"trend": "STABLE", "change": "0%"},
                "FINANCIAL": {"trend": "DECREASING", "change": "-8%"},
                "OPERATIONAL": {"trend": "STABLE", "change": "+2%"}
            },
            "emerging_risks": [
                "AI and Machine Learning Governance",
                "Supply Chain Disruption",
                "Climate-related Financial Risk",
                "Third-party Data Processing"
            ],
            "top_risk_drivers": [
                "Regulatory Changes",
                "Technology Complexity",
                "Vendor Dependencies",
                "Process Gaps"
            ]
        }
        
        return trending_data
        
    except Exception as e:
        logger.error("Failed to get risk trending", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve risk trending"
        )


# Compliance Framework Analysis

@router.get("/frameworks/{framework}/status")
async def get_framework_compliance_status(
    framework: ComplianceFramework,
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get compliance status for a specific framework"""
    try:
        # Get all requirements for the framework
        requirements = await prisma.compliancerequirement.find_many(
            where={"framework": framework.value}
        )
        
        total_requirements = len(requirements)
        if total_requirements == 0:
            return {
                "framework": framework.value,
                "total_requirements": 0,
                "compliance_status": "NOT_ASSESSED",
                "compliance_percentage": 0,
                "requirements_by_status": {}
            }
        
        # Group by status
        status_counts = {}
        for req in requirements:
            status = req.status
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Calculate compliance percentage
        compliant_count = status_counts.get(ComplianceStatus.COMPLIANT.value, 0)
        compliance_percentage = (compliant_count / total_requirements) * 100
        
        # Determine overall status
        if compliance_percentage >= 95:
            overall_status = "FULLY_COMPLIANT"
        elif compliance_percentage >= 80:
            overall_status = "SUBSTANTIALLY_COMPLIANT"
        elif compliance_percentage >= 60:
            overall_status = "PARTIALLY_COMPLIANT"
        else:
            overall_status = "NON_COMPLIANT"
        
        # Get critical gaps
        critical_gaps = await prisma.compliancerequirement.find_many(
            where={
                "framework": framework.value,
                "status": ComplianceStatus.NON_COMPLIANT.value,
                "criticality": "HIGH"
            },
            take=10
        )
        
        return {
            "framework": framework.value,
            "total_requirements": total_requirements,
            "compliance_status": overall_status,
            "compliance_percentage": round(compliance_percentage, 2),
            "requirements_by_status": status_counts,
            "critical_gaps": [
                {
                    "id": gap.id,
                    "requirement_id": gap.requirement_id,
                    "title": gap.title,
                    "category": gap.category
                }
                for gap in critical_gaps
            ]
        }
        
    except Exception as e:
        logger.error("Failed to get framework compliance status", error=str(e), framework=framework.value)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve framework compliance status"
        )


# Control Effectiveness Analysis

@router.get("/controls/effectiveness")
async def get_control_effectiveness_analysis(
    framework: Optional[ComplianceFramework] = Query(None, description="Filter by framework"),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get control effectiveness analysis"""
    try:
        # Build where clause
        where_clause = {}
        if framework:
            where_clause["framework"] = framework.value
        
        # Get all controls
        controls = await prisma.controlassessment.find_many(where=where_clause)
        
        total_controls = len(controls)
        if total_controls == 0:
            return {
                "total_controls": 0,
                "effectiveness_summary": {},
                "testing_status": {},
                "remediation_required": []
            }
        
        # Group by status
        status_counts = {}
        testing_status = {}
        remediation_needed = []
        
        for control in controls:
            # Count by effectiveness status
            status = control.status
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Track testing status
            if control.test_date:
                days_since_test = (date.today() - control.test_date).days
                if days_since_test <= 90:
                    testing_status["RECENT"] = testing_status.get("RECENT", 0) + 1
                elif days_since_test <= 365:
                    testing_status["CURRENT"] = testing_status.get("CURRENT", 0) + 1
                else:
                    testing_status["OVERDUE"] = testing_status.get("OVERDUE", 0) + 1
            else:
                testing_status["NOT_TESTED"] = testing_status.get("NOT_TESTED", 0) + 1
            
            # Identify controls needing remediation
            if control.status in [ControlStatus.INEFFECTIVE.value, ControlStatus.REMEDIATION_REQUIRED.value]:
                remediation_needed.append({
                    "id": control.id,
                    "control_id": control.control_id,
                    "title": control.title,
                    "status": control.status,
                    "deficiencies": control.deficiencies or [],
                    "remediation_due_date": control.remediation_due_date.isoformat() if control.remediation_due_date else None
                })
        
        # Calculate effectiveness percentage
        effective_count = status_counts.get(ControlStatus.EFFECTIVE.value, 0)
        effectiveness_percentage = (effective_count / total_controls) * 100
        
        return {
            "total_controls": total_controls,
            "effectiveness_percentage": round(effectiveness_percentage, 2),
            "effectiveness_summary": status_counts,
            "testing_status": testing_status,
            "remediation_required": remediation_needed[:20],  # Top 20 priority items
            "framework": framework.value if framework else "ALL"
        }
        
    except Exception as e:
        logger.error("Failed to get control effectiveness analysis", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve control effectiveness analysis"
        )


# Incident Analysis

@router.get("/incidents/analysis")
async def get_incident_analysis(
    days: int = Query(90, ge=30, le=365, description="Number of days to analyze"),
    current_user = Depends(get_current_active_user),
    prisma: Prisma = Depends(get_prisma)
):
    """Get compliance incident analysis"""
    try:
        # Date range for analysis
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        # Get incidents in date range
        incidents = await prisma.complianceincident.find_many(
            where={
                "discovered_date": {
                    "gte": start_date,
                    "lte": end_date
                }
            }
        )
        
        total_incidents = len(incidents)
        
        # Analyze by severity
        severity_counts = {}
        status_counts = {}
        financial_impact = 0
        
        for incident in incidents:
            # Count by severity
            severity = incident.severity
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
            
            # Count by status
            status = incident.status
            status_counts[status] = status_counts.get(status, 0) + 1
            
            # Sum financial impact
            if incident.actual_financial_impact:
                financial_impact += incident.actual_financial_impact
        
        # Calculate resolution metrics
        resolved_incidents = [i for i in incidents if i.resolution_date]
        if resolved_incidents:
            resolution_times = []
            for incident in resolved_incidents:
                if incident.discovered_date and incident.resolution_date:
                    resolution_time = (incident.resolution_date - incident.discovered_date).days
                    resolution_times.append(resolution_time)
            
            avg_resolution_time = sum(resolution_times) / len(resolution_times) if resolution_times else 0
        else:
            avg_resolution_time = 0
        
        # Get top incident types
        incident_types = {}
        for incident in incidents:
            inc_type = incident.incident_type
            incident_types[inc_type] = incident_types.get(inc_type, 0) + 1
        
        top_incident_types = sorted(incident_types.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "analysis_period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "total_incidents": total_incidents,
            "severity_distribution": severity_counts,
            "status_distribution": status_counts,
            "financial_impact_total": financial_impact,
            "average_resolution_days": round(avg_resolution_time, 1),
            "top_incident_types": [{"type": t[0], "count": t[1]} for t in top_incident_types],
            "open_incidents": status_counts.get(IncidentStatus.OPEN.value, 0) + status_counts.get(IncidentStatus.INVESTIGATING.value, 0)
        }
        
    except Exception as e:
        logger.error("Failed to get incident analysis", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve incident analysis"
        )