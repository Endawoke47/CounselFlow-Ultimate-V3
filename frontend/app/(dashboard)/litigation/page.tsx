"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gavel,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
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

// Mock data for litigation cases
const litigationCases = [
  {
    id: "1",
    caseNumber: "LIT-2024-0001",
    title: "Johnson vs. TechCorp Inc.",
    disputeType: "Employment Dispute",
    status: "Active",
    stage: "Discovery",
    court: "Superior Court of California",
    jurisdiction: "Los Angeles County",
    ourRole: "Defendant",
    amountInControversy: 2500000,
    trialDate: "2024-04-15",
    leadAttorney: "Sarah Chen",
    daysToTrial: 45,
    priority: "High",
    winProbability: 72,
  },
  {
    id: "2",
    caseNumber: "LIT-2024-0002",
    title: "ABC Corp vs. Competitor LLC",
    disputeType: "Contract Dispute",
    status: "Active",
    stage: "Motion Practice",
    court: "U.S. District Court",
    jurisdiction: "Northern District of California",
    ourRole: "Plaintiff",
    amountInControversy: 5000000,
    trialDate: "2024-06-20",
    leadAttorney: "Michael Rodriguez",
    daysToTrial: 98,
    priority: "High",
    winProbability: 85,
  },
  {
    id: "3",
    caseNumber: "LIT-2024-0003",
    title: "Patent Infringement Matter",
    disputeType: "Intellectual Property",
    status: "Settled",
    stage: "Closed",
    court: "U.S. District Court",
    jurisdiction: "Eastern District of Texas",
    ourRole: "Plaintiff",
    amountInControversy: 15000000,
    trialDate: null,
    leadAttorney: "Dr. Lisa Wang",
    daysToTrial: null,
    priority: "Medium",
    winProbability: null,
  },
];

// Mock metrics data
const litigationMetrics = {
  totalActiveCases: 23,
  totalCasesThisYear: 67,
  averageWinRate: 78,
  totalAmountInControversy: 125000000,
  averageCaseDuration: 18,
  upcomingTrials: 5,
  overdueTasks: 12,
  settlementRate: 62,
};

const recentActivity = [
  {
    id: 1,
    type: "motion",
    title: "Motion for Summary Judgment Filed",
    case: "Johnson vs. TechCorp Inc.",
    time: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    type: "discovery",
    title: "Discovery Response Received",
    case: "ABC Corp vs. Competitor LLC",
    time: "4 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "expert",
    title: "Expert Witness Report Submitted",
    case: "Patent Infringement Matter",
    time: "1 day ago",
    priority: "low",
  },
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "Discovery Cutoff",
    case: "Johnson vs. TechCorp Inc.",
    date: "2024-01-20",
    daysLeft: 8,
    type: "discovery",
  },
  {
    id: 2,
    title: "Expert Disclosure Deadline",
    case: "ABC Corp vs. Competitor LLC",
    date: "2024-01-25",
    daysLeft: 13,
    type: "expert",
  },
  {
    id: 3,
    title: "Motion Hearing",
    case: "Contract Breach Matter",
    date: "2024-01-18",
    daysLeft: 6,
    type: "motion",
  },
];

export default function LitigationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "settled":
        return "bg-blue-100 text-blue-800";
      case "dismissed":
        return "bg-gray-100 text-gray-800";
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Gavel className="h-8 w-8 text-primary" />
            Litigation & Disputes
          </h1>
          <p className="text-muted-foreground">
            Manage litigation cases, discovery, motions, and trial preparation
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Case
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{litigationMetrics.totalActiveCases}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{litigationMetrics.averageWinRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total at Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(litigationMetrics.totalAmountInControversy)}
            </div>
            <p className="text-xs text-muted-foreground">Across all active cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trials</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{litigationMetrics.upcomingTrials}</div>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cases" className="space-y-6">
        <TabsList>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
          <TabsTrigger value="motions">Motions</TabsTrigger>
          <TabsTrigger value="experts">Expert Witnesses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases by title, case number, or client..."
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

          {/* Cases Table */}
          <Card>
            <CardHeader>
              <CardTitle>Litigation Cases</CardTitle>
              <CardDescription>
                Overview of all litigation cases and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Trial Date</TableHead>
                    <TableHead>Attorney</TableHead>
                    <TableHead>Win %</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {litigationCases.map((litigationCase) => (
                    <TableRow key={litigationCase.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{litigationCase.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {litigationCase.caseNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{litigationCase.disputeType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(litigationCase.status)}>
                          {litigationCase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{litigationCase.stage}</TableCell>
                      <TableCell>
                        {formatCurrency(litigationCase.amountInControversy)}
                      </TableCell>
                      <TableCell>
                        {litigationCase.trialDate ? (
                          <div>
                            <div>{new Date(litigationCase.trialDate).toLocaleDateString()}</div>
                            {litigationCase.daysToTrial && (
                              <div className="text-sm text-muted-foreground">
                                {litigationCase.daysToTrial} days
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>{litigationCase.leadAttorney}</TableCell>
                      <TableCell>
                        {litigationCase.winProbability ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${litigationCase.winProbability}%` }}
                              />
                            </div>
                            <span className="text-sm">{litigationCase.winProbability}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
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
                              Edit Case
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

        <TabsContent value="discovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Discovery Management</CardTitle>
              <CardDescription>
                Track discovery requests, responses, and document production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Discovery Module</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive discovery management coming soon
                </p>
                <Button>Add Discovery Request</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Motion Practice</CardTitle>
              <CardDescription>
                Manage legal motions, hearings, and court filings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Motion Practice</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced motion tracking and management coming soon
                </p>
                <Button>File New Motion</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expert Witnesses</CardTitle>
              <CardDescription>
                Manage expert witness engagements and disclosure schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Expert Witness Management</h3>
                <p className="text-muted-foreground mb-4">
                  Expert witness coordination and tracking coming soon
                </p>
                <Button>Add Expert Witness</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Litigation Activity</CardTitle>
                <CardDescription>Latest updates across all cases</CardDescription>
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
                          {activity.case}
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
                <CardDescription>Important dates requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="flex items-center space-x-4">
                      <AlertCircle className={`h-4 w-4 ${
                        deadline.daysLeft <= 7 ? "text-red-500" : "text-yellow-500"
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {deadline.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {deadline.case}
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