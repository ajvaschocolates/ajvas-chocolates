"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { ProductGallery } from "./product-gallery";
import { ProductInfo } from "./product-info";
import { ProductActions } from "./product-actions";
import { ProductPackageSpecs } from "./product-package-specs";
import { ProductDeliveryEstimate } from "./product-delivery-estimate";

interface ProductDetailViewProps {
  product: Product;
}

const crumbLink =
  "hover:text-[#fb0b88] transition-colors focus-visible:outline-none rounded-sm";

const sectionLabel =
  "mb-2 font-pally text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9b8ab]/70";

export function ProductDetailView({ product }: ProductDetailViewProps) {
  return (
    <section className="relative w-full overflow-hidden [&_*]:!border-0 [&_*]:!ring-0 bg-[#260403] pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 text-[#faf4f0]">
      {/* Background: deep maroon with a soft warm glow behind the product image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_55%,#5a1a10_0%,#3a0b07_35%,#260403_65%,#190201_100%)]"
      />

      <Container>
        <div className="relative">
          {/* Breadcrumbs - hidden on mobile */}
          <nav aria-label="Breadcrumb" className="hidden sm:block mb-6 sm:mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-sans text-[10px] uppercase tracking-[0.16em] text-[#d9b8ab]/70">
              <li>
                <Link href="/" className={crumbLink}>
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-[#7a3a2c]" />
              </li>
              <li>
                <Link href="/shop" className={crumbLink}>
                  Shop
                </Link>
              </li>
              {product.category && (
                <>
                  <li aria-hidden="true">
                    <ChevronRight className="h-3.5 w-3.5 text-[#7a3a2c]" />
                  </li>
                  <li>
                    <Link
                      href={`/shop?category=${encodeURIComponent(product.category.id)}`}
                      className={crumbLink}
                    >
                      {product.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-[#7a3a2c]" />
              </li>
              <li
                className="max-w-[200px] truncate font-semibold text-[#faf4f0] sm:max-w-xs"
                aria-current="page"
              >
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Two columns: image left (col-span-7), compact details right (col-span-5) */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: Product Image Gallery */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-sm">
                <ProductGallery images={product.images} productName={product.name} />
              </div>
            </div>

            {/* Right: Info, specs, quantity + buttons, delivery */}
            <div className="flex flex-col gap-4 lg:col-span-5 lg:max-w-md">
              <ProductInfo product={product} />

              {Boolean(product.length_cm && product.width_cm && product.height_cm) && (
                <div>
                  <h2 className={sectionLabel}>Package Details</h2>
                  <ProductPackageSpecs
                    lengthCm={product.length_cm}
                    widthCm={product.width_cm}
                    heightCm={product.height_cm}
                  />
                </div>
              )}

              <ProductActions product={product} />

              <div>
                <h2 className={sectionLabel}>Delivery</h2>
                <ProductDeliveryEstimate />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}