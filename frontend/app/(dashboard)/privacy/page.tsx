"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Database,
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
  Lock,
  Globe,
  FileX,
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

// Mock data for data processing activities
const processingActivities = [
  {
    id: "1",
    name: "Customer Data Management",
    dataController: "CounselFlow Inc.",
    purposes: ["Customer Service", "Marketing", "Analytics"],
    legalBasis: ["Consent", "Legitimate Interests"],
    dataCategories: ["Personal Data", "Financial Data"],
    dataSubjects: ["Customers", "Prospects"],
    retention: "7 years",
    riskLevel: "Medium",
    piaRequired: true,
    piaConducted: true,
    complianceScore: 92,
    status: "Active",
    lastReviewed: "2024-01-10",
  },
  {
    id: "2",
    name: "Employee HR Management",
    dataController: "CounselFlow Inc.",
    purposes: ["Employment Management", "Legal Compliance"],
    legalBasis: ["Contract", "Legal Obligation"],
    dataCategories: ["Personal Data", "Employment Data"],
    dataSubjects: ["Employees"],
    retention: "Employee lifetime + 10 years",
    riskLevel: "High",
    piaRequired: true,
    piaConducted: false,
    complianceScore: 78,
    status: "Under Review",
    lastReviewed: "2023-12-15",
  },
  {
    id: "3",
    name: "Website Analytics",
    dataController: "CounselFlow Inc.",
    purposes: ["Analytics", "Security"],
    legalBasis: ["Legitimate Interests"],
    dataCategories: ["Behavioral Data", "Location Data"],
    dataSubjects: ["Website Visitors"],
    retention: "2 years",
    riskLevel: "Low",
    piaRequired: false,
    piaConducted: false,
    complianceScore: 95,
    status: "Active",
    lastReviewed: "2024-01-05",
  },
];

// Mock data for subject requests
const subjectRequests = [
  {
    id: "1",
    requestType: "Access",
    subjectName: "John Smith",
    email: "john.smith@email.com",
    requestDate: "2024-01-15",
    dueDate: "2024-02-14",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "Privacy Team",
    daysLeft: 15,
  },
  {
    id: "2",
    requestType: "Erasure",
    subjectName: "Jane Doe",
    email: "jane.doe@email.com",
    requestDate: "2024-01-10",
    dueDate: "2024-02-09",
    status: "Completed",
    priority: "High",
    assignedTo: "Legal Team",
    daysLeft: 0,
  },
  {
    id: "3",
    requestType: "Rectification",
    subjectName: "Bob Johnson",
    email: "bob.johnson@email.com",
    requestDate: "2024-01-20",
    dueDate: "2024-02-19",
    status: "Under Review",
    priority: "Low",
    assignedTo: "Privacy Team",
    daysLeft: 20,
  },
];

// Mock metrics data
const privacyMetrics = {
  totalProcessingActivities: 47,
  highRiskActivities: 8,
  piasRequired: 12,
  piasCompleted: 9,
  subjectRequests: 23,
  overdueTasks: 4,
  complianceScore: 87,
  breachIncidents: 2,
};

const recentActivity = [
  {
    id: 1,
    type: "pia",
    title: "PIA Completed",
    description: "Employee Data Processing Assessment",
    time: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    type: "request",
    title: "Subject Request Received",
    description: "Data Access Request - Customer Portal",
    time: "4 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "review",
    title: "Processing Activity Updated",
    description: "Marketing Data Collection - Legal Basis Updated",
    time: "1 day ago",
    priority: "low",
  },
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "PIA Review Due",
    activity: "Customer Data Management",
    date: "2024-02-15",
    daysLeft: 16,
    type: "pia",
  },
  {
    id: 2,
    title: "Subject Request Response",
    activity: "Data Access Request",
    date: "2024-02-14",
    daysLeft: 15,
    type: "request",
  },
  {
    id: 3,
    title: "Retention Policy Review",
    activity: "Employee HR Management",
    date: "2024-02-20",
    daysLeft: 21,
    type: "review",
  },
];

export default function PrivacyPage() {
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
      case "active":
      case "completed":
        return "bg-green-100 text-green-800";
      case "under review":
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
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

  const getComplianceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Data Privacy & PIA
          </h1>
          <p className="text-muted-foreground">
            Manage data protection, privacy impact assessments, and GDPR compliance
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Processing Activity
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Activities</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyMetrics.totalProcessingActivities}</div>
            <p className="text-xs text-muted-foreground">
              {privacyMetrics.highRiskActivities} high risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PIA Progress</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {privacyMetrics.piasCompleted}/{privacyMetrics.piasRequired}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((privacyMetrics.piasCompleted / privacyMetrics.piasRequired) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(privacyMetrics.complianceScore)}`}>
              {privacyMetrics.complianceScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subject Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyMetrics.subjectRequests}</div>
            <p className="text-xs text-muted-foreground">
              {privacyMetrics.overdueTasks} overdue responses
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activities">Processing Activities</TabsTrigger>
          <TabsTrigger value="pia">Privacy Impact Assessments</TabsTrigger>
          <TabsTrigger value="requests">Subject Rights Requests</TabsTrigger>
          <TabsTrigger value="breaches">Data Breaches</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search processing activities..."
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

          {/* Processing Activities Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Processing Activities</CardTitle>
              <CardDescription>
                Record of processing activities under GDPR Article 30
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Data Categories</TableHead>
                    <TableHead>Legal Basis</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>PIA Status</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Last Review</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processingActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.dataController}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {activity.dataCategories.map((category) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {activity.legalBasis.map((basis) => (
                            <Badge key={basis} variant="outline" className="text-xs">
                              {basis}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(activity.riskLevel)}>
                          {activity.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {activity.piaRequired ? (
                            activity.piaConducted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">Not required</span>
                          )}
                          <span className="text-sm">
                            {activity.piaRequired ? (activity.piaConducted ? "Complete" : "Required") : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                activity.complianceScore >= 90 ? "bg-green-500" :
                                activity.complianceScore >= 75 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${activity.complianceScore}%` }}
                            />
                          </div>
                          <span className="text-sm">{activity.complianceScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(activity.lastReviewed).toLocaleDateString()}
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
                              Edit Activity
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <FileText className="h-4 w-4" />
                              Generate PIA
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

        <TabsContent value="pia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Impact Assessments</CardTitle>
              <CardDescription>
                GDPR Article 35 compliance assessments for high-risk processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Privacy Impact Assessment Portal</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive PIA management and tracking coming soon
                </p>
                <Button>Conduct New PIA</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Rights Requests</CardTitle>
              <CardDescription>
                GDPR Article 15-22 subject access, rectification, and erasure requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Badge variant="outline">{request.requestType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.subjectName}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(request.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.assignedTo}</TableCell>
                      <TableCell>
                        <span className={request.daysLeft <= 7 ? "text-red-600 font-medium" : ""}>
                          {request.daysLeft} days
                        </span>
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
                              View Request
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <FileText className="h-4 w-4" />
                              Generate Response
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

        <TabsContent value="breaches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Breach Incidents</CardTitle>
              <CardDescription>
                GDPR Article 33-34 breach notification and incident management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Breach Incident Management</h3>
                <p className="text-muted-foreground mb-4">
                  Data breach tracking and notification system coming soon
                </p>
                <Button variant="destructive">Report Breach</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Privacy Activity</CardTitle>
                <CardDescription>Latest updates across privacy management</CardDescription>
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
                <CardDescription>Important privacy deadlines requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center space-x-4">
                      <AlertTriangle className={`h-4 w-4 ${
                        deadline.daysLeft <= 7 ? "text-red-500" : "text-yellow-500"
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {deadline.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deadline.activity}
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