import Link from 'next/link';
import { Package2, Github, Twitter, Instagram } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <Package2 className="h-6 w-6 text-primary" />
                            <span className="font-bold text-xl tracking-tight">ShopEase</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Your one-stop destination for premium products. Experience seamless shopping with fast delivery and excellent customer support.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Shop</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/products" className="hover:text-foreground">All Products</Link></li>
                            <li><Link href="/categories/electronics" className="hover:text-foreground">Electronics</Link></li>
                            <li><Link href="/categories/clothing" className="hover:text-foreground">Clothing</Link></li>
                            <li><Link href="/sale" className="hover:text-foreground">Clearance Sale</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Support</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/faq" className="hover:text-foreground">FAQ</Link></li>
                            <li><Link href="/shipping" className="hover:text-foreground">Shipping Returns</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                            <li><Link href="/track-order" className="hover:text-foreground">Track Order</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-sm">Legal</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
                            <li><Link href="/refund" className="hover:text-foreground">Refund Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} ShopEase Inc. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span>Secured Payments via Razorpay</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
