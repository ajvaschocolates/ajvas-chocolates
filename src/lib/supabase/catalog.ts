import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";
import { Product, Category } from "@/types/catalog";

function getPublicCatalogClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  return createClient(supabaseUrl, supabasePublishableKey);
}

export interface CatalogQueryResult<T> {
  data: T;
  error: string | null;
  success: boolean;
}

/**
 * Fetches all active categories from Supabase.
 * Respects RLS policies (public can read active records).
 */
export async function getActiveCategories(): Promise<Category[]> {
  const res = await getActiveCategoriesResult();
  return res.data;
}

export async function getActiveCategoriesResult(): Promise<CatalogQueryResult<Category[]>> {
  try {
    const supabase = getPublicCatalogClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, status, created_at, updated_at")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error) {
      console.warn("Supabase categories query warning:", error.message);
      return { data: [], error: error.message, success: false };
    }

    return { data: (data as Category[]) || [], error: null, success: true };
  } catch (err) {
    console.warn("Error fetching categories:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error", success: false };
  }
}

/**
 * Fetches active products with their images and category relation.
 */
export async function getActiveProducts(limit: number = 100): Promise<Product[]> {
  const res = await getActiveProductsResult(limit);
  return res.data;
}

export async function getActiveProductsResult(limit: number = 100): Promise<CatalogQueryResult<Product[]>> {
  try {
    const supabase = getPublicCatalogClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        category_id,
        name,
        slug,
        description,
        price,
        discount_type,
        discount_value,
        status,
        availability,
        weight_grams,
        length_cm,
        width_cm,
        height_cm,
        created_at,
        updated_at,
        category:categories (
          id,
          name,
          status,
          created_at,
          updated_at
        ),
        images:product_images (
          id,
          product_id,
          cloudinary_public_id,
          image_url,
          alt_text,
          sort_order,
          created_at,
          updated_at
        )
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Supabase products query warning:", error.message);
      return { data: [], error: error.message, success: false };
    }

    // Sort nested images by sort_order
    const products = (data as unknown as Product[]) || [];
    products.forEach((p) => {
      if (p.images && Array.isArray(p.images)) {
        p.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    });

    return { data: products, error: null, success: true };
  } catch (err) {
    console.warn("Error fetching products:", err);
    return { data: [], error: err instanceof Error ? err.message : "Unknown error", success: false };
  }
}
