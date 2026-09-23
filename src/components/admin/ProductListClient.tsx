"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Product, Category } from "@/types/catalog";
import { toggleProductStatusAction } from "@/app/admin/products/actions";
import {
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

interface ProductListClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductListClient({
  initialProducts,
  categories,
}: ProductListClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedAvailability, setSelectedAvailability] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Compute Metrics Triage Strip
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === "active").length;
  const lowStockCount = products.filter((p) => p.availability === "low_stock").length;
  const outOfStockCount = products.filter((p) => p.availability === "out_of_stock").length;

  // Filter Products
  const filteredProducts = products.filter((p) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      if (!matchName && !matchSlug) return false;
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      if (p.category_id !== selectedCategory) return false;
    }

    // Availability filter
    if (selectedAvailability !== "ALL") {
      if (p.availability !== selectedAvailability) return false;
    }

    // Status filter
    if (selectedStatus !== "ALL") {
      if (p.status !== selectedStatus) return false;
    }

    return true;
  });

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedAvailability("ALL");
    setSelectedStatus("ALL");
  }

  function handleToggleStatus(productId: string, currentStatus: "active" | "inactive") {
    setTogglingId(productId);
    startTransition(async () => {
      const res = await toggleProductStatusAction(productId, currentStatus);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  status: currentStatus === "active" ? "inactive" : "active",
                }
              : p
          )
        );
      } else {
        alert(res.error || "Failed to update product status.");
      }
      setTogglingId(null);
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Subheader with Breadcrumbs & Action */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-parchment-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-cocoa-600 mb-1">
            <span>Store Operations</span>
            <span>/</span>
            <span className="text-cocoa-950 font-medium">Products</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-cocoa-950 tracking-tight">
            Products
          </h1>
          <p className="text-sm text-cocoa-600 mt-0.5">
            Manage your chocolate and gifting catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-cocoa-900 hover:bg-cocoa-800 text-white text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-cocoa-700 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metric Triage Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-border">
          <span className="block text-xs font-medium text-cocoa-600">
            Total Products
          </span>
          <span className="block text-xl font-bold text-cocoa-950 mt-0.5">
            {totalCount}
          </span>
        </div>
        <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-border">
          <span className="block text-xs font-medium text-cocoa-600">
            Active on Storefront
          </span>
          <span className="block text-xl font-bold text-emerald-700 mt-0.5">
            {activeCount}
          </span>
        </div>
        <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-border">
          <span className="block text-xs font-medium text-cocoa-600">
            Low Stock Attention
          </span>
          <span className="block text-xl font-bold text-amber-700 mt-0.5">
            {lowStockCount}
          </span>
        </div>
        <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-border">
          <span className="block text-xs font-medium text-cocoa-600">
            Out of Stock
          </span>
          <span className="block text-xl font-bold text-rose-700 mt-0.5">
            {outOfStockCount}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cocoa-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name or slug..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-parchment-surface border border-parchment-border rounded text-cocoa-950 placeholder-cocoa-600/70 focus:outline-none focus:border-cocoa-700 min-h-[44px]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none min-h-[44px]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none min-h-[44px]"
          >
            <option value="ALL">All Availability</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none min-h-[44px]"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(searchQuery ||
            selectedCategory !== "ALL" ||
            selectedAvailability !== "ALL" ||
            selectedStatus !== "ALL") && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-medium text-cocoa-600 hover:text-cocoa-950 bg-parchment-muted rounded border border-parchment-line transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Catalog Table Container */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 px-4 text-center bg-parchment-surface rounded border border-dashed border-parchment-border space-y-3">
          <div className="w-12 h-12 rounded-full bg-parchment-muted mx-auto flex items-center justify-center text-cocoa-600">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-sans text-lg font-bold text-cocoa-950">
            No products found
          </h3>
          <p className="text-sm text-cocoa-600 max-w-sm mx-auto">
            {products.length === 0
              ? "Your catalog is empty. Click Add Product to create your first item."
              : "No products match your active search or filter selection."}
          </p>
          {products.length > 0 && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded bg-parchment-muted border border-parchment-line text-xs font-semibold text-cocoa-950 hover:bg-parchment-border transition-colors min-h-[44px]"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-parchment-surface border border-parchment-border rounded shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-parchment-muted/60 border-b border-parchment-border text-[11px] font-bold uppercase tracking-wider text-cocoa-600">
                    <th scope="col" className="py-3.5 pl-4 pr-3">
                      Product
                    </th>
                    <th scope="col" className="py-3.5 px-3">
                      Category
                    </th>
                    <th scope="col" className="py-3.5 px-3">
                      Price
                    </th>
                    <th scope="col" className="py-3.5 px-3">
                      Weight
                    </th>
                    <th scope="col" className="py-3.5 px-3">
                      Availability
                    </th>
                    <th scope="col" className="py-3.5 px-3">
                      Status
                    </th>
                    <th scope="col" className="py-3.5 pl-3 pr-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment-border text-xs">
                  {filteredProducts.map((p) => {
                    const primaryImage =
                      p.images && p.images.length > 0
                        ? p.images[0].image_url
                        : null;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-parchment-muted/30 transition-colors"
                      >
                        {/* Name & Image */}
                        <td className="py-3.5 pl-4 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded border border-parchment-border bg-parchment-muted overflow-hidden shrink-0 flex items-center justify-center font-sans text-xs font-bold text-cocoa-800">
                              {primaryImage ? (
                                <img
                                  src={primaryImage}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                p.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <span className="block font-semibold text-cocoa-950 text-sm leading-snug">
                                {p.name}
                              </span>
                              <span className="block text-[11px] text-cocoa-600 font-mono">
                                {p.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 text-cocoa-700">
                          {p.category?.name ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-parchment-muted border border-parchment-border text-cocoa-950 font-medium">
                              {p.category.name}
                            </span>
                          ) : (
                            <span className="text-cocoa-600">—</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-3 font-mono font-bold text-cocoa-950">
                          ₹{p.price.toLocaleString("en-IN")}
                          {p.discount_type !== "none" && p.discount_value > 0 && (
                            <span className="block text-[10px] text-amber-800 font-normal">
                              Offer active
                            </span>
                          )}
                        </td>

                        {/* Weight */}
                        <td className="py-3.5 px-3 font-mono text-cocoa-700">
                          {p.weight_grams}g
                        </td>

                        {/* Availability Badge */}
                        <td className="py-3.5 px-3">
                          {p.availability === "in_stock" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-greenBg text-status-greenText border border-status-greenBorder text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              In Stock
                            </span>
                          )}
                          {p.availability === "low_stock" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-amberBg text-status-amberText border border-status-amberBorder text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                              Low Stock
                            </span>
                          )}
                          {p.availability === "out_of_stock" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-redBg text-status-redText border border-status-redBorder text-[11px] font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                              Out of Stock
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3">
                          {p.status === "active" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-900">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-200 text-neutral-800">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-parchment-line bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-950 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </Link>

                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  p.id,
                                  p.status as "active" | "inactive"
                                )
                              }
                              disabled={togglingId === p.id || isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-parchment-line bg-parchment-muted hover:bg-parchment-border text-xs font-medium text-cocoa-800 transition-colors disabled:opacity-50"
                              title={
                                p.status === "active"
                                  ? "Deactivate Product"
                                  : "Activate Product"
                              }
                            >
                              {togglingId === p.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : p.status === "active" ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-cocoa-600" />
                                  <span className="hidden sm:inline">Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                  <span className="hidden sm:inline">Activate</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden space-y-3">
            {filteredProducts.map((p) => {
              const primaryImage =
                p.images && p.images.length > 0
                  ? p.images[0].image_url
                  : null;

              return (
                <div
                  key={p.id}
                  className="p-4 bg-parchment-surface border border-parchment-border rounded shadow-2xs flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded border border-parchment-border bg-parchment-muted overflow-hidden shrink-0 flex items-center justify-center font-sans text-sm font-bold text-cocoa-800">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        p.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-cocoa-600 font-mono truncate">
                          {p.slug}
                        </span>
                        {p.status === "active" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-900">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 text-neutral-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-cocoa-950 truncate mt-0.5">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-cocoa-950 text-sm font-mono">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-cocoa-600 font-mono">
                          ({p.weight_grams}g)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-parchment-border text-xs">
                    <span className="text-cocoa-600">
                      {p.category?.name || "Uncategorized"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="px-3 py-1.5 rounded bg-parchment-muted border border-parchment-line text-xs font-semibold text-cocoa-950"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleToggleStatus(
                            p.id,
                            p.status as "active" | "inactive"
                          )
                        }
                        disabled={togglingId === p.id}
                        className="px-3 py-1.5 rounded bg-parchment-muted border border-parchment-line text-xs font-medium text-cocoa-800"
                      >
                        {p.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
