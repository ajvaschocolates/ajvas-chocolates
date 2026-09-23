export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  url?: string;
  altText?: string;
}

const MAX_HTTP_URL_LENGTH = 2048;
const MAX_DATA_URL_LENGTH = 500000; // ~375KB payload cap to prevent DB memory bloat
const MAX_ALT_TEXT_LENGTH = 500;

// Allowed raster base64 data URL types (PNG, JPEG, WebP, GIF)
const RASTER_DATA_URL_REGEX = /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i;

/**
 * Synchronous URL validation helper safe to import in both client and server modules.
 */
export function isValidImageUrl(url: string): boolean {
  return validateImageInput(url).valid;
}

/**
 * Comprehensive image input validator enforcing protocol, format, data payload size,
 * and alt text length limits.
 */
export function validateImageInput(
  url: string,
  altText?: string
): ImageValidationResult {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "Image URL is required." };
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return { valid: false, error: "Image URL cannot be blank." };
  }

  // Validate Alt Text length if provided
  const trimmedAltText = (altText || "").trim();
  if (trimmedAltText.length > MAX_ALT_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Alt text exceeds maximum length of ${MAX_ALT_TEXT_LENGTH} characters.`,
    };
  }

  // Handle Base64 / Data URLs
  if (trimmedUrl.startsWith("data:")) {
    if (!trimmedUrl.startsWith("data:image/")) {
      return {
        valid: false,
        error: "Invalid data URL. Only image data URLs are supported.",
      };
    }

    // Security policy: SVG data URLs disabled to prevent XSS payloads in stored strings
    if (trimmedUrl.startsWith("data:image/svg+xml")) {
      return {
        valid: false,
        error: "Inline SVG data URLs are disabled for security. Please use a raster image (PNG, JPEG, WebP, GIF) or hosted HTTP/HTTPS link.",
      };
    }

    if (!RASTER_DATA_URL_REGEX.test(trimmedUrl)) {
      return {
        valid: false,
        error: "Unsupported image data format. Only PNG, JPEG, WebP, and GIF base64 images are supported.",
      };
    }

    if (trimmedUrl.length > MAX_DATA_URL_LENGTH) {
      return {
        valid: false,
        error: `Data URL exceeds maximum allowed size limit (~375KB / ${MAX_DATA_URL_LENGTH} characters). Please use a smaller image file or hosted image URL.`,
      };
    }

    return {
      valid: true,
      url: trimmedUrl,
      altText: trimmedAltText || undefined,
    };
  }

  // Handle HTTP / HTTPS URLs
  if (trimmedUrl.length > MAX_HTTP_URL_LENGTH) {
    return {
      valid: false,
      error: `Image URL exceeds maximum length of ${MAX_HTTP_URL_LENGTH} characters.`,
    };
  }

  try {
    const parsed = new URL(trimmedUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        valid: false,
        error: "Only http:// and https:// image URLs are supported.",
      };
    }
    if (parsed.username || parsed.password) {
      return {
        valid: false,
        error: "URLs containing embedded credentials are not allowed.",
      };
    }
  } catch {
    return {
      valid: false,
      error: "Invalid URL format. Please provide a valid HTTP, HTTPS, or base64 image URL.",
    };
  }

  return {
    valid: true,
    url: trimmedUrl,
    altText: trimmedAltText || undefined,
  };
}
