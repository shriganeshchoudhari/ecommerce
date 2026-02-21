import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Address, Order, PaymentInitiateResponse } from '@/types/checkout';
import { PaginatedResponse } from '@/types/product';

export const useAddresses = () => {
    return useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const { data } = await api.get<Address[]>('/users/me/addresses');
            return data;
        },
    });
};

export const useCreateAddress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (address: Omit<Address, 'id'>) => {
            const { data } = await api.post<Address>('/users/me/addresses', address);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
        },
    });
};

export const usePlaceOrder = () => {
    return useMutation({
        mutationFn: async ({ addressId, notes }: { addressId: number; notes?: string }) => {
            const { data } = await api.post<Order>('/orders', { addressId, notes });
            return data;
        },
    });
};

export const useInitiatePayment = () => {
    return useMutation({
        mutationFn: async (orderId: number) => {
            const { data } = await api.post<PaymentInitiateResponse>('/payments/initiate', { orderId });
            return data;
        },
    });
};

export const useVerifyPayment = () => {
    return useMutation({
        mutationFn: async (payload: { orderId: number; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) => {
            const { data } = await api.post('/payments/verify', payload);
            return data;
        },
    });
};

export const useOrders = (page = 0, size = 10) => {
    return useQuery({
        queryKey: ['orders', page, size],
        queryFn: async () => {
            const { data } = await api.get<PaginatedResponse<Order>>('/orders', {
                params: { page, size }
            });
            return data;
        },
    });
};
