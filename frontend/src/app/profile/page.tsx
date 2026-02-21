'use client';

import { useAuthStore } from '@/store/authStore';
import { useOrders, useAddresses } from '@/hooks/useCheckout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Package, MapPin, User, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isAuthenticated, logout } = useAuthStore();
    const router = useRouter();

    const { data: ordersData, isLoading: loadingOrders } = useOrders(0, 50);
    const { data: addresses, isLoading: loadingAddresses } = useAddresses();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (mounted && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, mounted, router]);

    if (!mounted || !isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const orders = ordersData?.content || [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
                    <Card>
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                <User className="h-10 w-10" />
                            </div>
                            <h2 className="font-bold text-xl">{user?.name}</h2>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                            <Badge variant="secondary" className="mt-2">{user?.role}</Badge>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-2">
                        <Button variant="ghost" className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    <h1 className="text-3xl font-bold tracking-tight mb-6">My Account</h1>

                    <Tabs defaultValue="orders" className="w-full">
                        <TabsList className="mb-6 grid w-full grid-cols-2 lg:w-[400px]">
                            <TabsTrigger value="orders">Orders</TabsTrigger>
                            <TabsTrigger value="addresses">Addresses</TabsTrigger>
                        </TabsList>

                        <TabsContent value="orders" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" /> Order History
                                    </CardTitle>
                                    <CardDescription>View and track your recent orders.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loadingOrders ? (
                                        <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
                                    ) : orders.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                            <p>You haven't placed any orders yet.</p>
                                            <Button variant="link" asChild className="mt-2">
                                                <Link href="/products">Start Shopping</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {orders.map((order) => (
                                                <div key={order.id} className="border rounded-xl p-4 sm:p-6 flex flex-col gap-4">
                                                    <div className="flex flex-col sm:flex-row justify-between gap-2 border-b pb-4">
                                                        <div>
                                                            <p className="font-semibold text-lg">Order #{order.orderNumber || order.id}</p>
                                                            <p className="text-sm text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <p className="font-bold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                                                            <Badge variant={order.status === 'DELIVERED' ? 'default' : order.status === 'CANCELLED' ? 'destructive' : 'secondary'} className="mt-1">
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {order.items?.map((item: any, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                                <div className="flex gap-2 items-center">
                                                                    <span className="text-muted-foreground">{item.quantity}x</span>
                                                                    <span className="font-medium line-clamp-1">{item.productName || 'Product'}</span>
                                                                </div>
                                                                <span className="text-muted-foreground">₹{item.price.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="addresses" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" /> Saved Addresses
                                    </CardTitle>
                                    <CardDescription>Manage your delivery addresses.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {loadingAddresses ? (
                                        <div className="py-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
                                    ) : addresses?.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground">
                                            <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                            <p>You haven't saved any addresses.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {addresses?.map((address) => (
                                                <div key={address.id} className="border rounded-xl p-4 flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold">{user?.name}</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {address.streetName}<br />
                                                        {address.city}, {address.state} {address.zipCode}<br />
                                                        {address.country}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
