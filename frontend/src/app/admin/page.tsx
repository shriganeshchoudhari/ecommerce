'use client';

import { useAuthStore } from '@/store/authStore';
import { useAdminStats, useAdminOrders, useUpdateOrderStatus } from '@/hooks/useAdmin';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Users, Package, DollarSign, Activity, Tag, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        } catch {
            toast.error('Failed to update status');
        }
    };

    const orders = ordersData?.content || [];

    // --- Coupons ---
    const queryClient = useQueryClient();
    const { data: coupons = [], isLoading: loadingCoupons } = useQuery<any[]>({
        queryKey: ['admin-coupons'],
        queryFn: () => api.get('/admin/coupons').then(r => r.data),
    });
    const { mutateAsync: deleteCoupon } = useMutation({
        mutationFn: (id: number) => api.delete(`/admin/coupons/${id}`),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon deleted'); },
    });
    const { mutateAsync: createCoupon, isPending: creatingCoupon } = useMutation({
        mutationFn: (data: any) => api.post('/admin/coupons', data).then(r => r.data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-coupons'] }); toast.success('Coupon created!'); },
    });
    const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', validFrom: '', validUntil: '' });

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCoupon({ ...newCoupon, discountValue: parseFloat(newCoupon.discountValue), minOrderAmount: newCoupon.minOrderAmount ? parseFloat(newCoupon.minOrderAmount) : null, validFrom: new Date(newCoupon.validFrom).toISOString(), validUntil: new Date(newCoupon.validUntil).toISOString() });
            setNewCoupon({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', validFrom: '', validUntil: '' });
        } catch { toast.error('Failed to create coupon'); }
    };

    // --- Users ---
    const { data: adminUsers = [], isLoading: loadingUsers } = useQuery<any[]>({
        queryKey: ['admin-users'],
        queryFn: () => api.get('/admin/users').then(r => r.data),
    });

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
                    <TabsList className="mb-4 flex flex-wrap gap-1">
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="coupons">Coupons</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
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

                    {/* Coupons Tab */}
                    <TabsContent value="coupons">
                        <div className="grid lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Tag className="h-4 w-4" /> Active Coupons</CardTitle></CardHeader>
                                <CardContent>
                                    {loadingCoupons ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                        <div className="space-y-3">
                                            {coupons.map((c: any) => (
                                                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-mono font-bold text-primary">{c.code}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                                                            {c.minOrderAmount ? ` (min ₹${c.minOrderAmount})` : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={c.active ? 'default' : 'secondary'}>{c.active ? 'Active' : 'Inactive'}</Badge>
                                                        <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => deleteCoupon(c.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {coupons.length === 0 && <p className="text-muted-foreground text-sm">No coupons yet.</p>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-4 w-4" /> New Coupon</CardTitle></CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateCoupon} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label>Code</Label>
                                                <Input placeholder="WELCOME20" value={newCoupon.code} onChange={e => setNewCoupon(s => ({ ...s, code: e.target.value.toUpperCase() }))} required />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Type</Label>
                                                <Select value={newCoupon.discountType} onValueChange={v => setNewCoupon(s => ({ ...s, discountType: v }))}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                                                        <SelectItem value="FIXED">Fixed ₹</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label>Discount Value</Label>
                                                <Input type="number" placeholder="20" value={newCoupon.discountValue} onChange={e => setNewCoupon(s => ({ ...s, discountValue: e.target.value }))} required />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Min Order (₹)</Label>
                                                <Input type="number" placeholder="500" value={newCoupon.minOrderAmount} onChange={e => setNewCoupon(s => ({ ...s, minOrderAmount: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <Label>Valid From</Label>
                                                <Input type="datetime-local" value={newCoupon.validFrom} onChange={e => setNewCoupon(s => ({ ...s, validFrom: e.target.value }))} required />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Valid Until</Label>
                                                <Input type="datetime-local" value={newCoupon.validUntil} onChange={e => setNewCoupon(s => ({ ...s, validUntil: e.target.value }))} required />
                                            </div>
                                        </div>
                                        <Button type="submit" className="w-full" disabled={creatingCoupon}>
                                            {creatingCoupon && <Loader2 className="animate-spin mr-2 h-4 w-4" />} Create Coupon
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> User Management</CardTitle>
                                <CardDescription>All registered users and their roles.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingUsers ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3">ID</th>
                                                    <th className="px-4 py-3">Name</th>
                                                    <th className="px-4 py-3">Email</th>
                                                    <th className="px-4 py-3">Role</th>
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {adminUsers.map((u: any) => (
                                                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                                                        <td className="px-4 py-3 text-muted-foreground">#{u.id}</td>
                                                        <td className="px-4 py-3 font-medium">{u.name}</td>
                                                        <td className="px-4 py-3">{u.email}</td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={u.enabled ? 'outline' : 'destructive'}>{u.enabled ? 'Active' : 'Disabled'}</Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
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
