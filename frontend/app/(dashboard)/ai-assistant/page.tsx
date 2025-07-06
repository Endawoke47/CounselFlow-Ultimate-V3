"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LegalChatbot } from "@/components/ai/legal-chatbot";
import {
  Brain,
  MessageCircle,
  FileText,
  Search,
  Scale,
  Gavel,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Zap,
  Star,
  Clock,
  Users,
  BarChart3,
  Settings,
  Lightbulb,
  Target,
  Shield
} from "lucide-react";

const AI_FEATURES = [
  {
    title: "Contract Analysis",
    description: "AI-powered contract review with risk assessment and compliance checking",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    features: ["Risk identification", "Clause analysis", "Compliance verification", "Redlining suggestions"]
  },
  {
    title: "Legal Research",
    description: "Intelligent case law research with precedent analysis and citation verification",
    icon: Search,
    color: "text-green-600",
    bgColor: "bg-green-100",
    features: ["Case law search", "Precedent analysis", "Citation verification", "Jurisdiction-specific results"]
  },
  {
    title: "Document Drafting",
    description: "Generate legal documents with customizable templates and smart suggestions",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    features: ["Template library", "Smart suggestions", "Clause recommendations", "Format optimization"]
  },
  {
    title: "Compliance Monitoring",
    description: "Automated compliance tracking with regulatory updates and alerts",
    icon: Shield,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    features: ["Regulatory tracking", "Automated alerts", "Compliance scoring", "Update notifications"]
  },
  {
    title: "Litigation Strategy",
    description: "Strategic case analysis with outcome prediction and tactical recommendations",
    icon: Gavel,
    color: "text-red-600",
    bgColor: "bg-red-100",
    features: ["Case analysis", "Outcome prediction", "Strategy recommendations", "Risk assessment"]
  },
  {
    title: "Legal Analytics",
    description: "Advanced analytics on legal matters, contracts, and firm performance",
    icon: BarChart3,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    features: ["Performance metrics", "Trend analysis", "Predictive insights", "Custom reports"]
  }
];

const RECENT_INTERACTIONS = [
  {
    id: 1,
    type: "Contract Review",
    title: "Service Agreement Analysis",
    timestamp: "2 hours ago",
    confidence: 94,
    status: "completed"
  },
  {
    id: 2,
    type: "Legal Research",
    title: "Employment Law Precedents",
    timestamp: "1 day ago",
    confidence: 89,
    status: "completed"
  },
  {
    id: 3,
    type: "Document Draft",
    title: "NDA Template Generation",
    timestamp: "2 days ago",
    confidence: 96,
    status: "completed"
  },
  {
    id: 4,
    type: "Compliance Check",
    title: "GDPR Compliance Review",
    timestamp: "3 days ago",
    confidence: 87,
    status: "completed"
  }
];

const USAGE_STATS = {
  totalQueries: 1247,
  thisMonth: 183,
  averageAccuracy: 92,
  timesSaved: 156, // hours
  documentsGenerated: 89,
  complianceChecks: 45
};

export default function AIAssistantPage() {
  const [selectedTab, setSelectedTab] = useState("chat");

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-counselflow-light/10 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-counselflow-primary rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-counselflow-dark">AI Legal Assistant</h1>
          </div>
          <p className="text-lg text-counselflow-neutral">
            Advanced AI-powered legal intelligence and automation platform
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="border-counselflow-primary/30 text-counselflow-primary">
            <Zap className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
          <Button variant="outline" className="border-counselflow-primary/30">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Total Queries</CardTitle>
            <MessageCircle className="h-4 w-4 text-counselflow-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">{USAGE_STATS.totalQueries}</div>
            <p className="text-xs text-counselflow-neutral">
              {USAGE_STATS.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-counselflow-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">{USAGE_STATS.averageAccuracy}%</div>
            <p className="text-xs text-counselflow-neutral">
              Average confidence
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-counselflow-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">{USAGE_STATS.timesSaved}h</div>
            <p className="text-xs text-counselflow-neutral">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Documents Generated</CardTitle>
            <FileText className="h-4 w-4 text-counselflow-bright" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">{USAGE_STATS.documentsGenerated}</div>
            <p className="text-xs text-counselflow-neutral">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="features">AI Features</TabsTrigger>
          <TabsTrigger value="history">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-counselflow-dark flex items-center space-x-2">
                <Brain className="h-5 w-5 text-counselflow-primary" />
                <span>Legal AI Assistant</span>
              </CardTitle>
              <CardDescription>
                Engage with our advanced AI for legal research, contract analysis, document generation, and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <LegalChatbot embedded={true} className="h-[600px] border-0 shadow-none" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {AI_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-counselflow-dark">{feature.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-counselflow-neutral mb-4">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.features.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-counselflow-primary rounded-full"></div>
                          <span className="text-sm text-counselflow-dark">{item}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4 bg-counselflow-primary hover:bg-counselflow-dark">
                      Try {feature.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-counselflow-dark">Recent AI Interactions</CardTitle>
              <CardDescription>
                Your recent conversations and AI-powered legal tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECENT_INTERACTIONS.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-counselflow-primary/20 hover:bg-counselflow-light/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-counselflow-primary/20 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-counselflow-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-counselflow-dark">{interaction.title}</div>
                        <div className="text-sm text-counselflow-neutral">{interaction.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-700">
                        {interaction.confidence}% confidence
                      </Badge>
                      <span className="text-sm text-counselflow-neutral">{interaction.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-counselflow-dark">AI Usage Trends</CardTitle>
                <CardDescription>
                  Monthly AI assistant usage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-counselflow-neutral">Contract Analysis</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-3/4 h-2 bg-counselflow-primary rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-counselflow-neutral">Legal Research</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-3/5 h-2 bg-counselflow-success rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-counselflow-neutral">Document Drafting</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-2/5 h-2 bg-counselflow-warning rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-counselflow-neutral">Compliance Checks</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-1/3 h-2 bg-counselflow-bright rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">33%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-counselflow-dark">Performance Insights</CardTitle>
                <CardDescription>
                  AI accuracy and user satisfaction metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-counselflow-dark mb-2">92%</div>
                    <div className="text-sm text-counselflow-neutral">Average Accuracy</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-600">4.8</div>
                      <div className="text-xs text-counselflow-neutral">User Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600">2.3s</div>
                      <div className="text-xs text-counselflow-neutral">Avg Response</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-counselflow-neutral">User Satisfaction</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div className="w-[96%] h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}