"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  TrendingUp, 
  Calendar,
  DollarSign,
  AlertTriangle,
  Plus
} from "lucide-react";
import { useAuth } from "@/lib/auth";

// Mock data for dashboard
const stats = [
  {
    title: "Active Clients",
    value: "127",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Open Matters",
    value: "43",
    change: "+3%",
    changeType: "positive" as const,
    icon: Briefcase,
  },
  {
    title: "Pending Tasks",
    value: "18",
    change: "-8%",
    changeType: "positive" as const,
    icon: CheckSquare,
  },
  {
    title: "Revenue (MTD)",
    value: "$84,500",
    change: "+22%",
    changeType: "positive" as const,
    icon: DollarSign,
  },
];

const recentActivity = [
  {
    id: 1,
    type: "matter",
    title: "New Matter Created",
    description: "Johnson vs. ABC Corp - Employment dispute",
    time: "2 hours ago",
    priority: "high" as const,
  },
  {
    id: 2,
    type: "task",
    title: "Task Completed",
    description: "Contract review for Microsoft agreement",
    time: "4 hours ago",
    priority: "medium" as const,
  },
  {
    id: 3,
    type: "client",
    title: "New Client Added",
    description: "TechStart Inc. - Series A funding",
    time: "1 day ago",
    priority: "low" as const,
  },
];

const upcomingDeadlines = [
  {
    id: 1,
    title: "Discovery Deadline",
    matter: "Johnson vs. ABC Corp",
    date: "2024-01-15",
    daysLeft: 3,
    priority: "high" as const,
  },
  {
    id: 2,
    title: "Contract Renewal",
    matter: "Microsoft Service Agreement",
    date: "2024-01-18",
    daysLeft: 6,
    priority: "medium" as const,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your legal practice today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates across your legal practice
            </CardDescription>
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
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                    {activity.priority}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              Important dates requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center space-x-4">
                  <AlertTriangle className={`h-4 w-4 ${
                    deadline.daysLeft <= 3 ? "text-red-500" : "text-yellow-500"
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {deadline.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {deadline.matter}
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col gap-2">
              <Plus className="h-6 w-6" />
              New Client
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Briefcase className="h-6 w-6" />
              New Matter
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              New Contract
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CheckSquare className="h-6 w-6" />
              New Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}