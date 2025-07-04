import axios, { AxiosInstance, AxiosResponse } from "axios";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "staff" | "client" | "guest";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Client {
  id: number;
  company_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  full_name: string;
  display_name: string;
}

export interface Matter {
  id: number;
  title: string;
  description?: string;
  matter_number: string;
  matter_type: string;
  status: string;
  client_id: number;
  assigned_attorney_id?: number;
  created_by_id: number;
  hourly_rate?: number;
  estimated_hours?: number;
  budget?: number;
  opened_date: string;
  due_date?: string;
  closed_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface Contract {
  id: number;
  title: string;
  description?: string;
  contract_number: string;
  contract_type: string;
  status: string;
  client_id: number;
  counterparty_name?: string;
  counterparty_email?: string;
  matter_id?: number;
  contract_value?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  execution_date?: string;
  renewal_date?: string;
  content?: string;
  terms_and_conditions?: string;
  created_at: string;
  updated_at?: string;
  created_by_id: number;
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

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
      timeout: 10000,
    });

    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
      if (this.token) {
        this.setAuthHeader(this.token);
      }
    }

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.token) {
          // Try to refresh token
          try {
            await this.refreshToken();
            // Retry the original request
            return this.client.request(error.config);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.logout();
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(error);
      }
    );
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

  // Client methods
  async getClients(params?: {
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<{ clients: Client[]; total: number; page: number; per_page: number }> {
    const response = await this.client.get("/api/clients", { params });
    return response.data;
  }

  async getClient(id: number): Promise<Client> {
    const response = await this.client.get<Client>(`/api/clients/${id}`);
    return response.data;
  }

  async createClient(clientData: Omit<Client, "id" | "created_at" | "updated_at" | "full_name" | "display_name">): Promise<Client> {
    const response = await this.client.post<Client>("/api/clients", clientData);
    return response.data;
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    const response = await this.client.put<Client>(`/api/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: number): Promise<void> {
    await this.client.delete(`/api/clients/${id}`);
  }

  // AI methods
  async analyzeContract(contractText: string): Promise<any> {
    const response = await this.client.post("/api/ai/analyze-contract", {
      contract_text: contractText,
    });
    return response.data;
  }

  async generateDocument(templateType: string, parameters: Record<string, any>): Promise<string> {
    const response = await this.client.post("/api/ai/generate-document", {
      template_type: templateType,
      parameters,
    });
    return response.data.generated_document;
  }

  async getDocumentTemplates(): Promise<any[]> {
    const response = await this.client.get("/api/ai/templates");
    return response.data.templates;
  }

  async performLegalResearch(query: string): Promise<string> {
    const response = await this.client.post("/api/ai/legal-research", {
      query,
    });
    return response.data.research_results;
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