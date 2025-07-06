// CounselFlow Design System Constants and Utilities

export const counselflowColors = {
  // Primary Brand Colors
  primary: "#26A69A",     // Primary Turquoise
  dark: "#004D40",        // Dark Turquoise
  light: "#B2DFDB",       // Light Turquoise
  bright: "#00BCD4",      // Bright Turquoise
  
  // Status Colors
  success: "#4CAF50",     // Success Green
  warning: "#FF9800",     // Warning Orange
  error: "#F44336",       // Error Red
  neutral: "#757575",     // Neutral Gray
  "light-gray": "#F5F5F5", // Light Gray
} as const;

export const statusColors = {
  // Client Status Colors
  client: {
    ACTIVE: "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30",
    INACTIVE: "bg-gray-100 text-gray-700 border-gray-300",
    POTENTIAL: "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30",
    FORMER: "bg-red-100 text-red-700 border-red-300",
  },
  
  // Matter Status Colors
  matter: {
    ACTIVE: "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30",
    OPENED: "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30",
    ON_HOLD: "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30",
    CLOSED_WON: "bg-green-100 text-green-700 border-green-300",
    CLOSED_LOST: "bg-red-100 text-red-700 border-red-300",
    DISCOVERY: "bg-counselflow-primary/20 text-counselflow-primary border-counselflow-primary/30",
    SETTLEMENT: "bg-counselflow-primary/20 text-counselflow-primary border-counselflow-primary/30",
    TRIAL: "bg-counselflow-primary/20 text-counselflow-primary border-counselflow-primary/30",
    INTAKE: "bg-gray-100 text-gray-700 border-gray-300",
    CONFLICTS_CHECK: "bg-gray-100 text-gray-700 border-gray-300",
  },
  
  // Contract Status Colors
  contract: {
    ACTIVE: "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30",
    EXECUTED: "bg-counselflow-success/20 text-counselflow-success border-counselflow-success/30",
    DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
    UNDER_REVIEW: "bg-gray-100 text-gray-700 border-gray-300",
    LEGAL_REVIEW: "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30",
    AWAITING_SIGNATURE: "bg-counselflow-warning/20 text-counselflow-warning border-counselflow-warning/30",
    EXPIRED: "bg-red-100 text-red-700 border-red-300",
    TERMINATED: "bg-red-100 text-red-700 border-red-300",
    CANCELLED: "bg-red-100 text-red-700 border-red-300",
    RENEWED: "bg-counselflow-primary/20 text-counselflow-primary border-counselflow-primary/30",
  },
} as const;

export const riskColors = {
  LOW: "bg-green-100 text-green-700 border-green-300",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-300",
  HIGH: "bg-orange-100 text-orange-700 border-orange-300",
  CRITICAL: "bg-red-100 text-red-700 border-red-300",
} as const;

export const priorityColors = {
  LOW: "bg-gray-500 text-white",
  MEDIUM: "bg-blue-500 text-white",
  HIGH: "bg-yellow-500 text-white",
  URGENT: "bg-orange-500 text-white",
  CRITICAL: "bg-red-500 text-white",
} as const;

// Typography Scale
export const typography = {
  // Headings
  h1: "text-4xl font-bold tracking-tight text-counselflow-dark",
  h2: "text-3xl font-bold tracking-tight text-counselflow-dark",
  h3: "text-2xl font-bold tracking-tight text-counselflow-dark",
  h4: "text-xl font-semibold text-counselflow-dark",
  h5: "text-lg font-semibold text-counselflow-dark",
  h6: "text-base font-semibold text-counselflow-dark",
  
  // Body Text
  body: "text-sm text-counselflow-dark",
  bodyLarge: "text-base text-counselflow-dark",
  bodySmall: "text-xs text-counselflow-neutral",
  
  // Special Text
  caption: "text-xs text-counselflow-neutral",
  label: "text-sm font-medium text-counselflow-dark",
  button: "text-sm font-medium",
} as const;

// Component Spacing
export const spacing = {
  // Padding
  cardPadding: "p-6",
  sectionPadding: "px-6 py-4",
  formPadding: "p-4",
  
  // Margins
  sectionMargin: "space-y-6",
  elementMargin: "space-y-4",
  
  // Gaps
  gridGap: "gap-6",
  flexGap: "space-x-4",
} as const;

// Border Radius
export const borderRadius = {
  small: "rounded-md",
  medium: "rounded-lg",
  large: "rounded-xl",
  full: "rounded-full",
} as const;

// Shadows
export const shadows = {
  small: "shadow-sm",
  medium: "shadow-md",
  large: "shadow-lg",
  card: "shadow-lg",
} as const;

// Animation Classes
export const animations = {
  fadeIn: "animate-in fade-in-0 duration-200",
  fadeOut: "animate-out fade-out-0 duration-200",
  slideIn: "animate-in slide-in-from-top-2 duration-200",
  slideOut: "animate-out slide-out-to-top-2 duration-200",
  spin: "animate-spin",
  pulse: "animate-pulse",
} as const;

// Utility Functions
export const getStatusColor = (type: 'client' | 'matter' | 'contract', status: string): string => {
  const statusMap = statusColors[type] as Record<string, string>;
  return statusMap[status] || "bg-gray-100 text-gray-700 border-gray-300";
};

export const getRiskColor = (riskLevel: string): string => {
  return riskColors[riskLevel as keyof typeof riskColors] || riskColors.MEDIUM;
};

export const getPriorityColor = (priority: string): string => {
  return priorityColors[priority as keyof typeof priorityColors] || priorityColors.MEDIUM;
};

export const formatCurrency = (amount?: number, currency = "USD"): string => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

// Common CSS Classes for consistent styling
export const commonClasses = {
  // Cards
  card: "border-0 shadow-lg bg-white/80 backdrop-blur-sm",
  cardHeader: "flex flex-row items-center justify-between space-y-0 pb-2",
  
  // Buttons
  primaryButton: "bg-counselflow-primary hover:bg-counselflow-dark",
  outlineButton: "border-counselflow-primary/30 hover:bg-counselflow-light/20",
  
  // Inputs
  input: "border-counselflow-primary/30 focus:border-counselflow-primary",
  
  // Tables
  tableHeader: "bg-counselflow-light/20 hover:bg-counselflow-light/30",
  tableRow: "hover:bg-counselflow-light/10",
  
  // Backgrounds
  pageBackground: "bg-gradient-to-br from-counselflow-light/10 to-white min-h-screen",
  sectionBackground: "bg-white rounded-lg shadow-sm",
} as const;

// Icon mapping for different entities
export const entityIcons = {
  client: "Users",
  matter: "Briefcase", 
  contract: "FileText",
  task: "CheckSquare",
  document: "File",
  user: "User",
} as const;

// Legal Module Colors (for future module-specific styling)
export const moduleColors = {
  clients: counselflowColors.primary,
  matters: counselflowColors.bright,
  contracts: counselflowColors.dark,
  compliance: counselflowColors.warning,
  ip: counselflowColors.success,
  litigation: counselflowColors.error,
} as const;