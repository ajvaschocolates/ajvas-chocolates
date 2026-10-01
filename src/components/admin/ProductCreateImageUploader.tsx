"use client";

import { useState, useRef } from "react";
import {
  getCloudinaryUploadSignatureAction,
  deleteCloudinaryMediaAction,
} from "@/app/admin/products/actions";
import {
  validateMediaFile,
  prepareMediaFileForUpload,
} from "@/lib/utils/image-compression";
import {
  UploadCloud,
  Loader2,
  Trash2,
  Star,
  Check,
  AlertCircle,
} from "lucide-react";

export interface UploadedImageItem {
  id: string;
  url: string;
  publicId?: string;
  altText?: string;
  isMain: boolean;
}

interface ProductCreateImageUploaderProps {
  images: UploadedImageItem[];
  onImagesChange: (images: UploadedImageItem[]) => void;
  productName?: string;
}

export default function ProductCreateImageUploader({
  images,
  onImagesChange,
  productName = "",
}: ProductCreateImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function processFiles(fileList: FileList | File[]) {
    if (!fileList || fileList.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const filesArray = Array.from(fileList);
    let updatedImages = [...images];

    for (const file of filesArray) {
      const validationError = validateMediaFile(file);
      if (validationError) {
        setUploadError(`"${file.name}": ${validationError}`);
        continue;
      }

      try {
        setUploadingFileName(file.name);

        // Automatically compress file if > 2 MB (files <= 2 MB stay untouched)
        const fileToUpload = await prepareMediaFileForUpload(file);

        const sigRes = await getCloudinaryUploadSignatureAction("new");
        if (!sigRes.success || !sigRes.params) {
          throw new Error(sigRes.error || "Failed to generate upload signature.");
        }

        const { signature, timestamp, apiKey, cloudName, folder, publicId, tags } = sigRes.params;

        const uploadFormData = new FormData();
        uploadFormData.append("file", fileToUpload);
        uploadFormData.append("api_key", apiKey);
        uploadFormData.append("timestamp", String(timestamp));
        uploadFormData.append("signature", signature);
        uploadFormData.append("folder", folder);
        uploadFormData.append("public_id", publicId);
        uploadFormData.append("tags", tags);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const res = await fetch(uploadUrl, {
          method: "POST",
          body: uploadFormData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error?.message || "Upload to Cloudinary failed.");
        }

        const data = await res.json();
        const secureUrl = data.secure_url;
        const uploadedPublicId = data.public_id;

        if (secureUrl) {
          const isFirstImage = updatedImages.length === 0;
          const newImage: UploadedImageItem = {
            id: crypto.randomUUID(),
            url: secureUrl,
            publicId: uploadedPublicId,
            altText: productName || "Product image",
            isMain: isFirstImage,
          };
          updatedImages = [...updatedImages, newImage];
          onImagesChange(updatedImages);
        }
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : `Failed to upload "${file.name}".`
        );
      }
    }

    setIsUploading(false);
    setUploadingFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleSetMainImage(id: string) {
    const updated = images.map((img) => ({
      ...img,
      isMain: img.id === id,
    }));
    onImagesChange(updated);
  }

  function handleRemoveImage(id: string) {
    const target = images.find((img) => img.id === id);
    if (target?.publicId || target?.url) {
      deleteCloudinaryMediaAction(target.publicId || target.url).catch((err) => {
        console.warn("Cloudinary asset deletion error:", err);
      });
    }

    const remaining = images.filter((img) => img.id !== id);
    // If the removed image was main and there are remaining images, set the first as main
    if (remaining.length > 0 && !remaining.some((img) => img.isMain)) {
      remaining[0].isMain = true;
    }
    onImagesChange(remaining);
  }

  return (
    <section className="bg-parchment-surface border border-parchment-border rounded-xl p-6 shadow-2xs space-y-5">
      <div className="border-b border-parchment-border pb-3">
        <h2 className="font-sans text-lg font-bold text-cocoa-950">
          Product Images
        </h2>
        <p className="text-xs text-cocoa-600 mt-1">
          Select an image to upload it immediately. Choose one image as the Main Image for the product card.
        </p>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Upload Failed</span>
            <span>{uploadError}</span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Immediate Upload Dropzone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
          isDragging
            ? "border-burgundy bg-burgundy/5"
            : "border-parchment-border hover:border-cocoa-400 bg-parchment hover:bg-parchment-muted/60"
        } ${isUploading ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-8 h-8 text-burgundy animate-spin" />
            <p className="text-xs font-semibold text-cocoa-950">
              Uploading {uploadingFileName || "image"}...
            </p>
            <p className="text-[11px] text-cocoa-600">
              Please wait while your image is being uploaded to Cloudinary
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-cocoa-950">
                Click or drag &amp; drop to upload immediately
              </p>
              <p className="text-xs text-cocoa-600 mt-0.5">
                Supports JPG, PNG, WebP up to 4 MB (Auto-compressed above 2 MB)
              </p>
            </div>
            <button
              type="button"
              className="mt-1 px-3 py-1.5 rounded-lg bg-burgundy text-white text-xs font-semibold hover:bg-burgundy-hover transition shadow-2xs"
            >
              Choose Image File
            </button>
          </>
        )}
      </div>

      {/* Uploaded Images List */}
      {images.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs text-cocoa-600 font-medium">
            <span>Uploaded Product Images ({images.length})</span>
            <span className="text-[11px] text-cocoa-500">
              Selected Main Image is used on the product card
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {images.map((img) => {
              const isMain = img.isMain;

              return (
                <div
                  key={img.id}
                  className={`relative rounded-xl border p-3 transition flex flex-col justify-between ${
                    isMain
                      ? "border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/25 shadow-sm"
                      : "border-parchment-border bg-parchment hover:border-cocoa-400"
                  }`}
                >
                  {/* Image Thumbnail Container */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white border border-parchment-border mb-3">
                    <img
                      src={img.url}
                      alt={img.altText || "Product photo"}
                      className="w-full h-full object-cover"
                    />

                    {/* Prominent Badge for Main Image */}
                    {isMain && (
                      <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Main Image</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-parchment-line/60">
                    {isMain ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                        <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                        <span>Front of Card</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(img.id)}
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-white border border-cocoa-300 text-cocoa-900 hover:bg-cocoa-50 hover:border-cocoa-600 transition shadow-2xs flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        Set as Main
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      className="p-1.5 rounded-md text-cocoa-500 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
