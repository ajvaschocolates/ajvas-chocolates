"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Check } from "lucide-react";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { GiftCustomizationField } from "./gift-customization-field";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState("");
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
    addItem(product, quantity, customization);
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
    setBuyNowItem(product, quantity, customization);
    let stateParam = "";
    try {
      const saved =
        localStorage.getItem("ajvas_selected_state") ||
        sessionStorage.getItem("ajvas_selected_state");
      if (saved) {
        stateParam = `&state=${encodeURIComponent(saved)}`;
      }
    } catch {
      // ignore
    }
    router.push(`/checkout?mode=buy-now${stateParam}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Personalized Gift Request Section */}
      <GiftCustomizationField
        value={customization}
        onChange={setCustomization}
        disabled={isOutOfStock}
      />

      {/* Quantity Stepper Row */}
      <div className="flex flex-col gap-1.5">
        <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[#a39085]">
          Quantity
        </span>
        <div className="flex items-center justify-between sm:justify-start border border-[#3d1c12] bg-[#140b07] rounded-sm p-0.5 w-fit">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isOutOfStock || quantity <= 1}
            aria-label="Decrease quantity"
            className="w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center text-[#faf4f0] hover:text-[#fb0b88] disabled:opacity-30 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span
            className="w-10 text-center font-sans font-bold text-[#faf4f0] text-sm"
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
            className="w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center text-[#faf4f0] hover:text-[#fb0b88] disabled:opacity-30 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CTA Buttons Row - Under Quantity */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-0.5">
        {/* Add to Bag Button */}
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isOutOfStock}
          onClick={handleAddToBag}
          className="flex-1 min-h-[40px] py-2 text-[11px] font-bold uppercase tracking-wider shadow-md bg-[#fb0b88] text-white hover:bg-[#d90974] active:bg-[#b0075e] rounded-sm flex items-center justify-center gap-2 border-none"
        >
          {/* <ShoppingBag className="w-3.5 h-3.5" /> */}
          <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
        </Button>

        {/* Buy Now Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isOutOfStock}
          onClick={handleBuyNow}
          className="flex-1 min-h-[40px] py-2 text-[11px] font-bold uppercase tracking-wider bg-[#1b0e0a] border border-[#c99d52] text-[#c99d52] hover:bg-[#c99d52] hover:text-[#120805] rounded-sm flex items-center justify-center gap-2 transition-all"
        >
          {/* <Zap className="w-3.5 h-3.5 text-[#c99d52] group-hover:text-white" /> */}
          <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
        </Button>
      </div>

      {/* Accessible Feedback Region */}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-sm bg-[#3d101e] border border-[#fb0b88]/40 text-[#faf4f0] text-xs font-sans font-medium flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200"
        >
          <div className="w-5 h-5 rounded-sm bg-[#fb0b88] text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <p className="flex-1">{feedback.text}</p>
        </div>
      )}
    </div>
  );
}
