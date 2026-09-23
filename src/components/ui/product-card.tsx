"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/cart-context";
import { formatINR } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

export interface ProductCardProps {
  product: Product;
  onAddToBag?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({
  product,
  onAddToBag,
  onQuickView,
}: ProductCardProps) {
  const cart = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const primaryImage = product.images?.[0]?.image_url || "/images/placeholder-confection.jpg";
  const imageAlt = product.images?.[0]?.alt_text || product.name;

  // Calculate final discounted price if applicable
  let finalPrice = product.price;
  if (product.discount_type === "percentage" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - (product.price * product.discount_value) / 100);
  } else if (product.discount_type === "fixed" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - product.discount_value);
  }

  const isOutOfStock = product.availability === "out_of_stock";

  const handleAddClick = () => {
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
    <div className="group flex flex-col justify-between bg-white border border-brand-sand/80 rounded-2xl overflow-hidden shadow-subtle hover:shadow-elevated transition-all duration-300">
      {/* Product Image Area */}
      <div className="relative w-full aspect-[4/3] bg-brand-pink-light/40 overflow-hidden">
        {primaryImage && (
          <img
            src={primaryImage}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Floating Top-Right Wishlist Heart Button */}
        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          aria-label="Add to wishlist"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-brand-pink hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-brand-pink text-brand-pink" : "text-brand-pink"}`} />
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
            className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full font-sans text-xs font-semibold uppercase tracking-wider text-brand-navy shadow-md hover:bg-brand-pink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink z-20 min-h-[36px]"
          >
            Quick View
          </button>
        )}

        {/* Status / Discount Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discount_type !== "none" && product.discount_value > 0 && (
            <Badge variant="rose">
              {product.discount_type === "percentage"
                ? `${product.discount_value}% Off`
                : `${formatINR(product.discount_value)} Off`}
            </Badge>
          )}
          {product.availability === "low_stock" && (
            <Badge variant="amber">Limited</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="dark">Sold Out</Badge>
          )}
        </div>
      </div>

      {/* Product Info & Action */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {product.category?.name && (
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-pink">
              {product.category.name}
            </span>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="block mt-0.5 font-serif text-lg sm:text-xl font-bold text-brand-navy hover:text-brand-pink transition-colors leading-snug"
          >
            {product.name}
          </Link>
          {product.description && (
            <p className="mt-1 text-xs text-brand-muted line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-brand-sand/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans font-extrabold text-base sm:text-lg text-brand-navy">
                {formatINR(finalPrice)}
              </span>
              {product.discount_type !== "none" && product.discount_value > 0 && (
                <span className="text-xs text-brand-muted line-through">
                  {formatINR(product.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-brand-muted">Incl. all taxes</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isOutOfStock}
            onClick={handleAddClick}
            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
              isAdded
                ? "bg-emerald-600 text-white border-emerald-600"
                : "border-brand-pink/40 text-brand-pink hover:bg-brand-pink hover:text-white hover:border-brand-pink"
            }`}
          >
            {isOutOfStock ? "Sold Out" : isAdded ? "Added!" : "Add to Bag"}
          </Button>
        </div>
      </div>
    </div>
  );
}
