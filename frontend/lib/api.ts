import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";

// Performance monitoring interfaces
interface ApiCacheConfig {
  ttl: number;
  staleWhileRevalidate: boolean;
  key?: string;
}

interface EnhancedAxiosRequestConfig extends AxiosRequestConfig {
  cache?: ApiCacheConfig;
  skipAuth?: boolean;
  retries?: number;
  metadata?: { startTime: number };
}

// Enhanced types matching backend schemas
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "ADMIN" | "IN_HOUSE_COUNSEL" | "EXTERNAL_COUNSEL" | "LEGAL_OPS" | "PARALEGAL" | "LEGAL_ASSISTANT" | "CONTRACT_MANAGER" | "COMPLIANCE_OFFICER" | "CLIENT_CONTACT" | "BUSINESS_USER" | "GUEST" | "SYSTEM";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  full_name?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Client interfaces matching backend schemas
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "POTENTIAL" | "FORMER";
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  billing_contact?: string;
  primary_contact?: string;
  business_unit?: string;
  annual_revenue?: number;
  employee_count?: number;
  jurisdiction?: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  created_by: string;
  matters_count?: number;
  contracts_count?: number;
}

export interface ClientCreate {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | "POTENTIAL" | "FORMER";
  risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  billing_contact?: string;
  primary_contact?: string;
  business_unit?: string;
  annual_revenue?: number;
  employee_count?: number;
  jurisdiction?: string;
}

export interface ClientSearchParams {
  query?: string;
  status?: "ACTIVE" | "INACTIVE" | "POTENTIAL" | "FORMER";
  risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  industry?: string;
  limit?: number;
  offset?: number;
}

export interface ClientListResponse {
  clients: Client[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Matter interfaces matching backend schemas
export interface Matter {
  id: string;
  title: string;
  description?: string;
  matter_number: string;
  type: "LITIGATION" | "CORPORATE" | "EMPLOYMENT" | "INTELLECTUAL_PROPERTY" | "REAL_ESTATE" | "TAX" | "MERGERS_ACQUISITIONS" | "COMPLIANCE" | "IMMIGRATION" | "BANKRUPTCY" | "FAMILY" | "PERSONAL_INJURY" | "CRIMINAL" | "ENVIRONMENTAL" | "SECURITIES" | "OTHER";
  status: "INTAKE" | "CONFLICTS_CHECK" | "OPENED" | "ACTIVE" | "ON_HOLD" | "DISCOVERY" | "SETTLEMENT" | "TRIAL" | "APPEAL" | "CLOSED_WON" | "CLOSED_LOST" | "CLOSED_SETTLED" | "ARCHIVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | "CRITICAL";
  client_id: string;
  lead_attorney_id?: string;
  assigned_attorneys?: string[];
  hourly_rate?: number;
  estimated_hours?: number;
  budget_amount?: number;
  estimated_value?: number;
  opened_date: string;
  target_resolution_date?: string;
  closed_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  ai_risk_score?: number;
  complexity_score?: number;
}

// Contract interfaces matching backend schemas  
export interface Contract {
  id: string;
  title: string;
  description?: string;
  contract_number: string;
  type: "SERVICE_AGREEMENT" | "NDA" | "EMPLOYMENT" | "VENDOR" | "LICENSING" | "PARTNERSHIP" | "LEASE" | "PURCHASE" | "MSA" | "SOW" | "OTHER";
  status: "DRAFT" | "UNDER_REVIEW" | "LEGAL_REVIEW" | "AWAITING_SIGNATURE" | "EXECUTED" | "ACTIVE" | "EXPIRED" | "TERMINATED" | "CANCELLED" | "RENEWED";
  client_id: string;
  counterparty_name?: string;
  counterparty_email?: string;
  matter_id?: string;
  contract_value?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  execution_date?: string;
  renewal_date?: string;
  auto_renew: boolean;
  content?: string;
  terms_and_conditions?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  ai_risk_score?: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ai_summary?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled" | "on_hold";
  assigned_to_id?: number;
  created_by_id: number;
  matter_id?: number;
  due_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage: number;
  is_billable: boolean;
  is_milestone: boolean;
}

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private requestInterceptors: number[] = [];
  private responseInterceptors: number[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      timeout: 30000, // Increased timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (this.token) {
        this.setAuthHeader(this.token);
      }
    }

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Enhanced request interceptor
    const requestInterceptor = this.client.interceptors.request.use(
      (config: EnhancedAxiosRequestConfig) => {
        // Add performance timing
        config.metadata = { startTime: performance.now() };

        // Add auth token if available and not skipped
        if (!config.skipAuth && this.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        // Add request ID for tracing
        config.headers = config.headers || {};
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor
    const responseInterceptor = this.client.interceptors.response.use(
      (response) => {
        // Calculate response time
        const responseTime = performance.now() - (response.config as EnhancedAxiosRequestConfig).metadata?.startTime;
        
        // Log performance in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${responseTime.toFixed(2)}ms)`);
        }

        // Track slow requests
        if (responseTime > 2000) {
          console.warn(`🐌 Slow API request detected: ${response.config.url} took ${responseTime.toFixed(2)}ms`);
        }

        return response;
      },
      async (error: AxiosError) => {
        const responseTime = performance.now() - ((error.config as EnhancedAxiosRequestConfig)?.metadata?.startTime || 0);
        
        // Log error with timing
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${responseTime.toFixed(2)}ms)`, {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        });

        // Handle token expiry with retry logic
        if (error.response?.status === 401 && this.token) {
          try {
            await this.refreshToken();
            // Retry the original request
            return this.client.request(error.config!);
          } catch (refreshError) {
            this.logout();
            if (typeof window !== 'undefined') {
              window.location.href = "/auth/login";
            }
          }
        }

        return Promise.reject(this.transformError(error));
      }
    );

    this.requestInterceptors.push(requestInterceptor);
    this.responseInterceptors.push(responseInterceptor);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private transformError(error: AxiosError): Error & { 
    status?: number; 
    code?: string;
    userMessage?: string;
  } {
    const errorData = error.response?.data as any;
    const transformedError = new Error(
      errorData?.message || error.message || 'An unexpected error occurred'
    ) as Error & { status?: number; code?: string; userMessage?: string };

    transformedError.status = error.response?.status;
    transformedError.code = errorData?.error_code;
    transformedError.userMessage = errorData?.user_message;

    return transformedError;
  }

  // Enhanced request method with retry logic and caching
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: EnhancedAxiosRequestConfig
  ): Promise<T> {
    const retries = config?.retries ?? 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response: AxiosResponse<T> = await this.client.request({
          method,
          url,
          data,
          ...config,
        });

        return response.data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx) or if it's the last attempt
        if (
          attempt === retries ||
          (error as AxiosError)?.response?.status &&
          (error as AxiosError).response!.status >= 400 &&
          (error as AxiosError).response!.status < 500
        ) {
          break;
        }

        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔄 Retrying request (attempt ${attempt + 2}/${retries + 1}) after ${delay}ms`);
        }
      }
    }

    throw lastError;
  }

  // Cached GET method
  async getWithCache<T = any>(
    url: string, 
    config?: EnhancedAxiosRequestConfig & { cache?: ApiCacheConfig }
  ): Promise<T> {
    const cacheConfig = config?.cache;
    
    if (!cacheConfig) {
      return this.request<T>('GET', url, undefined, config);
    }

    const cacheKey = cacheConfig.key || `${url}_${JSON.stringify(config?.params || {})}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < cached.ttl) {
      // Optionally refresh in background for stale-while-revalidate
      if (cacheConfig.staleWhileRevalidate && (now - cached.timestamp) > cached.ttl * 0.8) {
        this.refreshCache(url, config, cacheKey).catch(console.error);
      }
      
      return cached.data;
    }

    // Fetch fresh data
    const data = await this.request<T>('GET', url, undefined, config);
    
    // Cache the result
    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      ttl: cacheConfig.ttl,
    });

    return data;
  }

  private async refreshCache(url: string, config: any, cacheKey: string) {
    try {
      const data = await this.request('GET', url, undefined, config);
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: config?.cache?.ttl || 300000, // 5 minutes default
      });
    } catch (error) {
      console.error('Background cache refresh failed:', error);
    }
  }

  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  // Cleanup method
  cleanup() {
    this.requestInterceptors.forEach(id => this.client.interceptors.request.eject(id));
    this.responseInterceptors.forEach(id => this.client.interceptors.response.eject(id));
    this.cache.clear();
  }

  private setAuthHeader(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  private removeAuthHeader() {
    delete this.client.defaults.headers.common["Authorization"];
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await this.client.post<AuthTokens>("/api/auth/login", {
      email,
      password,
    });
    
    const tokens = response.data;
    this.token = tokens.access_token;
    this.setAuthHeader(tokens.access_token);
    
    // Store tokens in localStorage
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("user", JSON.stringify(tokens.user));
    
    return tokens;
  }

  async register(userData: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }): Promise<User> {
    const response = await this.client.post<User>("/api/auth/register", userData);
    return response.data;
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await this.client.post<AuthTokens>("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    
    const tokens = response.data;
    this.token = tokens.access_token;
    this.setAuthHeader(tokens.access_token);
    
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("user", JSON.stringify(tokens.user));
    
    return tokens;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/api/auth/logout");
    } catch (error) {
      // Ignore errors during logout
    } finally {
      this.token = null;
      this.removeAuthHeader();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>("/api/auth/me");
    return response.data;
  }

  // Enhanced Client methods matching backend API
  async getClients(params?: ClientSearchParams): Promise<ClientListResponse> {
    const response = await this.client.get("/api/v1/clients", { params });
    return response.data;
  }

  async getClient(id: string): Promise<Client> {
    const response = await this.client.get<Client>(`/api/v1/clients/${id}`);
    return response.data;
  }

  async createClient(clientData: ClientCreate): Promise<Client> {
    const response = await this.client.post<Client>("/api/v1/clients", clientData);
    return response.data;
  }

  async updateClient(id: string, clientData: Partial<ClientCreate>): Promise<Client> {
    const response = await this.client.put<Client>(`/api/v1/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/v1/clients/${id}`);
    return response.data;
  }

  // Matter methods
  async getMatters(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    type?: string[];
    status?: string[];
    client_id?: string;
  }): Promise<{ matters: Matter[]; total: number; page: number; per_page: number }> {
    const response = await this.client.get("/api/v1/matters", { params });
    return response.data;
  }

  async getMatter(id: string): Promise<Matter> {
    const response = await this.client.get<Matter>(`/api/v1/matters/${id}`);
    return response.data;
  }

  async createMatter(matterData: Partial<Matter>): Promise<Matter> {
    const response = await this.client.post<Matter>("/api/v1/matters", matterData);
    return response.data;
  }

  async updateMatter(id: string, matterData: Partial<Matter>): Promise<Matter> {
    const response = await this.client.put<Matter>(`/api/v1/matters/${id}`, matterData);
    return response.data;
  }

  async deleteMatter(id: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/v1/matters/${id}`);
    return response.data;
  }

  // Contract methods
  async getContracts(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    type?: string[];
    status?: string[];
    client_id?: string;
  }): Promise<{ contracts: Contract[]; total: number; page: number; per_page: number }> {
    const response = await this.client.get("/api/v1/contracts", { params });
    return response.data;
  }

  async getContract(id: string): Promise<Contract> {
    const response = await this.client.get<Contract>(`/api/v1/contracts/${id}`);
    return response.data;
  }

  async createContract(contractData: Partial<Contract>): Promise<Contract> {
    const response = await this.client.post<Contract>("/api/v1/contracts", contractData);
    return response.data;
  }

  async updateContract(id: string, contractData: Partial<Contract>): Promise<Contract> {
    const response = await this.client.put<Contract>(`/api/v1/contracts/${id}`, contractData);
    return response.data;
  }

  async deleteContract(id: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/api/v1/contracts/${id}`);
    return response.data;
  }

  // Enhanced AI methods matching backend API
  async analyzeContract(requestData: {
    contract_text: string;
    analysis_type?: string;
    use_consensus?: boolean;
    provider?: string;
  }): Promise<any> {
    const response = await this.client.post("/api/v1/ai/analyze-contract", requestData);
    return response.data;
  }

  async generateDocument(requestData: {
    document_type: string;
    template_data: Record<string, any>;
    use_consensus?: boolean;
    provider?: string;
  }): Promise<any> {
    const response = await this.client.post("/api/v1/ai/generate-document", requestData);
    return response.data;
  }

  async performLegalResearch(requestData: {
    query: string;
    jurisdiction?: string;
    practice_area?: string;
    use_consensus?: boolean;
  }): Promise<any> {
    const response = await this.client.post("/api/v1/ai/legal-research", requestData);
    return response.data;
  }

  async analyzeLitigationStrategy(requestData: {
    case_description: string;
    case_type?: string;
    jurisdiction?: string;
    use_consensus?: boolean;
  }): Promise<any> {
    const response = await this.client.post("/api/v1/ai/analyze-litigation", requestData);
    return response.data;
  }

  async getAIModels(): Promise<any> {
    const response = await this.client.get("/api/v1/ai/models");
    return response.data;
  }

  async getAIUsageStats(): Promise<any> {
    const response = await this.client.get("/api/v1/ai/usage-stats");
    return response.data;
  }

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current user from localStorage
  getCurrentUserFromStorage(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiClient = new ApiClient();
export default apiClient;