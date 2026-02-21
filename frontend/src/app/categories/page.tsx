'use client';

import { useCategories } from '@/hooks/useProducts';
import Link from 'next/link';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategoriesPage() {
    const { data: categories, isLoading } = useCategories();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Shop by Category</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Explore our wide range of products categorized for your convenience.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categories?.map((category) => (
                    <Link
                        key={category.id}
                        href={`/products?categoryId=${category.id}`}
                        className="group relative overflow-hidden rounded-2xl border bg-card hover:shadow-xl transition-all block"
                    >
                        <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative">
                            {category.imageUrl ? (
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-primary/40 uppercase">
                                        {category.name.substring(0, 2)}
                                    </span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                            <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                            {category.description && (
                                <p className="text-sm text-white/80 line-clamp-2 mb-4">
                                    {category.description}
                                </p>
                            )}
                            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black w-full justify-between group-hover:translate-x-1 transition-transform">
                                Explore <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
