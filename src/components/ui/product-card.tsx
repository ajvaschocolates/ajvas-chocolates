"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
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
  rating = 5.0,
  reviewCount = 124,
  onAddToBag,
  onQuickView,
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
    <div className="group flex flex-col justify-between bg-white border border-[#ebdcd3] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 relative">
      {/* Top Image Box */}
      <div className="relative w-full aspect-[4/3] bg-[#faf4f0] overflow-hidden">
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
          <div className="absolute top-2.5 left-2.5 z-10">
            <span
              className={`inline-block font-sans text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-xs ${
                computedBadge.includes("OFF")
                  ? "bg-[#fb0b88]"
                  : "bg-amber-600"
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
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-brand-pink hover:scale-110 transition-transform"
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? "fill-brand-pink text-brand-pink" : "text-brand-pink"
            }`}
          />
        </button>

        {/* Quick View Button Overlay */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full font-sans text-[11px] font-bold uppercase tracking-wider text-brand-espresso shadow-md hover:bg-brand-pink hover:text-white z-20"
          >
            Quick View
          </button>
        )}
      </div>

      {/* Product Details Area */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            className="block font-serif text-base sm:text-lg font-bold text-brand-espresso hover:text-brand-pink transition-colors leading-snug line-clamp-1"
          >
            {product.name}
          </Link>

          {/* Star Rating Row */}
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              ))}
            </div>
            <span className="font-sans text-[11px] text-brand-muted font-normal">
              ({reviewCount})
            </span>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-sans text-base sm:text-lg font-extrabold text-brand-espresso">
              {formatINR(finalPrice)}
            </span>
            {product.discount_type !== "none" && product.discount_value > 0 && (
              <span className="font-sans text-xs text-brand-muted line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Full-width Outlined ADD TO CART Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddClick}
          className={`w-full flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider font-bold py-2.5 px-3 rounded-full border transition-all duration-200 ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : isAdded
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "border-[#fbcfe8] text-brand-pink bg-white hover:bg-brand-pink hover:text-white hover:border-brand-pink shadow-xs"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{isOutOfStock ? "SOLD OUT" : isAdded ? "ADDED!" : "ADD TO CART"}</span>
        </button>
      </div>
    </div>
  );
}
