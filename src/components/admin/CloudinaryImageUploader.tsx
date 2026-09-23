"use client";

import { useState, useRef } from "react";
import { getCloudinaryUploadSignatureAction } from "@/app/admin/products/actions";
import {
  UploadCloud,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  FileImage,
  RefreshCw,
} from "lucide-react";

interface CloudinaryImageUploaderProps {
  productId: string;
  onUploadSuccess: (
    imageUrl: string,
    publicId: string,
    altText?: string
  ) => Promise<void> | void;
  onError?: (error: string) => void;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB app-level cap
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function CloudinaryImageUploader({
  productId,
  onUploadSuccess,
  onError,
}: CloudinaryImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function validateFile(file: File): string | null {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Unsupported file format. Only JPG, PNG, WebP, and GIF images are allowed.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds the 10 MB maximum limit (${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)} MB). Please select a smaller file.`;
    }
    return null;
  }

  function handleFileSelect(file: File) {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      if (onError) onError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!altText) {
      // Auto-populate initial alt text from file name without extension
      const defaultAlt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setAltText(defaultAlt);
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
      // Step 1: Request signed upload signature from server
      const sigRes = await getCloudinaryUploadSignatureAction(productId);
      if (!sigRes.success || !sigRes.params) {
        throw new Error(
          sigRes.error || "Failed to obtain secure upload signature from server."
        );
      }

      const { signature, timestamp, apiKey, cloudName, folder, publicId, tags } =
        sigRes.params;

      // Step 2: Prepare FormData for direct upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("public_id", publicId);
      formData.append("tags", tags);

      // Step 3: Direct XMLHttpRequest upload with live progress tracking
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
            const cloudinaryData = JSON.parse(xhr.responseText);
            const secureUrl = cloudinaryData.secure_url;
            const uploadedPublicId = cloudinaryData.public_id;

            if (!secureUrl || !uploadedPublicId) {
              throw new Error("Invalid response received from Cloudinary media server.");
            }

            // Step 4: Associate uploaded media in Supabase database via Server Action
            await onUploadSuccess(secureUrl, uploadedPublicId, altText);

            setSuccessMessage("File uploaded and added to product gallery successfully!");
            setSelectedFile(null);
            setAltText("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          } catch (err) {
            const msg =
              err instanceof Error
                ? err.message
                : "Failed to record uploaded image in database.";
            setErrorMessage(msg);
            if (onError) onError(msg);
          }
        } else {
          let cloudErr = "Upload request failed.";
          try {
            const parsed = JSON.parse(xhr.responseText);
            if (parsed.error?.message) cloudErr = parsed.error.message;
          } catch {
            // fallback
          }
          setErrorMessage(`Cloudinary Upload Error: ${cloudErr}`);
          if (onError) onError(`Cloudinary Upload Error: ${cloudErr}`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        xhrRef.current = null;
        const msg = "Network error occurred while uploading file to Cloudinary.";
        setErrorMessage(msg);
        if (onError) onError(msg);
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
      const msg = err instanceof Error ? err.message : "Unexpected upload error.";
      setErrorMessage(msg);
      if (onError) onError(msg);
    }
  }

  return (
    <div className="space-y-4">
      {/* Alert Status Banners */}
      {errorMessage && (
        <div
          aria-live="polite"
          className="flex items-start justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:opacity-75"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          aria-live="polite"
          className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <div>{successMessage}</div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:opacity-75"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
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
          <UploadCloud className="h-5 w-5 text-brand-pink" />
        </div>
        <p className="font-serif text-sm font-bold text-brand-navy">
          Click or Drag &amp; Drop product photo here
        </p>
        <p className="font-sans text-xs text-brand-muted mt-1 font-medium">
          Supports JPG, PNG, WebP, GIF (Max 10 MB per image)
        </p>
      </div>

      {/* Selected File Details & Upload Action */}
      {selectedFile && (
        <div className="rounded-xl border border-brand-sand/80 bg-white p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-navy truncate">
              <FileImage className="h-4 w-4 text-brand-pink shrink-0" />
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
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div>
            <label
              htmlFor="upload_alt_text"
              className="block text-[11px] font-extrabold uppercase text-brand-navy mb-1"
            >
              Alt Text (Descriptive Caption)
            </label>
            <input
              id="upload_alt_text"
              type="text"
              value={altText}
              disabled={isUploading}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Artisan Dark Chocolate Gift Box"
              className="w-full rounded-lg border border-brand-sand/80 bg-brand-cream/30 px-3 py-1.5 text-xs text-brand-navy focus:border-brand-pink focus:outline-none"
            />
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs font-mono text-brand-navy">
                <span className="font-bold">Uploading to Cloudinary...</span>
                <span className="font-bold text-brand-pink">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-brand-sand/40 overflow-hidden">
                <div
                  className="h-full bg-brand-pink transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isUploading ? (
              <button
                type="button"
                onClick={handleCancelUpload}
                className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 font-sans text-xs font-extrabold text-rose-800 hover:bg-rose-100 transition"
              >
                Cancel Upload
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartUpload}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-full bg-brand-pink px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-brand-pink-hover transition focus:outline-none"
              >
                <UploadCloud className="h-4 w-4 text-white" />
                Upload File to Cloudinary
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
