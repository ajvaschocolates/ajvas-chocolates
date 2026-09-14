"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag, Zap, Check } from "lucide-react";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ type: "bag" | "buy"; text: string } | null>(null);
  const { addItem, setBuyNowItem } = useCart();

  const isOutOfStock = product.availability === "out_of_stock";

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToBag = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setFeedback({
      type: "bag",
      text: `Added ${quantity} ${quantity === 1 ? "item" : "items"} to your bag.`,
    });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    setBuyNowItem(product, quantity);
    setFeedback({
      type: "buy",
      text: `Selected ${quantity} ${quantity === 1 ? "item" : "items"} for direct checkout. (Checkout will be available in the upcoming release)`,
    });
    setTimeout(() => {
      setFeedback(null);
    }, 5000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity & CTA Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Stepper */}
        <div className="flex items-center justify-between sm:justify-start border border-brand-sand/80 bg-white rounded-xl p-1 shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isOutOfStock || quantity <= 1}
            aria-label="Decrease quantity"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-espresso hover:text-brand-burgundy disabled:opacity-30 disabled:hover:text-brand-espresso transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span
            className="w-12 text-center font-sans font-bold text-brand-espresso text-base"
            aria-live="polite"
            aria-label={`Selected quantity: ${quantity}`}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isOutOfStock}
            aria-label="Increase quantity"
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-espresso hover:text-brand-burgundy disabled:opacity-30 disabled:hover:text-brand-espresso transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to Bag Button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={isOutOfStock}
          onClick={handleAddToBag}
          className="flex-1 min-h-[48px] py-3 text-xs font-semibold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
        </Button>

        {/* Buy Now Button */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="flex-1 min-h-[48px] py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-brand-gold" />
          <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
        </Button>
      </div>

      {/* Accessible Feedback Region */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-lg bg-brand-surface border border-brand-sand text-brand-espresso text-xs font-sans flex items-center gap-2 shadow-subtle animate-in fade-in duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-brand-burgundy text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <p className="flex-1">{feedback.text}</p>
        </div>
      )}
    </div>
  );
}
