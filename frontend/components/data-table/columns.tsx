"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash, 
  Brain,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { type Client, type Matter, type Contract } from "@/lib/api";

// Client columns
export const createClientColumns = (
  onView?: (client: Client) => void,
  onEdit?: (client: Client) => void,
  onDelete?: (client: Client) => void
): ColumnDef<Client>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Client Name",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-counselflow-primary/20 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-counselflow-primary" />
          </div>
          <div>
            <div className="font-medium text-counselflow-dark">{client.name}</div>
            <div className="text-sm text-counselflow-neutral">{client.industry}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => {
      const client = row.original;
      return (
        <div>
          <div className="text-sm">{client.email}</div>
          <div className="text-sm text-counselflow-neutral">{client.phone}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusColor = (status: string) => {
        switch (status) {
          case "ACTIVE": return "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30";
          case "INACTIVE": return "bg-gray-100 text-gray-700 border-gray-300";
          case "POTENTIAL": return "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30";
          case "FORMER": return "bg-red-100 text-red-700 border-red-300";
          default: return "bg-gray-100 text-gray-700 border-gray-300";
        }
      };
      return (
        <Badge className={`${getStatusColor(status)} border`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "risk_level",
    header: "Risk Level",
    cell: ({ row }) => {
      const riskLevel = row.getValue("risk_level") as string;
      const getRiskColor = (level: string) => {
        switch (level) {
          case "LOW": return "bg-green-100 text-green-700";
          case "MEDIUM": return "bg-yellow-100 text-yellow-700";
          case "HIGH": return "bg-orange-100 text-orange-700";
          case "CRITICAL": return "bg-red-100 text-red-700";
          default: return "bg-gray-100 text-gray-700";
        }
      };
      return (
        <Badge className={getRiskColor(riskLevel)}>
          {riskLevel}
        </Badge>
      );
    },
  },
  {
    accessorKey: "matters_count",
    header: "Matters",
    cell: ({ row }) => {
      const count = row.getValue("matters_count") as number;
      return <span className="font-medium">{count || 0}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <span className="text-sm text-counselflow-neutral">{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(client)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Client
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(client)}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Matter columns
export const createMatterColumns = (
  onView?: (matter: Matter) => void,
  onEdit?: (matter: Matter) => void,
  onDelete?: (matter: Matter) => void,
  onAnalyze?: (matter: Matter) => void
): ColumnDef<Matter>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Matter",
    cell: ({ row }) => {
      const matter = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-counselflow-primary/20 rounded-full flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-counselflow-primary" />
          </div>
          <div>
            <div className="font-medium text-counselflow-dark">{matter.title}</div>
            <div className="text-sm text-counselflow-neutral">{matter.matter_number}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant="outline" className="border-counselflow-primary/30 text-counselflow-primary">
          {type.replace(/_/g, ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
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
          default:
            return "bg-gray-100 text-gray-700 border-gray-300";
        }
      };
      
      const getStatusIcon = (status: string) => {
        switch (status) {
          case "ACTIVE":
          case "OPENED":
            return <CheckCircle className="h-3 w-3" />;
          case "CLOSED_LOST":
            return <XCircle className="h-3 w-3" />;
          case "ON_HOLD":
            return <AlertCircle className="h-3 w-3" />;
          default:
            return <Clock className="h-3 w-3" />;
        }
      };

      return (
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <Badge className={`${getStatusColor(status)} border`}>
            {status.replace(/_/g, ' ')}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      const getPriorityColor = (priority: string) => {
        switch (priority) {
          case "CRITICAL": return "bg-red-500 text-white";
          case "URGENT": return "bg-orange-500 text-white";
          case "HIGH": return "bg-yellow-500 text-white";
          case "MEDIUM": return "bg-blue-500 text-white";
          case "LOW": return "bg-gray-500 text-white";
          default: return "bg-gray-500 text-white";
        }
      };
      return (
        <Badge className={getPriorityColor(priority)}>
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "budget_amount",
    header: "Budget",
    cell: ({ row }) => {
      const amount = row.getValue("budget_amount") as number;
      if (!amount) return "N/A";
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },
  },
  {
    accessorKey: "opened_date",
    header: "Opened",
    cell: ({ row }) => {
      const date = new Date(row.getValue("opened_date"));
      return <span className="text-sm text-counselflow-neutral">{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const matter = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(matter)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(matter)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Matter
              </DropdownMenuItem>
            )}
            {onAnalyze && (
              <DropdownMenuItem onClick={() => onAnalyze(matter)}>
                <Brain className="h-4 w-4 mr-2" />
                AI Analysis
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(matter)}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Contract columns
export const createContractColumns = (
  onView?: (contract: Contract) => void,
  onEdit?: (contract: Contract) => void,
  onDelete?: (contract: Contract) => void,
  onAnalyze?: (contract: Contract) => void
): ColumnDef<Contract>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Contract",
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-counselflow-primary/20 rounded-full flex items-center justify-center">
            <FileText className="h-4 w-4 text-counselflow-primary" />
          </div>
          <div>
            <div className="font-medium text-counselflow-dark">{contract.title}</div>
            <div className="text-sm text-counselflow-neutral">{contract.contract_number}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant="outline" className="border-counselflow-primary/30 text-counselflow-primary">
          {type.replace(/_/g, ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
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
          default:
            return "bg-gray-100 text-gray-700 border-gray-300";
        }
      };

      const getStatusIcon = (status: string) => {
        switch (status) {
          case "ACTIVE":
          case "EXECUTED":
            return <CheckCircle className="h-3 w-3" />;
          case "EXPIRED":
          case "TERMINATED":
          case "CANCELLED":
            return <XCircle className="h-3 w-3" />;
          case "LEGAL_REVIEW":
          case "AWAITING_SIGNATURE":
            return <AlertCircle className="h-3 w-3" />;
          default:
            return <Clock className="h-3 w-3" />;
        }
      };

      return (
        <div className="flex items-center space-x-2">
          {getStatusIcon(status)}
          <Badge className={`${getStatusColor(status)} border`}>
            {status.replace(/_/g, ' ')}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "risk_level",
    header: "Risk",
    cell: ({ row }) => {
      const contract = row.original;
      const getRiskColor = (level: string) => {
        switch (level) {
          case "LOW": return "bg-green-100 text-green-700";
          case "MEDIUM": return "bg-yellow-100 text-yellow-700";
          case "HIGH": return "bg-orange-100 text-orange-700";
          case "CRITICAL": return "bg-red-100 text-red-700";
          default: return "bg-gray-100 text-gray-700";
        }
      };
      return (
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
      );
    },
  },
  {
    accessorKey: "contract_value",
    header: "Value",
    cell: ({ row }) => {
      const contract = row.original;
      if (!contract.contract_value) return "N/A";
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: contract.currency
      }).format(contract.contract_value);
    },
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = row.getValue("end_date") as string;
      if (!endDate) return "N/A";
      return <span className="text-sm text-counselflow-neutral">{new Date(endDate).toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const contract = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(contract)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(contract)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Contract
              </DropdownMenuItem>
            )}
            {onAnalyze && (
              <DropdownMenuItem onClick={() => onAnalyze(contract)}>
                <Brain className="h-4 w-4 mr-2" />
                AI Analysis
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(contract)}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Filter configurations for different data types
export const clientFilters = [
  {
    accessorKey: "status",
    title: "Status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Inactive", value: "INACTIVE" },
      { label: "Potential", value: "POTENTIAL" },
      { label: "Former", value: "FORMER" },
    ],
  },
  {
    accessorKey: "risk_level",
    title: "Risk Level",
    options: [
      { label: "Low", value: "LOW" },
      { label: "Medium", value: "MEDIUM" },
      { label: "High", value: "HIGH" },
      { label: "Critical", value: "CRITICAL" },
    ],
  },
];

export const matterFilters = [
  {
    accessorKey: "type",
    title: "Type",
    options: [
      { label: "Litigation", value: "LITIGATION" },
      { label: "Corporate", value: "CORPORATE" },
      { label: "Employment", value: "EMPLOYMENT" },
      { label: "IP", value: "INTELLECTUAL_PROPERTY" },
      { label: "Real Estate", value: "REAL_ESTATE" },
      { label: "Tax", value: "TAX" },
    ],
  },
  {
    accessorKey: "status",
    title: "Status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "On Hold", value: "ON_HOLD" },
      { label: "Closed Won", value: "CLOSED_WON" },
      { label: "Closed Lost", value: "CLOSED_LOST" },
    ],
  },
  {
    accessorKey: "priority",
    title: "Priority",
    options: [
      { label: "Low", value: "LOW" },
      { label: "Medium", value: "MEDIUM" },
      { label: "High", value: "HIGH" },
      { label: "Urgent", value: "URGENT" },
      { label: "Critical", value: "CRITICAL" },
    ],
  },
];

export const contractFilters = [
  {
    accessorKey: "type",
    title: "Type",
    options: [
      { label: "Service Agreement", value: "SERVICE_AGREEMENT" },
      { label: "NDA", value: "NDA" },
      { label: "Employment", value: "EMPLOYMENT" },
      { label: "Vendor", value: "VENDOR" },
      { label: "Licensing", value: "LICENSING" },
    ],
  },
  {
    accessorKey: "status",
    title: "Status",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Draft", value: "DRAFT" },
      { label: "Under Review", value: "UNDER_REVIEW" },
      { label: "Executed", value: "EXECUTED" },
      { label: "Expired", value: "EXPIRED" },
    ],
  },
  {
    accessorKey: "risk_level",
    title: "Risk Level",
    options: [
      { label: "Low", value: "LOW" },
      { label: "Medium", value: "MEDIUM" },
      { label: "High", value: "HIGH" },
      { label: "Critical", value: "CRITICAL" },
    ],
  },
];