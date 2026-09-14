"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { Container } from "@/components/ui/container";
import { CartItemRow } from "./cart-item-row";
import { CartSummary } from "./cart-summary";

export function CartView() {
  const { items, totalItemsCount, isHydrated } = useCart();

  // Loading / Hydration skeleton state
  if (!isHydrated) {
    return (
      <div className="w-full py-10 sm:py-16">
        <Container>
          <div className="max-w-5xl mx-auto animate-pulse">
            <div className="h-8 w-48 bg-brand-sand/60 rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-6">
                <div className="h-28 bg-brand-sand/40 rounded-2xl" />
                <div className="h-28 bg-brand-sand/40 rounded-2xl" />
              </div>
              <div className="lg:col-span-4">
                <div className="h-72 bg-brand-sand/40 rounded-2xl" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Intentional Empty Cart State
  if (items.length === 0) {
    return (
      <div className="w-full py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-brand-surface border border-brand-sand/80 flex items-center justify-center text-brand-muted shadow-subtle">
              <ShoppingBag className="w-9 h-9 text-brand-espresso" />
            </div>

            <div className="space-y-2">
              <span className="font-sans text-xs uppercase tracking-widest font-semibold text-brand-burgundy">
                YOUR BAG
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-espresso tracking-tight">
                Your bag is empty.
              </h1>
              <p className="font-sans text-sm text-brand-muted leading-relaxed max-w-sm mx-auto">
                Explore our chocolate gifts and curated collections to find something worth gifting.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-3 inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest font-semibold min-h-[50px] px-8 rounded-lg bg-brand-cocoa text-brand-cream hover:bg-brand-espresso active:bg-black transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              <span>Shop Chocolates</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  // Populated Cart State
  return (
    <div className="w-full py-8 sm:py-12">
      <Container>
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Header Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-brand-sand/70 pb-5">
            <div className="flex items-baseline gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-espresso tracking-tight">
                Shopping Bag
              </h1>
              <span className="font-sans text-sm text-brand-muted">
                ({totalItemsCount} {totalItemsCount === 1 ? "item" : "items"})
              </span>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-sans text-xs text-brand-muted hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shop</span>
            </Link>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="divide-y divide-transparent">
                {items.map((item) => (
                  <CartItemRow key={item.productId} item={item} />
                ))}
              </div>

              <div className="pt-6">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-brand-espresso hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded"
                >
                  <ArrowLeft className="w-4 h-4 text-brand-gold" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right: Sticky Order Summary */}
            <div className="lg:col-span-4">
              <CartSummary items={items} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
