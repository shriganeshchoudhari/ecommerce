'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Star, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function WishlistPage() {
    const { items, isLoading, fetchWishlist, removeFromWishlist } = useWishlistStore();
    const { addItem } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }
        fetchWishlist();
    }, [isAuthenticated]);

    const handleAddToCart = async (productId: number, productName: string) => {
        try {
            await addItem(productId, 1);
            toast.success(`${productName} added to cart!`);
        } catch {
            toast.error('Failed to add to cart');
        }
    };

    const handleRemove = async (productId: number, productName: string) => {
        try {
            await removeFromWishlist(productId);
            toast.success(`${productName} removed from wishlist`);
        } catch {
            toast.error('Failed to remove item');
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground mt-4">Loading wishlist...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
                <Heart className="h-7 w-7 text-primary fill-primary" />
                <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
                <span className="ml-auto text-muted-foreground text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/30">
                    <Heart className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                    <p className="text-muted-foreground mb-6">Save items you love to your wishlist.</p>
                    <Button asChild>
                        <Link href="/products">Browse Products</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => {
                        const product = item.product;
                        const image = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                        const displayPrice = product.salePrice ?? product.price;
                        const isSale = product.salePrice && product.salePrice < product.price;
                        const inStock = product.stockQuantity > 0;

                        return (
                            <div key={item.id} className="group bg-card rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                                <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden bg-muted">
                                    <img
                                        src={image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </Link>
                                <div className="p-4">
                                    <Link href={`/products/${product.id}`}>
                                        <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors mb-1">{product.name}</h3>
                                    </Link>

                                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                        <span className="text-xs font-medium text-foreground">{product.averageRating?.toFixed(1) ?? '—'}</span>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-lg font-bold">₹{displayPrice.toLocaleString()}</span>
                                        {isSale && (
                                            <span className="text-sm text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
                                        )}
                                    </div>

                                    {!inStock && (
                                        <div className="flex items-center gap-1 text-destructive text-xs mb-3">
                                            <Package className="h-3 w-3" />
                                            <span>Out of Stock</span>
                                        </div>
                                    )}

                                    <Separator className="mb-3" />

                                    <div className="flex gap-2">
                                        <Button
                                            className="flex-1"
                                            size="sm"
                                            onClick={() => handleAddToCart(product.id, product.name)}
                                            disabled={!inStock}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                            {inStock ? 'Add to Cart' : 'Unavailable'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleRemove(product.id, product.name)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
