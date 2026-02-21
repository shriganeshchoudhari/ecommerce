'use client';

import { useAuthStore } from '@/store/authStore';
import { useAdminStats, useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Users, Package, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner';

export default function AdminDashboardPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (mounted && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.replace('/');
        }
    }, [user, isAuthenticated, mounted, router]);

    const { data: stats, isLoading: loadingStats } = useAdminStats();
    const { data: ordersData, isLoading: loadingOrders } = useAdminOrders(0, 50);
    const { mutateAsync: updateStatus, isPending: updatingStatus } = useUpdateOrderStatus();

    if (!mounted || !isAuthenticated || user?.role !== 'ADMIN') return null;

    const handleStatusUpdate = async (orderId: number, status: string) => {
        try {
            await updateStatus({ orderId, status });
            toast.success('Order status updated');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const orders = ordersData?.content || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of store performance and management.</p>
                </div>

                {/* Stats Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : `₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Orders</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : `+${stats?.totalOrders || 0}`}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : `+${stats?.totalUsers || 0}`}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">Online</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Management Tabs */}
                <Tabs defaultValue="orders" className="w-full mt-6">
                    <TabsList className="mb-4">
                        <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                                <CardDescription>Manage and update order statuses.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingOrders ? (
                                    <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 rounded-tl-md">Order ID</th>
                                                    <th className="px-4 py-3">Date</th>
                                                    <th className="px-4 py-3">Customer</th>
                                                    <th className="px-4 py-3">Total</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3 rounded-tr-md text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                                                        <td className="px-4 py-3 font-medium">#{order.orderNumber || order.id}</td>
                                                        <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-4 py-3">{order.shippingAddress?.streetName.substring(0, 15)}...</td>
                                                        <td className="px-4 py-3 font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={order.status === 'DELIVERED' ? 'default' : order.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                                                                {order.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Select
                                                                defaultValue={order.status}
                                                                onValueChange={(val) => handleStatusUpdate(order.id, val)}
                                                                disabled={updatingStatus || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                                                            >
                                                                <SelectTrigger className="h-8 w-[130px] ml-auto">
                                                                    <SelectValue placeholder="Status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="PENDING">PENDING</SelectItem>
                                                                    <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                                                    <SelectItem value="SHIPPED">SHIPPED</SelectItem>
                                                                    <SelectItem value="DELIVERED">DELIVERED</SelectItem>
                                                                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="products">
                        <Card>
                            <CardHeader>
                                <CardTitle>Products Management</CardTitle>
                                <CardDescription>Product inventory will be shown here (Mockup view for now).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/20">
                                    Product CRUD interface via Admin API
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
