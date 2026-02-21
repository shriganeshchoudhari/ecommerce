import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Order } from '@/types/checkout';
import { PaginatedResponse } from '@/types/product';

export interface DashboardStats {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
}

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const { data } = await api.get<DashboardStats>('/admin/dashboard/stats');
            return data;
        },
    });
};

export const useAdminOrders = (page = 0, size = 10) => {
    return useQuery({
        queryKey: ['admin', 'orders', page, size],
        queryFn: async () => {
            const { data } = await api.get<PaginatedResponse<Order>>('/admin/orders', {
                params: { page, size }
            });
            return data;
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
            const { data } = await api.put<Order>(`/admin/orders/${orderId}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        },
    });
};
