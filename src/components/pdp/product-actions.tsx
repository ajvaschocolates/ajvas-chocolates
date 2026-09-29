"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, Zap, Check } from "lucide-react";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
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
    router.push("/checkout?mode=buy-now");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity & CTA Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Stepper */}
        <div className="flex items-center justify-between sm:justify-start border border-[#3d1c12] bg-[#140b07] rounded-full p-1 shrink-0">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isOutOfStock || quantity <= 1}
            aria-label="Decrease quantity"
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#faf4f0] hover:text-[#fb0b88] disabled:opacity-30 transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span
            className="w-10 text-center font-sans font-extrabold text-[#faf4f0] text-base"
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
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#faf4f0] hover:text-[#fb0b88] disabled:opacity-30 transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
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
          className="flex-1 min-h-[48px] py-3 text-xs font-bold uppercase tracking-wider shadow-md bg-[#fb0b88] text-white hover:bg-[#d90974] active:bg-[#b0075e] rounded-full flex items-center justify-center gap-2 border-none"
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
          className="flex-1 min-h-[48px] py-3 text-xs font-bold uppercase tracking-wider bg-[#1b0e0a] border border-[#c99d52] text-[#c99d52] hover:bg-[#c99d52] hover:text-[#120805] rounded-full flex items-center justify-center gap-2 transition-all"
        >
          <Zap className="w-4 h-4 text-[#c99d52] group-hover:text-[#120805]" />
          <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
        </Button>
      </div>

      {/* Accessible Feedback Region */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-xl bg-[#3d101e] border border-[#fb0b88]/40 text-[#faf4f0] text-xs font-sans font-medium flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-[#fb0b88] text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <p className="flex-1">{feedback.text}</p>
        </div>
      )}
    </div>
  );
}
