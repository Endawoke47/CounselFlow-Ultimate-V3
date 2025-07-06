// Shared Component Library - CounselFlow Design System
// Export all reusable components following the CounselFlow specification

// Data Table Components
export { AdvancedDataTable } from "@/components/data-table/advanced-data-table";
export { 
  createClientColumns, 
  createMatterColumns, 
  createContractColumns,
  clientFilters,
  matterFilters,
  contractFilters 
} from "@/components/data-table/columns";

// Search Components
export { GlobalSearch } from "@/components/global-search";

// Layout Components
export { Header } from "@/components/layout/header";
export { Sidebar } from "@/components/layout/sidebar";

// UI Components (Re-export for convenience)
export { Button } from "@/components/ui/button";
export { Input } from "@/components/ui/input";
export { Label } from "@/components/ui/label";
export { Badge } from "@/components/ui/badge";
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
export { Textarea } from "@/components/ui/textarea";
export { Checkbox } from "@/components/ui/checkbox";
export { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";

// Form Components would go here when implemented
// export { FormField } from "@/components/form/form-field";
// export { FormWrapper } from "@/components/form/form-wrapper";

// Charts and Visualization Components would go here when implemented
// export { AIInsightsChart } from "@/components/charts/ai-insights-chart";
// export { RiskScoreChart } from "@/components/charts/risk-score-chart";

// AI Components would go here when implemented
// export { AIAnalysisModal } from "@/components/ai/ai-analysis-modal";
// export { AIDocumentGenerator } from "@/components/ai/ai-document-generator";
// export { LegalChatbot } from "@/components/ai/legal-chatbot";