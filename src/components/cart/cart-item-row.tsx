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
    <div className="py-5 sm:py-6 border-b border-brand-sand/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
      {/* Product Image & Details */}
      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* Thumbnail */}
        <Link
          href={`/products/${item.slug}`}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-brand-surface border border-brand-sand/80 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          aria-label={`View details for ${item.name}`}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-brand-surface">
              <BrandLogo size="sm" />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          {item.categoryName && (
            <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-brand-burgundy truncate">
              {item.categoryName}
            </span>
          )}
          <Link
            href={`/products/${item.slug}`}
            className="font-serif text-base sm:text-lg font-bold text-brand-espresso hover:text-brand-burgundy transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
          >
            {item.name}
          </Link>
          <div className="flex items-center gap-2 mt-1 font-sans text-xs sm:text-sm text-brand-muted">
            <span>Unit:</span>
            {hasDiscount ? (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-brand-espresso">
                  ₹{effectiveUnitPrice.toLocaleString("en-IN")}
                </span>
                <span className="line-through text-brand-muted/70 text-xs">
                  ₹{item.unitPrice.toLocaleString("en-IN")}
                </span>
              </div>
            ) : (
              <span className="font-medium text-brand-espresso">
                ₹{item.unitPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity & Actions & Line Total */}
      <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-sand/40">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-brand-sand/80 bg-white rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity for ${item.name}`}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-espresso hover:text-brand-burgundy disabled:opacity-30 disabled:hover:text-brand-espresso transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span
            className="w-10 text-center font-sans font-bold text-brand-espresso text-sm"
            aria-live="polite"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            aria-label={`Increase quantity for ${item.name}`}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-espresso hover:text-brand-burgundy transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right min-w-[90px]">
          <span className="font-sans text-sm sm:text-base font-bold text-brand-espresso block">
            ₹{lineTotal.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          aria-label={`Remove ${item.name} from bag`}
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-muted hover:text-accent-rose transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
