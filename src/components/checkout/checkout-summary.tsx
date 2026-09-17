import { Package, ShieldCheck, Truck, Scale } from "lucide-react";
import { CartItem } from "@/types/cart";
import { ShippingCalculationState } from "@/types/checkout";
import { BrandLogo } from "@/components/layout/brand-logo";

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingAmount: number | null;
  shippingState: ShippingCalculationState;
  totalWeightGrams: number;
  isBuyNowMode?: boolean;
}

export function CheckoutSummary({
  items,
  subtotal,
  shippingAmount,
  shippingState,
  totalWeightGrams,
  isBuyNowMode,
}: CheckoutSummaryProps) {
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = shippingAmount !== null ? subtotal + shippingAmount : null;

  const formattedWeight =
    totalWeightGrams >= 1000
      ? `${(totalWeightGrams / 1000).toFixed(1)} kg`
      : `${totalWeightGrams} g`;

  return (
    <div className="bg-white rounded-2xl border border-brand-sand/80 p-6 sm:p-7 shadow-subtle flex flex-col gap-6 lg:sticky lg:top-28">
      {/* Heading */}
      <div className="flex items-center justify-between border-b border-brand-sand/70 pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-brand-espresso tracking-tight">
            Order Summary
          </h2>
          <p className="font-sans text-xs text-brand-muted mt-0.5">
            {isBuyNowMode ? "Direct item purchase" : `${totalItemsCount} ${totalItemsCount === 1 ? "item" : "items"}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-surface rounded-lg border border-brand-sand/70 text-[11px] font-sans font-medium text-brand-espresso">
          <Scale className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span>{formattedWeight}</span>
        </div>
      </div>

      {/* Itemized List */}
      <div className="divide-y divide-brand-sand/50 max-h-[320px] overflow-y-auto pr-1 scrollbar-none">
        {items.map((item) => {
          const effectivePrice = item.discountedUnitPrice ?? item.unitPrice;
          const lineTotal = effectivePrice * item.quantity;
          return (
            <div key={item.productId} className="py-3 flex items-center justify-between gap-3 text-xs font-sans">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-brand-surface border border-brand-sand/80 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <BrandLogo size="sm" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-brand-espresso truncate font-sans text-xs">
                    {item.name}
                  </p>
                  <p className="text-brand-muted text-[11px]">
                    Qty: {item.quantity} × ₹{effectivePrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <span className="font-bold text-brand-espresso shrink-0 text-sm">
                ₹{lineTotal.toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Financial Calculation */}
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
            {shippingAmount !== null ? (
              <span className="font-bold text-brand-espresso">
                ₹{shippingAmount.toLocaleString("en-IN")}
              </span>
            ) : shippingState === "calculating" || shippingState === "recalculating" ? (
              <span className="text-xs font-medium text-brand-gold animate-pulse">
                Calculating rate...
              </span>
            ) : shippingState === "calculation_failed" ? (
              <span className="text-xs font-medium text-amber-700">
                Unavailable for destination
              </span>
            ) : shippingState === "awaiting_courier" ? (
              <span className="text-xs font-medium text-brand-muted">
                Select courier service
              </span>
            ) : (
              <span className="text-xs font-medium text-brand-muted">
                Calculated in Step 1
              </span>
            )}
          </div>
          <p className="text-[11px] text-brand-muted leading-tight">
            Single combined package shipment based on destination pincode and courier service.
          </p>
        </div>

        {/* Final Total / Order Subtotal */}
        <div className="flex items-center justify-between text-brand-espresso pt-3 border-t border-brand-sand/40">
          <div>
            <span className="font-bold text-base block">
              {finalTotal !== null ? "Total Payable" : "Order Subtotal"}
            </span>
            <span className="text-[11px] text-brand-muted font-normal block">
              {finalTotal !== null
                ? "Total payable amount including delivery"
                : "Final total calculated after delivery selection"}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold text-xl text-brand-espresso">
              ₹{(finalTotal ?? subtotal).toLocaleString("en-IN")}
            </span>
            {finalTotal === null && (
              <span className="block text-[10px] uppercase font-sans tracking-wider text-brand-muted font-semibold">
                (Excl. Delivery)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-1 gap-2.5 text-[11px] font-sans text-brand-muted">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span>Pan-India Courier Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-brand-gold shrink-0" />
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
