'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Loader2, MapPin, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { toast } from 'sonner';

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useAddresses, useCreateAddress, usePlaceOrder, useInitiatePayment, useVerifyPayment } from '@/hooks/useCheckout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Address } from '@/types/checkout';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);

    // Form State
    const [newAddress, setNewAddress] = useState({
        streetName: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: ''
    });

    const { data: addresses, isLoading: loadingAddresses } = useAddresses();
    const { mutateAsync: createAddress, isPending: creatingAddress } = useCreateAddress();
    const { mutateAsync: placeOrder } = usePlaceOrder();
    const { mutateAsync: initiatePayment } = useInitiatePayment();
    const { mutateAsync: verifyPayment } = useVerifyPayment();

    // Redirect if cart is empty
    useEffect(() => {
        if (!cart?.items || cart.items.length === 0) {
            router.replace('/cart');
        }
    }, [cart, router]);

    // Set default address if available
    useEffect(() => {
        if (addresses && addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    const handleAddNewAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await createAddress(newAddress);
            setSelectedAddressId(added.id);
            setShowNewAddressForm(false);
            toast.success('Address added successfully');
        } catch (error) {
            toast.error('Failed to add address');
        }
    };

    const handlePayment = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Place the order in backend
            const order = await placeOrder({ addressId: selectedAddressId });

            // 2. Initiate Razorpay payment
            const rpOrder = await initiatePayment(order.id);

            // 3. Open Razorpay options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXX', // Replace with real env var
                amount: rpOrder.amount, // Amount is in currency subunits. Default currency is INR.
                currency: "INR",
                name: "ShopEase",
                description: `Order #${order.orderNumber}`,
                order_id: rpOrder.razorpayOrderId,
                handler: async function (response: any) {
                    try {
                        // 4. Verify Payment
                        await verifyPayment({
                            orderId: order.id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });

                        toast.success("Payment successful!");
                        await clearCart();
                        router.push(`/checkout/success?orderId=${order.id}`);
                    } catch (err) {
                        toast.error("Payment verification failed. Please contact support.");
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: ""
                },
                notes: {
                    address: "ShopEase Office"
                },
                theme: {
                    color: "#000000" // Tailwind neutral-900 or primary
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast.error("Payment cancelled");
                    }
                }
            };

            const razorpayTemplate = new (window as any).Razorpay(options);
            razorpayTemplate.open();

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error processing checkout');
            setIsProcessing(false);
        }
    };

    if (!cart?.items || cart.items.length === 0) return null;

    const cartTotal = cart.items.reduce((total, item) => total + item.subtotal, 0);
    const gst = Math.round(cartTotal * 0.18);

    let discount = 0;
    if (cart.coupon) {
        discount = cart.coupon.discountType === 'FIXED'
            ? cart.coupon.discountValue
            : Math.round(cartTotal * (cart.coupon.discountValue / 100));
        if (discount > cartTotal) discount = cartTotal;
    }

    const finalTotal = Math.max(0, cartTotal - discount + gst);

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column - Addresses */}
                    <div className="lg:col-span-8 space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                            </h2>

                            {loadingAddresses ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6" /></div>
                            ) : (
                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                    {addresses?.map((address) => (
                                        <Card
                                            key={address.id}
                                            className={`cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                            onClick={() => setSelectedAddressId(address.id)}
                                        >
                                            <CardContent className="p-4 relative">
                                                {selectedAddressId === address.id && (
                                                    <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
                                                )}
                                                <p className="font-medium">{user?.name}</p>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {address.streetName}<br />
                                                    {address.city}, {address.state} {address.zipCode}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {!showNewAddressForm && (
                                        <Card
                                            className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors flex items-center justify-center min-h-[140px]"
                                            onClick={() => setShowNewAddressForm(true)}
                                        >
                                            <span className="font-medium text-muted-foreground">+ Add New Address</span>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {showNewAddressForm && (
                                <form onSubmit={handleAddNewAddress} className="space-y-4 bg-muted/30 p-6 rounded-xl border">
                                    <div className="space-y-2">
                                        <Label htmlFor="streetName">Street Address</Label>
                                        <Input id="streetName" required value={newAddress.streetName} onChange={e => setNewAddress({ ...newAddress, streetName: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input id="state" required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="zipCode">ZIP Code</Label>
                                            <Input id="zipCode" required value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input id="country" disabled value={newAddress.country} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button type="button" variant="ghost" onClick={() => setShowNewAddressForm(false)}>Cancel</Button>
                                        <Button type="submit" disabled={creatingAddress}>
                                            {creatingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Address
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Order Summary & Payment Action */}
                    <div className="lg:col-span-4">
                        <div className="bg-card border rounded-xl p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

                            <ul className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {cart.items.map((item) => (
                                    <li key={item.id} className="flex justify-between items-start text-sm">
                                        <div className="flex gap-3">
                                            <span className="text-muted-foreground">{item.quantity}x</span>
                                            <span className="line-clamp-2 max-w-[180px] font-medium">{item.product.name}</span>
                                        </div>
                                        <span>₹{item.subtotal.toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>

                            <Separator className="my-4" />

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (18% GST)</span>
                                    <span className="font-medium">₹{gst.toLocaleString()}</span>
                                </div>

                                {cart.coupon && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span className="flex items-center">
                                            <Tag className="h-4 w-4 mr-1" />
                                            Discount ({cart.coupon.code})
                                        </span>
                                        <span>-₹{discount.toLocaleString()}</span>
                                    </div>
                                )}

                                <Separator className="my-4" />

                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span>₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handlePayment}
                                    disabled={isProcessing || !selectedAddressId || addresses?.length === 0}
                                >
                                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                                    {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
