"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  DollarSign,
  AlertTriangle,
  Plus,
  Brain,
  Shield,
  Zap,
  BarChart3,
  Clock,
  Scale,
  Bot,
  Target,
  Award,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

// Enhanced professional legal dashboard data with AI insights
const stats = [
  {
    title: "Active Clients",
    value: "127",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
    trend: "up",
    insight: "New enterprise clients acquired",
    color: "bg-counselflow-primary"
  },
  {
    title: "Open Matters",
    value: "43",
    change: "+3%",
    changeType: "positive" as const,
    icon: Briefcase,
    trend: "up",
    insight: "5 high-priority litigation cases",
    color: "bg-counselflow-bright"
  },
  {
    title: "AI Risk Score",
    value: "7.2/10",
    change: "+0.3",
    changeType: "negative" as const,
    icon: Brain,
    trend: "warning",
    insight: "3 contracts need immediate review",
    color: "bg-counselflow-warning"
  },
  {
    title: "Revenue (MTD)",
    value: "$284,500",
    change: "+22%",
    changeType: "positive" as const,
    icon: DollarSign,
    trend: "up",
    insight: "Exceeding monthly targets",
    color: "bg-counselflow-success"
  },
];

const aiInsights = [
  {
    id: 1,
    type: "risk",
    title: "High-Risk Contract Detected",
    description: "Microsoft Service Agreement contains unusual liability clauses",
    severity: "high",
    action: "Review liability terms in Section 12.3",
    confidence: 94,
    icon: Shield
  },
  {
    id: 2,
    type: "opportunity",
    title: "Workflow Optimization",
    description: "Document review process can be automated for 40% time savings",
    severity: "medium",
    action: "Implement AI document classification",
    confidence: 87,
    icon: Zap
  },
  {
    id: 3,
    type: "deadline",
    title: "Statute of Limitations Alert",
    description: "Johnson vs. ABC Corp filing deadline approaching",
    severity: "critical",
    action: "File motion within 72 hours",
    confidence: 99,
    icon: Clock
  }
];

const practiceMetrics = [
  {
    title: "Matter Complexity",
    current: 7.2,
    target: 6.0,
    progress: 85,
    trend: "increasing",
    icon: Target
  },
  {
    title: "Client Satisfaction",
    current: 9.1,
    target: 9.0,
    progress: 91,
    trend: "stable",
    icon: Award
  },
  {
    title: "AI Efficiency Gain",
    current: 34,
    target: 40,
    progress: 68,
    trend: "improving",
    icon: Bot
  }
];

const recentActivity = [
  {
    id: 1,
    type: "ai_analysis",
    title: "AI Risk Assessment Completed",
    description: "Contract analysis flagged 3 high-risk clauses in Enterprise SaaS Agreement",
    time: "15 minutes ago",
    priority: "high" as const,
    icon: Brain
  },
  {
    id: 2,
    type: "matter",
    title: "Litigation Matter Filed",
    description: "Johnson vs. ABC Corp - Employment discrimination claim initiated",
    time: "2 hours ago",
    priority: "critical" as const,
    icon: Scale
  },
  {
    id: 3,
    type: "contract",
    title: "Contract Executed",
    description: "Microsoft Service Agreement - $2.4M annual value",
    time: "4 hours ago",
    priority: "medium" as const,
    icon: FileText
  },
  {
    id: 4,
    type: "client",
    title: "Enterprise Client Onboarded",
    description: "TechUnicorn Inc. - Series B funding and IP portfolio",
    time: "1 day ago",
    priority: "medium" as const,
    icon: Users
  },
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "Statute of Limitations",
    matter: "Johnson vs. ABC Corp",
    date: "2024-01-15",
    daysLeft: 3,
    priority: "critical" as const,
    type: "legal_deadline",
    aiInsight: "Critical filing deadline - motion must be filed"
  },
  {
    id: 2,
    title: "Discovery Cutoff",
    matter: "TechCorp IP Litigation", 
    date: "2024-01-18",
    daysLeft: 6,
    priority: "high" as const,
    type: "procedural",
    aiInsight: "Expert witness depositions pending"
  },
  {
    id: 3,
    title: "Contract Renewal",
    matter: "Microsoft Enterprise Agreement",
    date: "2024-01-22",
    daysLeft: 10,
    priority: "medium" as const,
    type: "commercial",
    aiInsight: "Renegotiate pricing terms for better value"
  },
  {
    id: 4,
    title: "Patent Filing",
    matter: "AI Algorithm Patent App",
    date: "2024-01-25",
    daysLeft: 13,
    priority: "high" as const,
    type: "ip",
    aiInsight: "Prior art search completed - strong patentability"
  }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-700 bg-red-100 border-red-200";
      case "high":
        return "text-orange-700 bg-orange-100 border-orange-200";
      case "medium":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "low":
        return "text-green-700 bg-green-100 border-green-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high": 
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-counselflow-light/20 to-white min-h-screen">
      {/* Enhanced Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-counselflow-dark">
            {getTimeOfDayGreeting()}, {user?.first_name}!
          </h1>
          <p className="text-lg text-counselflow-neutral mt-2">
            Your CounselFlow command center - powered by AI insights
          </p>
          <div className="flex items-center mt-3 text-sm text-counselflow-neutral">
            <Clock className="h-4 w-4 mr-2" />
            {currentTime.toLocaleString()}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-br from-counselflow-primary to-counselflow-bright rounded-xl flex items-center justify-center shadow-lg">
            <Scale className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-counselflow-dark">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-counselflow-dark mb-2">{stat.value}</div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${stat.changeType === "positive" ? "text-counselflow-success" : "text-counselflow-warning"}`}>
                  {stat.change}
                </span>
                <TrendingUp className={`h-4 w-4 ${stat.changeType === "positive" ? "text-counselflow-success" : "text-counselflow-warning"}`} />
              </div>
              <p className="text-xs text-counselflow-neutral mt-1 truncate">
                {stat.insight}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-counselflow-primary/5 to-counselflow-bright/5">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-counselflow-primary to-counselflow-bright rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-counselflow-dark">AI-Powered Legal Insights</CardTitle>
              <CardDescription className="text-counselflow-neutral">
                Real-time analysis and recommendations from CounselFlow AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="border border-counselflow-primary/20 hover:border-counselflow-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityColor(insight.severity)}`}>
                      <insight.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-counselflow-dark truncate">{insight.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-counselflow-neutral mb-3 line-clamp-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-counselflow-primary">
                          {insight.action}
                        </span>
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enhanced Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-counselflow-primary" />
              <CardTitle className="text-counselflow-dark">Recent Activity</CardTitle>
            </div>
            <CardDescription className="text-counselflow-neutral">
              Latest updates across your legal practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-counselflow-light/20 transition-colors">
                  <div className="w-8 h-8 bg-counselflow-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <activity.icon className="h-4 w-4 text-counselflow-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-counselflow-dark truncate">
                        {activity.title}
                      </p>
                      <Badge className={`${getPriorityColor(activity.priority)} text-xs border`}>
                        {activity.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-counselflow-neutral line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                    <p className="text-xs text-counselflow-neutral">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-counselflow-primary/10">
              <Link href="/dashboard/activity">
                <Button variant="ghost" className="w-full text-counselflow-primary hover:bg-counselflow-primary/10">
                  View All Activity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Upcoming Deadlines */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-counselflow-primary" />
              <CardTitle className="text-counselflow-dark">Critical Deadlines</CardTitle>
            </div>
            <CardDescription className="text-counselflow-neutral">
              Important dates requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="p-4 rounded-lg border border-counselflow-primary/20 hover:border-counselflow-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        deadline.daysLeft <= 3 ? "text-red-500" : 
                        deadline.daysLeft <= 7 ? "text-orange-500" : "text-yellow-500"
                      }`} />
                      <div>
                        <p className="text-sm font-semibold text-counselflow-dark">
                          {deadline.title}
                        </p>
                        <p className="text-sm text-counselflow-neutral">
                          {deadline.matter}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                        {deadline.daysLeft} days
                      </div>
                      <p className="text-xs text-counselflow-neutral mt-1">
                        {new Date(deadline.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Lightbulb className="h-3 w-3 text-counselflow-bright" />
                      <span className="text-xs text-counselflow-neutral">
                        {deadline.aiInsight}
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-counselflow-primary">
                      Take Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-counselflow-primary/10">
              <Link href="/dashboard/deadlines">
                <Button variant="ghost" className="w-full text-counselflow-primary hover:bg-counselflow-primary/10">
                  View All Deadlines
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Practice Performance Metrics */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-counselflow-light/10 to-counselflow-bright/10">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-counselflow-primary" />
            <CardTitle className="text-counselflow-dark">Practice Performance</CardTitle>
          </div>
          <CardDescription className="text-counselflow-neutral">
            Key performance indicators and targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {practiceMetrics.map((metric) => (
              <div key={metric.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className="h-4 w-4 text-counselflow-primary" />
                    <span className="text-sm font-medium text-counselflow-dark">{metric.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {metric.trend}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-counselflow-neutral">Current: {metric.current}</span>
                    <span className="text-counselflow-neutral">Target: {metric.target}</span>
                  </div>
                  <Progress value={metric.progress} className="h-2" />
                  <p className="text-xs text-counselflow-neutral">
                    {metric.progress}% of target achieved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-counselflow-primary" />
            <CardTitle className="text-counselflow-dark">Quick Actions</CardTitle>
          </div>
          <CardDescription className="text-counselflow-neutral">
            Start new work or access AI-powered tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/clients">
              <Button className="h-24 w-full flex-col gap-3 bg-counselflow-primary hover:bg-counselflow-dark text-white shadow-lg">
                <Users className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-semibold">New Client</div>
                  <div className="text-xs opacity-90">Onboard enterprise client</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/matters">
              <Button variant="outline" className="h-24 w-full flex-col gap-3 border-counselflow-primary/30 hover:bg-counselflow-primary/10 hover:border-counselflow-primary">
                <Briefcase className="h-8 w-8 text-counselflow-primary" />
                <div className="text-center">
                  <div className="font-semibold text-counselflow-dark">New Matter</div>
                  <div className="text-xs text-counselflow-neutral">Create legal matter</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/contracts">
              <Button variant="outline" className="h-24 w-full flex-col gap-3 border-counselflow-bright/30 hover:bg-counselflow-bright/10 hover:border-counselflow-bright">
                <FileText className="h-8 w-8 text-counselflow-bright" />
                <div className="text-center">
                  <div className="font-semibold text-counselflow-dark">New Contract</div>
                  <div className="text-xs text-counselflow-neutral">AI-powered drafting</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/ai/contract-analysis">
              <Button variant="outline" className="h-24 w-full flex-col gap-3 border-counselflow-warning/30 hover:bg-counselflow-warning/10 hover:border-counselflow-warning">
                <Brain className="h-8 w-8 text-counselflow-warning" />
                <div className="text-center">
                  <div className="font-semibold text-counselflow-dark">AI Analysis</div>
                  <div className="text-xs text-counselflow-neutral">Contract & risk review</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}