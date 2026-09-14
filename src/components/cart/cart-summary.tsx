import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, PackageCheck } from "lucide-react";
import { CartItem } from "@/types/cart";

interface CartSummaryProps {
  items: CartItem[];
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((acc, item) => {
    const price = item.discountedUnitPrice ?? item.unitPrice;
    return acc + price * item.quantity;
  }, 0);

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-white rounded-2xl border border-brand-sand/80 p-6 sm:p-7 shadow-subtle flex flex-col gap-6 lg:sticky lg:top-28">
      <div>
        <h2 className="font-serif text-xl font-bold text-brand-espresso tracking-tight">
          Order Summary
        </h2>
        <p className="font-sans text-xs text-brand-muted mt-0.5">
          {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in your shopping bag
        </p>
      </div>

      <div className="space-y-3 font-sans text-sm border-t border-b border-brand-sand/70 py-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-brand-espresso">
          <span className="text-brand-muted">Subtotal</span>
          <span className="font-bold text-base">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {/* Delivery */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between text-brand-espresso">
            <span className="text-brand-muted">Delivery</span>
            <span className="text-xs font-semibold text-brand-burgundy uppercase tracking-wider">
              Calculated at checkout
            </span>
          </div>
          <p className="text-[11px] text-brand-muted leading-tight">
            Single consolidated package shipment computed from destination pincode and courier service.
          </p>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="flex flex-col gap-3">
        <Link
          href="/checkout"
          className="w-full inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest font-semibold min-h-[50px] px-6 rounded-lg bg-brand-cocoa text-brand-cream hover:bg-brand-espresso active:bg-black transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/shop"
          className="w-full text-center font-sans text-xs text-brand-muted hover:text-brand-burgundy transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Factual Trust Highlights */}
      <div className="pt-2 border-t border-brand-sand/50 grid grid-cols-1 gap-2.5 text-[11px] font-sans text-brand-muted">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span>Pan-India Courier Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <PackageCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span>Consolidated Package Shipment</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span>Guest Checkout</span>
        </div>
      </div>
    </div>
  );
}
