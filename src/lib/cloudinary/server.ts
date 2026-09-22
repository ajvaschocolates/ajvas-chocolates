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
  if (publicId.startsWith("external_url_") || !publicId.includes("/")) {
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
