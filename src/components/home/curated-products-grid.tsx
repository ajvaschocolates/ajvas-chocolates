import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";

export interface CuratedProductsGridProps {
  products: Product[];
}

export function CuratedProductsGrid({ products }: CuratedProductsGridProps) {
  return (
    <section className="w-full bg-brand-cream py-16 lg:py-24 border-b border-brand-sand/60" id="gifts">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
              Confections &amp; Boxes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-espresso mt-1">
              Curated Selections
            </h2>
          </div>
          <p className="font-sans text-sm text-brand-muted">
            Ready to ship nationwide in careful gift packaging.
          </p>
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
