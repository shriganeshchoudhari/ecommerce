'use client';

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, isLoading, updateItemQuantity, removeItem, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-md">
                <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                    <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                <p className="text-muted-foreground mb-8">Please log in to view and manage your shopping cart.</p>
                <div className="flex flex-col gap-4">
                    <Button asChild size="lg">
                        <Link href="/login">Log In to View Cart</Link>
                    </Button>
                    <Button variant="outline" asChild size="lg">
                        <Link href="/products">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const items = cart?.items || [];
    const cartTotal = items.reduce((total, item) => total + item.subtotal, 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

            {items.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h2 className="text-xl font-medium mb-2">No items in your cart</h2>
                    <p className="text-muted-foreground mb-6">Add some products to see them here.</p>
                    <Button asChild>
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="bg-card border rounded-xl overflow-hidden">
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-3 text-center">Quantity</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-1 text-right"></div>
                            </div>

                            <ul className="divide-y">
                                {items.map((item) => {
                                    const product = item.product;
                                    const primaryImage = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';

                                    return (
                                        <li key={item.id} className="p-4 sm:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                                            <div className="col-span-6 flex items-center gap-4 w-full">
                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                                                    <img src={primaryImage} alt={product.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <Link href={`/products/${product.id}`} className="font-medium hover:text-primary line-clamp-2">
                                                        {product.name}
                                                    </Link>
                                                    <p className="text-sm text-muted-foreground mt-1">₹{(product.salePrice || product.price).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="col-span-3 flex justify-center w-full mt-4 md:mt-0">
                                                <div className="flex items-center border rounded-md">
                                                    <button
                                                        className="p-2 hover:bg-muted"
                                                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || isLoading}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        className="p-2 hover:bg-muted"
                                                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= product.stockQuantity || isLoading}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="col-span-2 w-full text-right font-medium hidden md:block">
                                                ₹{item.subtotal.toLocaleString()}
                                            </div>

                                            <div className="col-span-1 w-full text-right mt-2 md:mt-0 flex justify-between md:block">
                                                <span className="font-medium md:hidden">₹{item.subtotal.toLocaleString()}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="p-4 bg-muted/30 border-t flex justify-between items-center">
                                <Button variant="ghost" className="text-muted-foreground" onClick={clearCart} disabled={isLoading}>
                                    Clear Cart
                                </Button>
                                <Link href="/products" className="text-sm font-medium hover:text-primary">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-card border rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                                    <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping Estimate</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax Estimate (18% GST)</span>
                                    <span className="font-medium">₹{Math.round(cartTotal * 0.18).toLocaleString()}</span>
                                </div>

                                <Separator className="my-4" />

                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Order Total</span>
                                    <span>₹{Math.round(cartTotal * 1.18).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <Button className="w-full" size="lg" asChild>
                                    <Link href="/checkout">
                                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Secure checkout powered by Razorpay.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
