"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Clock,
  Download,
  Copy,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api";

interface AnalysisResult {
  id: string;
  status: "analyzing" | "completed" | "error";
  summary: string;
  risk_level: "low" | "medium" | "high";
  key_terms: Array<{
    term: string;
    description: string;
    risk_level: "low" | "medium" | "high";
  }>;
  obligations: Array<{
    party: string;
    obligation: string;
    deadline?: string;
  }>;
  recommendations: string[];
  created_at: string;
}

export default function ContractAnalysisPage() {
  const [contractText, setContractText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const apiClient = useApiClient();

  const handleAnalyze = async () => {
    if (!contractText.trim()) {
      toast.error("Please enter contract text to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await apiClient.analyzeContract(contractText);
      setAnalysisResult(result);
      toast.success("Contract analysis completed!");
    } catch (error: any) {
      toast.error(error.message || "Analysis failed");
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContractText(text);
        toast.success("File uploaded successfully");
      };
      reader.readAsText(file);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Info className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contract Analysis</h1>
        <p className="text-muted-foreground">
          AI-powered contract analysis for risk assessment and key insights
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Input
            </CardTitle>
            <CardDescription>
              Upload a contract file or paste the contract text below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="file-upload">Upload Contract File</Label>
              <div className="mt-2">
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or paste text
                </span>
              </div>
            </div>

            {/* Text Input */}
            <div>
              <Label htmlFor="contract-text">Contract Text</Label>
              <Textarea
                id="contract-text"
                placeholder="Paste your contract text here..."
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                className="min-h-[300px] mt-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !contractText.trim()}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Contract
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setContractText("");
                  setAnalysisResult(null);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-generated insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!analysisResult ? (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Analysis Yet</h3>
                <p className="text-muted-foreground">
                  Upload or paste a contract to get started with AI analysis
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Analysis Status */}
                <div className="flex items-center justify-between">
                  <Badge className={getRiskColor(analysisResult.risk_level)}>
                    {getRiskIcon(analysisResult.risk_level)}
                    <span className="ml-1 capitalize">{analysisResult.risk_level} Risk</span>
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(analysisResult.created_at).toLocaleString()}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h4 className="font-medium mb-2">Executive Summary</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {analysisResult.summary}
                  </p>
                </div>

                {/* Key Terms */}
                <div>
                  <h4 className="font-medium mb-2">Key Terms</h4>
                  <div className="space-y-2">
                    {analysisResult.key_terms.map((term, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{term.term}</span>
                          <Badge size="sm" className={getRiskColor(term.risk_level)}>
                            {term.risk_level}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {term.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Obligations */}
                <div>
                  <h4 className="font-medium mb-2">Key Obligations</h4>
                  <div className="space-y-2">
                    {analysisResult.obligations.map((obligation, index) => (
                      <div key={index} className="border rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{obligation.party}</span>
                          {obligation.deadline && (
                            <Badge variant="outline" className="text-xs">
                              Due: {obligation.deadline}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {obligation.obligation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Results
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}