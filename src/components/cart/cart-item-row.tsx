"use client";

import Link from "next/link";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { useCart } from "@/context/cart-context";
import { BrandLogo } from "@/components/layout/brand-logo";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();

  const effectiveUnitPrice = item.discountedUnitPrice ?? item.unitPrice;
  const lineTotal = effectiveUnitPrice * item.quantity;
  const hasDiscount = item.discountedUnitPrice !== undefined && item.discountedUnitPrice < item.unitPrice;

  return (
    <div className="py-5 sm:py-6 border-b border-[#3d1c12] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
      {/* Product Image & Details */}
      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* Thumbnail */}
        <Link
          href={`/products/${item.slug}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#1f110c] border border-[#3d1c12] shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d52]"
          aria-label={`View details for ${item.name}`}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#1f110c]">
              <BrandLogo size="sm" />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          {item.categoryName && (
            <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[#c99d52] truncate">
              {item.categoryName}
            </span>
          )}
          <Link
            href={`/products/${item.slug}`}
            className="font-serif text-base sm:text-lg font-bold text-[#faf4f0] hover:text-[#fb0b88] transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] rounded-sm"
          >
            {item.name}
          </Link>
          <div className="flex items-center gap-2 mt-1 font-sans text-xs sm:text-sm text-[#a39085]">
            <span>Unit:</span>
            {hasDiscount ? (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#faf4f0]">
                  ₹{effectiveUnitPrice.toLocaleString("en-IN")}
                </span>
                <span className="line-through text-[#a39085] text-xs">
                  ₹{item.unitPrice.toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <span className="font-medium text-[#faf4f0]">
                ₹{item.unitPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {item.customization && (
            <div className="mt-2 p-2 rounded bg-[#140b07] border border-[#3d1c12] text-xs max-w-md">
              <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#c99d52] block">
                Gift Personalization
              </span>
              <p className="text-[#faf4f0] text-xs mt-0.5 break-words font-sans italic">
                &ldquo;{item.customization}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quantity & Actions & Line Total */}
      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3d1c12]">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-[#3d1c12] bg-[#140b07] rounded-full p-1 shrink-0">
          <button
            type="button"
            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.customization)}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity for ${item.name}`}
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#faf4f0] hover:text-[#fb0b88] disabled:opacity-30 disabled:hover:text-[#faf4f0] transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span
            className="w-10 text-center font-sans font-bold text-[#faf4f0] text-sm"
            aria-live="polite"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.customization)}
            aria-label={`Increase quantity for ${item.name}`}
            className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#faf4f0] hover:text-[#fb0b88] transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right min-w-[90px]">
          <span className="font-sans text-sm sm:text-base font-bold text-[#faf4f0] block">
            ₹{lineTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => removeItem(item.productId, item.customization)}
          aria-label={`Remove ${item.name} from bag`}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#a39085] hover:text-[#fb0b88] transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
