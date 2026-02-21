import { create } from 'zustand';
import { api } from '@/api/client';

export interface WishlistProduct {
    id: number;
    name: string;
    price: number;
    salePrice?: number;
    images: { imageUrl: string; isPrimary: boolean }[];
    stockQuantity: number;
    averageRating: number;
}

export interface WishlistItem {
    id: number;
    product: WishlistProduct;
    addedAt: string;
}

interface WishlistState {
    items: WishlistItem[];
    isLoading: boolean;
    fetchWishlist: () => Promise<void>;
    addToWishlist: (productId: number) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    isWishlisted: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    isLoading: false,

    fetchWishlist: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get<WishlistItem[]>('/wishlist');
            set({ items: response.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    addToWishlist: async (productId: number) => {
        try {
            const response = await api.post<WishlistItem>('/wishlist', { productId });
            set(state => ({ items: [...state.items, response.data] }));
        } catch (error: any) {
            throw error;
        }
    },

    removeFromWishlist: async (productId: number) => {
        try {
            await api.delete(`/wishlist/${productId}`);
            set(state => ({ items: state.items.filter(i => i.product.id !== productId) }));
        } catch (error: any) {
            throw error;
        }
    },

    isWishlisted: (productId: number) => {
        return get().items.some(i => i.product.id === productId);
    },
}));
