"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { validateImageInput } from "@/lib/validation/image-url";
import { ProductImage } from "@/types/catalog";
import {
  generateSignedUploadParams,
  destroyCloudinaryAsset,
  verifyCloudinaryAssetProductOwnership,
  isValidProductCloudinaryPublicId,
  SignedUploadParams,
} from "@/lib/cloudinary/server";

export interface ProductActionResult {
  success: boolean;
  error?: string;
  productId?: string;
}

export interface ProductImageActionResult {
  success: boolean;
  error?: string;
  warning?: string;
  image?: ProductImage;
  images?: ProductImage[];
}

export interface UploadSignatureResult {
  success: boolean;
  error?: string;
  params?: SignedUploadParams;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Helper to fetch authoritative sorted product images list.
 */
async function fetchAuthoritativeProductImages(
  supabase: any,
  productId: string
): Promise<ProductImage[]> {
  const { data } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  return (data as ProductImage[]) || [];
}

/**
 * Server Action to generate signed Cloudinary upload parameters for a specific product.
 * Enforces admin authorization and locks folder/public_id parameters.
 */
export async function getCloudinaryUploadSignatureAction(
  productId: string
): Promise<UploadSignatureResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!productId) {
    return { success: false, error: "Product ID is required." };
  }

  try {
    const supabase = await createClient();

    // Verify product exists
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr || !product) {
      return { success: false, error: "Target product does not exist." };
    }

    const params = generateSignedUploadParams(productId);
    return { success: true, params };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate upload signature.",
    };
  }
}

export async function createProductAction(
  formData: FormData
): Promise<ProductActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const name = (formData.get("name") as string || "").trim();
  let slug = (formData.get("slug") as string || "").trim();
  const categoryId = (formData.get("category_id") as string || "").trim() || null;
  const description = (formData.get("description") as string || "").trim() || null;
  const price = parseFloat(formData.get("price") as string || "0");
  const discountType = (formData.get("discount_type") as string || "none") as "none" | "percentage" | "fixed";
  const discountValue = parseFloat(formData.get("discount_value") as string || "0");
  const status = (formData.get("status") as string || "active") as "active" | "inactive";
  const availability = (formData.get("availability") as string || "in_stock") as "in_stock" | "low_stock" | "out_of_stock";
  const weightGrams = parseInt(formData.get("weight_grams") as string || "500", 10);
  const lengthCm = parseFloat(formData.get("length_cm") as string || "0") || null;
  const widthCm = parseFloat(formData.get("width_cm") as string || "0") || null;
  const heightCm = parseFloat(formData.get("height_cm") as string || "0") || null;
  const imageUrl = (formData.get("image_url") as string || "").trim() || null;

  if (!name) {
    return { success: false, error: "Product name is required." };
  }

  if (isNaN(price) || price < 0) {
    return { success: false, error: "Valid price is required." };
  }

  if (isNaN(weightGrams) || weightGrams <= 0) {
    return { success: false, error: "Valid weight (in grams) is required for shipping calculations." };
  }

  if (!slug) {
    slug = slugify(name);
  }

  try {
    const supabase = await createClient();

    const { data: newProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        category_id: categoryId,
        description,
        price,
        discount_type: discountType,
        discount_value: discountValue,
        status,
        availability,
        weight_grams: weightGrams,
        length_cm: lengthCm,
        width_cm: widthCm,
        height_cm: heightCm,
      })
      .select("id")
      .single();

    if (insertError || !newProduct) {
      const isDuplicateSlug =
        insertError?.message?.includes("products_slug_key") ||
        insertError?.message?.includes("duplicate key");
      return {
        success: false,
        error: isDuplicateSlug
          ? "A product with this URL slug already exists. Please choose a different slug."
          : insertError?.message || "Failed to create product record.",
      };
    }

    // Attach initial primary image if valid URL provided
    if (imageUrl) {
      const imageValidation = validateImageInput(imageUrl, name);
      if (imageValidation.valid && imageValidation.url) {
        const publicId = imageValidation.url.includes("cloudinary.com")
          ? `product_${newProduct.id}_1`
          : `external_url_${crypto.randomUUID()}`;

        await supabase.from("product_images").insert({
          product_id: newProduct.id,
          image_url: imageValidation.url,
          cloudinary_public_id: publicId,
          alt_text: imageValidation.altText || name,
          sort_order: 0,
        });
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, productId: newProduct.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<ProductActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!productId) {
    return { success: false, error: "Product ID is required for updating." };
  }

  const name = (formData.get("name") as string || "").trim();
  let slug = (formData.get("slug") as string || "").trim();
  const categoryId = (formData.get("category_id") as string || "").trim() || null;
  const description = (formData.get("description") as string || "").trim() || null;
  const price = parseFloat(formData.get("price") as string || "0");
  const discountType = (formData.get("discount_type") as string || "none") as "none" | "percentage" | "fixed";
  const discountValue = parseFloat(formData.get("discount_value") as string || "0");
  const status = (formData.get("status") as string || "active") as "active" | "inactive";
  const availability = (formData.get("availability") as string || "in_stock") as "in_stock" | "low_stock" | "out_of_stock";
  const weightGrams = parseInt(formData.get("weight_grams") as string || "500", 10);
  const lengthCm = parseFloat(formData.get("length_cm") as string || "0") || null;
  const widthCm = parseFloat(formData.get("width_cm") as string || "0") || null;
  const heightCm = parseFloat(formData.get("height_cm") as string || "0") || null;
  const imageUrl = (formData.get("image_url") as string || "").trim() || null;

  if (!name) {
    return { success: false, error: "Product name is required." };
  }

  if (isNaN(price) || price < 0) {
    return { success: false, error: "Valid price is required." };
  }

  if (isNaN(weightGrams) || weightGrams <= 0) {
    return { success: false, error: "Valid weight (in grams) is required for shipping calculations." };
  }

  if (!slug) {
    slug = slugify(name);
  }

  try {
    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name,
        slug,
        category_id: categoryId,
        description,
        price,
        discount_type: discountType,
        discount_value: discountValue,
        status,
        availability,
        weight_grams: weightGrams,
        length_cm: lengthCm,
        width_cm: widthCm,
        height_cm: heightCm,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (updateError) {
      const isDuplicateSlug =
        updateError.message?.includes("products_slug_key") ||
        updateError.message?.includes("duplicate key");
      return {
        success: false,
        error: isDuplicateSlug
          ? "A product with this URL slug already exists. Please choose a different slug."
          : updateError.message,
      };
    }

    // Handle legacy form imageUrl synchronization safely
    if (imageUrl) {
      const imageValidation = validateImageInput(imageUrl, name);
      if (imageValidation.valid && imageValidation.url) {
        const { data: existingImages, error: fetchImgErr } = await supabase
          .from("product_images")
          .select("id, image_url")
          .eq("product_id", productId)
          .order("sort_order", { ascending: true })
          .limit(1);

        if (fetchImgErr) {
          return { success: false, error: `Failed to query product images: ${fetchImgErr.message}` };
        }

        if (existingImages && existingImages.length > 0) {
          // Only update primary image if the URL has actually changed from current primary
          if (existingImages[0].image_url !== imageValidation.url) {
            const { error: imgUpdateErr } = await supabase
              .from("product_images")
              .update({
                image_url: imageValidation.url,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingImages[0].id);

            if (imgUpdateErr) {
              return { success: false, error: `Failed to update primary product image: ${imgUpdateErr.message}` };
            }
          }
        } else {
          // Insert initial primary image if no images exist yet
          const publicId = imageValidation.url.includes("cloudinary.com")
            ? `product_${productId}_1`
            : `external_url_${crypto.randomUUID()}`;

          const { error: imgInsertErr } = await supabase.from("product_images").insert({
            product_id: productId,
            image_url: imageValidation.url,
            cloudinary_public_id: publicId,
            alt_text: imageValidation.altText || name,
            sort_order: 0,
          });

          if (imgInsertErr) {
            return { success: false, error: `Failed to attach primary product image: ${imgInsertErr.message}` };
          }
        }
      }
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, productId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

export async function toggleProductStatusAction(
  productId: string,
  currentStatus: "active" | "inactive"
): Promise<ProductActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, productId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Adds a new image to a product.
 * Supports Cloudinary direct public_id or external URL fallback with UUID.
 * Includes orphan asset cleanup if Supabase INSERT fails.
 */
export async function addProductImageAction(
  productId: string,
  imageUrl: string,
  altText?: string,
  cloudinaryPublicId?: string
): Promise<ProductImageActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!productId) {
    return { success: false, error: "Product ID is required." };
  }

  const validation = validateImageInput(imageUrl, altText);
  if (!validation.valid || !validation.url) {
    return {
      success: false,
      error: validation.error || "Invalid image URL format.",
    };
  }

  try {
    const supabase = await createClient();

    // Verify target product exists
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr || !product) {
      return { success: false, error: "Target product does not exist." };
    }

    // Determine public ID and verify Cloudinary asset server-side
    let finalPublicId = (cloudinaryPublicId || "").trim();
    let isVerifiedCloudinaryAsset = false;

    const isCloudinaryUrl =
      validation.url.includes("cloudinary.com") ||
      validation.url.includes("res.cloudinary.com");

    // Reject ambiguous or invalid pairings
    if (finalPublicId.startsWith("external_url_") && isCloudinaryUrl) {
      return {
        success: false,
        error: "Invalid request: external URL marker cannot be paired with a Cloudinary image URL.",
      };
    }

    if (finalPublicId && !finalPublicId.startsWith("external_url_")) {
      if (!isCloudinaryUrl) {
        return {
          success: false,
          error: "Cloudinary public ID provided, but submitted URL is not a valid Cloudinary image URL.",
        };
      }

      // Server-side API verification of Cloudinary asset metadata and URL correspondence
      const verifyRes = await verifyCloudinaryAssetProductOwnership(
        finalPublicId,
        productId,
        validation.url
      );

      if (!verifyRes.valid) {
        return {
          success: false,
          error: `Cloudinary asset verification failed: ${verifyRes.error || "Ownership or URL mismatch."}`,
        };
      }
      finalPublicId = verifyRes.resource?.publicId || finalPublicId;
      isVerifiedCloudinaryAsset = true;
    } else if (finalPublicId.startsWith("external_url_")) {
      // Valid explicit external URL marker with non-Cloudinary web URL
      if (isCloudinaryUrl) {
        return {
          success: false,
          error: "External URL marker cannot be used for Cloudinary assets.",
        };
      }
    } else if (!finalPublicId) {
      if (isCloudinaryUrl) {
        return {
          success: false,
          error: "Cloudinary direct asset upload requires a valid signed asset public ID.",
        };
      }
      // Independent external web image URL flow
      finalPublicId = `external_url_${crypto.randomUUID()}`;
    }

    // Determine current max sort order for this product
    const { data: existingImages } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const maxSort =
      existingImages && existingImages.length > 0
        ? existingImages[0].sort_order ?? 0
        : -1;
    const newSortOrder = maxSort + 1;

    const { data: newImage, error: insertErr } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        image_url: validation.url,
        cloudinary_public_id: finalPublicId,
        alt_text: validation.altText || null,
        sort_order: newSortOrder,
      })
      .select("*")
      .single();

    if (insertErr || !newImage) {
      // Immediate Orphan Cleanup if Cloudinary asset was verified but Supabase INSERT failed
      if (isVerifiedCloudinaryAsset) {
        await destroyCloudinaryAsset(finalPublicId);
      }
      return {
        success: false,
        error: insertErr?.message || "Failed to add product image record.",
      };
    }

    const authoritativeImages = await fetchAuthoritativeProductImages(supabase, productId);

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      image: newImage as ProductImage,
      images: authoritativeImages,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Updates an existing product image's URL and alt text.
 */
export async function updateProductImageAction(
  imageId: string,
  productId: string,
  imageUrl: string,
  altText?: string
): Promise<ProductImageActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!imageId || !productId) {
    return { success: false, error: "Image ID and Product ID are required." };
  }

  const validation = validateImageInput(imageUrl, altText);
  if (!validation.valid || !validation.url) {
    return {
      success: false,
      error: validation.error || "Invalid image URL format.",
    };
  }

  try {
    const supabase = await createClient();

    const { data: updatedImage, error: updateErr } = await supabase
      .from("product_images")
      .update({
        image_url: validation.url,
        alt_text: validation.altText || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", imageId)
      .eq("product_id", productId)
      .select("*")
      .maybeSingle();

    if (updateErr || !updatedImage) {
      return {
        success: false,
        error:
          updateErr?.message ||
          "Image record not found or does not belong to the specified product.",
      };
    }

    const authoritativeImages = await fetchAuthoritativeProductImages(supabase, productId);

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      image: updatedImage as ProductImage,
      images: authoritativeImages,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Deletes a product image record and destroys associated Cloudinary asset safely.
 * Returns authoritative remaining image list and warning banner if Cloudinary API fails.
 */
export async function deleteProductImageAction(
  imageId: string,
  productId: string
): Promise<ProductImageActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!imageId || !productId) {
    return { success: false, error: "Image ID and Product ID are required." };
  }

  try {
    const supabase = await createClient();

    // Verify image belongs to specified product and retrieve public_id
    const { data: targetImg } = await supabase
      .from("product_images")
      .select("id, cloudinary_public_id, image_url")
      .eq("id", imageId)
      .eq("product_id", productId)
      .maybeSingle();

    if (!targetImg) {
      return {
        success: false,
        error: "Image not found or does not belong to specified product.",
      };
    }

    // Step 1: Delete database row
    const { error: deleteErr } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", productId);

    if (deleteErr) {
      return { success: false, error: deleteErr.message };
    }

    // Re-index remaining images sort_order cleanly 0..N-1
    const { data: remaining } = await supabase
      .from("product_images")
      .select("id, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    let warningMessage: string | undefined = undefined;

    if (remaining && remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i].sort_order !== i) {
          const { error: reindexErr } = await supabase
            .from("product_images")
            .update({ sort_order: i, updated_at: new Date().toISOString() })
            .eq("id", remaining[i].id)
            .eq("product_id", productId);

          if (reindexErr) {
            warningMessage = `Image deleted from product gallery, but re-indexing remaining image order encountered an issue: ${reindexErr.message}`;
            break;
          }
        }
      }
    }

    // Step 2: Attempt Cloudinary Asset Destruction
    if (
      targetImg.cloudinary_public_id &&
      !targetImg.cloudinary_public_id.startsWith("external_url_")
    ) {
      // Server-side API verification before asset destruction
      const verifyRes = await verifyCloudinaryAssetProductOwnership(
        targetImg.cloudinary_public_id,
        productId,
        targetImg.image_url
      );

      if (verifyRes.valid) {
        const destroyRes = await destroyCloudinaryAsset(targetImg.cloudinary_public_id);
        if (!destroyRes.success) {
          warningMessage = `Database record deleted, but Cloudinary asset cleanup failed: ${
            destroyRes.error || "Cloudinary API timeout"
          }. Public ID: ${targetImg.cloudinary_public_id}`;
        }
      } else {
        // Cloudinary asset verification failed (e.g. legacy record without signed tags, or missing asset)
        warningMessage = `Database record deleted, but Cloudinary asset destruction was skipped because asset metadata could not be verified: ${verifyRes.error}. Public ID: ${targetImg.cloudinary_public_id}`;
      }
    }

    const authoritativeImages = await fetchAuthoritativeProductImages(supabase, productId);

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      warning: warningMessage,
      images: authoritativeImages,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Server Action to manually trigger cleanup of an orphaned Cloudinary asset.
 * Validates admin authorization, product existence, and asset ownership before destruction.
 */
export async function cleanupOrphanedAssetAction(
  publicId: string,
  productId: string
): Promise<ProductImageActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!publicId || !productId) {
    return { success: false, error: "Public ID and Product ID are required." };
  }

  try {
    const supabase = await createClient();

    // Verify product exists in catalog
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (prodErr || !product) {
      return { success: false, error: "Target product does not exist." };
    }

    // Validate asset ownership & product scoping via Cloudinary API
    const verifyRes = await verifyCloudinaryAssetProductOwnership(publicId, productId);
    if (!verifyRes.valid) {
      return {
        success: false,
        error: `Orphan asset cleanup refused: ${verifyRes.error}`,
      };
    }

    const destroyRes = await destroyCloudinaryAsset(publicId);
    if (destroyRes.success) {
      return { success: true };
    }
    return { success: false, error: destroyRes.error || "Failed to clean up asset." };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Cleanup failed.",
    };
  }
}

/**
 * Reorders product images given an ordered list of image IDs.
 */
export async function reorderProductImagesAction(
  productId: string,
  orderedImageIds: string[]
): Promise<ProductImageActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!productId || !Array.isArray(orderedImageIds)) {
    return {
      success: false,
      error: "Product ID and ordered image ID list are required.",
    };
  }

  try {
    const supabase = await createClient();

    // Verify product exists
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (!product) {
      return { success: false, error: "Target product does not exist." };
    }

    // Fetch existing images for product
    const { data: currentImages, error: fetchErr } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId);

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    const existingIds = (currentImages || []).map((img) => img.id);

    // Validate orderedImageIds match current product image IDs exactly
    if (orderedImageIds.length !== existingIds.length) {
      return {
        success: false,
        error: "Invalid image ordering payload length mismatch.",
      };
    }

    const uniqueInputSet = new Set(orderedImageIds);
    if (uniqueInputSet.size !== orderedImageIds.length) {
      return {
        success: false,
        error: "Duplicate image IDs detected in reorder payload.",
      };
    }

    const existingIdSet = new Set(existingIds);
    for (const id of orderedImageIds) {
      if (!existingIdSet.has(id)) {
        return {
          success: false,
          error: "Foreign or missing image ID detected in reorder payload.",
        };
      }
    }

    // Apply sort_order updates row by row and check for database errors
    for (let index = 0; index < orderedImageIds.length; index++) {
      const imgId = orderedImageIds[index];
      const { error: updateErr } = await supabase
        .from("product_images")
        .update({
          sort_order: index,
          updated_at: new Date().toISOString(),
        })
        .eq("id", imgId)
        .eq("product_id", productId);

      if (updateErr) {
        return {
          success: false,
          error: `Failed to update order for image ${imgId}: ${updateErr.message}`,
        };
      }
    }

    const authoritativeImages = await fetchAuthoritativeProductImages(supabase, productId);

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/shop");
    revalidatePath("/");

    return {
      success: true,
      images: authoritativeImages,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Sets an image as the primary image (sort_order = 0) while preserving relative order of other images.
 */
export async function setPrimaryProductImageAction(
  imageId: string,
  productId: string
): Promise<ProductImageActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!imageId || !productId) {
    return { success: false, error: "Image ID and Product ID are required." };
  }

  try {
    const supabase = await createClient();

    const { data: images, error: fetchErr } = await supabase
      .from("product_images")
      .select("id, sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (fetchErr || !images || images.length === 0) {
      return { success: false, error: fetchErr?.message || "No images found for product." };
    }

    const target = images.find((img) => img.id === imageId);
    if (!target) {
      return { success: false, error: "Image not found for specified product." };
    }

    const reorderedIds = [
      imageId,
      ...images.filter((img) => img.id !== imageId).map((img) => img.id),
    ];

    return await reorderProductImagesAction(productId, reorderedIds);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}
