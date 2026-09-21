import { createClient } from "./server";
import { Product, Category } from "@/types/catalog";

export interface AdminQueryResult<T> {
  data: T;
  error: string | null;
  success: boolean;
}

/**
 * Server-side helper to fetch ALL products (both active and inactive) for admin management.
 * Uses authenticated server client to satisfy RLS policies (is_admin).
 */
export async function getAllAdminProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
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
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase admin products query warning:", error.message);
      return [];
    }

    const products = (data as unknown as Product[]) || [];
    products.forEach((p) => {
      if (p.images && Array.isArray(p.images)) {
        p.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      }
    });

    return products;
  } catch (err) {
    console.error("Error fetching admin products:", err);
    return [];
  }
}

/**
 * Fetches a single product by ID for editing.
 */
export async function getAdminProductById(
  id: string
): Promise<Product | null> {
  try {
    if (!id) return null;

    const supabase = await createClient();
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
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const product = data as unknown as Product;
    if (product.images && Array.isArray(product.images)) {
      product.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    return product;
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    return null;
  }
}

/**
 * Fetches all categories for admin product forms.
 */
export async function getAllAdminCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, status, created_at, updated_at")
      .order("name", { ascending: true });

    if (error) {
      console.warn("Supabase admin categories query warning:", error.message);
      return [];
    }

    return (data as Category[]) || [];
  } catch (err) {
    console.error("Error fetching admin categories:", err);
    return [];
  }
}
