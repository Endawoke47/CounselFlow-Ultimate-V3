/**
 * CounselFlow Ultimate V3 - React Query API Hooks
 * Centralized data fetching with optimized caching and error handling
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getApiIntegration, 
  queryKeys,
  User,
  Client,
  ClientCreateRequest,
  Contract,
  ContractCreateRequest,
  Matter,
  MatterCreateRequest,
  BaseQueryParams,
  PaginatedResponse
} from './api-integration';

// =============================================================================
// AUTHENTICATION HOOKS
// =============================================================================

export function useCurrentUser(options?: UseQueryOptions<User, Error>) {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => getApiIntegration().getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      getApiIntegration().login({ email, password }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.currentUser, data);
      toast.success('Login successful');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (userData: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role?: string;
      tenant_id?: string;
    }) => getApiIntegration().register(userData),
    onSuccess: () => {
      toast.success('Registration successful! Please log in.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => getApiIntegration().logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      // Still clear cache even if server logout fails
      queryClient.clear();
    },
  });
}

// =============================================================================
// CLIENT HOOKS
// =============================================================================

export function useClients(
  params?: BaseQueryParams & {
    status?: string;
    risk_level?: string;
    industry?: string;
  },
  options?: UseQueryOptions<PaginatedResponse<Client>, Error>
) {
  return useQuery({
    queryKey: queryKeys.clients(params),
    queryFn: () => getApiIntegration().getClients(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

export function useClient(id: string, options?: UseQueryOptions<Client, Error>) {
  return useQuery({
    queryKey: queryKeys.client(id),
    queryFn: () => getApiIntegration().getClient(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCreateClient(options?: UseMutationOptions<Client, Error, ClientCreateRequest>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClientCreateRequest) => getApiIntegration().createClient(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(`Client "${newClient.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create client');
    },
    ...options,
  });
}

export function useUpdateClient(options?: UseMutationOptions<Client, Error, { id: string; data: Partial<ClientCreateRequest> }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => getApiIntegration().updateClient(id, data),
    onSuccess: (updatedClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.setQueryData(queryKeys.client(updatedClient.id), updatedClient);
      toast.success(`Client "${updatedClient.name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update client');
    },
    ...options,
  });
}

export function useDeleteClient(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getApiIntegration().deleteClient(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.removeQueries({ queryKey: ['client', deletedId] });
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete client');
    },
    ...options,
  });
}

// =============================================================================
// CONTRACT HOOKS
// =============================================================================

export function useContracts(
  params?: BaseQueryParams & {
    client_id?: string;
    status?: string;
    type?: string;
  },
  options?: UseQueryOptions<PaginatedResponse<Contract>, Error>
) {
  return useQuery({
    queryKey: queryKeys.contracts(params),
    queryFn: () => getApiIntegration().getContracts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

export function useContract(id: string, options?: UseQueryOptions<Contract, Error>) {
  return useQuery({
    queryKey: queryKeys.contract(id),
    queryFn: () => getApiIntegration().getContract(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCreateContract(options?: UseMutationOptions<Contract, Error, ContractCreateRequest>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ContractCreateRequest) => getApiIntegration().createContract(data),
    onSuccess: (newContract) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success(`Contract "${newContract.title}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create contract');
    },
    ...options,
  });
}

export function useUpdateContract(options?: UseMutationOptions<Contract, Error, { id: string; data: Partial<ContractCreateRequest> }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => getApiIntegration().updateContract(id, data),
    onSuccess: (updatedContract) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.setQueryData(queryKeys.contract(updatedContract.id), updatedContract);
      toast.success(`Contract "${updatedContract.title}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update contract');
    },
    ...options,
  });
}

export function useDeleteContract(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getApiIntegration().deleteContract(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.removeQueries({ queryKey: ['contract', deletedId] });
      toast.success('Contract deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete contract');
    },
    ...options,
  });
}

// =============================================================================
// MATTER HOOKS
// =============================================================================

export function useMatters(
  params?: BaseQueryParams & {
    client_id?: string;
    status?: string;
    type?: string;
    assigned_to?: string;
  },
  options?: UseQueryOptions<PaginatedResponse<Matter>, Error>
) {
  return useQuery({
    queryKey: queryKeys.matters(params),
    queryFn: () => getApiIntegration().getMatters(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

export function useMatter(id: string, options?: UseQueryOptions<Matter, Error>) {
  return useQuery({
    queryKey: queryKeys.matter(id),
    queryFn: () => getApiIntegration().getMatter(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useCreateMatter(options?: UseMutationOptions<Matter, Error, MatterCreateRequest>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: MatterCreateRequest) => getApiIntegration().createMatter(data),
    onSuccess: (newMatter) => {
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      toast.success(`Matter "${newMatter.title}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create matter');
    },
    ...options,
  });
}

export function useUpdateMatter(options?: UseMutationOptions<Matter, Error, { id: string; data: Partial<MatterCreateRequest> }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => getApiIntegration().updateMatter(id, data),
    onSuccess: (updatedMatter) => {
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      queryClient.setQueryData(queryKeys.matter(updatedMatter.id), updatedMatter);
      toast.success(`Matter "${updatedMatter.title}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update matter');
    },
    ...options,
  });
}

export function useDeleteMatter(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => getApiIntegration().deleteMatter(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      queryClient.removeQueries({ queryKey: ['matter', deletedId] });
      toast.success('Matter deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete matter');
    },
    ...options,
  });
}

// =============================================================================
// AI SERVICE HOOKS
// =============================================================================

export function useContractAnalysis() {
  return useMutation({
    mutationFn: (data: {
      contract_text: string;
      analysis_type?: string;
      use_consensus?: boolean;
    }) => getApiIntegration().analyzeContract(data),
    onSuccess: () => {
      toast.success('Contract analysis completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Contract analysis failed');
    },
  });
}

export function useDocumentGeneration() {
  return useMutation({
    mutationFn: (data: {
      document_type: string;
      template_data: Record<string, any>;
      use_consensus?: boolean;
    }) => getApiIntegration().generateDocument(data),
    onSuccess: () => {
      toast.success('Document generated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Document generation failed');
    },
  });
}

export function useLegalResearch() {
  return useMutation({
    mutationFn: (data: {
      query: string;
      jurisdiction?: string;
      practice_area?: string;
    }) => getApiIntegration().performLegalResearch(data),
    onSuccess: () => {
      toast.success('Legal research completed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Legal research failed');
    },
  });
}

// =============================================================================
// DASHBOARD HOOKS
// =============================================================================

export function useDashboardOverview(options?: UseQueryOptions<any, Error>) {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => getApiIntegration().getDashboardOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    ...options,
  });
}

export function useClientMetrics(
  days: number = 30,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: ['dashboard', 'client-metrics', days],
    queryFn: () => getApiIntegration().getClientMetrics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: days > 0,
    ...options,
  });
}

export function useContractMetrics(
  days: number = 30,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: ['dashboard', 'contract-metrics', days],
    queryFn: () => getApiIntegration().getContractMetrics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: days > 0,
    ...options,
  });
}

export function useMatterMetrics(
  days: number = 30,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: ['dashboard', 'matter-metrics', days],
    queryFn: () => getApiIntegration().getMatterMetrics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: days > 0,
    ...options,
  });
}

export function useAIMetrics(
  days: number = 30,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: ['dashboard', 'ai-metrics', days],
    queryFn: () => getApiIntegration().getAIMetrics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: days > 0,
    ...options,
  });
}

export function useCompleteDashboardData(
  days: number = 30,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: ['dashboard', 'complete-data', days],
    queryFn: () => getApiIntegration().getCompleteDashboardData(days),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    enabled: days > 0,
    ...options,
  });
}

export function useDashboardAlerts(options?: UseQueryOptions<any, Error>) {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => getApiIntegration().getDashboardAlerts(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    ...options,
  });
}

export function useRecentActivity(
  limit: number = 10,
  options?: UseQueryOptions<any, Error>
) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', limit],
    queryFn: () => getApiIntegration().getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    enabled: limit > 0,
    ...options,
  });
}

// =============================================================================
// SYSTEM HOOKS
// =============================================================================

export function useHealthCheck(options?: UseQueryOptions<any, Error>) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => getApiIntegration().healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 1,
    ...options,
  });
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export function useClearCache() {
  const queryClient = useQueryClient();
  
  return () => {
    getApiIntegration().clearCache();
    queryClient.clear();
    toast.success('Cache cleared successfully');
  };
}

// Optimistic updates helper
export function useOptimisticUpdate<T>(
  queryKey: any[],
  updateFn: (oldData: T, newData: Partial<T>) => T
) {
  const queryClient = useQueryClient();
  
  return (newData: Partial<T>) => {
    queryClient.setQueryData(queryKey, (oldData: T) => {
      if (!oldData) return oldData;
      return updateFn(oldData, newData);
    });
  };
}

// Bulk operations helper
export function useBulkOperation<T, R>(
  operationFn: (items: T[]) => Promise<R[]>,
  options?: {
    onSuccess?: (results: R[]) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: operationFn,
    onSuccess: (results) => {
      // Invalidate specified queries
      options?.invalidateQueries?.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
      
      options?.onSuccess?.(results);
      toast.success(`Bulk operation completed successfully (${results.length} items)`);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
      toast.error(error.message || 'Bulk operation failed');
    },
  });
}

// Export all hooks as default
export default {
  // Auth
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  
  // Clients
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  
  // Contracts
  useContracts,
  useContract,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
  
  // Matters
  useMatters,
  useMatter,
  useCreateMatter,
  useUpdateMatter,
  useDeleteMatter,
  
  // AI Services
  useContractAnalysis,
  useDocumentGeneration,
  useLegalResearch,
  
  // Dashboard
  useDashboardOverview,
  useClientMetrics,
  useContractMetrics,
  useMatterMetrics,
  useAIMetrics,
  useCompleteDashboardData,
  useDashboardAlerts,
  useRecentActivity,
  
  // System
  useHealthCheck,
  useClearCache,
  
  // Utilities
  useOptimisticUpdate,
  useBulkOperation,
};