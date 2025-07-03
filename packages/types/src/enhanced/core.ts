// Core TypeScript interfaces for CounselFlow Legal Management System

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// User Management Types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  lastLogin?: string;
  securityClearanceLevel: SecurityClearanceLevel;
  mfaEnabled: boolean;
  profilePictureUrl?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  PARTNER = 'partner',
  ATTORNEY = 'attorney',
  PARALEGAL = 'paralegal',
  SECRETARY = 'secretary',
  CLIENT = 'client',
  EXTERNAL_COUNSEL = 'external_counsel'
}

export enum SecurityClearanceLevel {
  PUBLIC = 'public',
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
  TOP_SECRET = 'top_secret'
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
}

// Contract Management Types
export interface Contract extends BaseEntity {
  title: string;
  description: string;
  contractType: ContractType;
  status: ContractStatus;
  clientEntity: string;
  counterparty: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  value: number;
  currency: string;
  owner: string;
  assignedLawyer: string;
  tags: string[];
  priority: Priority;
  riskLevel: RiskLevel;
  documentUrls: string[];
  notes: string;
  customFields: Record<string, unknown>;
}

export enum ContractType {
  SERVICE_AGREEMENT = 'service_agreement',
  EMPLOYMENT_CONTRACT = 'employment_contract',
  NDA = 'nda',
  LICENSING_AGREEMENT = 'licensing_agreement',
  PARTNERSHIP_AGREEMENT = 'partnership_agreement',
  VENDOR_AGREEMENT = 'vendor_agreement',
  LEASE_AGREEMENT = 'lease_agreement',
  OTHER = 'other'
}

export enum ContractStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed'
}

// Matter Management Types
export interface Matter extends BaseEntity {
  matterNumber: string;
  title: string;
  description: string;
  client: string;
  matterType: MatterType;
  status: MatterStatus;
  priority: Priority;
  assignedLawyer: string;
  assignedParalegal?: string;
  startDate: string;
  targetEndDate?: string;
  actualEndDate?: string;
  budgetAmount?: number;
  actualCost?: number;
  billingRate?: number;
  timeSpent: number; // in hours
  tags: string[];
  riskAssessment: RiskAssessment;
  confidentialityLevel: SecurityClearanceLevel;
  relatedMatters: string[];
  documents: DocumentReference[];
}

export enum MatterType {
  LITIGATION = 'litigation',
  CORPORATE = 'corporate',
  EMPLOYMENT = 'employment',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  REAL_ESTATE = 'real_estate',
  TAX = 'tax',
  REGULATORY = 'regulatory',
  MERGERS_ACQUISITIONS = 'mergers_acquisitions',
  COMPLIANCE = 'compliance',
  OTHER = 'other'
}

export enum MatterStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

// Common Enums
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Risk Assessment Types
export interface RiskAssessment {
  financialRisk: RiskLevel;
  reputationalRisk: RiskLevel;
  legalRisk: RiskLevel;
  operationalRisk: RiskLevel;
  overallRisk: RiskLevel;
  mitigationStrategies: string[];
  lastAssessedDate: string;
  assessedBy: string;
}

// Document Management Types
export interface DocumentReference {
  id: string;
  filename: string;
  url: string;
  type: DocumentType;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  isConfidential: boolean;
  tags: string[];
}

export enum DocumentType {
  CONTRACT = 'contract',
  BRIEF = 'brief',
  MOTION = 'motion',
  CORRESPONDENCE = 'correspondence',
  EVIDENCE = 'evidence',
  RESEARCH = 'research',
  MEMO = 'memo',
  INVOICE = 'invoice',
  OTHER = 'other'
}

// Task Management Types
export interface Task extends BaseEntity {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assignedTo: string;
  assignedBy: string;
  matterId?: string;
  contractId?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependencies: string[];
  attachments: DocumentReference[];
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

// Entity Management Types
export interface Entity extends BaseEntity {
  name: string;
  entityType: EntityType;
  jurisdiction: string;
  registrationNumber?: string;
  taxId?: string;
  address: Address;
  contacts: Contact[];
  parentEntity?: string;
  subsidiaries: string[];
  isActive: boolean;
  incorporationDate?: string;
  dissolutionDate?: string;
  notes: string;
}

export enum EntityType {
  CORPORATION = 'corporation',
  LLC = 'llc',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government',
  INDIVIDUAL = 'individual',
  OTHER = 'other'
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  contactType: ContactType;
}

export enum ContactType {
  PRIMARY = 'primary',
  BILLING = 'billing',
  LEGAL = 'legal',
  TECHNICAL = 'technical',
  EMERGENCY = 'emergency'
}

// Dispute Resolution Types
export interface Dispute extends BaseEntity {
  disputeNumber: string;
  title: string;
  description: string;
  disputeType: DisputeType;
  status: DisputeStatus;
  plaintiff: string;
  defendant: string;
  jurisdiction: string;
  court?: string;
  judge?: string;
  filingDate?: string;
  trialDate?: string;
  settlementAmount?: number;
  attorney: string;
  paralegal?: string;
  estimatedValue: number;
  riskAssessment: RiskAssessment;
  timeline: DisputeEvent[];
  documents: DocumentReference[];
}

export enum DisputeType {
  CONTRACT_DISPUTE = 'contract_dispute',
  EMPLOYMENT_DISPUTE = 'employment_dispute',
  IP_DISPUTE = 'ip_dispute',
  COMMERCIAL_LITIGATION = 'commercial_litigation',
  PERSONAL_INJURY = 'personal_injury',
  REAL_ESTATE_DISPUTE = 'real_estate_dispute',
  OTHER = 'other'
}

export enum DisputeStatus {
  FILED = 'filed',
  DISCOVERY = 'discovery',
  MEDIATION = 'mediation',
  ARBITRATION = 'arbitration',
  TRIAL = 'trial',
  SETTLEMENT = 'settlement',
  APPEAL = 'appeal',
  CLOSED = 'closed'
}

export interface DisputeEvent {
  id: string;
  eventType: string;
  description: string;
  date: string;
  createdBy: string;
  documents: string[];
}

// Analytics and Reporting Types
export interface DashboardMetrics {
  totalMatters: number;
  activeContracts: number;
  pendingTasks: number;
  overdueItems: number;
  revenueThisMonth: number;
  billableHours: number;
  clientSatisfaction: number;
  averageResponseTime: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  status?: string[];
  priority?: Priority[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  customFilters?: Record<string, unknown>;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  REMINDER = 'reminder'
}

// Webhook and Integration Types
export interface WebhookEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  data: Record<string, unknown>;
}

// Export all types for easy importing
export type {
  BaseEntity,
  User,
  Contract,
  Matter,
  Task,
  Entity,
  Dispute,
  DocumentReference,
  RiskAssessment,
  Address,
  Contact,
  DisputeEvent,
  DashboardMetrics,
  ChartData,
  ApiResponse,
  PaginatedResponse,
  FormValidationError,
  FormState,
  SearchFilters,
  SortConfig,
  Notification,
  WebhookEvent
};