import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/api/client';
import { LoginRequest, RegisterRequest, User } from '@/types/auth'; // We'll create these types next

interface AuthState {
    user: User | null;
    token: String | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (data: LoginRequest) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', data);
                    const { accessToken, id, name, email, role } = response.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('shopease_token', accessToken);
                    }

                    set({
                        user: { id, name, email, role },
                        token: accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            register: async (data: RegisterRequest) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/register', data);
                    const { accessToken, id, name, email, role } = response.data;

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('shopease_token', accessToken);
                    }

                    set({
                        user: { id, name, email, role },
                        token: accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('shopease_token');
                }
                set({ user: null, token: null, isAuthenticated: false });
                // Optional: Call backend logout if needed
                api.post('/auth/logout').catch(console.error);
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            // We only persist user info and token to local storage
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
