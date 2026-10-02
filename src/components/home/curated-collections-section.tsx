"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatINR } from "@/lib/utils";

export interface CuratedCollectionsSectionProps {
  products: Product[];
  /** Background photo for the "Popular in our shop" tile */
  promoImage?: string;
}

const FALLBACK_IMAGE =
  "/trolly.png";

/* ─── White product card: image on top, centered name + price below ─── */
function ProductCard({
  product,
  badgeText,
  className = "",
}: {
  product: Product;
  badgeText?: string;
  className?: string;
}) {
  const cart = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const primaryImage = product.images?.[0]?.image_url || FALLBACK_IMAGE;
  const imageAlt = product.images?.[0]?.alt_text || product.name;

  let finalPrice = product.price;
  if (product.discount_type === "percentage" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - (product.price * product.discount_value) / 100);
  } else if (product.discount_type === "fixed" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - product.discount_value);
  }

  const isOutOfStock = product.availability === "out_of_stock";
  const hasDiscount = product.discount_type !== "none" && product.discount_value > 0;

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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    cart.addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className={`group flex flex-col bg-white rounded-sm overflow-hidden ${className}`}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {computedBadge && (
          <span
            className={`absolute top-2 left-2 z-10 inline-block font-sans text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm text-white shadow-sm ${computedBadge.includes("OFF") ? "bg-[#fb0b88]" : "bg-[#c99d52]"
              }`}
          >
            {computedBadge}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          aria-label="Add to wishlist"
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-[#fb0b88] text-[#fb0b88]" : "text-[#3a2a26]"}`} />
        </button>

        {/* Mobile: small cart icon at the bottom-right of the image */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAdd}
          aria-label={isOutOfStock ? "Sold out" : isAdded ? "Added to cart" : "Add to cart"}
          className={`sm:hidden absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-colors ${isOutOfStock
            ? "bg-stone-700/90 cursor-not-allowed"
            : isAdded
              ? "bg-emerald-600"
              : "bg-[#fb0b88]"
            }`}
        >
          {isAdded ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>

        {/* Desktop: bar slides up over the image on hover */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAdd}
          className={`hidden sm:flex absolute inset-x-0 bottom-0 z-10 items-center justify-center gap-2 py-2.5 font-sans text-[10px] uppercase tracking-wider font-bold text-white transition-transform duration-300 translate-y-full group-hover:translate-y-0 focus-visible:translate-y-0 ${isOutOfStock
            ? "bg-stone-700/90 cursor-not-allowed"
            : isAdded
              ? "bg-emerald-600"
              : "bg-[#fb0b88] hover:bg-[#d90974]"
            }`}
        >
          {isOutOfStock ? (
            "Sold out"
          ) : isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" /> Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" /> Add to cart
            </>
          )}
        </button>
      </div>

      {/* Name + price */}
      <div className="flex flex-col items-center text-center gap-1.5 px-3 py-4 sm:py-5">
        <Link
          href={`/products/${product.slug}`}
          className="font-sans text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#2a1a16] hover:text-[#fb0b88] transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="font-sans text-sm sm:text-base font-extrabold text-[#2a1a16]">
            {formatINR(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="font-sans text-xs text-[#2a1a16]/45 line-through">
              {formatINR(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── "Popular in our shop" promo tile ─── */
function PromoTile({ image }: { image: string }) {
  return (
    <div className="relative col-span-2 lg:col-span-1 min-h-[200px] rounded-sm overflow-hidden flex flex-col items-center justify-center text-center p-6">
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[#5a3d38]/40" />
      <h3 className="relative font-heading text-xl sm:text-2xl uppercase tracking-wide text-white leading-snug">
        Popular in
        <br />
        our shop
      </h3>
 
    </div>
  );
}

/* ─── Demo data (used only when no products are passed) ─── */
const now = new Date().toISOString();

function demoProduct(
  n: number,
  categoryId: string,
  name: string,
  slug: string,
  description: string,
  price: number,
  weight: number,
  imageUrl: string,
  discountPercent = 0
): Product {
  return {
    id: `demo-${n}`,
    category_id: categoryId,
    name,
    slug,
    description,
    price,
    discount_type: discountPercent > 0 ? "percentage" : "none",
    discount_value: discountPercent,
    status: "active",
    availability: "in_stock",
    weight_grams: weight,
    length_cm: null,
    width_cm: null,
    height_cm: null,
    created_at: now,
    updated_at: now,
    images: [
      {
        id: `img-${n}`,
        product_id: `demo-${n}`,
        cloudinary_public_id: "",
        image_url: imageUrl,
        alt_text: name,
        sort_order: 0,
        created_at: "",
        updated_at: "",
      },
    ],
  } as Product;
}

const fallbackProducts: Product[] = [
  demoProduct(1, "cat-1", "Mini Bites Assorted Pack", "mini-bites-assorted-pack", "A luxury assortment of artisanal chocolates.", 450, 350, "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop"),
  demoProduct(2, "cat-2", "Dry Fruit Delight Box", "dry-fruit-delight-box", "Rich dark cocoa truffles handcrafted with single-origin chocolate.", 2000, 250, "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=600&auto=format&fit=crop", 10),
  demoProduct(3, "cat-1", "Classic Truffle Collection", "classic-truffle-collection", "Ultimate celebration hamper with assorted barks and bonbons.", 699, 750, "https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=600&auto=format&fit=crop"),
  demoProduct(4, "cat-3", "The Grand Velvet Hamper", "festive-gift-hamper", "Selected confections packaged with woven ribbons and greeting card.", 3450, 400, "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=600&auto=format&fit=crop"),
];

/* ─── Section ─── */
export function CuratedCollectionsSection({
  products,
  promoImage = FALLBACK_IMAGE,
}: CuratedCollectionsSectionProps) {
  const displayProducts = products && products.length > 0 ? products.slice(0, 4) : fallbackProducts;
  const badges = ["BESTSELLER", undefined, undefined, "NEW"];

  return (
    <section className="w-full bg-black py-8 sm:py-16 lg:py-16" id="best-sellers">
      <Container>
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl text-[#faf4f0]">
            Best Selling{" "}
            <span className="font-heading font-normal text-amber-200">Products</span>
          </h2>
          <p className="font-subtitle text-xs sm:text-xl text-[#ffffe3] mt-2 font-normal tracking-wide">
            Our customers&apos; favourite chocolates, loved for their taste and quality.
          </p>
        </div>

        {/* Desktop: promo tile + 3 products in one row. Mobile: promo on top, 2x2 products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <PromoTile image={promoImage} />
          {displayProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              badgeText={badges[idx]}
              className={idx === 3 ? "lg:hidden" : ""}
            />
          ))}
        </div>

        {/* Bottom Center "View All Products" Button */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <Link href="/shop" className="inline-flex justify-center">
            <Button
              variant="primary"
              size="lg"
              className="gap-2 bg-[#fb0b88] hover:bg-[#d90974] text-white font-pally !text-sm uppercase tracking-wider  rounded-full px-7 sm:px-8 py-3 shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <span>View All Products</span>
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}