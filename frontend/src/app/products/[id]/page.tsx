'use client';

import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShoppingCart, Star, HelpCircle, Truck, ArrowLeft, Plus, Minus, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useState, use, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import Link from 'next/link';

interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: { name: string };
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const productId = parseInt(id);
    const { data: product, isLoading, error } = useProduct(productId);
    const { addItem, isLoading: isAddingToCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();
    const { fetchWishlist, addToWishlist, removeFromWishlist, isWishlisted } = useWishlistStore();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const queryClient = useQueryClient();

    interface Variant {
        id: number; size: string | null; color: string | null; skuSuffix: string | null;
        stockQuantity: number; priceOverride: number | null; active: boolean;
    }

    const { data: variants = [] } = useQuery<Variant[]>({
        queryKey: ['variants', productId],
        queryFn: () => api.get(`/products/${productId}/variants`).then(r => r.data),
        enabled: !!productId,
    });

    interface RecommendedProduct {
        id: number; name: string; price: number; salePrice?: number;
        images: { imageUrl: string; isPrimary: boolean }[];
        averageRating: number;
    }

    const { data: recommendations = [] } = useQuery<RecommendedProduct[]>({
        queryKey: ['recommendations', productId],
        queryFn: () => api.get(`/products/${productId}/recommendations`).then(r => r.data),
        enabled: !!productId,
    });

    const sizes = [...new Set(variants.filter(v => v.size).map(v => v.size!))];
    const colors = [...new Set(variants.filter(v => v.color).map(v => v.color!))];

    const selectedVariant = variants.find(v =>
        (!selectedSize || v.size === selectedSize) && (!selectedColor || v.color === selectedColor)
    );
    const variantPrice = selectedVariant?.priceOverride ?? null;

    useEffect(() => { if (isAuthenticated) fetchWishlist(); }, [isAuthenticated]);

    const wishlisted = product ? isWishlisted(product.id) : false;

    const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
        queryKey: ['reviews', productId],
        queryFn: () => api.get(`/reviews/product/${productId}`).then(r => r.data),
    });

    const { mutateAsync: submitReview, isPending: submittingReview } = useMutation({
        mutationFn: (data: { productId: number; rating: number; comment: string }) =>
            api.post('/reviews', data).then(r => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            toast.success('Review submitted!');
            setReviewComment(''); setReviewRating(5);
        },
        onError: () => toast.error('Could not submit review. Have you purchased this product?'),
    });

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) { toast.error('Please login to save to wishlist'); return; }
        try {
            if (wishlisted) { await removeFromWishlist(product!.id); toast.success('Removed from wishlist'); }
            else { await addToWishlist(product!.id); toast.success('Saved to wishlist!'); }
        } catch { toast.error('Something went wrong'); }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                <p className="text-muted-foreground mb-6">The product you are looking for does not exist or has been removed. Error detail: {error ? error.message : 'No product data'}</p>
                <Button asChild>
                    <Link href="/products">Browse All Products</Link>
                </Button>
            </div>
        );
    }

    const handleAddToCart = async () => {
        try {
            await addItem(product.id, quantity);
            toast.success(`${quantity} ${product.name} added to cart!`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Please log in to add items to cart');
        }
    };

    const images = product.images?.length > 0
        ? product.images.map(img => img.imageUrl)
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'];

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Images */}
                <div className="space-y-4">
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted border">
                        <img
                            src={images[activeImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`aspect-square rounded-md overflow-hidden border-2 ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                                >
                                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-primary font-medium">{product.category?.name}</span>
                            <span className="text-muted-foreground text-sm">• SKU: {product.sku}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-5 w-5 fill-current" />
                                <span className="font-medium text-foreground ml-1">{product.averageRating || 'New'}</span>
                            </div>
                            <span className="text-muted-foreground text-sm">({product.reviewCount || 0} reviews)</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {product.salePrice ? (
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold">₹{product.salePrice.toLocaleString()}</span>
                                <span className="text-xl text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
                                <span className="text-sm font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                                </span>
                            </div>
                        ) : (
                            <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                        )}
                        <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
                    </div>

                    <div className="prose prose-sm dark:prose-invert">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {product.description}
                        </p>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                        {/* Variant Selectors */}
                        {sizes.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm">Size: <span className="text-primary">{selectedSize ?? '—'}</span></h3>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                                            className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'
                                                }`}
                                        >{size}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {colors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm">Color: <span className="text-primary">{selectedColor ?? '—'}</span></h3>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                                            className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${selectedColor === color ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary'
                                                }`}
                                        >{color}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {variantPrice && (
                            <p className="text-sm text-muted-foreground">Variant price: <strong className="text-foreground">₹{variantPrice.toLocaleString()}</strong></p>
                        )}
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Quantity</h3>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline" size="icon" className="h-8 w-8 rounded-full"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <Button
                                    variant="outline" size="icon" className="h-8 w-8 rounded-full"
                                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                    disabled={quantity >= product.stockQuantity}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm text-green-600 font-medium">
                            {product.stockQuantity > 0 ? `${product.stockQuantity} items in stock` : 'Out of Stock'}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                size="lg"
                                className="flex-1"
                                onClick={handleAddToCart}
                                disabled={product.stockQuantity === 0 || isAddingToCart}
                            >
                                {isAddingToCart ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                                Add to Cart
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={handleWishlistToggle}
                                className={wishlisted ? 'border-pink-400 text-pink-500' : ''}
                            >
                                <Heart className={`h-5 w-5 mr-1 ${wishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
                                {wishlisted ? 'Saved' : 'Wishlist'}
                            </Button>
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            <span>Free Delivery over ₹999</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            <span>14 Day Returns</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
                <Separator className="mb-8" />
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

                {/* Review list */}
                {reviewsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>
                ) : reviews.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet. Be the first!</p>
                ) : (
                    <div className="space-y-6 mb-10">
                        {reviews.map((review) => (
                            <div key={review.id} className="rounded-xl border p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold">{review.user?.name ?? 'Anonymous'}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500 mb-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'opacity-25'}`} />
                                    ))}
                                </div>
                                <p className="text-muted-foreground text-sm">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit Review Form */}
                {isAuthenticated && (
                    <div className="rounded-xl border p-6 bg-muted/30">
                        <h3 className="font-semibold mb-4">Write a Review</h3>
                        <div className="flex items-center gap-2 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <button key={i} onClick={() => setReviewRating(i + 1)} type="button">
                                    <Star className={`h-6 w-6 cursor-pointer transition-colors ${i < reviewRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                                </button>
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">{reviewRating} / 5</span>
                        </div>
                        <Textarea
                            placeholder="Share your honest opinion..."
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            rows={3}
                            className="mb-4"
                        />
                        <Button
                            onClick={() => submitReview({ productId: product.id, rating: reviewRating, comment: reviewComment })}
                            disabled={submittingReview || !reviewComment.trim()}
                        >
                            {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Review
                        </Button>
                    </div>
                )}
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="mt-16">
                    <Separator className="mb-8" />
                    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recommendations.map(rec => {
                            const recImg = rec.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                            const recPrice = rec.salePrice ?? rec.price;
                            return (
                                <Link key={rec.id} href={`/products/${rec.id}`} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-square overflow-hidden bg-muted">
                                        <img
                                            src={recImg}
                                            alt={rec.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium text-sm line-clamp-2 mb-1">{rec.name}</p>
                                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                                            <Star className="h-3 w-3 fill-current" />
                                            <span className="text-xs text-foreground">{rec.averageRating?.toFixed(1) ?? 'New'}</span>
                                        </div>
                                        <p className="font-bold text-sm">₹{recPrice.toLocaleString()}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
