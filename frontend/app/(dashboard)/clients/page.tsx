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
  Users, 
  Plus, 
  Download,
  Shield,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  RefreshCw
} from "lucide-react";
import { AdvancedDataTable } from "@/components/data-table/advanced-data-table";
import { createClientColumns, clientFilters } from "@/components/data-table/columns";
import { toast } from "sonner";
import { apiClient, type Client, type ClientCreate, type ClientSearchParams } from "@/lib/api";

export default function ClientsPage() {
  // State management for real API integration
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    has_next: false,
    has_prev: false
  });

  const [newClient, setNewClient] = useState<ClientCreate>({
    name: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    website: "",
    description: "",
    status: "ACTIVE",
    risk_level: "MEDIUM",
    billing_contact: "",
    primary_contact: "",
    business_unit: "",
    annual_revenue: undefined,
    employee_count: undefined,
    jurisdiction: "",
  });

  // Load clients from API
  const loadClients = async () => {
    try {
      setLoading(true);
      const searchParams: ClientSearchParams = {
        limit: 100, // Load more for data table
      };

      const response = await apiClient.getClients(searchParams);
      setClients(response.clients);
      setPagination({
        total: response.total,
        page: response.page,
        per_page: response.per_page,
        has_next: response.has_next,
        has_prev: response.has_prev
      });
    } catch (error) {
      console.error("Failed to load clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700 border-gray-300";
      case "POTENTIAL":
        return "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30";
      case "FORMER":
        return "bg-red-100 text-red-700 border-red-300";
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

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createClient(newClient);
      toast.success("Client created successfully");
      setIsCreateModalOpen(false);
      resetClientForm();
      loadClients(); // Reload the clients list
    } catch (error) {
      console.error("Failed to create client:", error);
      toast.error("Failed to create client");
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    
    try {
      await apiClient.updateClient(editingClient.id, newClient);
      toast.success("Client updated successfully");
      setIsEditModalOpen(false);
      setEditingClient(null);
      resetClientForm();
      loadClients(); // Reload the clients list
    } catch (error) {
      console.error("Failed to update client:", error);
      toast.error("Failed to update client");
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    
    try {
      await apiClient.deleteClient(clientId);
      toast.success("Client deleted successfully");
      loadClients(); // Reload the clients list
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Failed to delete client");
    }
  };

  const resetClientForm = () => {
    setNewClient({
      name: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      website: "",
      description: "",
      status: "ACTIVE",
      risk_level: "MEDIUM",
      billing_contact: "",
      primary_contact: "",
      business_unit: "",
      annual_revenue: undefined,
      employee_count: undefined,
      jurisdiction: "",
    });
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      industry: client.industry || "",
      website: client.website || "",
      description: client.description || "",
      status: client.status,
      risk_level: client.risk_level,
      billing_contact: client.billing_contact || "",
      primary_contact: client.primary_contact || "",
      business_unit: client.business_unit || "",
      annual_revenue: client.annual_revenue,
      employee_count: client.employee_count,
      jurisdiction: client.jurisdiction || "",
    });
    setIsEditModalOpen(true);
  };

  // Column configuration for data table
  const columns = createClientColumns(
    (client: Client) => {
      // Handle view client
      console.log("View client:", client);
      // Navigate to client details page
    },
    (client: Client) => {
      // Handle edit client
      openEditModal(client);
    },
    (client: Client) => {
      // Handle delete client
      handleDeleteClient(client.id);
    }
  );

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-counselflow-light/10 to-white min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-counselflow-primary rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-counselflow-dark">Client Management</h1>
          </div>
          <p className="text-lg text-counselflow-neutral">
            Manage enterprise client relationships with AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadClients} className="border-counselflow-primary/30">
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
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-counselflow-dark">Add New Client</DialogTitle>
                <DialogDescription className="text-counselflow-neutral">
                  Create a new client profile with comprehensive information and risk assessment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Client Name *</Label>
                <Input
                  id="client-name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={newClient.industry}
                  onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
                  placeholder="Client industry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-contact">Primary Contact</Label>
                <Input
                  id="primary-contact"
                  value={newClient.primary_contact}
                  onChange={(e) => setNewClient({ ...newClient, primary_contact: e.target.value })}
                  placeholder="Primary contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="contact@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Phone</Label>
                <Input
                  id="client-phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-counselflow-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">{pagination.total}</div>
            <p className="text-xs text-counselflow-neutral">
              {clients.filter(c => c.status === 'ACTIVE').length} active
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
              {clients.filter(c => ['HIGH', 'CRITICAL'].includes(c.risk_level)).length}
            </div>
            <p className="text-xs text-counselflow-neutral">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Total Matters</CardTitle>
            <Briefcase className="h-4 w-4 text-counselflow-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">
              {clients.reduce((sum, c) => sum + (c.matters_count || 0), 0)}
            </div>
            <p className="text-xs text-counselflow-neutral">
              Across all clients
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-counselflow-dark">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-counselflow-bright" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-counselflow-dark">
              {clients.reduce((sum, c) => sum + (c.annual_revenue || 0), 0).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
              })}
            </div>
            <p className="text-xs text-counselflow-neutral">
              Annual revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Data Table */}
      <AdvancedDataTable
        columns={columns}
        data={clients}
        loading={loading}
        searchPlaceholder="Search clients by name, email, or industry..."
        filters={clientFilters}
        enableExport={true}
        enableColumnVisibility={true}
        enableGlobalFilter={true}
        title="Client Directory"
        description="Comprehensive client management with AI-powered insights and risk assessment"
        onRefresh={loadClients}
        className="bg-white rounded-lg shadow-sm"
      />
    </div>
  );
}