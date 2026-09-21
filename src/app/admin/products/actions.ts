"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export interface ProductActionResult {
  success: boolean;
  error?: string;
  productId?: string;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
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

    // Attach image if URL provided
    if (imageUrl) {
      await supabase.from("product_images").insert({
        product_id: newProduct.id,
        image_url: imageUrl,
        cloudinary_public_id: `product_${newProduct.id}_1`,
        alt_text: name,
        sort_order: 0,
      });
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

    // Attach or update image if URL provided
    if (imageUrl) {
      // Check existing images
      const { data: existingImages } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
        .limit(1);

      if (existingImages && existingImages.length > 0) {
        await supabase
          .from("product_images")
          .update({
            image_url: imageUrl,
            alt_text: name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingImages[0].id);
      } else {
        await supabase.from("product_images").insert({
          product_id: productId,
          image_url: imageUrl,
          cloudinary_public_id: `product_${productId}_1`,
          alt_text: name,
          sort_order: 0,
        });
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
