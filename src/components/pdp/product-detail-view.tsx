"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "./product-gallery";
import { ProductInfo } from "./product-info";
import { ProductActions } from "./product-actions";
import { ProductPackageSpecs } from "./product-package-specs";
import { ProductPincodeChecker } from "./product-pincode-checker";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <div className="w-full py-6 sm:py-10">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-1.5 sm:gap-2 text-xs font-sans text-brand-muted flex-wrap">
            <li>
              <Link
                href="/"
                className="hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-sand" />
            </li>
            <li>
              <Link
                href="/shop"
                className="hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
              >
                Shop
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="w-3.5 h-3.5 text-brand-sand" />
                </li>
                <li>
                  <Link
                    href={`/shop?category=${encodeURIComponent(product.category.id)}`}
                    className="hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
                  >
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-sand" />
            </li>
            <li className="text-brand-espresso font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Main Two-Column PDP Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Product Info & Customer Interactions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <ProductInfo product={product} />

            <ProductActions product={product} />

            <ProductPackageSpecs
              weightGrams={product.weight_grams}
              lengthCm={product.length_cm}
              widthCm={product.width_cm}
              heightCm={product.height_cm}
            />

            <ProductPincodeChecker />
          </div>
        </div>
      </Container>
    </div>
  );
}
