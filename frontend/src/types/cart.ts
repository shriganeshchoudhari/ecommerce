export interface CartItem {
    id: number;
    product: {
        id: number;
        name: string;
        salePrice?: number;
        price: number;
        images: { imageUrl: string; isPrimary: boolean }[];
        stockQuantity: number;
    };
    quantity: number;
    subtotal: number;
}

export interface Cart {
    id: number;
    items: CartItem[];
}
