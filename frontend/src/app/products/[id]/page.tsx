'use client';

import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Star, HelpCircle, Truck, ArrowLeft, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useState, use } from 'react';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const productId = parseInt(id);
    const { data: product, isLoading, error } = useProduct(productId);
    const { addItem, isLoading: isAddingToCart } = useCartStore();
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

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

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                size="lg"
                                className="w-full flex-1"
                                onClick={handleAddToCart}
                                disabled={product.stockQuantity === 0 || isAddingToCart}
                            >
                                {isAddingToCart ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                                Add to Cart
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
        </div>
    );
}
