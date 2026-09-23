"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  X, 
  SearchX, 
  Check, 
  ArrowUpDown, 
  ChevronDown, 
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { Product, Category } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { PincodeCheckerSection } from "@/components/home/pincode-checker-section";
import { formatINR } from "@/lib/utils";

export interface ShopCollectionsClientProps {
  initialCategories: Category[];
  initialProducts: Product[];
  error?: string | null;
}

export function ShopCollectionsClient({
  initialCategories,
  initialProducts,
  error,
}: ShopCollectionsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Close modal on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && quickViewProduct) {
        setQuickViewProduct(null);
      }
    },
    [quickViewProduct]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Check if any filter is active
  const hasActiveFilters =
    selectedCategory !== "all" ||
    priceRange !== "all" ||
    inStockOnly ||
    sortBy !== "featured";

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setPriceRange("all");
    setInStockOnly(false);
    setSortBy("featured");
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category_id === selectedCategory);
    }

    // Price filter
    if (priceRange === "under-1000") {
      result = result.filter((p) => p.price < 1000);
    } else if (priceRange === "1000-2500") {
      result = result.filter((p) => p.price >= 1000 && p.price <= 2500);
    } else if (priceRange === "above-2500") {
      result = result.filter((p) => p.price > 2500);
    }

    // Availability filter
    if (inStockOnly) {
      result = result.filter((p) => p.availability !== "out_of_stock");
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return result;
  }, [initialProducts, selectedCategory, priceRange, inStockOnly, sortBy]);

  return (
    <div className="w-full bg-brand-cream min-h-screen">
      {/* 1. Editorial Header Section */}
      <section className="w-full pt-6 pb-5 sm:pt-8 sm:pb-6 border-b border-brand-sand/60 bg-brand-cream">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold mb-1.5 block">
                Chocolate Gifting
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso tracking-tight">
                Shop &amp; Collections
              </h1>
              <p className="font-sans text-sm sm:text-base text-brand-muted mt-1.5 leading-relaxed">
                Explore chocolate gift hampers, keepsake boxes, and curated confections for celebrations and memorable moments.
              </p>
            </div>

            <div className="flex items-center gap-2 text-brand-muted text-xs sm:text-sm font-sans self-start md:self-end bg-brand-surface px-3 py-1.5 rounded-lg border border-brand-border/60">
              <CheckCircle className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Delivery availability is checked by destination pincode</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Error State (Server / Query Failure) */}
      {error && (
        <section className="py-8 sm:py-12">
          <Container>
            <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-white rounded-2xl border border-brand-border/60 shadow-subtle">
              <h2 className="font-serif text-2xl font-bold text-brand-espresso mb-2">
                We couldn&apos;t load the collection
              </h2>
              <p className="font-sans text-sm text-brand-muted mb-6">
                Please try again.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                Try Again
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* 3. Empty Catalog State (Production Baseline: 0 records in Supabase) */}
      {!error && initialProducts.length === 0 && (
        <section className="py-8 sm:py-12">
          <Container>
            <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-white rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-brand-surface flex items-center justify-center text-brand-gold mb-3.5 border border-brand-sand">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-espresso mb-1.5">
                Catalog updating
              </h2>
              <p className="font-sans text-xs sm:text-sm text-brand-muted max-w-xs mb-6 leading-relaxed">
                Our collection is currently being updated. Please check back soon.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center font-sans uppercase tracking-wider font-semibold text-xs px-6 py-3 min-h-[44px] bg-brand-cocoa text-brand-cream hover:bg-brand-espresso active:bg-black rounded shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy focus-visible:ring-offset-2"
              >
                Return to Home
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* 4. Populated Catalog Experience */}
      {!error && initialProducts.length > 0 && (
        <>
          {/* Category Navigation Pills & Counter */}
          <section className="w-full pt-6 pb-2">
            <Container>
              <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6 py-2">
                <nav
                  aria-label="Category filter"
                  className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`min-h-[44px] px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                      selectedCategory === "all"
                        ? "bg-brand-pink text-white shadow-md"
                        : "bg-white hover:bg-brand-pink-light text-brand-navy border border-brand-sand"
                    }`}
                  >
                    All Confections
                  </button>

                  {initialCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`min-h-[44px] px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                        selectedCategory === cat.id
                          ? "bg-brand-pink text-white shadow-md"
                          : "bg-white hover:bg-brand-pink-light text-brand-navy border border-brand-sand"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>

                <div className="font-sans text-xs sm:text-sm text-brand-muted font-medium flex items-center gap-2 ml-auto sm:ml-0">
                  <span className="w-2 h-2 rounded-full bg-accent-rose inline-block" />
                  <span>{filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}</span>
                </div>
              </div>
            </Container>
          </section>

          {/* Horizontal Filter & Sort Bar */}
          <section className="w-full pb-8">
            <Container>
              <div className="bg-white rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-brand-border/60 shadow-subtle">
                <div className="flex flex-wrap items-center gap-3 flex-grow">
                  {/* Price Filter Dropdown */}
                  <div className="relative inline-block">
                    <label htmlFor="filter-price" className="sr-only">
                      Filter by Price
                    </label>
                    <select
                      id="filter-price"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="appearance-none min-h-[44px] bg-brand-surface text-brand-espresso font-sans text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-lg border border-brand-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy cursor-pointer hover:bg-brand-sand/50 transition-colors font-medium"
                    >
                      <option value="all">All Prices</option>
                      <option value="under-1000">Under ₹1,000</option>
                      <option value="1000-2500">₹1,000 – ₹2,500</option>
                      <option value="above-2500">Above ₹2,500</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted" />
                  </div>

                  {/* Availability Toggle */}
                  <button
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-lg font-sans text-xs sm:text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy ${
                      inStockOnly
                        ? "bg-brand-cocoa text-brand-cream border-brand-cocoa"
                        : "bg-brand-surface text-brand-espresso border-brand-border/60 hover:bg-brand-sand/50"
                    }`}
                  >
                    <Check className={`w-4 h-4 ${inStockOnly ? "text-brand-gold" : "text-brand-muted"}`} />
                    <span>In Stock Only</span>
                  </button>

                  {/* Clear Filters Action */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="min-h-[44px] flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider font-semibold text-brand-burgundy hover:text-brand-espresso px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-2 ml-auto">
                  <label htmlFor="filter-sort" className="font-sans text-xs sm:text-sm text-brand-muted font-medium hidden sm:inline">
                    Sort:
                  </label>
                  <div className="relative inline-block">
                    <select
                      id="filter-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none min-h-[44px] bg-brand-surface text-brand-espresso font-sans text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-lg border border-brand-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy cursor-pointer hover:bg-brand-sand/50 transition-colors font-medium"
                    >
                      <option value="featured">Featured Curations</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                    <ArrowUpDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-muted" />
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Product Grid / Filter-Empty State */}
          <section className="w-full pb-16 lg:pb-24">
            <Container>
              {filteredProducts.length === 0 ? (
                <div className="w-full py-16 px-6 text-center bg-white rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center text-brand-muted mb-4">
                    <SearchX className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-brand-espresso mb-2">
                    No chocolates found
                  </h3>
                  <p className="font-sans text-sm text-brand-muted max-w-md mb-6 leading-relaxed">
                    We couldn&apos;t find any curations matching your current selection. Try resetting filters to explore our full collection.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleResetFilters}
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
              )}
            </Container>
          </section>

          {/* 5. Occasion Discovery Bar (Authoritative Stitch Gifting by Occasion) */}
          <section className="w-full bg-brand-surface py-12 lg:py-16 border-t border-brand-sand/60">
            <Container>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold block mb-1">
                    Tailored Selection
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-brand-espresso tracking-tight">
                    Gifting by Occasion
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-brand-sand/80 text-brand-espresso font-sans text-xs sm:text-sm font-semibold transition-colors shadow-subtle border border-brand-border/40 inline-flex items-center"
                  >
                    Birthdays
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-brand-sand/80 text-brand-espresso font-sans text-xs sm:text-sm font-semibold transition-colors shadow-subtle border border-brand-border/40 inline-flex items-center"
                  >
                    Anniversaries
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-brand-sand/80 text-brand-espresso font-sans text-xs sm:text-sm font-semibold transition-colors shadow-subtle border border-brand-border/40 inline-flex items-center"
                  >
                    Weddings &amp; Favours
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-brand-sand/80 text-brand-espresso font-sans text-xs sm:text-sm font-semibold transition-colors shadow-subtle border border-brand-border/40 inline-flex items-center"
                  >
                    Corporate Gifting
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-brand-sand/80 text-brand-espresso font-sans text-xs sm:text-sm font-semibold transition-colors shadow-subtle border border-brand-border/40 inline-flex items-center"
                  >
                    Tokens of Gratitude
                  </Link>
                </div>
              </div>
            </Container>
          </section>

          {/* 6. Pincode Delivery Module */}
          <PincodeCheckerSection />
        </>
      )}

      {/* 7. Quick View Modal (Accessible Dialog) */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          className="fixed inset-0 z-50 bg-brand-espresso/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setQuickViewProduct(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated border border-brand-border/60 flex flex-col md:flex-row gap-6 relative">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close product quick view"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-sand flex items-center justify-center text-brand-muted hover:text-brand-espresso transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="w-full md:w-1/2 aspect-[4/5] bg-brand-surface rounded-xl overflow-hidden">
              <img
                src={quickViewProduct.images?.[0]?.image_url || "/images/placeholder-confection.jpg"}
                alt={quickViewProduct.images?.[0]?.alt_text || quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modal Content */}
            <div className="w-full md:w-1/2 flex flex-col justify-between gap-4">
              <div>
                {quickViewProduct.category?.name && (
                  <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
                    {quickViewProduct.category.name}
                  </span>
                )}
                <h3
                  id="quick-view-title"
                  className="font-serif text-2xl font-bold text-brand-espresso mt-1"
                >
                  {quickViewProduct.name}
                </h3>
                <p className="font-sans text-xl font-bold text-brand-espresso mt-2">
                  {formatINR(quickViewProduct.price)}
                </p>
                {quickViewProduct.description && (
                  <p className="font-sans text-sm text-brand-muted mt-3 leading-relaxed">
                    {quickViewProduct.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-brand-sand/60 flex flex-col gap-2.5">
                <Link
                  href={`/products/${quickViewProduct.slug}`}
                  className="w-full"
                  onClick={() => setQuickViewProduct(null)}
                >
                  <Button variant="primary" size="md" className="w-full gap-2">
                    <span>View Product Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full"
                >
                  Continue Browsing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
