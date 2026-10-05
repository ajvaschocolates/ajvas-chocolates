import { Package, ShieldCheck, Truck, Scale } from "lucide-react";
import { CartItem } from "@/types/cart";
import { ShippingCalculationState, ShippingZone } from "@/types/checkout";
import { BrandLogo } from "@/components/layout/brand-logo";
import { useDeliveryState, getDeliveryEstimateForState } from "@/lib/delivery-estimate";

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingAmount: number | null;
  shippingZone?: ShippingZone | null;
  shippingState: ShippingCalculationState;
  totalWeightGrams: number;
  isBuyNowMode?: boolean;
  selectedState?: string;
}

export function CheckoutSummary({
  items,
  subtotal,
  shippingAmount,
  shippingZone,
  shippingState,
  totalWeightGrams,
  isBuyNowMode,
  selectedState,
}: CheckoutSummaryProps) {
  const { selectedState: storedState } = useDeliveryState();
  const activeState = selectedState || storedState;
  const estimate = getDeliveryEstimateForState(activeState);

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = shippingAmount !== null ? subtotal + shippingAmount : null;

  const formattedWeight =
    totalWeightGrams >= 1000
      ? `${(totalWeightGrams / 1000).toFixed(1)} kg`
      : `${totalWeightGrams} g`;

  const getZoneLabel = (zone?: ShippingZone | null) => {
    switch (zone) {
      case "kerala":
        return "Kerala Rate Zone";
      case "tn_kar":
        return "TN & Karnataka Rate Zone";
      case "other":
        return "Rest of India Rate Zone";
      default:
        return "State-Based Shipping";
    }
  };

  return (
    <div className="bg-transparent p-0 shadow-none rounded-none sm:bg-[#1f110c] sm:rounded-sm sm:p-7 sm:shadow-2xl flex flex-col gap-6 lg:sticky lg:top-28">
      {/* Heading */}
      <div className="flex items-center justify-between border-b border-[#3d1c12] pb-4">
        <div>
          <h2 className="font-pally text-xl font-bold text-[#faf4f0] tracking-tight">
            Order Summary
          </h2>
          <p className="font-sans text-xs text-[#a39085] mt-0.5">
            {isBuyNowMode ? "Direct item purchase" : `${totalItemsCount} ${totalItemsCount === 1 ? "item" : "items"}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#140b07] rounded-sm text-[11px] font-sans font-medium text-[#c99d52]">
          <Scale className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
          <span>{formattedWeight}</span>
        </div>
      </div>

      {/* Itemized List */}
      <div className="divide-y divide-[#3d1c12] max-h-[320px] overflow-y-auto pr-1 scrollbar-none">
        {items.map((item) => {
          const effectivePrice = item.discountedUnitPrice ?? item.unitPrice;
          const lineTotal = effectivePrice * item.quantity;
          return (
            <div key={item.productId} className="py-3 flex items-center justify-between gap-3 text-xs font-sans">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-sm bg-[#140b07] overflow-hidden shrink-0 flex items-center justify-center">
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
                  <p className="font-medium text-[#faf4f0] truncate font-sans text-xs">
                    {item.name}
                  </p>
                  <p className="text-[#a39085] text-[11px]">
                    Qty: {item.quantity} × ₹{effectivePrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <span className="font-bold text-[#faf4f0] shrink-0 text-sm">
                ₹{lineTotal.toLocaleString("en-IN")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Financial Calculation */}
      <div className="space-y-3 font-sans text-sm border-t border-b border-[#3d1c12] py-4">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-[#faf4f0]">
          <span className="text-[#d1c2b9]">Subtotal</span>
          <span className="font-bold text-base">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {/* Delivery Fee */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center justify-between text-[#faf4f0]">
            <span className="text-[#d1c2b9] flex items-center gap-1.5">
              <span>Delivery Fee</span>
              {shippingZone && (
                <span className="px-2 py-0.5 text-[10px] font-mono text-white font-semibold">
                  {getZoneLabel(shippingZone)}
                </span>
              )}
            </span>
            {shippingAmount !== null ? (
              <span className="font-bold text-[#faf4f0]">
                {shippingAmount === 0 ? (
                  <span className="text-[#c99d52] font-bold uppercase text-xs">FREE</span>
                ) : (
                  `₹${shippingAmount.toLocaleString("en-IN")}`
                )}
              </span>
            ) : shippingState === "calculating" || shippingState === "recalculating" ? (
              <span className="text-xs font-medium text-[#c99d52] animate-pulse">
                Calculating state rate...
              </span>
            ) : shippingState === "calculation_failed" ? (
              <span className="text-xs font-medium text-[#fb0b88]">
                Unavailable for state
              </span>
            ) : (
              <span className="text-xs font-medium text-[#a39085]">
                Select State in Step 1
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#a39085] leading-tight">
            Per-unit regional shipping calculated automatically based on destination state.
          </p>
        </div>

        {/* Estimated Delivery */}
        <div className="flex flex-col gap-0.5 pt-2 border-t border-[#3d1c12]/60">
          <div className="flex items-center justify-between text-[#faf4f0]">
            <span className="text-[#d1c2b9]">Estimated Delivery</span>
            {estimate.isKnownState ? (
              <span className="font-bold text-[#c99d52]">{estimate.days}</span>
            ) : (
              <span className="text-xs text-[#a39085]">Select State in Step 1</span>
            )}
          </div>
          {estimate.isKnownState && (
            <p className="text-[11px] text-[#a39085] leading-tight text-right">
              {estimate.badgeLabel}
            </p>
          )}
        </div>

        {/* Final Total / Order Subtotal */}
        <div className="flex items-center justify-between text-[#faf4f0] pt-3 border-t border-[#3d1c12]">
          <div>
            <span className="font-bold text-base block text-[#faf4f0]">
              {finalTotal !== null ? "Total Payable" : "Order Subtotal"}
            </span>
            <span className="text-[11px] text-[#a39085] font-normal block">
              {finalTotal !== null
                ? "Total payable amount including delivery"
                : "Select delivery State in Step 1 to calculate total"}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold text-xl text-[#c99d52]">
              ₹{(finalTotal ?? subtotal ?? 0).toLocaleString("en-IN")}
            </span>
            {finalTotal === null && (
              <span className="block text-[10px] uppercase font-sans tracking-wider text-[#a39085] font-semibold">
                (Excl. Delivery)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-1 gap-2.5 text-[11px] font-sans text-[#d1c2b9]">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
          <span>Pan-India Courier Dispatch</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
          <span>Carefully Packaged Confectionery</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
          <span>Guest Checkout</span>
        </div>
      </div>
    </div>
  );
}
