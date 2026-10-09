"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  X, 
  SearchX, 
  Check, 
  ArrowUpDown, 
  ChevronDown, 
  ShoppingBag,
  SlidersHorizontal
} from "lucide-react";
import { Product, Category } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";

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

  // Mobile Bottom Sheet Filter State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(selectedCategory);
  const [draftPriceRange, setDraftPriceRange] = useState(priceRange);
  const [draftInStockOnly, setDraftInStockOnly] = useState(inStockOnly);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);

  const openMobileFilter = () => {
    setDraftCategory(selectedCategory);
    setDraftPriceRange(priceRange);
    setDraftInStockOnly(inStockOnly);
    setDraftSortBy(sortBy);
    setIsMobileFilterOpen(true);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
  };

  const resetDraftFilters = () => {
    setDraftCategory("all");
    setDraftPriceRange("all");
    setDraftInStockOnly(false);
    setDraftSortBy("featured");
  };

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

  const applyMobileFilters = () => {
    handleCategorySelect(draftCategory);
    setPriceRange(draftPriceRange);
    setInStockOnly(draftInStockOnly);
    setSortBy(draftSortBy);
    setIsMobileFilterOpen(false);
  };

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

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

  // Preview count for mobile bottom sheet
  const draftPreviewCount = useMemo(() => {
    let result = [...initialProducts];
    if (draftCategory !== "all") {
      result = result.filter((p) => p.category_id === draftCategory);
    }
    if (draftPriceRange === "under-1000") {
      result = result.filter((p) => p.price < 1000);
    } else if (draftPriceRange === "1000-2500") {
      result = result.filter((p) => p.price >= 1000 && p.price <= 2500);
    } else if (draftPriceRange === "above-2500") {
      result = result.filter((p) => p.price > 2500);
    }
    if (draftInStockOnly) {
      result = result.filter((p) => p.availability !== "out_of_stock");
    }
    return result.length;
  }, [initialProducts, draftCategory, draftPriceRange, draftInStockOnly]);

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
      {/* 1. Error State (Server / Query Failure) */}
      {error && (
        <section className="pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
          <Container>
            <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-[#1f110c] rounded-sm shadow-xl">
              <h2 className="font-pally text-2xl font-bold text-[#faf4f0] mb-2">
                We couldn&apos;t load the collection
              </h2>
              <p className="font-sans text-sm text-[#d0c4b8]/80 mb-6">
                Please try again.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto bg-[#fb0b88] hover:bg-[#d90974] text-white font-bold rounded-sm px-6 py-2.5 border-none"
              >
                Try Again
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* 2. Empty Catalog State */}
      {!error && initialProducts.length === 0 && (
        <section className="pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
          <Container>
            <div className="max-w-md mx-auto text-center p-6 sm:p-8 bg-[#1f110c] rounded-sm shadow-xl flex flex-col items-center">
              <div className="w-11 h-11 rounded-sm bg-[#2a140d] flex items-center justify-center text-amber-200 mb-3.5">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="font-pally text-xl sm:text-2xl font-bold text-[#faf4f0] mb-1.5">
                Catalog updating
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#d0c4b8]/80 max-w-xs mb-6 leading-relaxed">
                Our collection is currently being updated. Please check back soon.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center font-sans uppercase tracking-wider font-semibold text-xs px-6 py-3 min-h-[44px] bg-[#fb0b88] hover:bg-[#d90974] text-white rounded-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
              >
                Return to Home
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* 3. Populated Catalog Experience */}
      {!error && initialProducts.length > 0 && (
        <>
          {/* Category Navigation Pills & Counter */}
          <section className="w-full pt-20 sm:pt-24 lg:pt-28 pb-1">
            <Container>
              {/* Editorial Shop Header / Intro */}
              <div className="mb-6 sm:mb-8 text-left max-w-3xl">
                <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#fb0b88] block mb-2">
                  Artisanal Confections & Gifting
                </span>
                <h1 className="font-pally text-3xl sm:text-4xl text-[#faf4f0] leading-tight mb-3 font-bold">
                  Shop Luxury Chocolate Hampers
                </h1>
                <p className="font-sans text-xs sm:text-sm text-[#d0c4b8]/85 leading-relaxed">
                  Discover hand-curated chocolate gift hampers, keepsake presentation boxes, and artisanal confections crafted with precision. Perfect for celebrations, milestone moments, and thoughtful gifting across India.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4 py-1.5">

                <nav
                  aria-label="Category filter"
                  className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none w-full sm:w-auto"
                >
                  <button
                    type="button"
                    onClick={() => handleCategorySelect("all")}
                    className={`min-h-[36px] px-3.5 py-1.5 rounded-sm font-sans text-[11px] uppercase tracking-wider font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
                      selectedCategory === "all"
                        ? "bg-[#fb0b88] text-white shadow-sm"
                        : "bg-[#1b0e0a] hover:bg-[#2d1810] text-[#faf4f0]"
                    }`}
                  >
                    All Confections
                  </button>

                  {initialCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-sm font-sans text-[11px] uppercase tracking-wider font-bold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
                        selectedCategory === cat.id
                          ? "bg-[#fb0b88] text-white shadow-sm"
                          : "bg-[#1b0e0a] hover:bg-[#2d1810] text-[#faf4f0]"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </nav>

                <div className="font-sans text-xs text-[#d0c4b8]/80 font-medium flex items-center gap-1.5 ml-auto sm:ml-0">
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#fb0b88] inline-block" />
                  <span>{filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}</span>
                </div>
              </div>
            </Container>
          </section>

          {/* Horizontal Filter & Sort Bar (Desktop/Tablet) */}
          <section className="w-full pb-5 hidden sm:block">
            <Container>
              <div className="bg-[#1b0e0a] rounded-sm p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex flex-wrap items-center gap-2 flex-grow">
                  {/* Price Filter Dropdown */}
                  <div className="relative inline-block">
                    <label htmlFor="filter-price" className="sr-only">
                      Filter by Price
                    </label>
                    <select
                      id="filter-price"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="appearance-none min-h-[36px] bg-[#140b07] text-[#faf4f0] font-sans text-xs pl-3 pr-8 py-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] cursor-pointer hover:bg-[#1a0e09] transition-colors font-medium border-0"
                    >
                      <option value="all">All Prices</option>
                      <option value="under-1000">Under ₹1,000</option>
                      <option value="1000-2500">₹1,000 – ₹2,500</option>
                      <option value="above-2500">Above ₹2,500</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-200" />
                  </div>

                  {/* Availability Toggle */}
                  <button
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-sans text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
                      inStockOnly
                        ? "bg-[#fb0b88] text-white"
                        : "bg-[#140b07] text-[#faf4f0] hover:bg-[#1a0e09]"
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${inStockOnly ? "text-white" : "text-amber-200"}`} />
                    <span>In Stock Only</span>
                  </button>

                  {/* Clear Filters Action */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="min-h-[36px] flex items-center gap-1 font-sans text-[11px] uppercase tracking-wider font-semibold text-amber-200 hover:text-[#fb0b88] px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] rounded-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Sort Control */}
                <div className="flex items-center gap-2 ml-auto">
                  <label htmlFor="filter-sort" className="font-sans text-xs text-[#d0c4b8]/70 font-medium hidden sm:inline">
                    Sort:
                  </label>
                  <div className="relative inline-block">
                    <select
                      id="filter-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none min-h-[36px] bg-[#140b07] text-[#faf4f0] font-sans text-xs pl-3 pr-8 py-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] cursor-pointer hover:bg-[#1a0e09] transition-colors font-medium border-0"
                    >
                      <option value="featured">Featured Curations</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest Arrivals</option>
                    </select>
                    <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-200" />
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Product Grid / Filter-Empty State */}
          <section className="w-full pb-16 lg:pb-24">
            <Container>
              {filteredProducts.length === 0 ? (
                <div className="w-full py-12 px-6 text-center bg-[#1f110c] rounded-sm shadow-xl flex flex-col items-center">
                  <div className="w-10 h-10 rounded-sm bg-[#2d1810] flex items-center justify-center text-amber-200 mb-3">
                    <SearchX className="w-5 h-5" />
                  </div>
                  <h3 className="font-pally text-xl font-bold text-[#faf4f0] mb-1.5">
                    No chocolates found
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-[#d0c4b8]/80 max-w-md mb-5 leading-relaxed">
                    We couldn&apos;t find any curations matching your current selection. Try resetting filters to explore our full collection.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleResetFilters}
                    className="bg-[#fb0b88] hover:bg-[#d90974] text-white font-bold rounded-sm px-5 py-2 text-xs border-none"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </Container>
          </section>

          {/* Mobile Floating Bottom Center Filter Button */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 sm:hidden">
            <button
              type="button"
              onClick={openMobileFilter}
              className="flex items-center gap-2 bg-[#fb0b88] hover:bg-[#d90974] active:scale-95 text-white font-pally font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-sm shadow-2xl transition-all border-none"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Mobile Filter Bottom Sheet Drawer */}
          {isMobileFilterOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-filter-title"
              className="fixed inset-0 z-50 sm:hidden"
            >
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={closeMobileFilter}
                aria-hidden="true"
              />

              {/* Drawer content sliding up from bottom */}
              <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-[#1b0e0a] rounded-t-lg shadow-2xl p-5 flex flex-col gap-4 text-[#faf4f0] animate-in slide-in-from-bottom duration-300">
                {/* Top Handle */}
                <div className="w-10 h-1 bg-[#3d1c12] rounded-full mx-auto -mt-1 mb-1 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between pb-1 border-b border-[#3d1c12]/40">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#fb0b88]" />
                    <h3 id="mobile-filter-title" className="font-pally text-base font-bold text-[#faf4f0]">
                      Filters &amp; Sort
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={resetDraftFilters}
                      className="font-sans text-xs uppercase tracking-wider font-semibold text-amber-200 hover:text-[#fb0b88] transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={closeMobileFilter}
                      aria-label="Close filters"
                      className="w-7 h-7 rounded-sm bg-[#140b07] flex items-center justify-center text-[#d0c4b8] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-2">
                  <span className="font-pally text-xs font-bold uppercase tracking-wider text-amber-200">
                    Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDraftCategory("all")}
                      className={`px-3 py-1.5 rounded-sm font-sans text-xs uppercase tracking-wider font-bold transition-all ${
                        draftCategory === "all"
                          ? "bg-[#fb0b88] text-white shadow-sm"
                          : "bg-[#140b07] text-[#faf4f0]"
                      }`}
                    >
                      All
                    </button>
                    {initialCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setDraftCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-sm font-sans text-xs uppercase tracking-wider font-bold transition-all ${
                          draftCategory === cat.id
                            ? "bg-[#fb0b88] text-white shadow-sm"
                            : "bg-[#140b07] text-[#faf4f0]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="flex flex-col gap-2">
                  <span className="font-pally text-xs font-bold uppercase tracking-wider text-amber-200">
                    Price Range
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "all", label: "All Prices" },
                      { id: "under-1000", label: "Under ₹1,000" },
                      { id: "1000-2500", label: "₹1,000 – ₹2,500" },
                      { id: "above-2500", label: "Above ₹2,500" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDraftPriceRange(item.id)}
                        className={`px-3 py-2 rounded-sm font-sans text-xs font-medium text-center transition-all ${
                          draftPriceRange === item.id
                            ? "bg-[#fb0b88] text-white shadow-sm font-bold"
                            : "bg-[#140b07] text-[#faf4f0]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock Only */}
                <div className="flex flex-col gap-2">
                  <span className="font-pally text-xs font-bold uppercase tracking-wider text-amber-200">
                    Availability
                  </span>
                  <button
                    type="button"
                    onClick={() => setDraftInStockOnly(!draftInStockOnly)}
                    className={`flex items-center justify-between p-2.5 rounded-sm font-sans text-xs font-medium transition-all ${
                      draftInStockOnly
                        ? "bg-[#fb0b88] text-white"
                        : "bg-[#140b07] text-[#faf4f0]"
                    }`}
                  >
                    <span>In Stock Only</span>
                    <Check className={`w-4 h-4 ${draftInStockOnly ? "text-white" : "opacity-0"}`} />
                  </button>
                </div>

                {/* Sort By */}
                <div className="flex flex-col gap-2">
                  <span className="font-pally text-xs font-bold uppercase tracking-wider text-amber-200">
                    Sort By
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "featured", label: "Featured" },
                      { id: "newest", label: "Newest" },
                      { id: "price-asc", label: "Price: Low to High" },
                      { id: "price-desc", label: "Price: High to Low" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDraftSortBy(item.id)}
                        className={`px-3 py-2 rounded-sm font-sans text-xs font-medium text-center transition-all ${
                          draftSortBy === item.id
                            ? "bg-[#fb0b88] text-white shadow-sm font-bold"
                            : "bg-[#140b07] text-[#faf4f0]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit / Apply Button */}
                <div className="pt-2 sticky bottom-0 bg-[#1b0e0a] pb-1">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={applyMobileFilters}
                    className="w-full min-h-[44px] bg-[#fb0b88] hover:bg-[#d90974] active:bg-[#b0075e] text-white font-pally font-bold text-xs uppercase tracking-wider rounded-sm shadow-xl border-none flex items-center justify-center gap-2"
                  >
                    <span>Apply Filters</span>
                    <span className="opacity-90 font-normal">({draftPreviewCount} Products)</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
