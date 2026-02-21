export interface Address {
    id: number;
    streetName: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    totalAmount: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    shippingAddress: Address;
    items: any[];
}

export interface PaymentInitiateResponse {
    id: number;
    razorpayOrderId: string;
    amount: number;
    status: string;
}
