import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Product, Category, PaginatedResponse } from '@/types/product';

// Categories
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get<Category[]>('/categories');
            return data;
        },
    });
};

export const useCategoryBySlug = (slug: string) => {
    return useQuery({
        queryKey: ['categories', slug],
        queryFn: async () => {
            const { data } = await api.get<Category>(`/categories/${slug}`);
            return data;
        },
        enabled: !!slug,
    });
};

// Products
interface ProductFilters {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export const useProducts = (filters: ProductFilters = {}) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: async () => {
            const { data } = await api.get<PaginatedResponse<Product>>('/products', {
                params: filters,
            });
            return data;
        },
    });
};

export const useProduct = (id: number) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await api.get<Product>(`/products/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
