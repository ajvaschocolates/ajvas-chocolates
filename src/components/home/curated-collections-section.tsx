import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";

export interface CuratedCollectionsSectionProps {
  products: Product[];
}

export function CuratedCollectionsSection({ products }: CuratedCollectionsSectionProps) {
  // If no products exist in the database, show clean empty state
  if (!products || products.length === 0) {
    return (
      <section className="w-full bg-brand-surface py-16 lg:py-24 border-b border-brand-sand/60" id="collections">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
                Curated Selections
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-espresso mt-1">
                Gifts they&apos;ll remember
              </h2>
            </div>
            <p className="font-sans text-sm text-brand-muted max-w-md">
              Each assortment is assembled with woven ribbon closures and personalized greetings.
            </p>
          </div>

          <div className="w-full py-16 px-6 rounded-2xl bg-white border border-brand-border/60 text-center shadow-subtle">
            <p className="font-serif text-xl font-semibold text-brand-espresso">
              Catalog updating
            </p>
            <p className="font-sans text-sm text-brand-muted mt-2 max-w-md mx-auto">
              Our seasonal gift hampers and curated confections are currently being prepared. Check back shortly for active curations.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  // If products exist, render them
  return (
    <section className="w-full bg-white py-14 lg:py-20 border-b border-brand-sand/60" id="collections">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy">
              BEST SELLING <span className="text-brand-pink">PRODUCTS</span>
            </h2>
            <p className="font-sans text-sm text-brand-muted mt-1">
              Top-rated treats loved by our customers
            </p>
          </div>
          <div className="flex items-center gap-3 self-end">
            <a href="/shop" className="font-sans text-xs uppercase tracking-widest font-bold text-brand-navy hover:text-brand-pink transition-colors">
              View All →
            </a>
            <div className="flex items-center gap-1.5 ml-2">
              <button aria-label="Previous product" className="w-8 h-8 rounded-full border border-brand-sand flex items-center justify-center text-brand-navy hover:border-brand-pink hover:text-brand-pink transition-colors text-xs font-bold">
                ‹
              </button>
              <button aria-label="Next product" className="w-8 h-8 rounded-full border border-brand-sand flex items-center justify-center text-brand-navy hover:border-brand-pink hover:text-brand-pink transition-colors text-xs font-bold">
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
