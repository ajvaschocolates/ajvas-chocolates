"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export interface CategoryActionResult {
  success: boolean;
  error?: string;
  categoryId?: string;
}

/**
 * Creates a new category.
 * Enforces admin authentication and handles unique category name constraint.
 */
export async function createCategoryAction(
  formData: FormData
): Promise<CategoryActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const name = (formData.get("name") as string || "").trim();
  const status = (formData.get("status") as string || "active") as "active" | "inactive";
  const imageUrl = (formData.get("image_url") as string || "").trim() || null;
  const imagePublicId = (formData.get("image_public_id") as string || "").trim() || null;
  const displayOrderRaw = formData.get("display_order");
  const displayOrder = displayOrderRaw !== null && displayOrderRaw !== "" ? parseInt(String(displayOrderRaw), 10) : 0;

  if (!name) {
    return { success: false, error: "Category name is required." };
  }

  try {
    const supabase = await createClient();

    const { data: newCategory, error: insertError } = await supabase
      .from("categories")
      .insert({
        name,
        status,
        image_url: imageUrl,
        image_public_id: imagePublicId,
        display_order: isNaN(displayOrder) ? 0 : displayOrder,
      })
      .select("id")
      .single();

    if (insertError || !newCategory) {
      const isDuplicate =
        insertError?.message?.includes("categories_name_lower_unique") ||
        insertError?.message?.includes("duplicate key") ||
        insertError?.code === "23505";

      return {
        success: false,
        error: isDuplicate
          ? "A category with this name already exists. Please choose a unique name."
          : insertError?.message || "Failed to create category.",
      };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/", "layout");

    return { success: true, categoryId: newCategory.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Updates an existing category's name, status, image, and display order.
 */
export async function updateCategoryAction(
  categoryId: string,
  formData: FormData
): Promise<CategoryActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!categoryId) {
    return { success: false, error: "Category ID is required for updating." };
  }

  const name = (formData.get("name") as string || "").trim();
  const status = (formData.get("status") as string || "active") as "active" | "inactive";
  const imageUrl = (formData.get("image_url") as string || "").trim() || null;
  const imagePublicId = (formData.get("image_public_id") as string || "").trim() || null;
  const displayOrderRaw = formData.get("display_order");
  const displayOrder = displayOrderRaw !== null && displayOrderRaw !== "" ? parseInt(String(displayOrderRaw), 10) : 0;

  if (!name) {
    return { success: false, error: "Category name is required." };
  }

  try {
    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("categories")
      .update({
        name,
        status,
        image_url: imageUrl,
        image_public_id: imagePublicId,
        display_order: isNaN(displayOrder) ? 0 : displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (updateError) {
      const isDuplicate =
        updateError.message?.includes("categories_name_lower_unique") ||
        updateError.message?.includes("duplicate key") ||
        updateError.code === "23505";

      return {
        success: false,
        error: isDuplicate
          ? "A category with this name already exists. Please choose a unique name."
          : updateError.message || "Failed to update category.",
      };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/", "layout");

    return { success: true, categoryId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Toggles category status between active and inactive.
 */
export async function toggleCategoryStatusAction(
  categoryId: string,
  currentStatus: "active" | "inactive"
): Promise<CategoryActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, categoryId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Deletes a category safely.
 * Catches foreign key constraints if products are referencing this category.
 */
export async function deleteCategoryAction(
  categoryId: string
): Promise<CategoryActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!categoryId) {
    return { success: false, error: "Category ID is required for deletion." };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      const isFkeyConstraint =
        error.code === "23503" ||
        error.message?.includes("foreign key constraint") ||
        error.message?.includes("violates foreign key constraint") ||
        error.message?.includes("products_category_id_fkey");

      return {
        success: false,
        error: isFkeyConstraint
          ? "Cannot delete this category because it is assigned to one or more products. Deactivate it instead."
          : error.message || "Failed to delete category.",
      };
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, categoryId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}
