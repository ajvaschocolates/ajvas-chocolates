"use client";

import { useState, useRef } from "react";
import { getCloudinaryUploadSignatureAction } from "@/app/admin/products/actions";
import { validateImageInput } from "@/lib/validation/image-url";
import {
  UploadCloud,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  FileImage,
  RefreshCw,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

interface ProductSingleImageUploaderProps {
  currentImageUrl: string;
  currentPublicId?: string;
  onImageChange: (imageUrl: string, publicId?: string) => void;
  productId?: string;
  title?: string;
  description?: string;
  dropzoneText?: string;
  getSignatureAction?: (targetId: string) => Promise<{
    success: boolean;
    error?: string;
    params?: {
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
      publicId: string;
      tags: string;
    };
  }>;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function ProductSingleImageUploader({
  currentImageUrl,
  currentPublicId,
  onImageChange,
  productId = "new",
  title = "Product Image",
  description = "Upload a high-resolution photo or specify an image URL.",
  dropzoneText = "Click or Drag & Drop product photo",
  getSignatureAction = getCloudinaryUploadSignatureAction,
}: ProductSingleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [inputMode, setInputMode] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual URL input state
  const [pastedUrl, setPastedUrl] = useState("");
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);

  const [isReplacing, setIsReplacing] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  function getAssetFilename(url: string): string {
    try {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart.split("?")[0]);
    } catch {
      return "Uploaded Asset";
    }
  }

  function validateFile(file: File): string | null {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Unsupported file format. Please choose a JPG, PNG, WebP, or GIF image.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds 10 MB limit (${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)} MB). Please select a smaller file.`;
    }
    return null;
  }

  function handleFileSelect(file: File) {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationErr = validateFile(file);
    if (validationErr) {
      setErrorMessage(validationErr);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleCancelUpload() {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setErrorMessage("Upload cancelled by user.");
  }

  async function handleStartUpload() {
    if (!selectedFile) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const sigRes = await getSignatureAction(productId);
      if (!sigRes.success || !sigRes.params) {
        throw new Error(
          sigRes.error || "Failed to obtain secure upload signature from server."
        );
      }

      const { signature, timestamp, apiKey, cloudName, folder, publicId, tags } =
        sigRes.params;

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("public_id", publicId);
      formData.append("tags", tags);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        setIsUploading(false);
        xhrRef.current = null;

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            const secureUrl = responseData.secure_url;
            const uploadedPublicId = responseData.public_id;

            if (!secureUrl || !uploadedPublicId) {
              throw new Error("Invalid response received from Cloudinary server.");
            }

            onImageChange(secureUrl, uploadedPublicId);
            setSuccessMessage("Image uploaded to Cloudinary successfully!");
            setSelectedFile(null);
            setIsReplacing(false);
            setImagePreviewError(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          } catch (err) {
            setErrorMessage(
              err instanceof Error ? err.message : "Error processing upload response."
            );
          }
        } else {
          let cloudErr = "Upload failed.";
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.error?.message) cloudErr = parsed.error.message;
          } catch {
            // fallback
          }
          setErrorMessage(`Cloudinary Upload Error: ${cloudErr}`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        xhrRef.current = null;
        setErrorMessage("Network error during Cloudinary upload. Please check connection.");
      };

      xhr.onabort = () => {
        setIsUploading(false);
        xhrRef.current = null;
      };

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setErrorMessage(
        err instanceof Error ? err.message : "Unexpected upload error occurred."
      );
    }
  }

  function handleApplyPastedUrl(e: React.FormEvent) {
    e.preventDefault();
    setUrlValidationError(null);
    setErrorMessage(null);

    const trimmed = pastedUrl.trim();
    if (!trimmed) {
      setUrlValidationError("Please enter an image URL.");
      return;
    }

    const validation = validateImageInput(trimmed, title);
    if (!validation.valid || !validation.url) {
      setUrlValidationError(validation.error || "Invalid image URL format.");
      return;
    }

    onImageChange(validation.url);
    setPastedUrl("");
    setIsReplacing(false);
    setImagePreviewError(false);
    setSuccessMessage("Image URL applied successfully.");
  }

  function handleRemoveImage() {
    onImageChange("");
    setSelectedFile(null);
    setIsReplacing(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  }

  return (
    <div className="bg-white border border-brand-sand/80 rounded-2xl p-4 sm:p-5 shadow-subtle space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-sand/60 pb-2.5">
        <div>
          <h2 className="font-sans text-base font-extrabold text-brand-navy">
            {title}
          </h2>
          <p className="font-sans text-xs text-brand-muted mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {/* Global Status Alerts */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans flex items-start justify-between gap-2"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Image Preview Card (If an image URL exists and not in replacing mode) */}
      {currentImageUrl && !isReplacing ? (
        <div className="rounded-xl border border-brand-sand/80 bg-brand-cream/40 p-3 sm:p-4 space-y-3">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-white border border-brand-sand/60 shrink-0 relative flex items-center justify-center">
              {!imagePreviewError ? (
                <img
                  src={currentImageUrl}
                  alt="Preview"
                  onError={() => setImagePreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-rose-500">
                  <ImageIcon className="w-6 h-6 mx-auto" />
                  <span className="text-[10px] font-medium block mt-1">Image Error</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-pink-light text-brand-pink border border-brand-pink/20">
                <CheckCircle2 className="w-3 h-3 text-brand-pink" />
                {currentImageUrl.includes("cloudinary.com")
                  ? "Cloudinary Asset"
                  : "External Image URL"}
              </span>

              <p className="font-sans text-xs text-brand-navy font-bold truncate block">
                {currentPublicId || getAssetFilename(currentImageUrl)}
              </p>

              <p className="font-mono text-[10px] text-brand-muted truncate block">
                {currentImageUrl}
              </p>

              <div className="flex items-center gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => setIsReplacing(true)}
                  className="px-3 py-1.5 rounded-full border border-cocoa-200 bg-white text-cocoa-800 hover:bg-parchment-hover text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3 h-3 text-cocoa-600" />
                  Replace Image
                </button>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Image Selection Controls (Tabs & Upload Area) */
        <div className="space-y-3">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 bg-brand-cream rounded-xl border border-brand-sand/60 w-fit">
              <button
                type="button"
                onClick={() => {
                  setInputMode("upload");
                  setErrorMessage(null);
                  setUrlValidationError(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs font-extrabold transition flex items-center gap-1.5 ${
                  inputMode === "upload"
                    ? "bg-brand-pink text-white shadow-xs"
                    : "text-brand-navy hover:bg-brand-pink-light/50"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload Image File
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode("url");
                  setErrorMessage(null);
                  setUrlValidationError(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs font-extrabold transition flex items-center gap-1.5 ${
                  inputMode === "url"
                    ? "bg-brand-pink text-white shadow-xs"
                    : "text-brand-navy hover:bg-brand-pink-light/50"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Paste Image URL
              </button>
            </div>

            {currentImageUrl && isReplacing && (
              <button
                type="button"
                onClick={() => setIsReplacing(false)}
                className="text-xs font-bold text-cocoa-600 hover:text-cocoa-900 underline"
              >
                Cancel Replace
              </button>
            )}
          </div>

          {/* TAB 1: File Upload */}
          {inputMode === "upload" && (
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center min-h-[160px] sm:min-h-[190px] rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-brand-pink bg-brand-pink-light/40"
                    : "border-brand-sand/80 bg-brand-cream/30 hover:border-brand-pink hover:bg-brand-pink-light/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_MIME_TYPES.join(",")}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-10 h-10 rounded-full bg-brand-pink-light/60 border border-brand-pink/20 flex items-center justify-center text-brand-pink mb-2">
                  <UploadCloud className="w-5 h-5 text-brand-pink" />
                </div>

                <p className="font-sans text-sm font-bold text-brand-navy">
                  {dropzoneText}
                </p>
                <p className="font-sans text-[11px] text-brand-muted mt-0.5 font-medium">
                  Supports JPG, PNG, WebP, GIF (Max 10 MB per image)
                </p>

                <div className="mt-3">
                  <span className="px-4 py-2 rounded-full bg-brand-pink text-white hover:bg-brand-pink-hover text-xs font-extrabold shadow-sm transition inline-flex items-center gap-2">
                    <UploadCloud className="w-3.5 h-3.5 text-white" />
                    Select Image File
                  </span>
                </div>
              </div>

              {/* Selected File Card & Start Upload */}
              {selectedFile && (
                <div className="rounded-xl border border-brand-sand/80 bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-navy truncate">
                      <FileImage className="w-4 h-4 text-brand-pink shrink-0" />
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="font-mono text-[10px] text-brand-muted font-normal">
                        ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>

                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-brand-muted hover:text-rose-600 p-1"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono text-brand-navy">
                        <span className="font-bold">Uploading to Cloudinary...</span>
                        <span className="font-bold text-brand-pink">{uploadProgress}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-brand-sand/40 overflow-hidden">
                        <div
                          className="h-full bg-brand-pink transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    {isUploading ? (
                      <button
                        type="button"
                        onClick={handleCancelUpload}
                        className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50 text-xs font-extrabold text-rose-800 hover:bg-rose-100 transition"
                      >
                        Cancel Upload
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStartUpload}
                        className="px-5 py-2.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-extrabold shadow-sm transition inline-flex items-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4 text-white" />
                        Upload File to Cloudinary
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Paste Image URL */}
          {inputMode === "url" && (
            <form onSubmit={handleApplyPastedUrl} className="space-y-3">
              <div>
                <label
                  htmlFor="pasted_image_url"
                  className="block text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-1.5"
                >
                  Or paste image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="pasted_image_url"
                    type="url"
                    value={pastedUrl}
                    onChange={(e) => {
                      setPastedUrl(e.target.value);
                      setUrlValidationError(null);
                    }}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    className="flex-1 px-4 py-2.5 bg-brand-cream/50 border border-brand-sand/80 rounded-xl text-xs font-sans text-brand-navy placeholder-brand-muted focus:outline-none focus:border-brand-pink"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-extrabold transition shrink-0"
                  >
                    Apply URL
                  </button>
                </div>
                {urlValidationError && (
                  <p className="text-xs font-medium text-rose-600 mt-1">
                    {urlValidationError}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
