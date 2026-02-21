import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { addItem, isLoading } = useCartStore();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if clicked inside a Link
        try {
            await addItem(product.id, 1);
            toast.success(`${product.name} added to cart!`);
        } catch (error: any) {
            toast.error('Failed to add to cart. Please log in first.');
        }
    };

    const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl ||
        product.images?.[0]?.imageUrl ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-all hover:shadow-lg">
            <Link href={`/products/${product.id}`} className="absolute inset-0 z-10" />
            <div className="aspect-square bg-muted relative">
                <img
                    src={primaryImage}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                {product.salePrice && (
                    <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md z-20">
                        SALE
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-grow p-4 space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500 shrink-0 ml-2">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-medium text-muted-foreground">{product.averageRating || 'New'}</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-1">{product.category?.name || 'Category'}</p>

                <div className="mt-auto pt-4 flex items-center justify-between z-20">
                    <div className="flex flex-col">
                        {product.salePrice ? (
                            <>
                                <span className="text-lg font-bold">₹{product.salePrice.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground line-through">₹{product.price.toLocaleString()}</span>
                            </>
                        ) : (
                            <span className="text-lg font-bold">₹{product.price.toLocaleString()}</span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className="rounded-full"
                        onClick={handleAddToCart}
                        disabled={product.stockQuantity === 0 || isLoading}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span className="sr-only">Add to cart</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
