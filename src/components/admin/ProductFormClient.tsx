"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, Category, ProductImage } from "@/types/catalog";
import ProductImagesManager from "./ProductImagesManager";
import ProductSingleImageUploader from "./ProductSingleImageUploader";
import {
  createProductAction,
  updateProductAction,
  toggleProductStatusAction,
} from "@/app/admin/products/actions";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

interface ProductFormClientProps {
  mode: "create" | "edit";
  product?: Product | null;
  categories: Category[];
}

export default function ProductFormClient({
  mode,
  product,
  categories,
}: ProductFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Fields State
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState<string>(
    product?.price !== undefined ? String(product.price) : ""
  );
  const [discountType, setDiscountType] = useState<
    "none" | "percentage" | "fixed"
  >(product?.discount_type || "none");
  const [discountValue, setDiscountValue] = useState<string>(
    product?.discount_value !== undefined ? String(product.discount_value) : "0"
  );
  const [status, setStatus] = useState<"active" | "inactive">(
    product?.status || "active"
  );
  const [availability, setAvailability] = useState<
    "in_stock" | "low_stock" | "out_of_stock"
  >(product?.availability || "in_stock");
  const [weightGrams, setWeightGrams] = useState<string>(
    product?.weight_grams !== undefined ? String(product.weight_grams) : "500"
  );
  const [lengthCm, setLengthCm] = useState<string>(
    product?.length_cm !== undefined && product.length_cm !== null
      ? String(product.length_cm)
      : ""
  );
  const [widthCm, setWidthCm] = useState<string>(
    product?.width_cm !== undefined && product.width_cm !== null
      ? String(product.width_cm)
      : ""
  );
  const [heightCm, setHeightCm] = useState<string>(
    product?.height_cm !== undefined && product.height_cm !== null
      ? String(product.height_cm)
      : ""
  );

  // Image URL & Gallery State
  const initialImagesList: ProductImage[] =
    product?.images && Array.isArray(product.images)
      ? [...product.images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      : [];
  const [imagesList, setImagesList] = useState<ProductImage[]>(initialImagesList);

  const primaryImageFromList = imagesList.length > 0 ? imagesList[0].image_url : "";
  const existingImageUrl =
    primaryImageFromList ||
    (product?.images && product.images.length > 0 ? product.images[0].image_url : "");

  const [imageUrl, setImageUrl] = useState(existingImageUrl);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [imageError, setImageError] = useState(false);

  const activePreviewUrl = primaryImageFromList || imageUrl;

  // Status & Error Banner
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compute calculated discount price for preview
  const numericPrice = parseFloat(price) || 0;
  const numericDiscountVal = parseFloat(discountValue) || 0;

  let calculatedFinalPrice = numericPrice;
  if (discountType === "percentage" && numericDiscountVal > 0) {
    calculatedFinalPrice = Math.max(
      0,
      numericPrice - (numericPrice * numericDiscountVal) / 100
    );
  } else if (discountType === "fixed" && numericDiscountVal > 0) {
    calculatedFinalPrice = Math.max(0, numericPrice - numericDiscountVal);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("discount_type", discountType);
    formData.append("discount_value", discountValue);
    formData.append("status", status);
    formData.append("availability", availability);
    formData.append("weight_grams", weightGrams);
    formData.append("length_cm", lengthCm);
    formData.append("width_cm", widthCm);
    formData.append("height_cm", heightCm);
    formData.append("image_url", imageUrl);
    formData.append("cloudinary_public_id", cloudinaryPublicId);

    startTransition(async () => {
      let res;
      if (mode === "create") {
        res = await createProductAction(formData);
      } else if (product) {
        res = await updateProductAction(product.id, formData);
      }

      if (res?.success) {
        setSuccessMessage(
          mode === "create"
            ? "Product created successfully!"
            : "Product updated successfully!"
        );
        if (mode === "create" && res.productId) {
          router.push(`/admin/products/${res.productId}`);
        } else {
          router.refresh();
        }
      } else {
        setErrorMessage(res?.error || "Failed to save product.");
      }
    });
  }

  function handleToggleStatus() {
    if (!product) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await toggleProductStatusAction(
        product.id,
        status
      );
      if (res.success) {
        const nextStatus = status === "active" ? "inactive" : "active";
        setStatus(nextStatus);
        setSuccessMessage(
          `Product is now ${nextStatus === "active" ? "Active" : "Inactive"}.`
        );
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to update product status.");
      }
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Breadcrumbs & Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-cocoa-600 font-medium"
        >
          <Link href="/admin/products" className="hover:text-cocoa-950 transition">
            Products
          </Link>
          <span className="text-cocoa-600/50">/</span>
          <span className="text-cocoa-950 font-semibold">
            {mode === "create" ? "New Product" : "Edit Product"}
          </span>
        </nav>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-950">Error saving product</p>
            <p className="text-xs text-red-800 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-emerald-950">Success</p>
            <p className="text-xs text-emerald-800 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Form Header */}
      <header className="pb-6 border-b border-parchment-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              {mode === "create" ? "Add Product" : "Edit Product"}
            </h1>
            {product && (
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-parchment-muted text-cocoa-950 border border-parchment-line">
                SKU: {product.slug}
              </span>
            )}
          </div>
          <p className="text-sm text-cocoa-600 mt-1">
            Manage product information, pricing, availability, and physical package metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded border border-parchment-border bg-parchment-surface text-sm font-medium text-cocoa-950 hover:bg-parchment-muted transition"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2.5 rounded bg-burgundy hover:bg-burgundy-hover text-white text-sm font-semibold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === "create" ? "Create Product" : "Save Product"}</span>
          </button>
        </div>
      </header>

      {/* Form Body Grid */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* LEFT COLUMN: Basic info, pricing, status, package (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Basic Information */}
          <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-5">
            <h2 className="font-sans text-lg font-bold text-cocoa-950 border-b border-parchment-border pb-3">
              Basic Information
            </h2>

            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
              >
                Product Name <span className="text-burgundy">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Grand Velvet Hamper"
                className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 placeholder-cocoa-600/50 focus:outline-none focus:border-cocoa-700"
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
              >
                URL Slug / Identifier
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. grand-velvet-hamper (auto-generated if empty)"
                className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 placeholder-cocoa-600/50 focus:outline-none focus:border-cocoa-700"
              />
            </div>

            {/* Category Selection */}
            <div>
              <label
                htmlFor="category"
                className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
              >
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 focus:outline-none"
              >
                <option value="">Select Category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed product description and tasting notes..."
                className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 placeholder-cocoa-600/50 focus:outline-none focus:border-cocoa-700 leading-relaxed"
              />
            </div>
          </section>

          {/* Card 2: Pricing & Offer Rules */}
          <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h2 className="font-sans text-lg font-bold text-cocoa-950">
                Pricing &amp; Discounts
              </h2>
              <span className="text-xs text-cocoa-600">Currency: INR (₹)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
                >
                  Regular Price (₹) <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa-600 font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    id="price"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3450"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm font-semibold text-cocoa-950 focus:outline-none focus:border-cocoa-700"
                  />
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label
                  htmlFor="discountType"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
                >
                  Discount Type
                </label>
                <select
                  id="discountType"
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(
                      e.target.value as "none" | "percentage" | "fixed"
                    )
                  }
                  className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 focus:outline-none"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage (%) Off</option>
                  <option value="fixed">Fixed Amount (₹) Off</option>
                </select>
              </div>
            </div>

            {discountType !== "none" && (
              <div>
                <label
                  htmlFor="discountValue"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
                >
                  Discount Value (
                  {discountType === "percentage" ? "%" : "₹"})
                </label>
                <input
                  id="discountValue"
                  type="number"
                  min="0"
                  step="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={
                    discountType === "percentage" ? "10" : "150"
                  }
                  className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 focus:outline-none focus:border-cocoa-700"
                />
              </div>
            )}
          </section>

          {/* Card 3: Availability & Storefront Status */}
          <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-5">
            <h2 className="font-sans text-lg font-bold text-cocoa-950 border-b border-parchment-border pb-3">
              Availability &amp; Visibility
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Storefront Visibility */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-2">
                  Storefront Visibility <span className="text-burgundy">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-parchment-border bg-parchment hover:bg-parchment-muted cursor-pointer transition">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === "active"}
                      onChange={() => setStatus("active")}
                      className="text-burgundy focus:ring-burgundy w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-semibold text-cocoa-950 block">
                        Active
                      </span>
                      <span className="text-[11px] text-cocoa-600">
                        Visible and purchasable on storefront
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-parchment-border bg-parchment hover:bg-parchment-muted cursor-pointer transition">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === "inactive"}
                      onChange={() => setStatus("inactive")}
                      className="text-burgundy focus:ring-burgundy w-4 h-4"
                    />
                    <div>
                      <span className="text-sm font-semibold text-cocoa-950 block">
                        Inactive
                      </span>
                      <span className="text-[11px] text-cocoa-600">
                        Hidden from storefront catalog
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Stock Availability */}
              <div>
                <label
                  htmlFor="availability"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-2"
                >
                  Stock Availability <span className="text-burgundy">*</span>
                </label>
                <select
                  id="availability"
                  required
                  value={availability}
                  onChange={(e) =>
                    setAvailability(
                      e.target.value as "in_stock" | "low_stock" | "out_of_stock"
                    )
                  }
                  className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 focus:outline-none"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <p className="text-[11px] text-cocoa-600 mt-2 leading-relaxed">
                  Controls operational stock status badge shown on catalog.
                </p>
              </div>
            </div>
          </section>

          {/* Card 4: Package Metrics (Dynamic Shipping Rules) */}
          <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-4">
            <div className="border-b border-parchment-border pb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-lg font-bold text-cocoa-950">
                  Package Details
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-parchment-muted text-cocoa-950 uppercase tracking-wider">
                  Logistics Engine
                </span>
              </div>
              <p className="text-xs text-cocoa-600 mt-1">
                Physical dimensions used for dynamic courier shipping rate calculations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label
                  htmlFor="weightGrams"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1"
                >
                  Weight (g) <span className="text-burgundy">*</span>
                </label>
                <input
                  id="weightGrams"
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="lengthCm"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1"
                >
                  Length (cm)
                </label>
                <input
                  id="lengthCm"
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                  placeholder="20"
                  className="w-full px-3 py-2 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="widthCm"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1"
                >
                  Width (cm)
                </label>
                <input
                  id="widthCm"
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  placeholder="15"
                  className="w-full px-3 py-2 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="heightCm"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1"
                >
                  Height (cm)
                </label>
                <input
                  id="heightCm"
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Quick Activate/Deactivate Toggle Button for existing products */}
          {mode === "edit" && product && (
            <div className="pt-2 flex items-center justify-between border-t border-parchment-border">
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isPending}
                className="text-xs font-medium text-cocoa-700 hover:text-burgundy underline transition flex items-center gap-1.5"
              >
                {status === "active" ? (
                  <>
                    <EyeOff className="w-4 h-4" /> Deactivate this product
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-emerald-700" /> Activate this
                    product
                  </>
                )}
              </button>
              <span className="text-[11px] text-cocoa-600 font-mono">
                ID: {product.id}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Product Image Gallery & Storefront Card Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {mode === "edit" && product ? (
            <ProductImagesManager
              productId={product.id}
              initialImages={product.images || []}
              onImagesChange={(updatedList) => {
                setImagesList(updatedList);
                if (updatedList.length > 0) {
                  setImageUrl(updatedList[0].image_url);
                  setImageError(false);
                }
              }}
            />
          ) : (
            <ProductSingleImageUploader
              currentImageUrl={imageUrl}
              currentPublicId={cloudinaryPublicId}
              onImageChange={(url, publicId) => {
                setImageUrl(url);
                setCloudinaryPublicId(publicId || "");
                setImageError(false);
              }}
              productId="new"
            />
          )}

          {/* Card 6: Storefront Card Preview */}
          <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h2 className="font-sans text-lg font-bold text-cocoa-950">
                Storefront Card Preview
              </h2>
              <span className="text-[11px] font-medium text-cocoa-600 uppercase tracking-wider">
                Live Mirror
              </span>
            </div>

            <div className="max-w-[280px] mx-auto bg-white border border-parchment-border rounded-lg overflow-hidden shadow-sm transition-all duration-300">
              <div className="aspect-[4/3] bg-parchment-muted overflow-hidden relative flex items-center justify-center">
                {activePreviewUrl && !imageError ? (
                  <img
                    src={activePreviewUrl}
                    alt={name || "Product Preview"}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-cocoa-600/60 flex flex-col items-center gap-1">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[10px]">
                      {imageError
                        ? "Invalid or broken image URL"
                        : "No image URL"}
                    </span>
                  </div>
                )}
                {availability === "out_of_stock" && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 shadow-xs">
                    Out of Stock
                  </div>
                )}
                {availability === "low_stock" && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 shadow-xs">
                    Low Stock
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-cocoa-600">
                  {categories.find((c) => c.id === categoryId)?.name ||
                    "Confectionery"}
                </div>
                <h3 className="font-serif font-bold text-sm text-cocoa-950 leading-snug truncate">
                  {name || "Product Name"}
                </h3>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-bold text-cocoa-950 text-base font-mono">
                    ₹{calculatedFinalPrice.toLocaleString("en-IN")}
                  </span>
                  {discountType !== "none" && numericDiscountVal > 0 && (
                    <span className="text-xs text-neutral-400 line-through font-mono">
                      ₹{numericPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-cocoa-600">
              Visual representation of the customer card on shop and collections screens.
            </p>
          </section>
        </div>
      </form>
    </div>
  );
}
