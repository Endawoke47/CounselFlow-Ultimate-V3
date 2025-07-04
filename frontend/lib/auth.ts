import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, User, AuthTokens } from "./api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Client-side validation
          if (!email || !password) {
            throw new Error("Email and password are required");
          }
          
          if (!email.includes('@') || email.length < 5) {
            throw new Error("Please enter a valid email address");
          }
          
          if (password.length < 3) {
            throw new Error("Password is too short");
          }
          
          const tokens = await apiClient.login(email.trim().toLowerCase(), password);
          set({
            user: tokens.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || error.message || "Login failed. Please try again.";
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw new Error(errorMessage);
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Client-side validation
          if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
            throw new Error("All required fields must be filled");
          }
          
          if (!userData.email.includes('@') || userData.email.length < 5) {
            throw new Error("Please enter a valid email address");
          }
          
          if (userData.password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
          }
          
          if (userData.password !== userData.confirm_password) {
            throw new Error("Passwords do not match");
          }
          
          if (userData.first_name.trim().length < 2 || userData.last_name.trim().length < 2) {
            throw new Error("First name and last name must be at least 2 characters long");
          }
          
          // Clean up user data
          const cleanUserData = {
            ...userData,
            email: userData.email.trim().toLowerCase(),
            first_name: userData.first_name.trim(),
            last_name: userData.last_name.trim(),
          };
          
          await apiClient.register(cleanUserData);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || error.message || "Registration failed. Please try again.";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiClient.logout();
        } catch (error) {
          // Ignore errors during logout
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshUser: async () => {
        if (!apiClient.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const user = await apiClient.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Check if user is still valid on rehydration
        if (state?.isAuthenticated && apiClient.isAuthenticated()) {
          state.refreshUser();
        } else {
          state?.logout();
        }
      },
    }
  )
);

// Auth guard hook
export function useAuthGuard(requiredRoles?: string[]) {
  const { user, isAuthenticated } = useAuth();

  const hasRequiredRole = () => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return {
    isAuthenticated,
    hasAccess: isAuthenticated && hasRequiredRole(),
    user,
  };
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasAccess, user } = useAuthGuard(requiredRoles);

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    if (!hasAccess) {
      return <div>You don't have permission to access this page.</div>;
    }

    return <Component {...props} />;
  };
}