export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl?: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
}

export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    stockQuantity: number;
    category: Category;
    images: ProductImage[];
    averageRating: number;
    reviewCount: number;
    active: boolean;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
