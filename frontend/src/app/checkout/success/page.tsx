'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    return (
        <div className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-lg text-center space-y-6">
            <div className="flex justify-center">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">
                    Payment Successful!
                </h1>
                <p className="text-muted-foreground text-lg">
                    Thank you for your purchase. Your order has been placed successfully.
                </p>
            </div>

            {orderId && (
                <div className="bg-muted p-4 rounded-xl flex items-center justify-center gap-3">
                    <Package className="text-muted-foreground h-5 w-5" />
                    <span className="font-medium text-lg">Order #{orderId.padStart(6, '0')}</span>
                </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
                <Button size="lg" className="w-full" asChild>
                    <Link href="/profile">View Order Status</Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link href="/products">Continue Shopping <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <Suspense fallback={<p>Loading order details...</p>}>
                <CheckoutSuccessContent />
            </Suspense>
        </div>
    );
}
