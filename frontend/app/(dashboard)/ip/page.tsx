"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb,
  Plus,
  Search,
  Filter,
  Calendar,
  Award,
  Copyright,
  Trademark,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  Shield,
  Globe,
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

// Mock data for IP assets
const ipAssets = [
  {
    id: "1",
    title: "Machine Learning Algorithm for Data Processing",
    type: "Patent",
    status: "Granted",
    applicationNumber: "US16/123,456",
    filingDate: "2023-03-15",
    grantDate: "2024-01-10",
    expirationDate: "2043-03-15",
    inventor: "Dr. Sarah Chen",
    assignee: "TechCorp Inc.",
    jurisdictions: ["US", "EU", "JP"],
    priority: "High",
    renewalDue: "2025-03-15",
    estimatedValue: 2500000,
  },
  {
    id: "2",
    title: "COUNSELFLOW",
    type: "Trademark",
    status: "Registered",
    applicationNumber: "US87/654,321",
    filingDate: "2022-08-20",
    grantDate: "2023-06-15",
    expirationDate: "2033-06-15",
    inventor: "Legal Team",
    assignee: "CounselFlow Inc.",
    jurisdictions: ["US", "CA"],
    priority: "High",
    renewalDue: "2028-06-15",
    estimatedValue: 500000,
  },
  {
    id: "3",
    title: "User Interface Design System",
    type: "Design Patent",
    status: "Pending",
    applicationNumber: "US30/789,012",
    filingDate: "2024-01-05",
    grantDate: null,
    expirationDate: "2039-01-05",
    inventor: "Design Team",
    assignee: "TechCorp Inc.",
    jurisdictions: ["US"],
    priority: "Medium",
    renewalDue: null,
    estimatedValue: 150000,
  },
  {
    id: "4",
    title: "Software Documentation Suite",
    type: "Copyright",
    status: "Registered",
    applicationNumber: "TX0009123456",
    filingDate: "2023-12-01",
    grantDate: "2023-12-15",
    expirationDate: "2098-12-01",
    inventor: "Development Team",
    assignee: "TechCorp Inc.",
    jurisdictions: ["US"],
    priority: "Low",
    renewalDue: null,
    estimatedValue: 75000,
  },
];

// Mock metrics data
const ipMetrics = {
  totalAssets: 156,
  activePatents: 67,
  pendingApplications: 23,
  trademarks: 45,
  portfolioValue: 45000000,
  renewalsDue: 8,
  expiringAssets: 12,
  newFilings: 15,
};

const recentActivity = [
  {
    id: 1,
    type: "patent",
    title: "Patent Application Filed",
    description: "AI-based Legal Document Analysis System",
    time: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    type: "trademark",
    title: "Trademark Registration Complete",
    description: "LEGALTECH Pro - Class 42",
    time: "1 day ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "renewal",
    title: "Patent Renewal Due",
    description: "Data Processing Algorithm - US Patent",
    time: "3 days ago",
    priority: "high",
  },
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "Patent Renewal Fee",
    asset: "Machine Learning Algorithm",
    date: "2024-03-15",
    daysLeft: 35,
    type: "renewal",
    fee: 1600,
  },
  {
    id: 2,
    title: "Trademark Renewal",
    asset: "COUNSELFLOW Mark",
    date: "2024-06-15",
    daysLeft: 127,
    type: "renewal",
    fee: 725,
  },
  {
    id: 3,
    title: "Response to Office Action",
    asset: "UI Design Patent Application",
    date: "2024-02-10",
    daysLeft: 12,
    type: "response",
    fee: 0,
  },
];

export default function IPPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "granted":
      case "registered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "abandoned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "patent":
        return <Award className="h-4 w-4" />;
      case "trademark":
        return <Trademark className="h-4 w-4" />;
      case "copyright":
        return <Copyright className="h-4 w-4" />;
      case "design patent":
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
            <Lightbulb className="h-8 w-8 text-primary" />
            Intellectual Property
          </h1>
          <p className="text-muted-foreground">
            Manage patents, trademarks, copyrights, and IP portfolio strategy
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New IP Asset
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipMetrics.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12</span> this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patents</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipMetrics.activePatents}</div>
            <p className="text-xs text-muted-foreground">
              {ipMetrics.pendingApplications} pending applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(ipMetrics.portfolioValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ipMetrics.renewalsDue}</div>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="patents">Patents</TabsTrigger>
          <TabsTrigger value="trademarks">Trademarks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search IP assets by title, number, or inventor..."
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

          {/* IP Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>IP Portfolio</CardTitle>
              <CardDescription>
                Overview of all intellectual property assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Jurisdictions</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(asset.type)}
                          </div>
                          <div>
                            <div className="font-medium">{asset.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {asset.applicationNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{asset.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(asset.filingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(asset.expirationDate).toLocaleDateString()}</div>
                          {asset.renewalDue && (
                            <div className="text-sm text-muted-foreground">
                              Next renewal: {new Date(asset.renewalDue).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {asset.jurisdictions.map((jurisdiction) => (
                            <Badge key={jurisdiction} variant="secondary" className="text-xs">
                              {jurisdiction}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(asset.estimatedValue)}
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
                              Edit Asset
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

        <TabsContent value="patents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patent Portfolio</CardTitle>
              <CardDescription>
                Manage patent applications, grants, and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Patent Management</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced patent portfolio management coming soon
                </p>
                <Button>File New Patent</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trademarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trademark Portfolio</CardTitle>
              <CardDescription>
                Manage trademark registrations and renewals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Trademark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Trademark Management</h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive trademark tracking coming soon
                </p>
                <Button>Register New Trademark</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent IP Activity</CardTitle>
                <CardDescription>Latest updates across your IP portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(activity.type)}
                      </div>
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
                <CardDescription>Important IP deadlines requiring attention</CardDescription>
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
                          {deadline.asset}
                        </p>
                        {deadline.fee > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Fee: {formatCurrency(deadline.fee)}
                          </p>
                        )}
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