"use client";

import { useState, useTransition, useEffect } from "react";
import { ProductImage } from "@/types/catalog";
import CloudinaryImageUploader from "./CloudinaryImageUploader";
import {
  addProductImageAction,
  updateProductImageAction,
  deleteProductImageAction,
  reorderProductImagesAction,
  setPrimaryProductImageAction,
  cleanupOrphanedAssetAction,
} from "@/app/admin/products/actions";
import {
  isValidImageUrl,
  validateImageInput,
} from "@/lib/validation/image-url";
import {
  Plus,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertTriangle,
  X,
  Edit2,
  Sparkles,
  Link2,
  UploadCloud,
} from "lucide-react";

interface ProductImagesManagerProps {
  productId: string;
  initialImages: ProductImage[];
  onImagesChange?: (images: ProductImage[]) => void;
}

export default function ProductImagesManager({
  productId,
  initialImages,
  onImagesChange,
}: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(
    [...initialImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
  );

  const [isPending, startTransition] = useTransition();

  // Tab State: "upload" (Cloudinary Direct File Drop) vs "url" (External Web Link)
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");

  // Inline Editing State
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  // Sync images state with server prop when not actively editing
  useEffect(() => {
    if (!isPending && !editingImageId) {
      const sorted = [...initialImages].sort(
        (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
      );
      setImages(sorted);
    }
  }, [initialImages, isPending, editingImageId]);

  // URL Fallback Input Form State
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const [newImagePreviewError, setNewImagePreviewError] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Image State (inline editing per image ID)
  const [editUrl, setEditUrl] = useState("");
  const [editAltText, setEditAltText] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Dialog State
  const [deletingImage, setDeletingImage] = useState<ProductImage | null>(null);

  // Image load error tracking for thumbnails
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // Banner status
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [cleanupPublicId, setCleanupPublicId] = useState<string | null>(null);

  // Accessibility keyboard handler for Escape key on Delete Dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && deletingImage) {
        setDeletingImage(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deletingImage]);

  function notifyParent(updatedList: ProductImage[]) {
    setImages(updatedList);
    if (onImagesChange) {
      onImagesChange(updatedList);
    }
  }

  function handleImageLoadError(imageId: string) {
    setFailedImageIds((prev) => ({ ...prev, [imageId]: true }));
  }

  // Handle Cloudinary File Upload Success
  async function handleCloudinaryUploadSuccess(
    imageUrl: string,
    publicId: string,
    altText?: string
  ) {
    setAddError(null);
    setStatusMessage(null);
    setWarningMessage(null);

    const res = await addProductImageAction(
      productId,
      imageUrl,
      altText,
      publicId
    );

    if (res.success && res.images) {
      notifyParent(res.images);
      setStatusMessage({
        type: "success",
        text: "Cloudinary media file uploaded and added to gallery!",
      });
    } else {
      setAddError(res.error || "Failed to record uploaded media in database.");
    }
  }

  // Handle External Image URL Add
  function handleAddImageUrl(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setStatusMessage(null);
    setWarningMessage(null);

    const validation = validateImageInput(newImageUrl, newAltText);
    if (!validation.valid || !validation.url) {
      setAddError(validation.error || "Invalid image URL format.");
      return;
    }

    startTransition(async () => {
      const res = await addProductImageAction(
        productId,
        validation.url!,
        validation.altText
      );

      if (res.success && res.images) {
        notifyParent(res.images);
        setNewImageUrl("");
        setNewAltText("");
        setNewImagePreviewError(false);
        setStatusMessage({ type: "success", text: "External image link added to gallery!" });
      } else {
        setAddError(res.error || "Failed to add image link.");
      }
    });
  }

  // Open Edit Mode for an image
  function handleStartEdit(img: ProductImage) {
    setEditingImageId(img.id);
    setEditUrl(img.image_url);
    setEditAltText(img.alt_text || "");
    setEditError(null);
  }

  // Save Inline Edit
  function handleSaveEdit(img: ProductImage) {
    setEditError(null);
    setStatusMessage(null);
    setWarningMessage(null);

    const validation = validateImageInput(editUrl, editAltText);
    if (!validation.valid || !validation.url) {
      setEditError(validation.error || "Invalid image URL format.");
      return;
    }

    startTransition(async () => {
      const res = await updateProductImageAction(
        img.id,
        productId,
        validation.url!,
        validation.altText
      );

      if (res.success && res.images) {
        notifyParent(res.images);
        setEditingImageId(null);
        setFailedImageIds((prev) => ({ ...prev, [img.id]: false }));
        setStatusMessage({ type: "success", text: "Image updated successfully!" });
      } else {
        setEditError(res.error || "Failed to update image.");
      }
    });
  }

  // Handle Set Primary Image with Optimistic Rollback
  function handleSetPrimary(img: ProductImage) {
    if (images[0]?.id === img.id || isPending) return;
    setStatusMessage(null);
    setWarningMessage(null);

    const previousImages = [...images];

    // Optimistically move target image to index 0
    const reordered = [
      img,
      ...images.filter((item) => item.id !== img.id),
    ].map((item, idx) => ({ ...item, sort_order: idx }));

    notifyParent(reordered);

    startTransition(async () => {
      const res = await setPrimaryProductImageAction(img.id, productId);

      if (res.success && res.images) {
        notifyParent(res.images);
        setStatusMessage({
          type: "success",
          text: `"${img.alt_text || "Image"}" set as primary storefront image!`,
        });
      } else {
        // Rollback optimistic update on error
        notifyParent(previousImages);
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to set primary image. Order restored.",
        });
      }
    });
  }

  // Handle Move Up / Move Down with Optimistic Rollback
  function handleMove(index: number, direction: "up" | "down") {
    if (isPending) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setStatusMessage(null);
    setWarningMessage(null);

    const previousImages = [...images];

    const newOrder = [...images];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    const reindexed = newOrder.map((item, idx) => ({ ...item, sort_order: idx }));
    notifyParent(reindexed);

    startTransition(async () => {
      const orderedIds = reindexed.map((img) => img.id);
      const res = await reorderProductImagesAction(productId, orderedIds);

      if (res.success && res.images) {
        notifyParent(res.images);
      } else {
        // Rollback optimistic update on error
        notifyParent(previousImages);
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to reorder images. Order restored.",
        });
      }
    });
  }

  // Confirm & Delete Image
  function handleConfirmDelete() {
    if (!deletingImage || isPending) return;
    setStatusMessage(null);
    setWarningMessage(null);
    setCleanupPublicId(null);

    startTransition(async () => {
      const res = await deleteProductImageAction(deletingImage.id, productId);

      if (res.success && res.images) {
        notifyParent(res.images);
        setDeletingImage(null);

        if (res.warning) {
          setWarningMessage(res.warning);
          setCleanupPublicId(res.cleanupPublicId || null);
        } else {
          setStatusMessage({ type: "success", text: "Image removed from product gallery." });
        }
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to remove image.",
        });
      }
    });
  }

  // Retry Cloudinary Cleanup for orphaned/failed asset destruction
  function handleRetryCloudinaryCleanup() {
    if (!cleanupPublicId || isPending) return;
    const targetPublicId = cleanupPublicId;

    startTransition(async () => {
      const res = await cleanupOrphanedAssetAction(targetPublicId, productId);
      if (res.success) {
        setWarningMessage(null);
        setCleanupPublicId(null);
        setStatusMessage({
          type: "success",
          text: `Cloudinary asset (${targetPublicId}) destroyed successfully.`,
        });
      } else {
        setStatusMessage({
          type: "error",
          text: `Cleanup retry failed: ${res.error || "Unknown error"}`,
        });
      }
    });
  }

  return (
    <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-parchment-border pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-lg font-bold text-cocoa-950">
              Product Images &amp; Media Gallery
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gold-100 text-gold-900 border border-gold-300 uppercase tracking-wider">
              {images.length} {images.length === 1 ? "Image" : "Images"}
            </span>
          </div>
          <p className="text-xs text-cocoa-600 mt-1">
            Upload media via Cloudinary or link external image URLs. Position #1 is the primary storefront card photo.
          </p>
        </div>
      </div>

      {/* Global Status Alert Banner */}
      {statusMessage && (
        <div
          aria-live="polite"
          className={`flex items-center justify-between rounded-lg p-3 text-xs font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            aria-label="Dismiss message"
            className="p-1 hover:opacity-75 focus:outline-none focus:ring-1 focus:ring-cocoa-400 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Partial Failure Warning Banner */}
      {warningMessage && (
        <div
          aria-live="polite"
          className="flex items-start justify-between rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1.5">
              <div>{warningMessage}</div>
              {cleanupPublicId && (
                <button
                  type="button"
                  onClick={handleRetryCloudinaryCleanup}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-amber-200 text-amber-950 hover:bg-amber-300 transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Retry Cloudinary Cleanup
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            aria-label="Dismiss warning"
            className="p-1 hover:opacity-75"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Media Input Modes: Tabbed Switcher */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-cocoa-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
              activeTab === "upload"
                ? "bg-cocoa-900 text-white shadow-xs"
                : "text-cocoa-700 hover:bg-parchment-hover hover:text-cocoa-950"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Cloudinary Direct Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
              activeTab === "url"
                ? "bg-cocoa-900 text-white shadow-xs"
                : "text-cocoa-700 hover:bg-parchment-hover hover:text-cocoa-950"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" />
            External Image URL Link
          </button>
        </div>

        {/* Tab 1: Cloudinary Direct File Dropzone */}
        {activeTab === "upload" && (
          <CloudinaryImageUploader
            productId={productId}
            onUploadSuccess={handleCloudinaryUploadSuccess}
            onError={(msg) => setAddError(msg)}
          />
        )}

        {/* Tab 2: External Image URL Link Input Form */}
        {activeTab === "url" && (
          <form
            onSubmit={handleAddImageUrl}
            className="rounded-xl border border-cocoa-200/80 bg-parchment-card p-4 space-y-4"
          >
            <h3 className="font-sans text-sm font-bold text-cocoa-950 flex items-center gap-1.5">
              <Link2 className="h-4 w-4 text-gold-600" />
              Add External Image URL
            </h3>

            {addError && (
              <div
                aria-live="polite"
                className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div>{addError}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* URL Input */}
              <div className="md:col-span-7">
                <label
                  htmlFor="new_image_url"
                  className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1"
                >
                  Image URL <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cocoa-400" />
                  <input
                    id="new_image_url"
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      setNewImagePreviewError(false);
                      setAddError(null);
                    }}
                    placeholder="https://images.unsplash.com/... or hosted image URL"
                    className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface pl-8 pr-3 py-2 text-xs text-cocoa-900 placeholder-cocoa-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Alt Text Input */}
              <div className="md:col-span-5">
                <label
                  htmlFor="new_alt_text"
                  className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1"
                >
                  Alt Text (Description)
                </label>
                <input
                  id="new_alt_text"
                  type="text"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  placeholder="e.g. Artisan Dark Chocolate Box"
                  className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 placeholder-cocoa-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>

            {/* Live Add Image Preview Box */}
            {newImageUrl.trim() && (
              <div className="flex items-center gap-4 pt-1">
                <div className="h-16 w-20 rounded-lg border border-cocoa-200 bg-parchment-muted overflow-hidden flex items-center justify-center shrink-0">
                  {!newImagePreviewError ? (
                    <img
                      src={newImageUrl.trim()}
                      alt="New Image Preview"
                      onError={() => setNewImagePreviewError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-0.5 text-rose-600 p-1 text-center">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-[9px] leading-tight">Image Load Error</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-cocoa-600">
                  {newImagePreviewError ? (
                    <span className="text-rose-600 font-medium">
                      Warning: Unable to render image from this URL. Please verify the URL syntax.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Valid live image preview
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !newImageUrl.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-600 px-4 py-2 text-xs font-semibold text-cocoa-950 shadow-sm hover:bg-gold-500 focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding Link...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add External Image Link
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Image Gallery Cards Grid */}
      {images.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-cocoa-200 bg-parchment-card">
          <ImageIcon className="mx-auto h-10 w-10 text-cocoa-400" />
          <h4 className="mt-2 font-sans text-base font-semibold text-cocoa-900">
            No product images in gallery
          </h4>
          <p className="mt-1 text-xs text-cocoa-600">
            Upload a file or add an image URL above to showcase this product on the storefront.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-cocoa-600">
            <span>
              Image #1 is designated as the <strong>Primary Storefront Image</strong>.
            </span>
            <span className="font-mono text-[11px]">
              {images.length} {images.length === 1 ? "card" : "cards"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.map((img, index) => {
              const isPrimary = index === 0;
              const isEditing = editingImageId === img.id;
              const hasFailed = failedImageIds[img.id];
              const isCloudinaryAsset =
                img.cloudinary_public_id &&
                !img.cloudinary_public_id.startsWith("external_url_");

              return (
                <div
                  key={img.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isPrimary
                      ? "border-gold-400 bg-gold-50/20 shadow-xs ring-1 ring-gold-400/50"
                      : "border-cocoa-200 bg-parchment-card"
                  }`}
                >
                  {/* Card Badge Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-cocoa-100">
                    <div className="flex items-center gap-2">
                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-600 px-2.5 py-0.5 font-mono text-[10px] font-bold text-cocoa-950 uppercase tracking-wider shadow-xs">
                          <Star className="h-3 w-3 fill-cocoa-950 text-cocoa-950" />
                          Primary Image
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-parchment-surface px-2.5 py-0.5 font-mono text-[10px] text-cocoa-600 border border-cocoa-200">
                          #{index + 1}
                        </span>
                      )}

                      {isCloudinaryAsset ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[9px] font-medium text-blue-800 border border-blue-200">
                          Cloudinary Media
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-parchment-surface px-2 py-0.5 font-mono text-[9px] font-medium text-cocoa-600 border border-cocoa-200">
                          External Link
                        </span>
                      )}
                    </div>

                    {/* Reordering Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0 || isPending}
                        aria-label={`Move image #${index + 1} up`}
                        title="Move Image Up"
                        className="rounded p-1 text-cocoa-600 hover:bg-parchment-hover focus:ring-1 focus:ring-gold-500 focus:outline-none disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === images.length - 1 || isPending}
                        aria-label={`Move image #${index + 1} down`}
                        title="Move Image Down"
                        className="rounded p-1 text-cocoa-600 hover:bg-parchment-hover focus:ring-1 focus:ring-gold-500 focus:outline-none disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail & Info Body */}
                  <div className="flex gap-4 pt-3">
                    {/* Thumbnail Box */}
                    <div className="h-24 w-28 rounded-lg border border-cocoa-200 bg-parchment-muted overflow-hidden flex items-center justify-center shrink-0 relative">
                      {!hasFailed ? (
                        <img
                          src={isEditing ? editUrl : img.image_url}
                          alt={img.alt_text || `Product image #${index + 1}`}
                          onError={() => handleImageLoadError(img.id)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-amber-700 p-1 text-center">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="text-[9px] leading-tight font-medium">Load Error</span>
                        </div>
                      )}
                    </div>

                    {/* Image Details / Edit Form */}
                    <div className="flex-1 space-y-2 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          {editError && (
                            <div className="text-[10px] text-rose-700">{editError}</div>
                          )}
                          <div>
                            <label
                              htmlFor={`edit_url_${img.id}`}
                              className="block text-[10px] font-mono uppercase text-cocoa-600 mb-0.5"
                            >
                              Image URL
                            </label>
                            <input
                              id={`edit_url_${img.id}`}
                              type="text"
                              value={editUrl}
                              onChange={(e) => {
                                setEditUrl(e.target.value);
                                setFailedImageIds((prev) => ({ ...prev, [img.id]: false }));
                              }}
                              className="w-full rounded border border-cocoa-200 bg-parchment-surface px-2 py-1 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`edit_alt_${img.id}`}
                              className="block text-[10px] font-mono uppercase text-cocoa-600 mb-0.5"
                            >
                              Alt Text
                            </label>
                            <input
                              id={`edit_alt_${img.id}`}
                              type="text"
                              value={editAltText}
                              onChange={(e) => setEditAltText(e.target.value)}
                              className="w-full rounded border border-cocoa-200 bg-parchment-surface px-2 py-1 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(img)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 rounded bg-gold-600 px-2.5 py-1 text-[11px] font-semibold text-cocoa-950 focus:ring-1 focus:ring-gold-500 focus:outline-none"
                            >
                              <Check className="h-3 w-3" /> Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingImageId(null)}
                              className="rounded border border-cocoa-200 px-2 py-1 text-[11px] text-cocoa-600 hover:bg-parchment-hover focus:outline-none"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="block text-[10px] font-mono uppercase text-cocoa-500">
                              Alt Text
                            </span>
                            <p className="text-xs font-semibold text-cocoa-950 truncate">
                              {img.alt_text || (
                                <span className="italic text-cocoa-400">No alt text specified</span>
                              )}
                            </p>
                          </div>

                          <div>
                            <span className="block text-[10px] font-mono uppercase text-cocoa-500">
                              Asset Key / URL
                            </span>
                            <p
                              className="text-[11px] font-mono text-cocoa-600 truncate"
                              title={img.image_url}
                            >
                              {img.cloudinary_public_id || img.image_url}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  {!isEditing && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-cocoa-100/80">
                      <div>
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(img)}
                            disabled={isPending}
                            aria-label={`Set image #${index + 1} as primary`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-900 focus:outline-none disabled:opacity-50"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Set as Primary
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(img)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-xs text-cocoa-700 hover:text-cocoa-950 focus:outline-none disabled:opacity-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingImage(img)}
                          disabled={isPending}
                          className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 focus:outline-none disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accessible Delete Confirmation Modal */}
      {deletingImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete_modal_title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-parchment-card p-6 shadow-xl">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3 text-rose-700">
                <div className="rounded-full bg-rose-100 p-2 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 id="delete_modal_title" className="font-sans text-lg font-bold text-cocoa-950">
                  Remove Product Image
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingImage(null)}
                aria-label="Close dialog"
                className="rounded p-1 text-cocoa-400 hover:text-cocoa-700 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg border border-cocoa-200 bg-parchment-surface">
              <div className="h-14 w-16 rounded overflow-hidden bg-parchment-muted shrink-0">
                <img
                  src={deletingImage.image_url}
                  alt={deletingImage.alt_text || "Delete preview"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-xs text-cocoa-800 min-w-0">
                <p className="font-semibold truncate">
                  {deletingImage.alt_text || "Product Image"}
                </p>
                <p className="font-mono text-[10px] text-cocoa-500 truncate">
                  {deletingImage.cloudinary_public_id || deletingImage.image_url}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-cocoa-700 leading-relaxed">
              Are you sure you want to remove this image from the product gallery?
            </p>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-cocoa-100 mt-6">
              <button
                type="button"
                onClick={() => setDeletingImage(null)}
                disabled={isPending}
                className="rounded-lg border border-cocoa-200 px-4 py-2 font-mono text-xs text-cocoa-700 hover:bg-parchment-hover focus:outline-none disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:outline-none disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove Image"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
