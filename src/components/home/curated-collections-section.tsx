"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";

export interface CuratedCollectionsSectionProps {
  products: Product[];
}

export function CuratedCollectionsSection({ products }: CuratedCollectionsSectionProps) {
  const [scrollIndex, setScrollIndex] = useState(0);

  // If no products exist in database, display fallback curated items
  const fallbackProducts: Product[] = [
    {
      id: "demo-1",
      category_id: "cat-1",
      name: "Mini Bites Assorted Pack",
      slug: "mini-bites-assorted-pack",
      description: "A luxury assortment of artisanal chocolates in custom keepsake presentation.",
      price: 450,
      discount_type: "none",
      discount_value: 0,
      status: "active",
      availability: "in_stock",
      weight_grams: 350,
      length_cm: null,
      width_cm: null,
      height_cm: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        {
          id: "img-1",
          product_id: "demo-1",
          cloudinary_public_id: "",
          image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop",
          alt_text: "Mini Bites Assorted Pack",
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
      ],
    },
    {
      id: "demo-2",
      category_id: "cat-2",
      name: "Dry Fruit Delight Box",
      slug: "dry-fruit-delight-box",
      description: "Rich dark cocoa truffles handcrafted with single-origin chocolate.",
      price: 820,
      discount_type: "none",
      discount_value: 0,
      status: "active",
      availability: "in_stock",
      weight_grams: 250,
      length_cm: null,
      width_cm: null,
      height_cm: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        {
          id: "img-2",
          product_id: "demo-2",
          cloudinary_public_id: "",
          image_url: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=600&auto=format&fit=crop",
          alt_text: "Dry Fruit Delight Box",
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
      ],
    },
    {
      id: "demo-3",
      category_id: "cat-1",
      name: "Classic Truffle Collection",
      slug: "classic-truffle-collection",
      description: "Ultimate celebration hamper with assorted barks, bonbons, and roasted nuts.",
      price: 699,
      discount_type: "none",
      discount_value: 0,
      status: "active",
      availability: "in_stock",
      weight_grams: 750,
      length_cm: null,
      width_cm: null,
      height_cm: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        {
          id: "img-3",
          product_id: "demo-3",
          cloudinary_public_id: "",
          image_url: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=600&auto=format&fit=crop",
          alt_text: "Classic Truffle Collection",
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
      ],
    },
    {
      id: "demo-4",
      category_id: "cat-3",
      name: "Festive Gift Hamper",
      slug: "festive-gift-hamper",
      description: "Selected confections packaged with woven ribbons and greeting card.",
      price: 1299,
      discount_type: "none",
      discount_value: 0,
      status: "active",
      availability: "in_stock",
      weight_grams: 400,
      length_cm: null,
      width_cm: null,
      height_cm: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: [
        {
          id: "img-4",
          product_id: "demo-4",
          cloudinary_public_id: "",
          image_url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=600&auto=format&fit=crop",
          alt_text: "Festive Gift Hamper",
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
      ],
    },
  ];

  const displayProducts = products && products.length > 0 ? products : fallbackProducts;

  const handlePrev = () => {
    setScrollIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex((prev) => Math.min(displayProducts.length - 4, prev + 1));
  };

  return (
    <section className="w-full bg-[#140b07] py-14 sm:py-16 lg:py-20 border-b border-[#2d1810]" id="best-sellers">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#faf4f0]">
              Best Selling{" "}
              <span className="font-serif italic font-normal text-[#fb0b88]">
                Products
              </span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#d0c4b8]/80 mt-1 font-normal">
              Our customers&apos; favourite chocolates, loved for their taste and quality.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-end">
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-widest font-bold text-amber-200 hover:text-[#fb0b88] transition-colors"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4 text-[#fb0b88]" />
            </Link>

            {/* Carousel Arrows (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={scrollIndex === 0}
                aria-label="Previous products"
                className="w-8 h-8 rounded-full border border-[#3d1c12] bg-[#20100a] flex items-center justify-center text-[#faf4f0] hover:border-[#fb0b88] hover:text-[#fb0b88] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={scrollIndex >= displayProducts.length - 4}
                aria-label="Next products"
                className="w-8 h-8 rounded-full border border-[#3d1c12] bg-[#20100a] flex items-center justify-center text-[#faf4f0] hover:border-[#fb0b88] hover:text-[#fb0b88] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid - 2 columns on Mobile, 4 columns on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayProducts.slice(0, 4).map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              badgeText={
                idx === 0 ? "BESTSELLER" : idx === 1 ? "20% OFF" : idx === 3 ? "NEW" : undefined
              }
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
