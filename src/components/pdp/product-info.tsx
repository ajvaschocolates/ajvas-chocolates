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
        return <Badge variant="cyan">In Stock</Badge>;
      case "low_stock":
        return <Badge variant="amber">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="neutral">Sold Out</Badge>;
      default:
        return null;
    }
  };


  return (
    <div className="flex flex-col gap-4">
      {/* Category Eyebrow & Availability */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {product.category?.name ? (
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#c99d52]">
            {product.category.name}
          </span>
        ) : (
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#a39085]">
            AJVAS Confection
          </span>
        )}
        {renderAvailabilityBadge()}
      </div>

      {/* Main Title */}
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#faf4f0] tracking-tight leading-tight">
        {product.name}
      </h1>

      {/* Price Presentation */}
      <div className="flex items-baseline gap-3 pt-1 pb-2">
        {discountedPrice !== undefined ? (
          <>
            <span className="font-sans text-2xl sm:text-3xl font-bold text-[#faf4f0]">
              ₹{discountedPrice.toLocaleString("en-IN")}
            </span>
            <span className="font-sans text-base sm:text-lg text-[#a39085] line-through">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <span className="font-sans text-xs font-semibold px-2.5 py-1 rounded-full bg-[#3d101e] border border-[#fb0b88]/30 text-[#fb0b88]">
              {product.discount_type === "percentage"
                ? `${product.discount_value}% OFF`
                : `₹${product.discount_value} OFF`}
            </span>
          </>
        ) : (
          <span className="font-sans text-2xl sm:text-3xl font-bold text-[#faf4f0]">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#3d1c12]" />

      {/* Product Description */}
      {product.description && product.description.trim().length > 0 && (
        <div className="text-[#d1c2b9] font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {product.description}
        </div>
      )}
    </div>
  );
}
