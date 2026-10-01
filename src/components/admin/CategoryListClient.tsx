"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { CategoryWithCount } from "@/lib/supabase/admin-catalog";
import ProductSingleImageUploader from "@/components/admin/ProductSingleImageUploader";
import { getCloudinaryCmsUploadSignatureAction } from "@/app/admin/homepage/actions";
import {
  createCategoryAction,
  updateCategoryAction,
  toggleCategoryStatusAction,
  deleteCategoryAction,
} from "@/app/admin/categories/actions";
import {
  Plus,
  Search,
  RotateCcw,
  Edit2,
  Trash2,
  FolderTree,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  X,
  AlertTriangle,
  Package,
} from "lucide-react";

interface CategoryListClientProps {
  initialCategories: CategoryWithCount[];
}

export default function CategoryListClient({
  initialCategories,
}: CategoryListClientProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Action status IDs
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalStatus, setModalStatus] = useState<"active" | "inactive">("active");
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalImagePublicId, setModalImagePublicId] = useState("");
  const [modalDisplayOrder, setModalDisplayOrder] = useState<number>(0);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog State
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Metrics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === "active").length;
  const inactiveCategories = categories.filter((c) => c.status === "inactive").length;
  const totalCategorizedProducts = categories.reduce((acc, c) => acc + c.product_count, 0);

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!c.name.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "ALL") {
      if (c.status !== statusFilter) return false;
    }
    return true;
  });

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("ALL");
  }

  // Open Create Modal
  function handleOpenCreateModal() {
    setEditingCategory(null);
    setModalName("");
    setModalStatus("active");
    setModalImageUrl("");
    setModalImagePublicId("");
    setModalDisplayOrder(categories.length);
    setModalError(null);
    setIsModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEditModal(cat: CategoryWithCount) {
    setEditingCategory(cat);
    setModalName(cat.name);
    setModalStatus(cat.status);
    setModalImageUrl(cat.image_url || "");
    setModalImagePublicId(cat.image_public_id || "");
    setModalDisplayOrder(cat.display_order ?? 0);
    setModalError(null);
    setIsModalOpen(true);
  }

  // Close Modal
  function handleCloseModal() {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setEditingCategory(null);
    setModalError(null);
  }

  // Submit Modal Form
  async function handleSubmitModal(e: React.FormEvent) {
    e.preventDefault();
    setModalError(null);

    if (!modalName.trim()) {
      setModalError("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", modalName.trim());
    formData.append("status", modalStatus);
    formData.append("image_url", modalImageUrl);
    formData.append("image_public_id", modalImagePublicId);
    formData.append("display_order", String(modalDisplayOrder));

    startTransition(async () => {
      let res;
      if (editingCategory) {
        res = await updateCategoryAction(editingCategory.id, formData);
      } else {
        res = await createCategoryAction(formData);
      }

      setIsSubmitting(false);

      if (res.success) {
        if (editingCategory) {
          // Update in local state
          setCategories((prev) =>
            prev.map((c) =>
              c.id === editingCategory.id
                ? {
                    ...c,
                    name: modalName.trim(),
                    status: modalStatus,
                    image_url: modalImageUrl,
                    image_public_id: modalImagePublicId,
                    display_order: modalDisplayOrder,
                    updated_at: new Date().toISOString(),
                  }
                : c
            )
          );
        } else if (res.categoryId) {
          // Add new category in local state
          const newCat: CategoryWithCount = {
            id: res.categoryId,
            name: modalName.trim(),
            status: modalStatus,
            image_url: modalImageUrl,
            image_public_id: modalImagePublicId,
            display_order: modalDisplayOrder,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_count: 0,
          };
          setCategories((prev) => [...prev, newCat]);
        }
        setIsModalOpen(false);
      } else {
        setModalError(res.error || "Failed to save category.");
      }
    });
  }

  // Handle Status Toggle
  function handleToggleStatus(cat: CategoryWithCount) {
    setTogglingId(cat.id);
    startTransition(async () => {
      const res = await toggleCategoryStatusAction(cat.id, cat.status);
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === cat.id
              ? {
                  ...c,
                  status: cat.status === "active" ? "inactive" : "active",
                  updated_at: new Date().toISOString(),
                }
              : c
          )
        );
      } else {
        alert(res.error || "Failed to update category status.");
      }
      setTogglingId(null);
    });
  }

  // Open Delete Confirmation Dialog
  function handleOpenDeleteDialog(cat: CategoryWithCount) {
    setDeletingCategory(cat);
    setDeleteError(null);
  }

  // Confirm Delete Action
  function handleConfirmDelete() {
    if (!deletingCategory) return;
    setDeleteError(null);

    startTransition(async () => {
      const res = await deleteCategoryAction(deletingCategory.id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
        setDeletingCategory(null);
      } else {
        setDeleteError(res.error || "Failed to delete category.");
      }
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Category Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-cocoa-950">
          Categories
        </h1>
        <p className="text-xs text-cocoa-600 mt-1">
          Store product categories and collection organization
        </p>
      </div>

      {/* Metrics Triage Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-xl border border-cocoa-200/80 bg-parchment-card p-4 shadow-sm transition-all hover:border-cocoa-300">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-cocoa-600">
              Total Categories
            </span>
            <FolderTree className="h-4 w-4 text-cocoa-500" />
          </div>
          <div className="mt-2 font-sans text-2xl font-bold text-cocoa-950">
            {totalCategories}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-700">
              Active Categories
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 font-sans text-2xl font-bold text-emerald-950">
            {activeCategories}
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm transition-all hover:border-amber-300">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-amber-700">
              Inactive Categories
            </span>
            <XCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 font-sans text-2xl font-bold text-amber-950">
            {inactiveCategories}
          </div>
        </div>

        <div className="rounded-xl border border-cocoa-200/80 bg-parchment-card p-4 shadow-sm transition-all hover:border-cocoa-300">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-cocoa-600">
              Categorized Products
            </span>
            <Package className="h-4 w-4 text-cocoa-500" />
          </div>
          <div className="mt-2 font-sans text-2xl font-bold text-cocoa-950">
            {totalCategorizedProducts}
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-cocoa-200/80 bg-parchment-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name..."
              className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface py-2 pl-9 pr-8 text-xs font-sans text-cocoa-900 placeholder-cocoa-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-cocoa-400 hover:text-cocoa-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-sans text-cocoa-900 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== "ALL") && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cocoa-200 px-3 py-2 font-mono text-xs text-cocoa-700 hover:bg-parchment-hover"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* Add Category Button */}
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-600 px-4 py-2 text-xs font-semibold text-cocoa-950 shadow-sm transition-colors hover:bg-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-cocoa-200/80 bg-parchment-card shadow-sm">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="mx-auto h-10 w-10 text-cocoa-400" />
            <h3 className="mt-3 font-sans text-lg font-semibold text-cocoa-900">
              {categories.length === 0 ? "No categories created yet" : "No matching categories"}
            </h3>
            <p className="mt-1 text-xs text-cocoa-600">
              {categories.length === 0
                ? "Get started by adding your first category to organize your chocolates."
                : "Try adjusting your search query or filters."}
            </p>
            {categories.length === 0 ? (
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-600 px-4 py-2 text-xs font-semibold text-cocoa-950 hover:bg-gold-500"
              >
                <Plus className="h-4 w-4" />
                Create Category
              </button>
            ) : (
              <button
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-cocoa-300 px-4 py-2 font-mono text-xs text-cocoa-700 hover:bg-parchment-hover"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-cocoa-200/80 bg-parchment-surface font-mono text-[11px] uppercase tracking-wider text-cocoa-600">
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Products
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cocoa-100 font-sans text-cocoa-900">
                  {filteredCategories.map((cat) => {
                    const isToggling = togglingId === cat.id;

                    return (
                      <tr
                        key={cat.id}
                        className="transition-colors hover:bg-parchment-hover/50"
                      >
                        {/* Category Name & ID */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-cocoa-950">
                            {cat.name}
                          </div>
                          <div className="font-mono text-[10px] text-cocoa-400">
                            ID: {cat.id}
                          </div>
                        </td>

                        {/* Products Count */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-parchment-surface px-2.5 py-1 font-mono text-[11px] text-cocoa-700 border border-cocoa-200">
                            <Package className="h-3 w-3 text-cocoa-500" />
                            {cat.product_count} {cat.product_count === 1 ? "Product" : "Products"}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                          {cat.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/70 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-cocoa-200 bg-cocoa-100/70 px-2.5 py-0.5 font-mono text-[11px] font-medium text-cocoa-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-cocoa-500" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Last Updated */}
                        <td className="px-6 py-4 font-mono text-[11px] text-cocoa-500">
                          {new Date(cat.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(cat)}
                              title="Edit Category"
                              className="rounded-lg p-1.5 text-cocoa-600 hover:bg-parchment-hover hover:text-cocoa-900"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            {/* Toggle Status Button */}
                            <button
                              onClick={() => handleToggleStatus(cat)}
                              disabled={isToggling || isPending}
                              title={cat.status === "active" ? "Deactivate Category" : "Activate Category"}
                              className="rounded-lg p-1.5 text-cocoa-600 hover:bg-parchment-hover hover:text-cocoa-900 disabled:opacity-50"
                            >
                              {isToggling ? (
                                <Loader2 className="h-4 w-4 animate-spin text-cocoa-500" />
                              ) : cat.status === "active" ? (
                                <EyeOff className="h-4 w-4 text-amber-600" />
                              ) : (
                                <Eye className="h-4 w-4 text-emerald-600" />
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleOpenDeleteDialog(cat)}
                              title="Delete Category"
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="divide-y divide-cocoa-100 md:hidden">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-cocoa-950 text-sm">
                        {cat.name}
                      </h4>
                      <p className="font-mono text-[10px] text-cocoa-400 mt-0.5">
                        ID: {cat.id}
                      </p>
                    </div>

                    {cat.status === "active" ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/70 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-cocoa-200 bg-cocoa-100/70 px-2 py-0.5 font-mono text-[10px] font-medium text-cocoa-700">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-cocoa-600 pt-1">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Package className="h-3.5 w-3.5 text-cocoa-500" />
                      {cat.product_count} Products
                    </span>

                    <span className="font-mono text-[10px] text-cocoa-400">
                      Updated: {new Date(cat.updated_at).toLocaleDateString("en-US")}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-cocoa-100/80">
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="inline-flex items-center gap-1 text-xs text-cocoa-700 font-medium"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleToggleStatus(cat)}
                      disabled={togglingId === cat.id}
                      className="inline-flex items-center gap-1 text-xs text-cocoa-700 font-medium"
                    >
                      {togglingId === cat.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : cat.status === "active" ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          Activate
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenDeleteDialog(cat)}
                      className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="flex w-full max-w-3xl max-h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-2xl border border-parchment-border bg-white shadow-2xl">
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between gap-4 border-b border-parchment-border bg-parchment/60 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-cocoa-950 truncate">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <p className="mt-0.5 text-xs text-cocoa-600">
                  {editingCategory
                    ? "Update category details and storefront display order."
                    : "Create a new chocolate category for the store."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="shrink-0 rounded-lg p-1.5 text-cocoa-400 transition-colors hover:bg-parchment-muted hover:text-cocoa-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitModal} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white px-5 py-5 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {modalError && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <div className="min-w-0 flex-1 break-words">{modalError}</div>
                  </div>
                )}

                {/* Fields row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-cocoa-950">
                      Category Name <span className="text-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      required
                      autoFocus
                      className="w-full rounded-lg border border-parchment-border bg-parchment px-3.5 py-2.5 text-sm text-cocoa-950 placeholder-cocoa-400 transition focus:border-cocoa-700 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-cocoa-950">
                      Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as "active" | "inactive")}
                      className="w-full rounded-lg border border-parchment-border bg-parchment px-3.5 py-2.5 text-sm text-cocoa-950 transition focus:border-cocoa-700 focus:bg-white focus:outline-none"
                    >
                      <option value="active">Active (Visible in storefront)</option>
                      <option value="inactive">Inactive (Hidden from storefront)</option>
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-cocoa-950">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={modalDisplayOrder}
                      onChange={(e) => setModalDisplayOrder(parseInt(e.target.value || "0", 10))}
                      min={0}
                      className="w-full rounded-lg border border-parchment-border bg-parchment px-3.5 py-2.5 font-mono text-sm text-cocoa-950 transition focus:border-cocoa-700 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Image uploader: full width */}
                <div className="mt-5 w-full">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-cocoa-950">
                    Category Image
                    <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-cocoa-500">
                      Used in Shop by Occasion
                    </span>
                  </label>

                  <ProductSingleImageUploader
                    currentImageUrl={modalImageUrl}
                    currentPublicId={modalImagePublicId}
                    productId={editingCategory?.id || "cat_new"}
                    getSignatureAction={getCloudinaryCmsUploadSignatureAction}
                    onImageChange={(url, publicId) => {
                      setModalImageUrl(url);
                      setModalImagePublicId(publicId || "");
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-parchment-border bg-parchment/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-parchment-border bg-white px-4 py-2.5 text-xs font-semibold text-cocoa-800 shadow-2xs transition hover:bg-parchment-muted disabled:opacity-50 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-burgundy px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-burgundy-hover disabled:opacity-50 sm:w-auto"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : editingCategory ? (
                    "Save Changes"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {mounted && deletingCategory && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-parchment-border bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-100 p-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-cocoa-950">
                Delete Category
              </h3>
            </div>

            <p className="mt-3 text-xs text-cocoa-700 leading-relaxed">
              Are you sure you want to delete category{" "}
              <span className="font-bold text-cocoa-950">
                &ldquo;{deletingCategory.name}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>

            {/* Error Banner inside Delete Modal */}
            {deleteError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <XCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div>{deleteError}</div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-parchment-border mt-6">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg border border-parchment-border bg-white text-xs font-semibold text-cocoa-800 hover:bg-parchment-muted transition shadow-2xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete Category"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}