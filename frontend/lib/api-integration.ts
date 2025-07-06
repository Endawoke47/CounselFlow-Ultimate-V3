/**
 * CounselFlow Ultimate V3 - Enhanced API Integration Service
 * Centralized API integration with improved error handling and data flow
 */

import { apiClient } from './api';
import { QueryClient } from '@tanstack/react-query';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
  pages: number;
}

export interface ApiError {
  error: boolean;
  error_code: string;
  message: string;
  user_message: string;
  status_code: number;
  details?: any;
  timestamp: string;
}

// Standardized query parameters
export interface BaseQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Authentication interfaces matching backend
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
  tenant_id?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  role: string;
}

// User interfaces matching backend schema
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  tenant_id?: string;
}

// Client interfaces matching backend schema  
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'POTENTIAL' | 'FORMER';
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ClientCreateRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'POTENTIAL' | 'FORMER';
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Contract interfaces matching backend schema
export interface Contract {
  id: string;
  title: string;
  description?: string;
  contract_number: string;
  type: string;
  status: string;
  client_id: string;
  contract_value?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  execution_date?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  ai_risk_score?: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ContractCreateRequest {
  title: string;
  description?: string;
  type: string;
  client_id: string;
  contract_value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  auto_renew?: boolean;
}

// Matter interfaces matching backend schema
export interface Matter {
  id: string;
  title: string;
  description?: string;
  matter_number: string;
  type: string;
  status: string;
  priority: string;
  client_id: string;
  lead_attorney_id?: string;
  opened_date: string;
  target_resolution_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface MatterCreateRequest {
  title: string;
  description?: string;
  type: string;
  priority: string;
  client_id: string;
  lead_attorney_id?: string;
  target_resolution_date?: string;
}

// =============================================================================
// API INTEGRATION SERVICE
// =============================================================================

class ApiIntegrationService {
  private queryClient: QueryClient;
  private baseUrl: string;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.baseUrl = '/api/v1'; // Standardized base URL
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/auth/login`, credentials);
      return this.handleResponse<AuthResponse>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/auth/register`, userData);
      return this.handleResponse<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/auth/logout`);
      // Clear all cached data on logout
      this.queryClient.clear();
    } catch (error) {
      // Log error but don't throw - logout should always succeed locally
      console.error('Logout error:', error);
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/auth/refresh`);
      return this.handleResponse<AuthResponse>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/auth/me`);
      return this.handleResponse<User>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // CLIENT METHODS
  // =============================================================================

  async getClients(params?: BaseQueryParams & {
    status?: string;
    risk_level?: string;
    industry?: string;
  }): Promise<PaginatedResponse<Client>> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/clients`, {
        params,
        cache: { ttl: 300000, staleWhileRevalidate: true }
      });
      return this.handlePaginatedResponse<Client>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getClient(id: string): Promise<Client> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/clients/${id}`, {
        cache: { ttl: 300000, staleWhileRevalidate: true }
      });
      return this.handleResponse<Client>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createClient(data: ClientCreateRequest): Promise<Client> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/clients`, data);
      const result = this.handleResponse<Client>(response);
      
      // Invalidate clients cache
      this.queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateClient(id: string, data: Partial<ClientCreateRequest>): Promise<Client> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/clients/${id}`, data);
      const result = this.handleResponse<Client>(response);
      
      // Invalidate specific client and clients list cache
      this.queryClient.invalidateQueries({ queryKey: ['clients'] });
      this.queryClient.invalidateQueries({ queryKey: ['client', id] });
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/clients/${id}`);
      
      // Invalidate caches
      this.queryClient.invalidateQueries({ queryKey: ['clients'] });
      this.queryClient.removeQueries({ queryKey: ['client', id] });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // CONTRACT METHODS
  // =============================================================================

  async getContracts(params?: BaseQueryParams & {
    client_id?: string;
    status?: string;
    type?: string;
  }): Promise<PaginatedResponse<Contract>> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/contracts`, {
        params,
        cache: { ttl: 300000, staleWhileRevalidate: true }
      });
      return this.handlePaginatedResponse<Contract>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContract(id: string): Promise<Contract> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/contracts/${id}`, {
        cache: { ttl: 300000, staleWhileRevalidate: true }
      });
      return this.handleResponse<Contract>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createContract(data: ContractCreateRequest): Promise<Contract> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/contracts`, data);
      const result = this.handleResponse<Contract>(response);
      
      // Invalidate contracts cache
      this.queryClient.invalidateQueries({ queryKey: ['contracts'] });
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateContract(id: string, data: Partial<ContractCreateRequest>): Promise<Contract> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/contracts/${id}`, data);
      const result = this.handleResponse<Contract>(response);
      
      // Invalidate caches
      this.queryClient.invalidateQueries({ queryKey: ['contracts'] });
      this.queryClient.invalidateQueries({ queryKey: ['contract', id] });
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteContract(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/contracts/${id}`);
      
      // Invalidate caches
      this.queryClient.invalidateQueries({ queryKey: ['contracts'] });
      this.queryClient.removeQueries({ queryKey: ['contract', id] });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // MATTER METHODS
  // =============================================================================

  async getMatters(params?: BaseQueryParams & {
    client_id?: string;
    status?: string;
    type?: string;
    assigned_to?: string;
  }): Promise<PaginatedResponse<Matter>> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/matters`, {
        params,
        cache: { ttl: 300000, staleWhileRevalidate: true }
      });
      return this.handlePaginatedResponse<Matter>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMatter(id: string): Promise<Matter> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/matters/${id}`, {
        cache: { ttl: 300000, staleWhileRevalidate: true }
      });
      return this.handleResponse<Matter>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createMatter(data: MatterCreateRequest): Promise<Matter> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/matters`, data);
      const result = this.handleResponse<Matter>(response);
      
      // Invalidate matters cache
      this.queryClient.invalidateQueries({ queryKey: ['matters'] });
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMatter(id: string, data: Partial<MatterCreateRequest>): Promise<Matter> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/matters/${id}`, data);
      const result = this.handleResponse<Matter>(response);
      
      // Invalidate caches
      this.queryClient.invalidateQueries({ queryKey: ['matters'] });
      this.queryClient.invalidateQueries({ queryKey: ['matter', id] });
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMatter(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/matters/${id}`);
      
      // Invalidate caches
      this.queryClient.invalidateQueries({ queryKey: ['matters'] });
      this.queryClient.removeQueries({ queryKey: ['matter', id] });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // AI SERVICES
  // =============================================================================

  async analyzeContract(data: {
    contract_text: string;
    analysis_type?: string;
    use_consensus?: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/ai/analyze-contract`, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateDocument(data: {
    document_type: string;
    template_data: Record<string, any>;
    use_consensus?: boolean;
  }): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/ai/generate-document`, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async performLegalResearch(data: {
    query: string;
    jurisdiction?: string;
    practice_area?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/ai/legal-research`, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // DASHBOARD METHODS
  // =============================================================================

  async getDashboardOverview(): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/overview`, {
        cache: { ttl: 120000, staleWhileRevalidate: true } // 2 minutes
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getClientMetrics(days: number = 30): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/metrics/clients`, {
        params: { days },
        cache: { ttl: 300000, staleWhileRevalidate: true } // 5 minutes
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContractMetrics(days: number = 30): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/metrics/contracts`, {
        params: { days },
        cache: { ttl: 300000, staleWhileRevalidate: true } // 5 minutes
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMatterMetrics(days: number = 30): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/metrics/matters`, {
        params: { days },
        cache: { ttl: 300000, staleWhileRevalidate: true } // 5 minutes
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAIMetrics(days: number = 30): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/metrics/ai`, {
        params: { days },
        cache: { ttl: 300000, staleWhileRevalidate: true } // 5 minutes
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCompleteDashboardData(days: number = 30): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/data`, {
        params: { days },
        cache: { ttl: 120000, staleWhileRevalidate: true } // 2 minutes
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDashboardAlerts(): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/alerts`, {
        cache: { ttl: 60000, staleWhileRevalidate: true } // 1 minute
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRecentActivity(limit: number = 10): Promise<any> {
    try {
      const response = await apiClient.getWithCache(`${this.baseUrl}/dashboard/recent-activity`, {
        params: { limit },
        cache: { ttl: 60000, staleWhileRevalidate: true } // 1 minute
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private handleResponse<T>(response: any): T {
    // Handle both direct data and wrapped responses
    if (response.data) {
      return response.data;
    }
    return response;
  }

  private handlePaginatedResponse<T>(response: any): PaginatedResponse<T> {
    // Ensure consistent pagination format
    if (response.data && Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.total || response.data.length,
        page: response.page || 1,
        per_page: response.per_page || response.data.length,
        has_next: response.has_next || false,
        has_prev: response.has_prev || false,
        pages: response.pages || 1
      };
    }

    // Handle direct array responses
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length,
        page: 1,
        per_page: response.length,
        has_next: false,
        has_prev: false,
        pages: 1
      };
    }

    return response;
  }

  private handleError(error: any): Error {
    // Extract error information from different response formats
    let message = 'An unexpected error occurred';
    let code = 'UNKNOWN_ERROR';
    let status = 500;

    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle FastAPI error format
      if (errorData.detail) {
        message = errorData.detail;
      } else if (errorData.message) {
        message = errorData.message;
      } else if (errorData.user_message) {
        message = errorData.user_message;
      }

      code = errorData.error_code || 'API_ERROR';
      status = error.response.status || errorData.status_code || 500;
    } else if (error.message) {
      message = error.message;
    }

    // Create enhanced error object
    const enhancedError = new Error(message) as Error & {
      code?: string;
      status?: number;
      originalError?: any;
    };

    enhancedError.code = code;
    enhancedError.status = status;
    enhancedError.originalError = error;

    return enhancedError;
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response = await apiClient.getWithCache('/health', {
        cache: { ttl: 30000, staleWhileRevalidate: true }
      });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Clear all caches
  clearCache(): void {
    this.queryClient.clear();
    apiClient.clearCache();
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let apiIntegrationInstance: ApiIntegrationService | null = null;

export function createApiIntegration(queryClient: QueryClient): ApiIntegrationService {
  if (!apiIntegrationInstance) {
    apiIntegrationInstance = new ApiIntegrationService(queryClient);
  }
  return apiIntegrationInstance;
}

export function getApiIntegration(): ApiIntegrationService {
  if (!apiIntegrationInstance) {
    throw new Error('API Integration not initialized. Call createApiIntegration first.');
  }
  return apiIntegrationInstance;
}

// =============================================================================
// REACT QUERY HOOKS
// =============================================================================

export const queryKeys = {
  // Auth
  currentUser: ['auth', 'current-user'] as const,
  
  // Clients
  clients: (params?: any) => ['clients', params] as const,
  client: (id: string) => ['client', id] as const,
  
  // Contracts  
  contracts: (params?: any) => ['contracts', params] as const,
  contract: (id: string) => ['contract', id] as const,
  
  // Matters
  matters: (params?: any) => ['matters', params] as const,
  matter: (id: string) => ['matter', id] as const,
  
  // Health
  health: ['health'] as const,
};

export default ApiIntegrationService;