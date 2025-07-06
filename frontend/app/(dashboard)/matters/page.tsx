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
  Briefcase, 
  Plus, 
  Search, 
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  Brain,
  Scale,
  Target,
  FileText,
  Eye,
  Edit,
  Trash,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { apiClient, type Matter, type Client } from "@/lib/api";

// Matter type and status options
const MATTER_TYPES = [
  "LITIGATION", "CORPORATE", "EMPLOYMENT", "INTELLECTUAL_PROPERTY", 
  "REAL_ESTATE", "TAX", "MERGERS_ACQUISITIONS", "COMPLIANCE", 
  "IMMIGRATION", "BANKRUPTCY", "FAMILY", "PERSONAL_INJURY", 
  "CRIMINAL", "ENVIRONMENTAL", "SECURITIES", "OTHER"
];

const MATTER_STATUSES = [
  "INTAKE", "CONFLICTS_CHECK", "OPENED", "ACTIVE", "ON_HOLD", 
  "DISCOVERY", "SETTLEMENT", "TRIAL", "APPEAL", "CLOSED_WON", 
  "CLOSED_LOST", "CLOSED_SETTLED", "ARCHIVED"
];

const MATTER_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT", "CRITICAL"];

export default function MattersPage() {
  // State management for real API integration
  const [matters, setMatters] = useState<Matter[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMatter, setEditingMatter] = useState<Matter | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    has_next: false,
    has_prev: false
  });

  const [newMatter, setNewMatter] = useState({
    title: "",
    description: "",
    matter_number: "",
    type: "CORPORATE" as any,
    status: "INTAKE" as any,
    priority: "MEDIUM" as any,
    client_id: "",
    lead_attorney_id: "",
    hourly_rate: 0,
    estimated_hours: 0,
    budget_amount: 0,
    estimated_value: 0,
    opened_date: new Date().toISOString().split('T')[0],
    target_resolution_date: "",
  });

  // Load matters from API
  const loadMatters = async () => {
    try {
      setLoading(true);
      const searchParams = {
        skip: (pagination.page - 1) * pagination.per_page,
        limit: pagination.per_page,
        search: searchTerm || undefined,
        type: typeFilter !== "all" ? [typeFilter] : undefined,
        status: statusFilter !== "all" ? [statusFilter] : undefined,
      };

      const response = await apiClient.getMatters(searchParams);
      setMatters(response.matters);
      setPagination({
        total: response.total,
        page: response.page,
        per_page: response.per_page,
        has_next: response.page * response.per_page < response.total,
        has_prev: response.page > 1
      });
    } catch (error) {
      console.error("Failed to load matters:", error);
      toast.error("Failed to load matters");
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
    loadMatters();
  }, [searchTerm, typeFilter, statusFilter, priorityFilter, pagination.page]);

  useEffect(() => {
    loadClients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "OPENED":
        return "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30";
      case "ON_HOLD":
        return "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30";
      case "CLOSED_WON":
        return "bg-green-100 text-green-700 border-green-300";
      case "CLOSED_LOST":
        return "bg-red-100 text-red-700 border-red-300";
      case "DISCOVERY":
      case "SETTLEMENT":
      case "TRIAL":
        return "bg-counselflow-primary/20 text-counselflow-primary border-counselflow-primary/30";
      case "INTAKE":
      case "CONFLICTS_CHECK":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-500 text-white";
      case "URGENT":
        return "bg-orange-500 text-white";
      case "HIGH":
        return "bg-yellow-500 text-white";
      case "MEDIUM":
        return "bg-blue-500 text-white";
      case "LOW":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createMatter(newMatter);
      toast.success("Matter created successfully");
      setIsCreateModalOpen(false);
      resetMatterForm();
      loadMatters();
    } catch (error) {
      console.error("Failed to create matter:", error);
      toast.error("Failed to create matter");
    }
  };

  const handleEditMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatter) return;
    
    try {
      await apiClient.updateMatter(editingMatter.id, newMatter);
      toast.success("Matter updated successfully");
      setIsEditModalOpen(false);
      setEditingMatter(null);
      resetMatterForm();
      loadMatters();
    } catch (error) {
      console.error("Failed to update matter:", error);
      toast.error("Failed to update matter");
    }
  };

  const handleDeleteMatter = async (matterId: string) => {
    if (!confirm("Are you sure you want to delete this matter?")) return;
    
    try {
      await apiClient.deleteMatter(matterId);
      toast.success("Matter deleted successfully");
      loadMatters();
    } catch (error) {
      console.error("Failed to delete matter:", error);
      toast.error("Failed to delete matter");
    }
  };

  const resetMatterForm = () => {
    setNewMatter({
      title: "",
      description: "",
      matter_number: "",
      type: "CORPORATE",
      status: "INTAKE",
      priority: "MEDIUM",
      client_id: "",
      lead_attorney_id: "",
      hourly_rate: 0,
      estimated_hours: 0,
      budget_amount: 0,
      estimated_value: 0,
      opened_date: new Date().toISOString().split('T')[0],
      target_resolution_date: "",
    });
  };

  const openEditModal = (matter: Matter) => {
    setEditingMatter(matter);
    setNewMatter({
      title: matter.title,
      description: matter.description || "",
      matter_number: matter.matter_number,
      type: matter.type,
      status: matter.status,
      priority: matter.priority,
      client_id: matter.client_id,
      lead_attorney_id: matter.lead_attorney_id || "",
      hourly_rate: matter.hourly_rate || 0,
      estimated_hours: matter.estimated_hours || 0,
      budget_amount: matter.budget_amount || 0,
      estimated_value: matter.estimated_value || 0,
      opened_date: matter.opened_date,
      target_resolution_date: matter.target_resolution_date || "",
    });
    setIsEditModalOpen(true);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-counselflow-light/10 to-white min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-counselflow-primary rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-counselflow-dark">Matter Management</h1>
          </div>
          <p className="text-lg text-counselflow-neutral">
            AI-powered legal matter lifecycle management and case tracking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadMatters} className="border-counselflow-primary/30">
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
                New Matter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-counselflow-dark">Create New Matter</DialogTitle>
                <DialogDescription className="text-counselflow-neutral">
                  Create a new legal matter with AI-powered classification and risk assessment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMatter} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-counselflow-dark font-medium">Matter Title *</Label>
                    <Input
                      id="title"
                      value={newMatter.title}
                      onChange={(e) => setNewMatter({ ...newMatter, title: e.target.value })}
                      placeholder="Enter matter title"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matter_number" className="text-counselflow-dark font-medium">Matter Number</Label>
                    <Input
                      id="matter_number"
                      value={newMatter.matter_number}
                      onChange={(e) => setNewMatter({ ...newMatter, matter_number: e.target.value })}
                      placeholder="Auto-generated if empty"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-counselflow-dark font-medium">Matter Type *</Label>
                    <Select value={newMatter.type} onValueChange={(value: any) => setNewMatter({ ...newMatter, type: value })}>
                      <SelectTrigger className="border-counselflow-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATTER_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-counselflow-dark font-medium">Status</Label>
                    <Select value={newMatter.status} onValueChange={(value: any) => setNewMatter({ ...newMatter, status: value })}>
                      <SelectTrigger className="border-counselflow-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATTER_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-counselflow-dark font-medium">Priority</Label>
                    <Select value={newMatter.priority} onValueChange={(value: any) => setNewMatter({ ...newMatter, priority: value })}>
                      <SelectTrigger className="border-counselflow-primary/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATTER_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-counselflow-dark font-medium">Client *</Label>
                  <Select value={newMatter.client_id} onValueChange={(value) => setNewMatter({ ...newMatter, client_id: value })}>
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

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-counselflow-dark font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={newMatter.description}
                    onChange={(e) => setNewMatter({ ...newMatter, description: e.target.value })}
                    placeholder="Enter matter description..."
                    className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_amount" className="text-counselflow-dark font-medium">Budget Amount</Label>
                    <Input
                      id="budget_amount"
                      type="number"
                      value={newMatter.budget_amount}
                      onChange={(e) => setNewMatter({ ...newMatter, budget_amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_value" className="text-counselflow-dark font-medium">Estimated Value</Label>
                    <Input
                      id="estimated_value"
                      type="number"
                      value={newMatter.estimated_value}
                      onChange={(e) => setNewMatter({ ...newMatter, estimated_value: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opened_date" className="text-counselflow-dark font-medium">Opened Date</Label>
                    <Input
                      id="opened_date"
                      type="date"
                      value={newMatter.opened_date}
                      onChange={(e) => setNewMatter({ ...newMatter, opened_date: e.target.value })}
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_resolution_date" className="text-counselflow-dark font-medium">Target Resolution</Label>
                    <Input
                      id="target_resolution_date"
                      type="date"
                      value={newMatter.target_resolution_date}
                      onChange={(e) => setNewMatter({ ...newMatter, target_resolution_date: e.target.value })}
                      className="border-counselflow-primary/30 focus:border-counselflow-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-counselflow-primary hover:bg-counselflow-dark">
                    Create Matter
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
            <CardTitle className="text-sm font-medium text-counselflow-dark">Total Matters</CardTitle>
            <Briefcase className="h-4 w-4 text-counselflow-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">{pagination.total}</div>
            <p className="text-xs text-counselflow-neutral">
              {matters.filter(m => m.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-counselflow-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">
              {formatCurrency(matters.reduce((sum, m) => sum + (m.budget_amount || 0), 0))}
            </div>
            <p className="text-xs text-counselflow-neutral">
              Across all matters
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-counselflow-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">
              {matters.filter(m => ['HIGH', 'URGENT', 'CRITICAL'].includes(m.priority)).length}
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
            <div className="text-2xl font-bold text-counselflow-dark">7.2</div>
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
                  placeholder="Search matters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-counselflow-primary/30 focus:border-counselflow-primary"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] border-counselflow-primary/30">
                <SelectValue placeholder="Matter Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {MATTER_TYPES.map((type) => (
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
                {MATTER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matters Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-counselflow-dark">Matters</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-counselflow-neutral">
              <span>Showing {matters.length} of {pagination.total}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin text-counselflow-primary" />
                <span className="text-counselflow-neutral">Loading matters...</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-counselflow-primary/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-counselflow-light/20">
                    <TableHead className="text-counselflow-dark font-semibold">Matter</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Client</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Type</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Status</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Priority</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Budget</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Opened</TableHead>
                    <TableHead className="text-counselflow-dark font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matters.map((matter) => (
                    <TableRow key={matter.id} className="hover:bg-counselflow-light/10">
                      <TableCell>
                        <div>
                          <div className="font-medium text-counselflow-dark">{matter.title}</div>
                          <div className="text-sm text-counselflow-neutral">{matter.matter_number}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-counselflow-dark">
                          {clients.find(c => c.id === matter.client_id)?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-counselflow-primary/30 text-counselflow-primary">
                          {matter.type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(matter.status)} border`}>
                          {matter.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(matter.priority)}>
                          {matter.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-counselflow-dark font-medium">
                        {formatCurrency(matter.budget_amount)}
                      </TableCell>
                      <TableCell className="text-counselflow-neutral">
                        {new Date(matter.opened_date).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => openEditModal(matter)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Matter
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Brain className="h-4 w-4 mr-2" />
                              AI Analysis
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMatter(matter.id)}
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
          {!loading && matters.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-counselflow-neutral">
                Showing {((pagination.page - 1) * pagination.per_page) + 1} to {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total} matters
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

      {/* Edit Matter Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-counselflow-dark">Edit Matter</DialogTitle>
            <DialogDescription className="text-counselflow-neutral">
              Update matter information and status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditMatter} className="space-y-6">
            {/* Same form fields as create modal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title" className="text-counselflow-dark font-medium">Matter Title *</Label>
                <Input
                  id="edit_title"
                  value={newMatter.title}
                  onChange={(e) => setNewMatter({ ...newMatter, title: e.target.value })}
                  placeholder="Enter matter title"
                  className="border-counselflow-primary/30 focus:border-counselflow-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_matter_number" className="text-counselflow-dark font-medium">Matter Number</Label>
                <Input
                  id="edit_matter_number"
                  value={newMatter.matter_number}
                  onChange={(e) => setNewMatter({ ...newMatter, matter_number: e.target.value })}
                  className="border-counselflow-primary/30 focus:border-counselflow-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-counselflow-dark font-medium">Matter Type *</Label>
                <Select value={newMatter.type} onValueChange={(value: any) => setNewMatter({ ...newMatter, type: value })}>
                  <SelectTrigger className="border-counselflow-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATTER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-counselflow-dark font-medium">Status</Label>
                <Select value={newMatter.status} onValueChange={(value: any) => setNewMatter({ ...newMatter, status: value })}>
                  <SelectTrigger className="border-counselflow-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATTER_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-counselflow-dark font-medium">Priority</Label>
                <Select value={newMatter.priority} onValueChange={(value: any) => setNewMatter({ ...newMatter, priority: value })}>
                  <SelectTrigger className="border-counselflow-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATTER_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
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
                Update Matter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}