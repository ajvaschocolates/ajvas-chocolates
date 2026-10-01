/**
 * Media Upload Utilities: File Size Guard & Automatic Client-Side Compression
 *
 * Rules:
 * 1. Files > 4 MB: Prevent upload (validation error).
 * 2. Files > 2 MB (up to 4 MB): Automatically compress using Canvas before uploading.
 * 3. Files <= 2 MB: Upload normally without compression.
 */

export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB limit
export const COMPRESSION_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2 MB compression threshold

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_MIME_TYPES = ALLOWED_IMAGE_MIME_TYPES;

/**
 * Validates a file against allowed formats and the 4 MB maximum file size limit.
 * Returns null if valid, or a descriptive error message if invalid.
 */
export function validateMediaFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    return "Unsupported file format. Please upload a JPG, PNG, WebP, or GIF image.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return `File size (${sizeMb} MB) exceeds the 4 MB maximum limit. Please select a file 4 MB or smaller.`;
  }

  return null;
}

/**
 * Prepares an image file for upload:
 * - If file size <= 2 MB: returns the original file untouched.
 * - If file size > 2 MB and <= 4 MB: automatically compresses it using Canvas.
 * - If file size > 4 MB: throws an error.
 */
export async function prepareMediaFileForUpload(file: File): Promise<File> {
  // 1. Files 2 MB or below upload normally without compression
  if (file.size <= COMPRESSION_THRESHOLD_BYTES) {
    return file;
  }

  // 2. Prevent upload if larger than 4 MB
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${sizeMb} MB) exceeds the 4 MB limit. Please select a smaller file.`
    );
  }

  // 3. Files between 2 MB and 4 MB: Automatically compress
  // If not an image (e.g. animated GIF or unsupported), don't break GIF frames
  if (file.type === "image/gif") {
    // For GIFs, return untouched or let user proceed if <= 4MB
    return file;
  }

  try {
    return await compressImageFile(file);
  } catch (err) {
    console.warn("Client-side image compression encountered an error, falling back to original:", err);
    return file;
  }
}

/**
 * Compresses an image file in the browser using HTML Canvas.
 * Adjusts dimensions if larger than 2048px and reduces quality until under 2 MB.
 */
async function compressImageFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = async () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Max resolution boundary (2048px on longest side)
          const MAX_DIMENSION = 2048;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Prefer WebP or JPEG for optimal compression ratio
          const outputMime = file.type === "image/webp" ? "image/webp" : "image/jpeg";
          const extension = outputMime === "image/webp" ? ".webp" : ".jpg";
          const newName = file.name.replace(/\.[^/.]+$/, "") + extension;

          // Quality tier ladder: start at 0.82, step down to 0.70 or 0.60 if still > 2 MB
          const qualities = [0.82, 0.72, 0.60];
          let finalBlob: Blob | null = null;

          for (const q of qualities) {
            const blob = await new Promise<Blob | null>((resBlob) => {
              canvas.toBlob((b) => resBlob(b), outputMime, q);
            });

            if (blob) {
              finalBlob = blob;
              // Stop once under 2 MB threshold
              if (blob.size <= COMPRESSION_THRESHOLD_BYTES) {
                break;
              }
            }
          }

          if (finalBlob) {
            const compressedFile = new File([finalBlob], newName, {
              type: outputMime,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        } catch {
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
