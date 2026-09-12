import Link from "next/link";
import { Product } from "@/types/catalog";
import { formatINR } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

export interface ProductCardProps {
  product: Product;
  onAddToBag?: (product: Product) => void;
}

export function ProductCard({
  product,
  onAddToBag,
}: ProductCardProps) {
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

  return (
    <div className="group flex flex-col justify-between bg-white border border-brand-border/60 rounded-xl overflow-hidden shadow-subtle hover:shadow-elevated transition-all duration-300">
      {/* Product Image Area */}
      <div className="relative w-full aspect-square bg-brand-surface overflow-hidden">
        {primaryImage && (
          <img
            src={primaryImage}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Status / Discount Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
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
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {product.category?.name && (
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-brand-gold">
              {product.category.name}
            </span>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="block mt-1 font-serif text-lg font-semibold text-brand-espresso hover:text-brand-burgundy transition-colors leading-snug"
          >
            {product.name}
          </Link>
          {product.description && (
            <p className="mt-1.5 text-xs text-brand-muted line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-brand-sand/60 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-sans font-bold text-lg text-brand-espresso">
                {formatINR(finalPrice)}
              </span>
              {product.discount_type !== "none" && product.discount_value > 0 && (
                <span className="text-xs text-brand-muted line-through">
                  {formatINR(product.price)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-brand-muted">All inclusive</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isOutOfStock}
            onClick={() => onAddToBag?.(product)}
            className="text-[11px] px-3 py-1.5 border-brand-border hover:bg-brand-cocoa hover:text-brand-cream hover:border-brand-cocoa transition-colors"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Bag"}
          </Button>
        </div>
      </div>
    </div>
  );
}
