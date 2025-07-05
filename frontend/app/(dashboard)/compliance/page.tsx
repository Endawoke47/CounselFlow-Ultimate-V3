"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  Target,
  Award,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for risk assessments
const riskAssessments = [
  {
    id: "1",
    title: "Cybersecurity Risk Assessment",
    category: "Information Security",
    riskLevel: "High",
    likelihood: 4,
    impact: 5,
    riskScore: 20,
    owner: "CISO",
    status: "Active",
    assessmentDate: "2024-01-15",
    reviewDate: "2024-04-15",
    mitigationActions: 3,
    residualRisk: "Medium",
  },
  {
    id: "2",
    title: "Regulatory Compliance - GDPR",
    category: "Data Privacy",
    riskLevel: "Medium",
    likelihood: 3,
    impact: 4,
    riskScore: 12,
    owner: "Privacy Officer",
    status: "Under Review",
    assessmentDate: "2024-01-10",
    reviewDate: "2024-04-10",
    mitigationActions: 5,
    residualRisk: "Low",
  },
  {
    id: "3",
    title: "Third-Party Vendor Risk",
    category: "Operational",
    riskLevel: "Medium",
    likelihood: 3,
    impact: 3,
    riskScore: 9,
    owner: "Procurement",
    status: "Active",
    assessmentDate: "2024-01-05",
    reviewDate: "2024-07-05",
    mitigationActions: 2,
    residualRisk: "Low",
  },
];

// Mock data for compliance requirements
const complianceRequirements = [
  {
    id: "1",
    framework: "SOX",
    requirementId: "SOX-404",
    title: "Internal Controls Assessment",
    description: "Annual assessment of internal controls over financial reporting",
    status: "Compliant",
    owner: "Finance Team",
    dueDate: "2024-12-31",
    lastAssessment: "2024-01-15",
    evidence: "Control testing documentation",
    criticality: "High",
  },
  {
    id: "2",
    framework: "GDPR",
    requirementId: "GDPR-Art30",
    title: "Records of Processing Activities",
    description: "Maintain comprehensive records of all data processing activities",
    status: "Partially Compliant",
    owner: "Privacy Team",
    dueDate: "2024-05-25",
    lastAssessment: "2024-01-10",
    evidence: "Processing activity register",
    criticality: "High",
  },
  {
    id: "3",
    framework: "ISO 27001",
    requirementId: "ISO-A.12.6.1",
    title: "Management of Technical Vulnerabilities",
    description: "Timely identification and management of technical vulnerabilities",
    status: "Non-Compliant",
    owner: "IT Security",
    dueDate: "2024-03-01",
    lastAssessment: "2024-01-05",
    evidence: "Vulnerability scan reports",
    criticality: "Medium",
  },
];

// Mock data for incidents
const complianceIncidents = [
  {
    id: "1",
    title: "Data Access Control Violation",
    type: "Access Control",
    severity: "High",
    status: "Under Investigation",
    reportedDate: "2024-01-20",
    discoveredBy: "Internal Audit",
    assignedTo: "Security Team",
    dueDate: "2024-02-20",
    impact: "Unauthorized access to customer data",
  },
  {
    id: "2",
    title: "Policy Compliance Gap",
    type: "Policy Violation",
    severity: "Medium",
    status: "Resolved",
    reportedDate: "2024-01-15",
    discoveredBy: "Compliance Team",
    assignedTo: "HR Department",
    dueDate: "2024-02-15",
    impact: "Employee training requirements not met",
  },
];

// Mock metrics data
const complianceMetrics = {
  totalRisks: 45,
  highRisks: 8,
  complianceScore: 87,
  frameworksTracked: 12,
  activeIncidents: 3,
  overdueTasks: 7,
  controlsImplemented: 234,
  controlsEffective: 198,
};

const recentActivity = [
  {
    id: 1,
    type: "risk",
    title: "Risk Assessment Updated",
    description: "Cybersecurity Risk - Mitigation actions implemented",
    time: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    type: "compliance",
    title: "Compliance Check Completed",
    description: "GDPR Article 30 - Records updated",
    time: "4 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "incident",
    title: "Incident Resolved",
    description: "Access control violation - Remediation complete",
    time: "1 day ago",
    priority: "high",
  },
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "Risk Assessment Review",
    item: "Cybersecurity Risk Assessment",
    date: "2024-04-15",
    daysLeft: 67,
    type: "risk",
  },
  {
    id: 2,
    title: "Compliance Audit",
    item: "SOX 404 Internal Controls",
    date: "2024-03-01",
    daysLeft: 22,
    type: "compliance",
  },
  {
    id: 3,
    title: "Incident Investigation",
    item: "Data Access Control Violation",
    date: "2024-02-20",
    daysLeft: 12,
    type: "incident",
  },
];

export default function CompliancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
      case "active":
      case "resolved":
        return "bg-green-100 text-green-800";
      case "partially compliant":
      case "under review":
      case "under investigation":
        return "bg-yellow-100 text-yellow-800";
      case "non-compliant":
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-purple-100 text-purple-800";
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Risk & Compliance
          </h1>
          <p className="text-muted-foreground">
            Manage enterprise risk, compliance frameworks, and governance
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Risk Assessment
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics.totalRisks}</div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.highRisks} high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Control Effectiveness</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((complianceMetrics.controlsEffective / complianceMetrics.controlsImplemented) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.controlsEffective}/{complianceMetrics.controlsImplemented} controls effective
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.overdueTasks} overdue tasks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="risks">Risk Assessments</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Requirements</TabsTrigger>
          <TabsTrigger value="controls">Control Assessments</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search risk assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Risk Assessments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessments</CardTitle>
              <CardDescription>
                Enterprise risk register and assessment tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riskAssessments.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{risk.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {risk.mitigationActions} mitigation actions
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{risk.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(risk.riskLevel)}>
                          {risk.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{risk.riskScore}</div>
                          <div className="text-xs text-muted-foreground">
                            ({risk.likelihood} × {risk.impact})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{risk.owner}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(risk.status)}>
                          {risk.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(risk.reviewDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Assessment
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Update Risk
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Target className="h-4 w-4" />
                              Add Mitigation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements</CardTitle>
              <CardDescription>
                Track compliance across multiple frameworks and regulations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Framework</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Last Assessment</TableHead>
                    <TableHead>Criticality</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceRequirements.map((requirement) => (
                    <TableRow key={requirement.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{requirement.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {requirement.requirementId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{requirement.framework}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(requirement.status)}>
                          {requirement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{requirement.owner}</TableCell>
                      <TableCell>
                        {new Date(requirement.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(requirement.lastAssessment).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(requirement.criticality)}>
                          {requirement.criticality}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <FileText className="h-4 w-4" />
                              View Evidence
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Control Assessments</CardTitle>
              <CardDescription>
                Monitor and assess the effectiveness of implemented controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Control Assessment Portal</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive control testing and effectiveness tracking coming soon
                </p>
                <Button>Assess Controls</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Incidents</CardTitle>
              <CardDescription>
                Track and manage compliance violations and incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported Date</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {incident.impact}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{incident.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(incident.status)}>
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(incident.reportedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{incident.assignedTo}</TableCell>
                      <TableCell>
                        {new Date(incident.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Incident
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <FileText className="h-4 w-4" />
                              Generate Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Activity</CardTitle>
                <CardDescription>Latest updates across risk and compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle>Critical Deadlines</CardTitle>
                <CardDescription>Important compliance deadlines requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center space-x-4">
                      <AlertTriangle className={`h-4 w-4 ${
                        deadline.daysLeft <= 30 ? "text-red-500" : "text-yellow-500"
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {deadline.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deadline.item}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {deadline.daysLeft} days
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(deadline.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}