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
import { formatINR } from "@/lib/utils";

export interface ShopCollectionsClientProps {
  initialCategories: Category[];
  initialProducts: Product[];
  initialCategory?: string | null;
  error?: string | null;
}

export function ShopCollectionsClient({
  initialCategories,
  initialProducts,
  initialCategory,
  error,
}: ShopCollectionsClientProps) {
  const resolveCatId = useCallback(
    (param?: string | null) => {
      if (!param || param === "all") return "all";
      const match = initialCategories.find(
        (c) =>
          c.id === param ||
          c.name.toLowerCase() === param.toLowerCase() ||
          c.name.toLowerCase().replace(/\s+/g, "-") === param.toLowerCase()
      );
      return match ? match.id : param;
    },
    [initialCategories]
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(() =>
    resolveCatId(initialCategory)
  );

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(resolveCatId(initialCategory));
    }
  }, [initialCategory, resolveCatId]);

  const [priceRange, setPriceRange] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleCategorySelect = useCallback((catId: string) => {
    setSelectedCategory(catId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (catId === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", catId);
      }
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

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
    handleCategorySelect("all");
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
    <div className="w-full bg-[#120805] text-[#faf4f0] min-h-screen">
      {/* 1. Editorial Header Section */}
      <section className="w-full pt-8 pb-6 border-b border-[#2d1810] bg-[#120805]">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="font-sans text-xs uppercase tracking-widest text-amber-200 font-bold mb-2 block">
                Chocolate Gifting
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#faf4f0] tracking-tight">
                Shop &amp; Collections
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#d0c4b8]/80 mt-2 leading-relaxed">
                Explore chocolate gift hampers, keepsake boxes, and curated confections for celebrations and memorable moments.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[#d0c4b8]/80 text-xs sm:text-sm font-sans self-start md:self-end bg-[#1b0e0a] px-3.5 py-2 rounded-lg border border-[#3d1c12]">
              <CheckCircle className="w-4 h-4 text-amber-200 shrink-0" />
              <span>Pan-India courier delivery available</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Error State (Server / Query Failure) */}
      {error && (
        <section className="py-8 sm:py-12">
          <Container>
            <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-[#1f110c] rounded-2xl border border-[#3d1c12] shadow-xl">
              <h2 className="font-serif text-2xl font-bold text-[#faf4f0] mb-2">
                We couldn&apos;t load the collection
              </h2>
              <p className="font-sans text-sm text-[#d0c4b8]/80 mb-6">
                Please try again.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto bg-[#fb0b88] hover:bg-[#d90974] text-white font-bold rounded-full px-6 py-2.5"
              >
                Try Again
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* 3. Empty Catalog State */}
      {!error && initialProducts.length === 0 && (
        <section className="py-8 sm:py-12">
          <Container>
            <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-[#1f110c] rounded-2xl border border-[#3d1c12] shadow-xl flex flex-col items-center">
              <div className="w-11 h-11 rounded-full bg-[#2a140d] flex items-center justify-center text-amber-200 mb-3.5 border border-[#3d1c12]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#faf4f0] mb-1.5">
                Catalog updating
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#d0c4b8]/80 max-w-xs mb-6 leading-relaxed">
                Our collection is currently being updated. Please check back soon.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center font-sans uppercase tracking-wider font-semibold text-xs px-6 py-3 min-h-[44px] bg-[#fb0b88] hover:bg-[#d90974] text-white rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
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
                    onClick={() => handleCategorySelect("all")}
                    className={`min-h-[44px] px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
                      selectedCategory === "all"
                        ? "bg-[#fb0b88] text-white shadow-md"
                        : "bg-[#1b0e0a] hover:bg-[#2d1810] text-[#faf4f0] border border-[#3d1c12]"
                    }`}
                  >
                    All Confections
                  </button>

                  {initialCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`min-h-[44px] px-5 py-2 rounded-full font-sans text-xs uppercase tracking-wider font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
                        selectedCategory === cat.id
                          ? "bg-[#fb0b88] text-white shadow-md"
                          : "bg-[#1b0e0a] hover:bg-[#2d1810] text-[#faf4f0] border border-[#3d1c12]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>

                <div className="font-sans text-xs sm:text-sm text-[#d0c4b8]/80 font-medium flex items-center gap-2 ml-auto sm:ml-0">
                  <span className="w-2 h-2 rounded-full bg-[#fb0b88] inline-block" />
                  <span>{filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}</span>
                </div>
              </div>
            </Container>
          </section>

          {/* Horizontal Filter & Sort Bar */}
          <section className="w-full pb-8">
            <Container>
              <div className="bg-[#1f110c] rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-[#3d1c12] shadow-md">
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
                      className="appearance-none min-h-[44px] bg-[#140b07] text-[#faf4f0] font-sans text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-lg border border-[#3d1c12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] cursor-pointer hover:border-amber-200/50 transition-colors font-medium"
                    >
                      <option value="all">All Prices</option>
                      <option value="under-1000">Under ₹1,000</option>
                      <option value="1000-2500">₹1,000 – ₹2,500</option>
                      <option value="above-2500">Above ₹2,500</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-200" />
                  </div>

                  {/* Availability Toggle */}
                  <button
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-lg font-sans text-xs sm:text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
                      inStockOnly
                        ? "bg-[#fb0b88] text-white border-[#fb0b88]"
                        : "bg-[#140b07] text-[#faf4f0] border-[#3d1c12] hover:border-amber-200/50"
                    }`}
                  >
                    <Check className={`w-4 h-4 ${inStockOnly ? "text-white" : "text-amber-200"}`} />
                    <span>In Stock Only</span>
                  </button>

                  {/* Clear Filters Action */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="min-h-[44px] flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider font-semibold text-amber-200 hover:text-[#fb0b88] px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] rounded"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-2 ml-auto">
                  <label htmlFor="filter-sort" className="font-sans text-xs sm:text-sm text-[#d0c4b8]/70 font-medium hidden sm:inline">
                    Sort:
                  </label>
                  <div className="relative inline-block">
                    <select
                      id="filter-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none min-h-[44px] bg-[#140b07] text-[#faf4f0] font-sans text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-lg border border-[#3d1c12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] cursor-pointer hover:border-amber-200/50 transition-colors font-medium"
                    >
                      <option value="featured">Featured Curations</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                    <ArrowUpDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-200" />
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Product Grid / Filter-Empty State */}
          <section className="w-full pb-16 lg:pb-24">
            <Container>
              {filteredProducts.length === 0 ? (
                <div className="w-full py-16 px-6 text-center bg-[#1f110c] rounded-2xl border border-[#3d1c12] shadow-xl flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#2d1810] flex items-center justify-center text-amber-200 mb-4">
                    <SearchX className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#faf4f0] mb-2">
                    No chocolates found
                  </h3>
                  <p className="font-sans text-sm text-[#d0c4b8]/80 max-w-md mb-6 leading-relaxed">
                    We couldn&apos;t find any curations matching your current selection. Try resetting filters to explore our full collection.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleResetFilters}
                    className="bg-[#fb0b88] hover:bg-[#d90974] text-white font-bold rounded-full px-6 py-2.5"
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

          {/* 5. Occasion Discovery Bar */}
          <section className="w-full bg-[#160c08] py-12 lg:py-16 border-t border-[#2d1810]">
            <Container>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="font-sans text-xs uppercase tracking-widest text-amber-200 font-bold block mb-1">
                    Tailored Selection
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf4f0] tracking-tight">
                    Gifting by Occasion
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#1f110c] hover:bg-[#2d1810] text-[#faf4f0] font-sans text-xs sm:text-sm font-semibold transition-colors shadow-sm border border-[#3d1c12] inline-flex items-center hover:text-amber-200"
                  >
                    Birthdays
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#1f110c] hover:bg-[#2d1810] text-[#faf4f0] font-sans text-xs sm:text-sm font-semibold transition-colors shadow-sm border border-[#3d1c12] inline-flex items-center hover:text-amber-200"
                  >
                    Anniversaries
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#1f110c] hover:bg-[#2d1810] text-[#faf4f0] font-sans text-xs sm:text-sm font-semibold transition-colors shadow-sm border border-[#3d1c12] inline-flex items-center hover:text-amber-200"
                  >
                    Weddings &amp; Favours
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#1f110c] hover:bg-[#2d1810] text-[#faf4f0] font-sans text-xs sm:text-sm font-semibold transition-colors shadow-sm border border-[#3d1c12] inline-flex items-center hover:text-amber-200"
                  >
                    Corporate Gifting
                  </Link>
                  <Link
                    href="/#occasions"
                    className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#1f110c] hover:bg-[#2d1810] text-[#faf4f0] font-sans text-xs sm:text-sm font-semibold transition-colors shadow-sm border border-[#3d1c12] inline-flex items-center hover:text-amber-200"
                  >
                    Tokens of Gratitude
                  </Link>
                </div>
              </div>
            </Container>
          </section>
        </>
      )}

      {/* 7. Quick View Modal (Accessible Dialog) */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setQuickViewProduct(null);
            }
          }}
        >
          <div className="bg-[#1f110c] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#3d1c12] flex flex-col md:flex-row gap-6 relative text-[#faf4f0]">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close product quick view"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#140b07] hover:bg-[#2d1810] flex items-center justify-center text-[#d0c4b8] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="w-full md:w-1/2 aspect-[4/5] bg-[#140b07] rounded-xl overflow-hidden border border-[#3d1c12]">
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
                  <span className="font-sans text-xs uppercase tracking-widest text-amber-200 font-bold">
                    {quickViewProduct.category.name}
                  </span>
                )}
                <h3
                  id="quick-view-title"
                  className="font-serif text-2xl font-bold text-[#faf4f0] mt-1"
                >
                  {quickViewProduct.name}
                </h3>
                <p className="font-sans text-xl font-bold text-white mt-2">
                  {formatINR(quickViewProduct.price)}
                </p>
                {quickViewProduct.description && (
                  <p className="font-sans text-sm text-[#d0c4b8]/80 mt-3 leading-relaxed line-clamp-4">
                    {quickViewProduct.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#2d1810] flex flex-col gap-2.5">
                <Link
                  href={`/products/${quickViewProduct.slug}`}
                  className="w-full"
                  onClick={() => setQuickViewProduct(null)}
                >
                  <Button variant="primary" size="md" className="w-full gap-2 bg-[#fb0b88] hover:bg-[#d90974] text-white font-bold rounded-full">
                    <span>View Product Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full border-[#3d1c12] text-[#faf4f0] hover:bg-white/10 rounded-full"
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
