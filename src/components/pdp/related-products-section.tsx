"use client";

import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";

interface RelatedProductsSectionProps {
  products?: Product[];
}

export function RelatedProductsSection({ products }: RelatedProductsSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#190906] py-12 sm:py-16 border-t border-[#3d1c12]/80">
      <Container>
        <div className="mb-8 sm:mb-10 flex flex-col items-start sm:items-center text-left sm:text-center">
          <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#fb0b88] block mb-2">
            Curated Selection
          </span>
          <h2 className="font-pally text-2xl sm:text-3xl text-[#faf4f0] font-semibold">
            Curated Confections You May Also Love
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#d0c4b8]/70 mt-1.5 max-w-lg">
            Explore complementing artisanal hampers and handcrafted chocolate collections.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 justify-center">
          {products.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
