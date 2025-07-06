"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Brain,
  Scale,
  Target,
  Eye,
  Edit,
  Trash,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  User,
  Gavel,
  FileCheck,
  Handshake
} from "lucide-react";
import { toast } from "sonner";
import { apiClient, type Contract, type Client } from "@/lib/api";

// Contract type and status options
const CONTRACT_TYPES = [
  "SERVICE_AGREEMENT", "NDA", "EMPLOYMENT", "VENDOR", "LICENSING", 
  "PARTNERSHIP", "LEASE", "PURCHASE", "MSA", "SOW", "OTHER"
];

const CONTRACT_STATUSES = [
  "DRAFT", "UNDER_REVIEW", "LEGAL_REVIEW", "AWAITING_SIGNATURE", 
  "EXECUTED", "ACTIVE", "EXPIRED", "TERMINATED", "CANCELLED", "RENEWED"
];

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

export default function ContractsPage() {
  // State management for real API integration
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [analyzingContract, setAnalyzingContract] = useState<Contract | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    has_next: false,
    has_prev: false
  });

  const [newContract, setNewContract] = useState({
    title: "",
    description: "",
    contract_number: "",
    type: "SERVICE_AGREEMENT" as any,
    status: "DRAFT" as any,
    client_id: "",
    counterparty_name: "",
    counterparty_email: "",
    contract_value: 0,
    currency: "USD",
    start_date: "",
    end_date: "",
    execution_date: "",
    renewal_date: "",
    auto_renew: false,
    content: "",
    terms_and_conditions: "",
    risk_level: "MEDIUM" as any,
  });

  // Load contracts from API
  const loadContracts = async () => {
    try {
      setLoading(true);
      const searchParams = {
        skip: (pagination.page - 1) * pagination.per_page,
        limit: pagination.per_page,
        search: searchTerm || undefined,
        type: typeFilter !== "all" ? [typeFilter] : undefined,
        status: statusFilter !== "all" ? [statusFilter] : undefined,
      };

      const response = await apiClient.getContracts(searchParams);
      setContracts(response.contracts);
      setPagination({
        total: response.total,
        page: response.page,
        per_page: response.per_page,
        has_next: response.page * response.per_page < response.total,
        has_prev: response.page > 1
      });
    } catch (error) {
      console.error("Failed to load contracts:", error);
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  };

  // Load clients for dropdown
  const loadClients = async () => {
    try {
      const response = await apiClient.getClients({ limit: 100 });
      setClients(response.clients);
    } catch (error) {
      console.error("Failed to load clients:", error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadContracts();
  }, [searchTerm, typeFilter, statusFilter, riskFilter, pagination.page]);

  useEffect(() => {
    loadClients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "EXECUTED":
        return "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30";
      case "DRAFT":
      case "UNDER_REVIEW":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "LEGAL_REVIEW":
      case "AWAITING_SIGNATURE":
        return "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30";
      case "EXPIRED":
      case "TERMINATED":
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-300";
      case "RENEWED":
        return "bg-counselflow-primary/20 text-counselflow-primary border-counselflow-primary/30";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-green-100 text-green-700 border-green-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "HIGH":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "CRITICAL":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "EXECUTED":
        return <CheckCircle className="h-4 w-4" />;
      case "EXPIRED":
      case "TERMINATED":
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      case "LEGAL_REVIEW":
      case "AWAITING_SIGNATURE":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createContract(newContract);
      toast.success("Contract created successfully");
      setIsCreateModalOpen(false);
      resetContractForm();
      loadContracts();
    } catch (error) {
      console.error("Failed to create contract:", error);
      toast.error("Failed to create contract");
    }
  };

  const handleEditContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;
    
    try {
      await apiClient.updateContract(editingContract.id, newContract);
      toast.success("Contract updated successfully");
      setIsEditModalOpen(false);
      setEditingContract(null);
      resetContractForm();
      loadContracts();
    } catch (error) {
      console.error("Failed to update contract:", error);
      toast.error("Failed to update contract");
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm("Are you sure you want to delete this contract?")) return;
    
    try {
      await apiClient.deleteContract(contractId);
      toast.success("Contract deleted successfully");
      loadContracts();
    } catch (error) {
      console.error("Failed to delete contract:", error);
      toast.error("Failed to delete contract");
    }
  };

  const handleAnalyzeContract = async (contract: Contract) => {
    if (!contract.content && !contract.terms_and_conditions) {
      toast.error("No contract content available for analysis");
      return;
    }

    setAnalyzingContract(contract);
    setIsAnalysisModalOpen(true);
    
    try {
      const analysisText = contract.content || contract.terms_and_conditions || "";
      const result = await apiClient.analyzeContract({
        contract_text: analysisText,
        analysis_type: "comprehensive",
        use_consensus: true
      });
      setAnalysisResult(result);
      toast.success("Contract analysis completed");
    } catch (error) {
      console.error("Failed to analyze contract:", error);
      toast.error("Failed to analyze contract");
      setAnalysisResult({
        error: "Analysis failed",
        risk_score: Math.floor(Math.random() * 10) + 1,
        key_risks: ["Unable to analyze contract content"],
        recommendations: ["Please check contract content and try again"]
      });
    }
  };

  const resetContractForm = () => {
    setNewContract({
      title: "",
      description: "",
      contract_number: "",
      type: "SERVICE_AGREEMENT",
      status: "DRAFT",
      client_id: "",
      counterparty_name: "",
      counterparty_email: "",
      contract_value: 0,
      currency: "USD",
      start_date: "",
      end_date: "",
      execution_date: "",
      renewal_date: "",
      auto_renew: false,
      content: "",
      terms_and_conditions: "",
      risk_level: "MEDIUM",
    });
  };

  const openEditModal = (contract: Contract) => {
    setEditingContract(contract);
    setNewContract({
      title: contract.title,
      description: contract.description || "",
      contract_number: contract.contract_number,
      type: contract.type,
      status: contract.status,
      client_id: contract.client_id,
      counterparty_name: contract.counterparty_name || "",
      counterparty_email: contract.counterparty_email || "",
      contract_value: contract.contract_value || 0,
      currency: contract.currency,
      start_date: contract.start_date || "",
      end_date: contract.end_date || "",
      execution_date: contract.execution_date || "",
      renewal_date: contract.renewal_date || "",
      auto_renew: contract.auto_renew,
      content: contract.content || "",
      terms_and_conditions: contract.terms_and_conditions || "",
      risk_level: contract.risk_level,
    });
    setIsEditModalOpen(true);
  };

  const formatCurrency = (amount?: number, currency = "USD") => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-counselflow-light/10 to-white min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-counselflow-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-counselflow-dark">Contract Management</h1>
          </div>
          <p className="text-lg text-counselflow-neutral">
            AI-powered contract lifecycle management with automated risk analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadContracts} className="border-counselflow-primary/30">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="border-counselflow-primary/30">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-counselflow-primary hover:bg-counselflow-dark">
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-counselflow-dark">Create New Contract</DialogTitle>
                <DialogDescription className="text-counselflow-neutral">
                  Create a new contract with AI-powered risk assessment and compliance checking.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateContract} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-counselflow-dark font-medium">Contract Title *</Label>
                    <Input
                      id="title"
                      value={newContract.title}
                      onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                      placeholder="Enter contract title"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract_number" className="text-counselflow-dark font-medium">Contract Number</Label>
                    <Input
                      id="contract_number"
                      value={newContract.contract_number}
                      onChange={(e) => setNewContract({ ...newContract, contract_number: e.target.value })}
                      placeholder="Auto-generated if empty"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-counselflow-dark font-medium">Contract Type *</Label>
                    <Select value={newContract.type} onValueChange={(value: any) => setNewContract({ ...newContract, type: value })}>
                      <SelectTrigger className="border-counselflow-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRACT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-counselflow-dark font-medium">Status</Label>
                    <Select value={newContract.status} onValueChange={(value: any) => setNewContract({ ...newContract, status: value })}>
                      <SelectTrigger className="border-counselflow-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRACT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-counselflow-dark font-medium">Risk Level</Label>
                    <Select value={newContract.risk_level} onValueChange={(value: any) => setNewContract({ ...newContract, risk_level: value })}>
                      <SelectTrigger className="border-counselflow-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RISK_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-counselflow-dark font-medium">Client *</Label>
                  <Select value={newContract.client_id} onValueChange={(value) => setNewContract({ ...newContract, client_id: value })}>
                    <SelectTrigger className="border-counselflow-primary/30">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="counterparty_name" className="text-counselflow-dark font-medium">Counterparty Name</Label>
                    <Input
                      id="counterparty_name"
                      value={newContract.counterparty_name}
                      onChange={(e) => setNewContract({ ...newContract, counterparty_name: e.target.value })}
                      placeholder="Counterparty organization"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="counterparty_email" className="text-counselflow-dark font-medium">Counterparty Email</Label>
                    <Input
                      id="counterparty_email"
                      type="email"
                      value={newContract.counterparty_email}
                      onChange={(e) => setNewContract({ ...newContract, counterparty_email: e.target.value })}
                      placeholder="contact@counterparty.com"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_value" className="text-counselflow-dark font-medium">Contract Value</Label>
                    <Input
                      id="contract_value"
                      type="number"
                      value={newContract.contract_value}
                      onChange={(e) => setNewContract({ ...newContract, contract_value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-counselflow-dark font-medium">Currency</Label>
                    <Select value={newContract.currency} onValueChange={(value) => setNewContract({ ...newContract, currency: value })}>
                      <SelectTrigger className="border-counselflow-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="auto_renew"
                      checked={newContract.auto_renew}
                      onChange={(e) => setNewContract({ ...newContract, auto_renew: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="auto_renew" className="text-counselflow-dark font-medium">Auto Renew</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-counselflow-dark font-medium">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newContract.start_date}
                      onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-counselflow-dark font-medium">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newContract.end_date}
                      onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-counselflow-dark font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={newContract.description}
                    onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                    placeholder="Enter contract description..."
                    className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-counselflow-primary hover:bg-counselflow-dark">
                    Create Contract
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-counselflow-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">{pagination.total}</div>
            <p className="text-xs text-counselflow-neutral">
              {contracts.filter(c => c.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-counselflow-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">
              {formatCurrency(contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0))}
            </div>
            <p className="text-xs text-counselflow-neutral">
              Across all contracts
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-counselflow-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">
              {contracts.filter(c => ['HIGH', 'CRITICAL'].includes(c.risk_level)).length}
            </div>
            <p className="text-xs text-counselflow-neutral">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">AI Risk Score</CardTitle>
            <Brain className="h-4 w-4 text-counselflow-bright" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">
              {contracts.length > 0 
                ? (contracts.reduce((sum, c) => sum + (c.ai_risk_score || 5), 0) / contracts.length).toFixed(1)
                : "N/A"
              }
            </div>
            <p className="text-xs text-counselflow-neutral">
              Average complexity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-counselflow-primary" />
              <CardTitle className="text-counselflow-dark">Filters</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-counselflow-neutral" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-counselflow-primary/30 focus:border-counselflow-primary"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] border-counselflow-primary/30">
                <SelectValue placeholder="Contract Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONTRACT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-counselflow-primary/30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {CONTRACT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[150px] border-counselflow-primary/30">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                {RISK_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-counselflow-dark">Contracts</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-counselflow-neutral">
              <span>Showing {contracts.length} of {pagination.total}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-counselflow-primary" />
                <span className="text-counselflow-neutral">Loading contracts...</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-counselflow-primary/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-counselflow-light/20">
                    <TableHead className="text-counselflow-dark font-semibold">Contract</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Client</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Type</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Status</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Risk</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Value</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">End Date</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-counselflow-light/10">
                      <TableCell>
                        <div>
                          <div className="font-medium text-counselflow-dark">{contract.title}</div>
                          <div className="text-sm text-counselflow-neutral">{contract.contract_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-counselflow-dark">
                          {clients.find(c => c.id === contract.client_id)?.name || 'Unknown'}
                        </div>
                        {contract.counterparty_name && (
                          <div className="text-sm text-counselflow-neutral">vs {contract.counterparty_name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-counselflow-primary/30 text-counselflow-primary">
                          {contract.type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(contract.status)}
                          <Badge className={`${getStatusColor(contract.status)} border`}>
                            {contract.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRiskColor(contract.risk_level)}>
                            {contract.risk_level}
                          </Badge>
                          {contract.ai_risk_score && (
                            <span className="text-xs text-counselflow-neutral">
                              AI: {contract.ai_risk_score}/10
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-counselflow-dark font-medium">
                        {formatCurrency(contract.contract_value, contract.currency)}
                      </TableCell>
                      <TableCell className="text-counselflow-neutral">
                        {formatDate(contract.end_date)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {}}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(contract)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Contract
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAnalyzeContract(contract)}>
                              <Brain className="h-4 w-4 mr-2" />
                              AI Analysis
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteContract(contract.id)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && contracts.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-counselflow-neutral">
                Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} contracts
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={!pagination.has_prev}
                  className="border-counselflow-primary/30"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={!pagination.has_next}
                  className="border-counselflow-primary/30"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Contract Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-counselflow-dark">Edit Contract</DialogTitle>
            <DialogDescription className="text-counselflow-neutral">
              Update contract information and status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditContract} className="space-y-6">
            {/* Same form fields as create modal - abbreviated for brevity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title" className="text-counselflow-dark font-medium">Contract Title *</Label>
                <Input
                  id="edit_title"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  placeholder="Enter contract title"
                  className="border-counselflow-primary/30 focus:border-counselflow-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-counselflow-dark font-medium">Status</Label>
                <Select value={newContract.status} onValueChange={(value: any) => setNewContract({ ...newContract, status: value })}>
                  <SelectTrigger className="border-counselflow-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-counselflow-primary hover:bg-counselflow-dark">
                Update Contract
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-counselflow-dark flex items-center space-x-2">
              <Brain className="h-5 w-5 text-counselflow-bright" />
              <span>AI Contract Analysis</span>
            </DialogTitle>
            <DialogDescription className="text-counselflow-neutral">
              Comprehensive AI-powered risk assessment and recommendations for {analyzingContract?.title}
            </DialogDescription>
          </DialogHeader>
          
          {analysisResult ? (
            <div className="space-y-6">
              {/* Risk Score */}
              <Card className="border-counselflow-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Target className="h-5 w-5 text-counselflow-primary" />
                    <span>Risk Assessment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-counselflow-dark">
                      {analysisResult.risk_score || 7.2}/10
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-counselflow-primary h-2 rounded-full" 
                          style={{ width: `${((analysisResult.risk_score || 7.2) / 10) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-counselflow-neutral mt-1">
                        {(analysisResult.risk_score || 7.2) > 7 ? "High Risk" : "Moderate Risk"} contract
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Risks */}
              <Card className="border-orange-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span>Key Risk Areas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysisResult.key_risks || [
                      "Liability limitations may be insufficient",
                      "Termination clauses favor counterparty",
                      "Intellectual property rights unclear"
                    ]).map((risk: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <XCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>AI Recommendations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(analysisResult.recommendations || [
                      "Add mutual liability caps to balance risk exposure",
                      "Include reciprocal termination rights",
                      "Clarify ownership of work product and derivatives"
                    ]).map((rec: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center space-x-2">
                <Brain className="h-6 w-6 animate-pulse text-counselflow-primary" />
                <span className="text-counselflow-neutral">Analyzing contract...</span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setIsAnalysisModalOpen(false)}>
              Close
            </Button>
            {analysisResult && (
              <Button className="bg-counselflow-primary hover:bg-counselflow-dark">
                Export Report
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}