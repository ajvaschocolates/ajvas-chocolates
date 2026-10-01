import { Product } from "@/types/catalog";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  product: Product;
}

function calculateDiscountedPrice(
  price: number,
  discountType: "none" | "percentage" | "fixed",
  discountValue: number
): number | undefined {
  if (discountType === "percentage" && discountValue > 0) {
    return Math.max(0, Math.round(price * (1 - discountValue / 100)));
  }
  if (discountType === "fixed" && discountValue > 0) {
    return Math.max(0, price - discountValue);
  }
  return undefined;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const discountedPrice = calculateDiscountedPrice(
    product.price,
    product.discount_type,
    product.discount_value
  );

  const renderAvailabilityBadge = () => {
    switch (product.availability) {
      case "in_stock":
        return <Badge variant="cyan" className="rounded-sm">In Stock</Badge>;
      case "low_stock":
        return <Badge variant="amber" className="rounded-sm">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="neutral" className="rounded-sm">Sold Out</Badge>;
      default:
        return null;
    }
  };


  return (
    <div className="flex flex-col gap-3">
      {/* Category Eyebrow & Availability */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {product.category?.name ? (
          <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[#c99d52]">
            {product.category.name}
          </span>
        ) : (
          <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[#a39085]">
            AJVAS Confection
          </span>
        )}
        {renderAvailabilityBadge()}
      </div>

      {/* Main Title */}
      <h1 className="font-pally text-xl sm:text-2xl lg:text-[26px] text-[#faf4f0] tracking-tight leading-snug">
        {product.name}
      </h1>

      {/* Price Presentation */}
      <div className="flex items-baseline gap-2.5 pt-0.5 pb-1">
        {discountedPrice !== undefined ? (
          <>
            <span className="font-sans text-xl sm:text-2xl font-bold text-[#faf4f0]">
              ₹{discountedPrice.toLocaleString("en-IN")}
            </span>
            <span className="font-sans text-sm sm:text-base text-[#a39085] line-through">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-[#3d101e] border border-[#fb0b88]/30 text-[#fb0b88]">
              {product.discount_type === "percentage"
                ? `${product.discount_value}% OFF`
                : `₹${product.discount_value} OFF`}
            </span>
          </>
        ) : (
          <span className="font-sans text-xl sm:text-2xl text-[#faf4f0]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#3d1c12]" />

      {/* Product Description */}
      {product.description && product.description.trim().length > 0 && (
        <div className="text-[#d1c2b9] font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-line">
          {product.description}
        </div>
      )}
    </div>
  );
}
