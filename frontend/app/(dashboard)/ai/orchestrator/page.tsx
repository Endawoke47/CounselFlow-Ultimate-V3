"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Plus,
  Search,
  Filter,
  Calendar,
  Bot,
  Brain,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  Sparkles,
  MessageSquare,
  FileSearch,
  PenTool,
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

// Mock data for AI services
const aiServices = [
  {
    id: "1",
    name: "Contract Analysis Service",
    type: "Document Analysis",
    model: "GPT-4",
    status: "Active",
    accuracy: 94.5,
    requestsToday: 127,
    avgResponseTime: "2.3s",
    lastUsed: "2024-01-20T10:30:00Z",
    costPerRequest: 0.15,
    description: "AI-powered contract review and risk assessment with consensus analysis",
  },
  {
    id: "2",
    name: "Legal Research Assistant",
    type: "Research",
    model: "Claude-3",
    status: "Active",
    accuracy: 92.1,
    requestsToday: 89,
    avgResponseTime: "4.1s",
    lastUsed: "2024-01-20T09:45:00Z",
    costPerRequest: 0.22,
    description: "Comprehensive legal research with case law and regulatory analysis",
  },
  {
    id: "3",
    name: "Document Generator",
    type: "Content Generation",
    model: "Gemini Pro",
    status: "Active",
    accuracy: 88.7,
    requestsToday: 45,
    avgResponseTime: "3.7s",
    lastUsed: "2024-01-20T08:15:00Z",
    costPerRequest: 0.18,
    description: "Multi-LLM document generation with consensus synthesis",
  },
  {
    id: "4",
    name: "Compliance Checker",
    type: "Compliance",
    model: "GPT-4",
    status: "Active",
    accuracy: 96.2,
    requestsToday: 73,
    avgResponseTime: "1.8s",
    lastUsed: "2024-01-20T11:15:00Z",
    costPerRequest: 0.12,
    description: "Regulatory compliance verification and gap analysis",
  },
  {
    id: "5",
    name: "Litigation Strategy Analyzer",
    type: "Strategic Analysis",
    model: "Claude-3",
    status: "Active",
    accuracy: 91.8,
    requestsToday: 34,
    avgResponseTime: "5.2s",
    lastUsed: "2024-01-20T10:45:00Z",
    costPerRequest: 0.28,
    description: "AI-powered litigation strategy and case strength analysis",
  },
  {
    id: "6",
    name: "Legal Memo Generator",
    type: "Content Generation",
    model: "GPT-4",
    status: "Active",
    accuracy: 93.4,
    requestsToday: 28,
    avgResponseTime: "6.1s",
    lastUsed: "2024-01-20T09:30:00Z",
    costPerRequest: 0.32,
    description: "Professional legal memorandum generation with structured analysis",
  },
  {
    id: "7",
    name: "Multi-Provider Consensus Engine",
    type: "Orchestration",
    model: "Multi-LLM",
    status: "Active",
    accuracy: 97.1,
    requestsToday: 156,
    avgResponseTime: "8.4s",
    lastUsed: "2024-01-20T10:50:00Z",
    costPerRequest: 0.45,
    description: "Advanced consensus analysis using multiple AI providers",
  },
];

// Mock data for recent AI tasks
const recentTasks = [
  {
    id: "1",
    service: "Contract Analysis Service",
    task: "Review Software License Agreement",
    user: "Sarah Chen",
    status: "Completed",
    duration: "2.1s",
    accuracy: 95.2,
    timestamp: "2024-01-20T10:30:00Z",
    insights: ["High risk clause identified", "Non-standard termination terms"],
  },
  {
    id: "2",
    service: "Legal Research Assistant",
    task: "Research employment law precedents",
    user: "Michael Rodriguez",
    status: "In Progress",
    duration: "4.5s",
    accuracy: null,
    timestamp: "2024-01-20T10:25:00Z",
    insights: [],
  },
  {
    id: "3",
    service: "Document Generator",
    task: "Generate NDA template",
    user: "Dr. Lisa Wang",
    status: "Completed",
    duration: "3.2s",
    accuracy: 91.8,
    timestamp: "2024-01-20T10:15:00Z",
    insights: ["Standard bilateral terms applied", "Jurisdiction clause added"],
  },
];

// Mock metrics data
const aiMetrics = {
  totalRequests: 1247,
  activeServices: 3,
  averageAccuracy: 92.8,
  totalCost: 234.50,
  successRate: 97.2,
  avgResponseTime: "3.1s",
  modelsUsed: 4,
  costSavings: 15600,
};

const recentActivity = [
  {
    id: 1,
    type: "service",
    title: "New AI Service Deployed",
    description: "Contract Analysis Service v2.1 - Enhanced risk detection",
    time: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    type: "analysis",
    title: "Bulk Document Analysis Completed",
    description: "127 contracts processed with 94.5% accuracy",
    time: "4 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "model",
    title: "Model Performance Updated",
    description: "GPT-4 accuracy improved to 96.2% for compliance tasks",
    time: "1 day ago",
    priority: "low",
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: "Model Training Session",
    service: "Contract Analysis Service",
    date: "2024-01-22",
    daysLeft: 2,
    type: "training",
  },
  {
    id: 2,
    title: "Performance Review",
    service: "Legal Research Assistant",
    date: "2024-01-25",
    daysLeft: 5,
    type: "review",
  },
  {
    id: 3,
    title: "Service Maintenance",
    service: "Compliance Checker",
    date: "2024-01-21",
    daysLeft: 1,
    type: "maintenance",
  },
];

export default function AIOrchestrator() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
        return "bg-green-100 text-green-800";
      case "in progress":
      case "training":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getModelIcon = (model: string) => {
    switch (model.toLowerCase()) {
      case "gpt-4":
        return <Brain className="h-4 w-4 text-green-600" />;
      case "claude-3":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case "gemini pro":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case "multi-llm":
        return <Zap className="h-4 w-4 text-orange-600" />;
      default:
        return <Bot className="h-4 w-4 text-gray-600" />;
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
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            AI Orchestrator
          </h1>
          <p className="text-muted-foreground">
            Manage AI services, monitor performance, and orchestrate intelligent legal workflows
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Deploy New Service
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.averageAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+1.2%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {aiMetrics.activeServices} services active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aiMetrics.costSavings)}</div>
            <p className="text-xs text-muted-foreground">
              vs manual processing
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">AI Services</TabsTrigger>
          <TabsTrigger value="consensus">Consensus Analysis</TabsTrigger>
          <TabsTrigger value="tasks">Recent Tasks</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* AI Service Actions */}
          <div className="flex gap-4 mb-6">
            <Button className="gap-2">
              <FileSearch className="h-4 w-4" />
              Analyze Contract
            </Button>
            <Button variant="outline" className="gap-2">
              <PenTool className="h-4 w-4" />
              Generate Document
            </Button>
            <Button variant="outline" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Legal Research
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Strategy Analysis
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search AI services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </Button>
          </div>

          {/* AI Services Table */}
          <Card>
            <CardHeader>
              <CardTitle>AI Services</CardTitle>
              <CardDescription>
                Monitor and manage deployed AI services and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Requests Today</TableHead>
                    <TableHead>Avg Response</TableHead>
                    <TableHead>Cost/Request</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {service.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getModelIcon(service.model)}
                          <Badge variant="outline">{service.model}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${service.accuracy}%` }}
                            />
                          </div>
                          <span className="text-sm">{service.accuracy}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{service.requestsToday}</div>
                      </TableCell>
                      <TableCell>{service.avgResponseTime}</TableCell>
                      <TableCell>{formatCurrency(service.costPerRequest)}</TableCell>
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
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Performance
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

        <TabsContent value="consensus" className="space-y-6">
          {/* Consensus Analysis Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Multi-LLM Consensus Engine
                </CardTitle>
                <CardDescription>
                  Advanced analysis using multiple AI providers for enhanced accuracy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Providers</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Brain className="h-3 w-3" />
                        GPT-4
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Claude-3
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        Gemini Pro
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consensus Accuracy</span>
                    <span className="font-medium text-green-600">97.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Provider Agreement Rate</span>
                    <span className="font-medium">92.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Consensus Analyses</span>
                    <span className="font-medium">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consensus Analysis Types</CardTitle>
                <CardDescription>
                  Available consensus analysis capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSearch className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Contract Risk Assessment</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PenTool className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Document Generation</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Compliance Analysis</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Legal Strategy</span>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Consensus Analyses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Consensus Analyses</CardTitle>
              <CardDescription>
                Latest multi-provider AI analyses with consensus results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileSearch className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Software License Agreement Analysis</div>
                      <div className="text-sm text-muted-foreground">
                        3 providers analyzed • 96.2% consensus accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">Risk Score: 7.2/10</div>
                    <div className="text-sm text-muted-foreground">2 min ago</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <PenTool className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">NDA Document Generation</div>
                      <div className="text-sm text-muted-foreground">
                        2 providers synthesized • Enhanced with consensus review
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">Quality: 94.5%</div>
                    <div className="text-sm text-muted-foreground">8 min ago</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">GDPR Compliance Review</div>
                      <div className="text-sm text-muted-foreground">
                        3 providers analyzed • 98.1% consensus accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">Compliance: 8.9/10</div>
                    <div className="text-sm text-muted-foreground">15 min ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Tasks</CardTitle>
              <CardDescription>
                Monitor recent AI service executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{task.task}</div>
                          {task.insights.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {task.insights.length} insights generated
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.service}</Badge>
                      </TableCell>
                      <TableCell>{task.user}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.duration}</TableCell>
                      <TableCell>
                        {task.accuracy ? (
                          <span className="text-sm">{task.accuracy}%</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>{formatTimestamp(task.timestamp)}</TableCell>
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
                              View Results
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <FileText className="h-4 w-4" />
                              Export Report
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

        <TabsContent value="models" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
                <CardDescription>
                  Accuracy and performance metrics across different models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getModelIcon(service.model)}
                        <div>
                          <div className="font-medium">{service.model}</div>
                          <div className="text-sm text-muted-foreground">{service.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{service.accuracy}%</div>
                        <div className="text-sm text-muted-foreground">{service.avgResponseTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>
                  Cost breakdown by service and model usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Daily Cost</span>
                    <span className="font-medium">{formatCurrency(aiMetrics.totalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Cost per Request</span>
                    <span className="font-medium">
                      {formatCurrency(aiMetrics.totalCost / aiMetrics.totalRequests)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Projection</span>
                    <span className="font-medium">{formatCurrency(aiMetrics.totalCost * 30)}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Estimated Savings</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(aiMetrics.costSavings)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Activity</CardTitle>
                <CardDescription>Latest updates across AI services</CardDescription>
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

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Tasks</CardTitle>
                <CardDescription>Upcoming AI service maintenance and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-4">
                      <AlertTriangle className={`h-4 w-4 ${
                        task.daysLeft <= 1 ? "text-red-500" : "text-yellow-500"
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.service}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {task.daysLeft} days
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(task.date).toLocaleDateString()}
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