import { create } from 'zustand';
import { api } from '@/api/client';
import { Cart } from '@/types/cart';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;

    fetchCart: () => Promise<void>;
    addItem: (productId: number, quantity?: number) => Promise<void>;
    updateItemQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    applyCoupon: (code: string) => Promise<void>;
    removeCoupon: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isLoading: false,
    error: null,

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<Cart>('/cart');
            set({ cart: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch cart', isLoading: false });
        }
    },

    addItem: async (productId: number, quantity: number = 1) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post<Cart>('/cart/items', { productId, quantity });
            set({ cart: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to add item', isLoading: false });
            throw error;
        }
    },

    updateItemQuantity: async (itemId: number, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
            set({ cart: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to update quantity', isLoading: false });
            throw error;
        }
    },

    removeItem: async (itemId: number) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.delete<Cart>(`/cart/items/${itemId}`);
            set({ cart: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to remove item', isLoading: false });
            throw error;
        }
    },

    clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.delete<Cart>('/cart');
            set({ cart: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to clear cart', isLoading: false });
            throw error;
        }
    },

    applyCoupon: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post<Cart>('/cart/coupon', { code });
            set({ cart: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to apply coupon', isLoading: false });
            throw error;
        }
    },

    removeCoupon: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.delete<Cart>('/cart/coupon');
            set({ cart: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to remove coupon', isLoading: false });
            throw error;
        }
    }
}));
