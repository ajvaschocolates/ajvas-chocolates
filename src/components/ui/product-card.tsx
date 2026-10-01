"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { formatINR } from "@/lib/utils";

export interface ProductCardProps {
  product: Product;
  badgeText?: string;
  rating?: number;
  reviewCount?: number;
  onAddToBag?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({
  product,
  badgeText,
  onAddToBag,
}: ProductCardProps) {
  const cart = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const primaryImage =
    product.images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop";
  const imageAlt = product.images?.[0]?.alt_text || product.name;

  // Calculate final discounted price if applicable
  let finalPrice = product.price;
  if (product.discount_type === "percentage" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - (product.price * product.discount_value) / 100);
  } else if (product.discount_type === "fixed" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - product.discount_value);
  }

  const isOutOfStock = product.availability === "out_of_stock";

  // Determine badge text
  let computedBadge = badgeText;
  if (!computedBadge) {
    if (product.discount_type === "percentage" && product.discount_value > 0) {
      computedBadge = `${product.discount_value}% OFF`;
    } else if (product.discount_type === "fixed" && product.discount_value > 0) {
      computedBadge = `${formatINR(product.discount_value)} OFF`;
    } else if (product.availability === "low_stock") {
      computedBadge = "LIMITED";
    }
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    if (onAddToBag) {
      onAddToBag(product);
    } else {
      cart.addItem(product);
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="group flex flex-col justify-between bg-white rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative">
      {/* Top Image Box */}
      <div className="relative w-full aspect-square bg-white overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Top-Left Badge */}
        {computedBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`inline-block font-sans text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm text-white shadow-md ${
                computedBadge.includes("OFF")
                  ? "bg-[#fb0b88]"
                  : "bg-[#c99d52]"
              }`}
            >
              {computedBadge}
            </span>
          </div>
        )}

        {/* Top-Right Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          aria-label="Add to wishlist"
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-sm flex items-center justify-center text-[#fb0b88] hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isLiked ? "fill-[#fb0b88] text-[#fb0b88]" : "text-white/80"
            }`}
          />
        </button>
      </div>

      {/* Product Details Area */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 justify-between gap-2.5 bg-white">
        <div>
          {/* Title - font-pally */}
          <Link
            href={`/products/${product.slug}`}
            className="block font-pally text-sm sm:text-base font-bold text-black hover:text-[#fb0b88] transition-colors leading-snug line-clamp-1"
          >
            {product.name}
          </Link>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="font-sans text-sm sm:text-base font-extrabold text-black">
              {formatINR(finalPrice)}
            </span>
            {product.discount_type !== "none" && product.discount_value > 0 && (
              <span className="font-sans text-[11px] text-black/60 line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Full-width ADD TO CART Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddClick}
          className={`w-full flex items-center justify-center gap-1.5 font-sans text-[11px] uppercase tracking-wider font-bold py-2 px-2.5 rounded-sm transition-all duration-200 shadow-md ${
            isOutOfStock
              ? "bg-stone-800 text-stone-500 cursor-not-allowed"
              : isAdded
              ? "bg-emerald-600 text-white"
              : "bg-[#fb0b88] hover:bg-[#d90974] active:bg-[#b0075e] text-white"
          }`}
        >
          <ShoppingCart className="w-3 h-3" />
          <span>{isOutOfStock ? "SOLD OUT" : isAdded ? "ADDED!" : "ADD TO CART"}</span>
        </button>
      </div>
    </div>
  );
}
