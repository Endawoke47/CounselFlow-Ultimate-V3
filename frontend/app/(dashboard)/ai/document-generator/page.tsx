"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Wand2, 
  Download, 
  Copy, 
  RefreshCw,
  FileEdit,
  Settings,
  Eye,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { useApiClient } from "@/lib/api";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "number" | "date" | "select" | "textarea";
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

interface GeneratedDocument {
  id: string;
  template_id: string;
  content: string;
  created_at: string;
  status: "generating" | "completed" | "error";
}

const templates: DocumentTemplate[] = [
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Standard NDA for protecting confidential information",
    category: "Contracts",
    fields: [
      { name: "party1_name", label: "Disclosing Party", type: "text", required: true, placeholder: "Company name" },
      { name: "party2_name", label: "Receiving Party", type: "text", required: true, placeholder: "Recipient name" },
      { name: "effective_date", label: "Effective Date", type: "date", required: true },
      { name: "duration", label: "Duration (years)", type: "number", required: true, placeholder: "2" },
      { name: "governing_law", label: "Governing Law", type: "select", required: true, options: ["Delaware", "California", "New York", "Texas"] },
      { name: "purpose", label: "Purpose", type: "textarea", required: true, placeholder: "Describe the purpose of disclosure..." }
    ]
  },
  {
    id: "service_agreement",
    name: "Service Agreement",
    description: "Professional services contract template",
    category: "Contracts",
    fields: [
      { name: "service_provider", label: "Service Provider", type: "text", required: true },
      { name: "client_name", label: "Client Name", type: "text", required: true },
      { name: "service_description", label: "Service Description", type: "textarea", required: true },
      { name: "compensation", label: "Compensation", type: "text", required: true, placeholder: "$X per hour/month" },
      { name: "start_date", label: "Start Date", type: "date", required: true },
      { name: "end_date", label: "End Date", type: "date", required: false }
    ]
  },
  {
    id: "privacy_policy",
    name: "Privacy Policy",
    description: "GDPR-compliant privacy policy template",
    category: "Legal Documents",
    fields: [
      { name: "company_name", label: "Company Name", type: "text", required: true },
      { name: "website_url", label: "Website URL", type: "text", required: true },
      { name: "contact_email", label: "Contact Email", type: "text", required: true },
      { name: "data_types", label: "Data Types Collected", type: "textarea", required: true },
      { name: "retention_period", label: "Data Retention Period", type: "text", required: true }
    ]
  }
];

export default function DocumentGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [activeTab, setActiveTab] = useState<"select" | "generate" | "preview">("select");
  const apiClient = useApiClient();

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setGeneratedDocument(null);
    setActiveTab("generate");
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    const requiredFields = selectedTemplate.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await apiClient.generateDocument(selectedTemplate.id, formData);
      setGeneratedDocument(result);
      setActiveTab("preview");
      toast.success("Document generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Generation failed");
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadDocument = () => {
    if (!generatedDocument) return;
    
    const blob = new Blob([generatedDocument.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate?.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Document downloaded");
  };

  const renderFieldInput = (field: any) => {
    const value = formData[field.name] || "";

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[100px]"
          />
        );
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full p-2 border border-input bg-background rounded-md"
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Generator</h1>
        <p className="text-muted-foreground">
          AI-powered legal document generation from templates
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        <Button
          variant={activeTab === "select" ? "default" : "ghost"}
          onClick={() => setActiveTab("select")}
          className="rounded-b-none"
        >
          <FileText className="h-4 w-4 mr-2" />
          Select Template
        </Button>
        <Button
          variant={activeTab === "generate" ? "default" : "ghost"}
          onClick={() => setActiveTab("generate")}
          disabled={!selectedTemplate}
          className="rounded-b-none"
        >
          <FileEdit className="h-4 w-4 mr-2" />
          Generate
        </Button>
        <Button
          variant={activeTab === "preview" ? "default" : "ghost"}
          onClick={() => setActiveTab("preview")}
          disabled={!generatedDocument}
          className="rounded-b-none"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Template Selection */}
      {activeTab === "select" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {template.category}
                    </Badge>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {template.fields.length} fields required
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Document Generation */}
      {activeTab === "generate" && selectedTemplate && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {selectedTemplate.name}
              </CardTitle>
              <CardDescription>
                {selectedTemplate.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderFieldInput(field)}
                </div>
              ))}
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setActiveTab("select");
                  }}
                >
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Preview</CardTitle>
              <CardDescription>
                This template will generate a legal document based on your input
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Ready to Generate</h3>
                <p className="text-muted-foreground">
                  Fill in the form fields and click "Generate Document" to create your legal document
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Preview */}
      {activeTab === "preview" && generatedDocument && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Document</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedDocument.content)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadDocument}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Review and download your generated legal document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedDocument.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template</Label>
                <p className="text-sm font-medium">{selectedTemplate?.name}</p>
              </div>
              <div>
                <Label>Generated</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(generatedDocument.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge className="bg-green-100 text-green-800">
                  {generatedDocument.status}
                </Badge>
              </div>
              
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save to Library
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("generate")}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Edit & Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}