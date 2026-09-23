import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";

export interface CuratedProductsGridProps {
  products: Product[];
}

export function CuratedProductsGrid({ products }: CuratedProductsGridProps) {
  return (
    <section className="w-full bg-[#fdf8f5] py-14 lg:py-20 border-b border-brand-sand/60" id="gifts">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy">
              Curated Selections
            </h2>
            <p className="font-sans text-sm text-brand-muted mt-1 font-medium">
              Handpicked favorites for every chocolate lover
            </p>
          </div>
          <div className="flex items-center gap-3 self-end">
            <a href="/shop" className="font-sans text-xs uppercase tracking-widest font-bold text-brand-navy hover:text-brand-pink transition-colors">
              View All →
            </a>
            <div className="flex items-center gap-1.5 ml-2">
              <button aria-label="Previous product" className="w-8 h-8 rounded-full border border-brand-sand flex items-center justify-center text-brand-navy hover:border-brand-pink hover:text-brand-pink transition-colors text-xs font-bold bg-white">
                ‹
              </button>
              <button aria-label="Next product" className="w-8 h-8 rounded-full border border-brand-sand flex items-center justify-center text-brand-navy hover:border-brand-pink hover:text-brand-pink transition-colors text-xs font-bold bg-white">
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid or Explicit Empty State */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="w-full py-16 px-6 rounded-2xl bg-brand-surface border border-brand-border/60 text-center shadow-subtle">
            <p className="font-serif text-xl font-semibold text-brand-espresso">
              No products currently available
            </p>
            <p className="font-sans text-sm text-brand-muted mt-2 max-w-md mx-auto">
              Our confectionery catalog is currently being updated. Active batches will appear here as soon as they are published.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
