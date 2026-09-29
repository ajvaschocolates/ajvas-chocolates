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
    <div className="bg-[#1f110c] rounded-2xl border border-[#3d1c12] p-6 sm:p-7 shadow-2xl flex flex-col gap-6 lg:sticky lg:top-28">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#faf4f0] tracking-tight">
          Order Summary
        </h2>
        <p className="font-sans text-xs text-[#a39085] mt-0.5 font-medium">
          {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in your shopping bag
        </p>
      </div>

      <div className="space-y-3 font-sans text-sm border-t border-b border-[#3d1c12] py-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-[#faf4f0]">
          <span className="text-[#d1c2b9] font-medium">Subtotal</span>
          <span className="font-extrabold text-base text-[#faf4f0]">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {/* Delivery */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between text-[#faf4f0]">
            <span className="text-[#d1c2b9] font-medium">Delivery</span>
            <span className="text-xs font-bold text-[#c99d52] uppercase tracking-wider">
              Calculated at checkout
            </span>
          </div>
          <p className="text-[11px] text-[#a39085] leading-tight font-medium">
            Single consolidated package shipment computed from destination pincode and courier service.
          </p>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="flex flex-col gap-3">
        <Link
          href="/checkout"
          className="w-full inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest font-extrabold min-h-[50px] px-6 rounded-full bg-[#fb0b88] text-white hover:bg-[#d90974] transition-all shadow-md shadow-[#fb0b88]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          href="/shop"
          className="w-full text-center font-sans text-xs font-bold text-[#c99d52] hover:text-[#fb0b88] transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] rounded-full"
        >
          Continue Shopping
        </Link>
      </div>

      {/* Factual Trust Highlights */}
      <div className="pt-2 border-t border-[#3d1c12] grid grid-cols-1 gap-2.5 text-[11px] font-sans font-semibold text-[#d1c2b9]">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
          <span>Pan-India Courier Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <PackageCheck className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
          <span>Consolidated Package Shipment</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
          <span>Guest Checkout</span>
        </div>
      </div>
    </div>
  );
}
