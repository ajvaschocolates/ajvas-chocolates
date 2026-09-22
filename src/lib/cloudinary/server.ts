import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary server-side SDK using environment variables.
 * Secret keys are strictly kept server-side and never exposed to client bundles.
 */
function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return { cloudName, apiKey, apiSecret };
}

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  tags: string;
}

/**
 * Server-side helper to generate SHA-256 signed upload parameters for a specific product.
 * Locks folder, public_id, and tags into the signature string.
 */
export function generateSignedUploadParams(
  productId: string
): SignedUploadParams {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error(
      "Cloudinary environment variables (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing."
    );
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const randomSuffix = crypto.randomUUID().replace(/-/g, "");
  const folder = `ajvas_chocolates/products/${productId}`;
  const publicId = `img_${productId}_${randomSuffix}`;
  const tags = `ajvas_product,prod_${productId}`;

  // Signature calculation over locked params
  const paramsToSign = {
    folder,
    public_id: publicId,
    tags,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    config.apiSecret
  );

  return {
    signature,
    timestamp,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder,
    publicId,
    tags,
  };
}

export interface VerifyAssetResult {
  valid: boolean;
  isExternal?: boolean;
  error?: string;
  resource?: {
    publicId: string;
    secureUrl: string;
    url: string;
    folder?: string;
    tags?: string[];
  };
}

// Recognized Cloudinary crop modes
const CLOUDINARY_CROP_MODES = new Set([
  "fill",
  "fit",
  "limit",
  "mfit",
  "fill_pad",
  "lfill",
  "pad",
  "lpad",
  "mpad",
  "crop",
  "scale",
  "thumb",
  "imagga_crop",
  "imagga_scale",
]);

// Recognized Cloudinary format keywords
const CLOUDINARY_FORMATS = new Set([
  "auto",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "svg",
  "pdf",
]);

/**
 * Tests whether a URL path segment is a valid Cloudinary transformation segment.
 * Checks known transformation parameter keys (c_, w_, h_, q_, f_, dpr_, etc.) and their value patterns.
 */
function isCloudinaryTransformationSegment(seg: string): boolean {
  if (!seg) return false;
  const params = seg.split(",");
  return params.every((param) => {
    const parts = param.split("_");
    if (parts.length < 2) return false;
    const key = parts[0];
    const val = parts.slice(1).join("_");

    switch (key) {
      case "c":
        return CLOUDINARY_CROP_MODES.has(val);
      case "w":
      case "h":
        return /^\d+(\.\d+)?$/.test(val) || val === "auto" || val === "iw" || val === "ih";
      case "q":
        return /^\d+$/.test(val) || val.startsWith("auto");
      case "f":
        return CLOUDINARY_FORMATS.has(val);
      case "dpr":
        return /^\d+(\.\d+)?$/.test(val) || val === "auto";
      case "fl":
        return /^[a-z0-9_]+$/i.test(val);
      case "e":
      case "b":
      case "r":
      case "a":
      case "g":
      case "t":
      case "l":
      case "u":
      case "pg":
      case "dn":
      case "bo":
      case "co":
      case "o":
      case "z":
      case "x":
      case "y":
      case "ar":
        return /^[a-z0-9_:\.]+/i.test(val);
      default:
        return false;
    }
  });
}

/**
 * Validates that an expected image URL corresponds to a canonical Cloudinary asset public ID.
 * Enforces HTTPS, authorized hostnames, matching configured cloud_name, precise transformation/version parsing,
 * and exact normalized public ID equality (without suffix matching).
 */
export function validateCloudinaryUrlCorrespondence(
  expectedUrl: string,
  canonicalPublicId: string
): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(expectedUrl.trim());

    // 1. Enforce HTTPS protocol
    if (parsed.protocol !== "https:") {
      return {
        valid: false,
        error: `Invalid URL protocol '${parsed.protocol}'. Cloudinary URLs must use HTTPS.`,
      };
    }

    // 2. Reject URLs with embedded credentials
    if (parsed.username || parsed.password) {
      return {
        valid: false,
        error: "URLs containing embedded credentials are not allowed.",
      };
    }

    const config = getCloudinaryConfig();
    const expectedCloudName = (config?.cloudName || "").toLowerCase();

    if (!expectedCloudName) {
      return {
        valid: false,
        error: "Cloudinary cloud_name configuration is missing on server.",
      };
    }

    // 3. Domain and Cloud Name validation
    const hostname = parsed.hostname.toLowerCase();
    const isSharedDomain = hostname === "res.cloudinary.com" || hostname === "cloudinary.com";
    const isCustomCloudDomain = hostname === `${expectedCloudName}.cloudinary.com`;

    if (!isSharedDomain && !isCustomCloudDomain) {
      return {
        valid: false,
        error: `Submitted image URL domain '${hostname}' is not authorized for cloud '${expectedCloudName}'.`,
      };
    }

    const pathname = parsed.pathname;

    // 4. Verify path contains cloud_name and /image/upload/
    let afterUploadPath = "";
    if (isSharedDomain) {
      const expectedPrefix = `/${expectedCloudName}/image/upload/`;
      if (!pathname.startsWith(expectedPrefix)) {
        return {
          valid: false,
          error: `URL path does not match expected cloud prefix '${expectedPrefix}'.`,
        };
      }
      afterUploadPath = pathname.substring(expectedPrefix.length);
    } else {
      const expectedPrefix = `/image/upload/`;
      if (!pathname.startsWith(expectedPrefix)) {
        return {
          valid: false,
          error: `URL path does not match expected upload prefix '${expectedPrefix}'.`,
        };
      }
      afterUploadPath = pathname.substring(expectedPrefix.length);
    }

    if (!afterUploadPath) {
      return {
        valid: false,
        error: "Submitted image URL lacks asset public ID path after '/image/upload/'.",
      };
    }

    // 5. Precise public ID path extraction
    let urlPublicIdPathWithExt = "";

    // Check if path contains explicit version segment /v<digits>/
    const versionMatch = afterUploadPath.match(/^(.*?\/)?v\d+\/(.+)$/);
    if (versionMatch) {
      // Everything after /v<digits>/ is guaranteed to be the public ID path!
      urlPublicIdPathWithExt = versionMatch[2];
    } else {
      // Filter out leading transformation segments if no version segment is present
      const rawSegments = afterUploadPath.split("/").filter(Boolean);
      const publicIdSegments: string[] = [];
      let pastTransformations = false;

      for (const seg of rawSegments) {
        if (!pastTransformations && isCloudinaryTransformationSegment(seg)) {
          continue;
        }
        pastTransformations = true;
        publicIdSegments.push(seg);
      }
      urlPublicIdPathWithExt = publicIdSegments.join("/");
    }

    if (!urlPublicIdPathWithExt) {
      return {
        valid: false,
        error: "Could not extract a valid public ID path from URL.",
      };
    }

    // Strip file extension (.jpg, .png, .webp, etc.)
    const urlPublicIdPath = urlPublicIdPathWithExt.replace(/\.[^/.]+$/, "");
    const canonicalPublicIdWithoutExt = canonicalPublicId.replace(/\.[^/.]+$/, "");

    // 6. EXACT normalized public_id match ONLY
    const matchesExact =
      urlPublicIdPath === canonicalPublicId ||
      urlPublicIdPath === canonicalPublicIdWithoutExt;

    if (!matchesExact) {
      return {
        valid: false,
        error: `Submitted image URL public ID '${urlPublicIdPath}' does not match canonical Cloudinary public ID '${canonicalPublicId}'.`,
      };
    }

    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Failed to parse submitted image URL: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Server-side helper to verify a Cloudinary asset's actual existence, canonical public ID,
 * product ownership (via signed server tags AND folder), and URL correspondence using Cloudinary's authenticated Admin API.
 */
export async function verifyCloudinaryAssetProductOwnership(
  publicId: string,
  productId: string,
  expectedUrl?: string
): Promise<VerifyAssetResult> {
  if (!publicId || typeof publicId !== "string" || !productId) {
    return { valid: false, error: "Public ID and Product ID are required for verification." };
  }

  // External URL markers are non-Cloudinary fallback identifiers
  if (publicId.startsWith("external_url_")) {
    return {
      valid: false,
      isExternal: true,
      error: "External URL markers are non-Cloudinary identifiers and cannot be verified via Cloudinary API.",
    };
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return {
      valid: false,
      error: "Cloudinary server credentials (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) missing on server.",
    };
  }

  try {
    // Authenticated API call to Cloudinary Admin API to fetch asset metadata
    const resource = await cloudinary.api.resource(publicId, {
      tags: true,
      context: true,
    });

    if (!resource || !resource.public_id) {
      return { valid: false, error: "Cloudinary API returned empty or invalid asset resource." };
    }

    // 1. Verify canonical Public ID exact match
    if (resource.public_id !== publicId) {
      return {
        valid: false,
        error: `Cloudinary public_id mismatch. Expected: ${publicId}, got: ${resource.public_id}`,
      };
    }

    // 2. Require BOTH matching product tag AND folder path for trustworthy product ownership
    const expectedTag = `prod_${productId}`;
    const expectedFolderPrefix = `ajvas_chocolates/products/${productId}`;

    const hasMatchingTag = Array.isArray(resource.tags) && resource.tags.includes(expectedTag);
    const hasMatchingFolder =
      typeof resource.folder === "string" &&
      (resource.folder === expectedFolderPrefix || resource.folder.startsWith(`${expectedFolderPrefix}/`));

    if (!hasMatchingTag || !hasMatchingFolder) {
      return {
        valid: false,
        error: `Asset product association unverified. Required tag 'prod_${productId}' (found: ${
          hasMatchingTag ? "yes" : "no"
        }) and folder '${expectedFolderPrefix}' (found: ${hasMatchingFolder ? "yes" : "no"}).`,
      };
    }

    // 3. Verify URL correspondence with strict parser if expectedUrl is provided
    if (expectedUrl) {
      const urlValidation = validateCloudinaryUrlCorrespondence(expectedUrl, resource.public_id);
      if (!urlValidation.valid) {
        return {
          valid: false,
          error: urlValidation.error || "Submitted image URL does not correspond to Cloudinary asset.",
        };
      }
    }

    return {
      valid: true,
      resource: {
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
        url: resource.url,
        folder: resource.folder,
        tags: resource.tags,
      },
    };
  } catch (err: any) {
    if (err?.http_code === 404 || err?.error?.http_code === 404) {
      return { valid: false, error: `Cloudinary asset non-existent or not found (404): ${publicId}` };
    }
    return {
      valid: false,
      error: `Cloudinary API verification failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Structural helper to validate public ID format against basic product tag patterns.
 */
export function isValidProductCloudinaryPublicId(
  publicId: string,
  productId: string
): boolean {
  if (!publicId || typeof publicId !== "string" || !productId) {
    return false;
  }

  // External URL markers are non-Cloudinary fallback identifiers
  if (publicId.startsWith("external_url_")) {
    return false;
  }

  // If publicId contains top-level namespace, enforce strict product folder path
  if (publicId.startsWith("ajvas_chocolates/")) {
    const expectedFolderPrefix = `ajvas_chocolates/products/${productId}/`;
    if (!publicId.startsWith(expectedFolderPrefix)) {
      return false;
    }
  }

  // Must contain product ID tag pattern (e.g. img_{productId}_ or product_{productId}_)
  const hasProductTag =
    publicId.includes(`_${productId}_`) || publicId.endsWith(`_${productId}`);

  return hasProductTag;
}

export interface DestroyAssetResult {
  success: boolean;
  isExternal?: boolean;
  error?: string;
}

/**
 * Server-side helper to destroy a Cloudinary asset by public_id.
 * Safely skips external URL non-Cloudinary identifiers.
 */
export async function destroyCloudinaryAsset(
  publicId: string
): Promise<DestroyAssetResult> {
  if (!publicId || typeof publicId !== "string") {
    return { success: false, error: "Public ID is required." };
  }

  // Safely skip non-Cloudinary external URL placeholders
  if (publicId.startsWith("external_url_")) {
    return { success: true, isExternal: true };
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return {
      success: false,
      error: "Cloudinary credentials missing on server.",
    };
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    if (res.result === "ok" || res.result === "not found") {
      return { success: true };
    }

    return {
      success: false,
      error: `Cloudinary asset destruction returned: ${res.result}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Cloudinary API call failed.",
    };
  }
}
