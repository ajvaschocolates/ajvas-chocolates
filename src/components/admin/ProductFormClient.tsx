"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, Category, ProductImage } from "@/types/catalog";
import ProductImagesManager from "./ProductImagesManager";
import ProductCreateImageUploader, {
  UploadedImageItem,
} from "./ProductCreateImageUploader";
import {
  createProductAction,
  updateProductAction,
  toggleProductStatusAction,
  deleteProductAction,
} from "@/app/admin/products/actions";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

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
  const [sellingPrice, setSellingPrice] = useState<string>(() => {
    if (!product || product.price === undefined) return "";
    const p = product.price;
    const dt = product.discount_type;
    const dv = product.discount_value || 0;
    if (dt === "percentage" && dv > 0) {
      return String(Math.max(0, Math.round(p - (p * dv) / 100)));
    }
    if (dt === "fixed" && dv > 0) {
      return String(Math.max(0, Math.round(p - dv)));
    }
    return String(p);
  });

  // Synchronized Pricing Logic Handlers
  function handlePriceChange(val: string) {
    setPrice(val);
    const numOrig = parseFloat(val);

    if (isNaN(numOrig) || numOrig <= 0) {
      return;
    }

    const numDisc = parseFloat(discountValue) || 0;
    if (discountType === "percentage" && numDisc > 0) {
      const computedSell = Math.max(0, Math.round(numOrig - (numOrig * numDisc) / 100));
      setSellingPrice(String(computedSell));
    } else if (discountType === "fixed" && numDisc > 0) {
      const computedSell = Math.max(0, Math.round(numOrig - numDisc));
      setSellingPrice(String(computedSell));
    } else {
      setSellingPrice(val);
    }
  }

  function handleSellingPriceChange(val: string) {
    setSellingPrice(val);
    const numSell = parseFloat(val);
    const numOrig = parseFloat(price);

    if (isNaN(numSell) || isNaN(numOrig) || numOrig <= 0) {
      return;
    }

    if (numSell >= numOrig) {
      setDiscountType("none");
      setDiscountValue("0");
    } else {
      const diff = numOrig - numSell;
      if (discountType === "percentage") {
        const pct = Math.round((diff / numOrig) * 100 * 10) / 10;
        setDiscountValue(String(pct));
      } else if (discountType === "fixed") {
        setDiscountValue(String(Math.round(diff)));
      } else {
        setDiscountType("percentage");
        const pct = Math.round((diff / numOrig) * 100 * 10) / 10;
        setDiscountValue(String(pct));
      }
    }
  }

  function handleDiscountTypeChange(newType: "none" | "percentage" | "fixed") {
    setDiscountType(newType);
    const numOrig = parseFloat(price);
    const numSell = parseFloat(sellingPrice);

    if (newType === "none") {
      setDiscountValue("0");
      if (!isNaN(numOrig) && numOrig > 0) {
        setSellingPrice(String(numOrig));
      }
      return;
    }

    if (!isNaN(numOrig) && numOrig > 0 && !isNaN(numSell) && numSell < numOrig) {
      const diff = numOrig - numSell;
      if (newType === "percentage") {
        const pct = Math.round((diff / numOrig) * 100 * 10) / 10;
        setDiscountValue(String(pct));
      } else if (newType === "fixed") {
        setDiscountValue(String(Math.round(diff)));
      }
    } else {
      const numDisc = parseFloat(discountValue) || 0;
      if (!isNaN(numOrig) && numOrig > 0 && numDisc > 0) {
        if (newType === "percentage") {
          setSellingPrice(String(Math.max(0, Math.round(numOrig - (numOrig * numDisc) / 100))));
        } else if (newType === "fixed") {
          setSellingPrice(String(Math.max(0, Math.round(numOrig - numDisc))));
        }
      }
    }
  }

  function handleDiscountValueChange(val: string) {
    setDiscountValue(val);
    const numDisc = parseFloat(val);
    const numOrig = parseFloat(price);

    if (isNaN(numOrig) || numOrig <= 0) return;

    if (isNaN(numDisc) || numDisc <= 0) {
      setSellingPrice(String(numOrig));
      return;
    }

    if (discountType === "percentage") {
      const clamped = Math.min(100, numDisc);
      const computedSell = Math.max(0, Math.round(numOrig - (numOrig * clamped) / 100));
      setSellingPrice(String(computedSell));
    } else if (discountType === "fixed") {
      const clamped = Math.min(numOrig, numDisc);
      const computedSell = Math.max(0, Math.round(numOrig - clamped));
      setSellingPrice(String(computedSell));
    }
  }

  const [status, setStatus] = useState<"active" | "inactive">(
    product?.status || "active"
  );
  const [availability, setAvailability] = useState<
    "in_stock" | "low_stock" | "out_of_stock"
  >(product?.availability || "in_stock");
  const [weightGrams] = useState<string>(
    product?.weight_grams !== undefined ? String(product.weight_grams) : "500"
  );
  const [lengthCm] = useState<string>(
    product?.length_cm !== undefined && product.length_cm !== null
      ? String(product.length_cm)
      : ""
  );
  const [widthCm] = useState<string>(
    product?.width_cm !== undefined && product.width_cm !== null
      ? String(product.width_cm)
      : ""
  );
  const [heightCm] = useState<string>(
    product?.height_cm !== undefined && product.height_cm !== null
      ? String(product.height_cm)
      : ""
  );
  const [shippingKerala, setShippingKerala] = useState<string>(
    product?.shipping_kerala !== undefined && product.shipping_kerala !== null
      ? String(product.shipping_kerala)
      : "0"
  );
  const [shippingTnKar, setShippingTnKar] = useState<string>(
    product?.shipping_tn_kar !== undefined && product.shipping_tn_kar !== null
      ? String(product.shipping_tn_kar)
      : "0"
  );
  const [shippingOther, setShippingOther] = useState<string>(
    product?.shipping_other !== undefined && product.shipping_other !== null
      ? String(product.shipping_other)
      : "0"
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
  const [cloudinaryPublicId] = useState("");

  // Dedicated state for Create mode uploaded images
  const [uploadedCreateImages, setUploadedCreateImages] = useState<UploadedImageItem[]>([]);

  // Status & Error Banner
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync existing product values when editing
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setSlug(product.slug || "");
      setCategoryId(product.category_id || "");
      setDescription(product.description || "");
      setPrice(product.price !== undefined ? String(product.price) : "");
      setDiscountType(product.discount_type || "none");
      setDiscountValue(
        product.discount_value !== undefined ? String(product.discount_value) : "0"
      );
      const p = product.price;
      const dt = product.discount_type;
      const dv = product.discount_value || 0;
      if (dt === "percentage" && dv > 0) {
        setSellingPrice(String(Math.max(0, Math.round(p - (p * dv) / 100))));
      } else if (dt === "fixed" && dv > 0) {
        setSellingPrice(String(Math.max(0, Math.round(p - dv))));
      } else {
        setSellingPrice(p !== undefined ? String(p) : "");
      }
      setStatus(product.status || "active");
      setAvailability(product.availability || "in_stock");
      setShippingKerala(
        product.shipping_kerala !== undefined && product.shipping_kerala !== null
          ? String(product.shipping_kerala)
          : "0"
      );
      setShippingTnKar(
        product.shipping_tn_kar !== undefined && product.shipping_tn_kar !== null
          ? String(product.shipping_tn_kar)
          : "0"
      );
      setShippingOther(
        product.shipping_other !== undefined && product.shipping_other !== null
          ? String(product.shipping_other)
          : "0"
      );
      if (product.images && Array.isArray(product.images)) {
        const sorted = [...product.images].sort(
          (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
        );
        setImagesList(sorted);
        if (sorted.length > 0) {
          setImageUrl(sorted[0].image_url);
        }
      }
    }
  }, [product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("category_id", categoryId);
    formData.append("description", description);
    const numOrig = parseFloat(price) || 0;
    const numSell = parseFloat(sellingPrice) || 0;

    let finalDiscountType = discountType;
    let finalDiscountValue = discountValue;

    if (numSell >= numOrig || numSell <= 0 || isNaN(numSell)) {
      finalDiscountType = "none";
      finalDiscountValue = "0";
    }

    formData.append("price", price);
    formData.append("discount_type", finalDiscountType);
    formData.append("discount_value", finalDiscountValue || "0");
    formData.append("status", status);
    formData.append("availability", availability);
    formData.append("weight_grams", weightGrams || "500");
    formData.append("length_cm", lengthCm);
    formData.append("width_cm", widthCm);
    formData.append("height_cm", heightCm);
    formData.append("shipping_kerala", shippingKerala);
    formData.append("shipping_tn_kar", shippingTnKar);
    formData.append("shipping_other", shippingOther);

    if (mode === "create") {
      const mainImg =
        uploadedCreateImages.find((img) => img.isMain) || uploadedCreateImages[0];
      if (mainImg) {
        formData.append("image_url", mainImg.url);
        if (mainImg.publicId) {
          formData.append("cloudinary_public_id", mainImg.publicId);
        }
      }
      const ordered = mainImg
        ? [mainImg, ...uploadedCreateImages.filter((img) => img.id !== mainImg.id)]
        : [];
      formData.append(
        "images_json",
        JSON.stringify(
          ordered.map((img, idx) => ({
            image_url: img.url,
            cloudinary_public_id: img.publicId,
            alt_text: img.altText || name || "Product image",
            sort_order: idx,
            is_primary: idx === 0,
          }))
        )
      );
    } else {
      formData.append("image_url", imageUrl);
      formData.append("cloudinary_public_id", cloudinaryPublicId);
    }

    startTransition(async () => {
      let res;
      if (mode === "create") {
        res = await createProductAction(formData);
      } else if (product) {
        res = await updateProductAction(product.id, formData);
      }

      if (res?.success) {
        router.push("/admin/products");
        router.refresh();
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

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleConfirmDeleteProduct() {
    if (!product) return;
    setIsDeleting(true);
    setDeleteError(null);

    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (res.success) {
        router.push("/admin/products");
      } else {
        setDeleteError(res.error || "Failed to delete product.");
        setIsDeleting(false);
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
          {mode === "edit" && product && (
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setIsDeleteOpen(true);
              }}
              className="px-3.5 py-2.5 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-sm font-semibold transition flex items-center gap-1.5"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

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
                className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 focus:outline-none focus:border-cocoa-700"
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
                className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none focus:border-cocoa-700"
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
                className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 focus:outline-none focus:border-cocoa-700 leading-relaxed"
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
              {/* Original Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
                >
                  Original Price (₹) <span className="text-burgundy">*</span>
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
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="1999"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm font-semibold text-cocoa-950 focus:outline-none focus:border-cocoa-700"
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label
                  htmlFor="sellingPrice"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1.5"
                >
                  Selling Price (₹) <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa-600 font-semibold text-sm">
                    ₹
                  </span>
                  <input
                    id="sellingPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={sellingPrice}
                    onChange={(e) => handleSellingPriceChange(e.target.value)}
                    placeholder="1499"
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
                    handleDiscountTypeChange(
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

              {/* Discount Value */}
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
                  step={discountType === "percentage" ? "0.1" : "1"}
                  disabled={discountType === "none"}
                  value={discountType === "none" ? "0" : discountValue}
                  onChange={(e) => handleDiscountValueChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-parchment border border-parchment-border rounded-lg text-sm text-cocoa-950 focus:outline-none focus:border-cocoa-700 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Live Pricing Summary Strip */}
            {discountType !== "none" &&
              parseFloat(discountValue) > 0 &&
              parseFloat(price) > 0 &&
              parseFloat(sellingPrice) < parseFloat(price) && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-medium">
                    Active Discount:{" "}
                    <strong>
                      {discountType === "percentage"
                        ? `${discountValue}% OFF`
                        : `₹${parseFloat(discountValue).toLocaleString("en-IN")} OFF`}
                    </strong>
                  </span>
                  <span>
                    Customer pays:{" "}
                    <strong className="text-emerald-950 font-bold font-mono text-sm">
                      ₹{parseFloat(sellingPrice || "0").toLocaleString("en-IN")}
                    </strong>{" "}
                    <span className="line-through text-emerald-700/70 ml-1">
                      ₹{parseFloat(price || "0").toLocaleString("en-IN")}
                    </span>
                  </span>
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

          {/* Card 4: State Shipping Rates */}
          <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-4">
            <div className="border-b border-parchment-border pb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-lg font-bold text-cocoa-950">
                  State Shipping Rates
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-brand-pink/20 text-brand-pink uppercase tracking-wider">
                  Per-Unit Charging
                </span>
              </div>
              <p className="text-xs text-cocoa-600 mt-1">
                Regional unit shipping charges applied at checkout based on customer&apos;s state selection. 0.00 indicates free shipping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label
                  htmlFor="shippingKerala"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1"
                >
                  Kerala Charge (₹) <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cocoa-600 text-xs font-bold">₹</span>
                  <input
                    id="shippingKerala"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={shippingKerala}
                    onChange={(e) => setShippingKerala(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-cocoa-600 block mt-1">Kerala deliveries</span>
              </div>

              <div>
                <label
                  htmlFor="shippingTnKar"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1"
                >
                  TN &amp; KA Charge (₹) <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cocoa-600 text-xs font-bold">₹</span>
                  <input
                    id="shippingTnKar"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={shippingTnKar}
                    onChange={(e) => setShippingTnKar(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-cocoa-600 block mt-1">Tamil Nadu &amp; Karnataka</span>
              </div>

              <div>
                <label
                  htmlFor="shippingOther"
                  className="block text-xs font-bold uppercase tracking-wider text-cocoa-950 mb-1"
                >
                  Other States Charge (₹) <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-cocoa-600 text-xs font-bold">₹</span>
                  <input
                    id="shippingOther"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={shippingOther}
                    onChange={(e) => setShippingOther(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-parchment border border-parchment-border rounded-lg text-sm font-mono text-cocoa-950 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-cocoa-600 block mt-1">Rest of India &amp; UTs</span>
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

        {/* RIGHT COLUMN: Product Images (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {mode === "edit" && product ? (
            <ProductImagesManager
              productId={product.id}
              initialImages={product.images || []}
              onImagesChange={(updatedList) => {
                setImagesList(updatedList);
                if (updatedList.length > 0) {
                  setImageUrl(updatedList[0].image_url);
                }
              }}
            />
          ) : (
            <ProductCreateImageUploader
              images={uploadedCreateImages}
              onImagesChange={setUploadedCreateImages}
              productName={name}
            />
          )}
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDeleteProduct}
        itemType="product"
        itemName={product?.name}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
