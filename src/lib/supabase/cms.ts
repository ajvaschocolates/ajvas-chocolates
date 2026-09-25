import { createClient } from "./server";
import { createServiceRoleClient } from "./service-role";
import { HeroBanner, HomepageSection } from "@/types/cms";
import { Category } from "@/types/catalog";

/**
 * Fetch all active hero banners for public homepage display.
 * Ordered by display_order ASC, created_at DESC.
 */
export async function getActiveHeroBanners(): Promise<HeroBanner[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase active hero banners query warning:", error.message);
      return [];
    }

    return (data as HeroBanner[]) || [];
  } catch (err) {
    console.error("Error fetching active hero banners:", err);
    return [];
  }
}

/**
 * Fetch all hero banners for admin management (both active and inactive).
 */
export async function getAllAdminHeroBanners(): Promise<HeroBanner[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase admin hero banners query warning:", error.message);
      return [];
    }

    return (data as HeroBanner[]) || [];
  } catch (err) {
    console.error("Error fetching admin hero banners:", err);
    return [];
  }
}

/**
 * Fetch a single hero banner by ID for editing.
 */
export async function getAdminHeroBannerById(
  id: string
): Promise<HeroBanner | null> {
  try {
    if (!id) return null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as HeroBanner;
  } catch (err) {
    console.error("Error fetching hero banner by ID:", err);
    return null;
  }
}

/**
 * Fetch all active homepage sections as a map keyed by section_key.
 * Used for server-side page rendering.
 * Uses service role client to bypass public RLS policies on homepage_sections table.
 */
export async function getHomepageSections(): Promise<
  Record<string, HomepageSection>
> {
  try {
    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch {
      supabase = await createClient();
    }

    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("status", "active");

    if (error) {
      console.warn("Supabase active homepage sections query warning:", error.message);
      return {};
    }

    if (!data) return {};

    const map: Record<string, HomepageSection> = {};
    (data as HomepageSection[]).forEach((sec) => {
      map[sec.section_key] = sec;
    });

    return map;
  } catch (err) {
    console.error("Error fetching active homepage sections:", err);
    return {};
  }
}

/**
 * Fetch all homepage sections for admin management.
 */
export async function getAllAdminHomepageSections(): Promise<
  HomepageSection[]
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Supabase admin homepage sections query warning:", error.message);
      return [];
    }

    return (data as HomepageSection[]) || [];
  } catch (err) {
    console.error("Error fetching admin homepage sections:", err);
    return [];
  }
}

/**
 * Fetch a single homepage section by section_key.
 */
export async function getAdminHomepageSectionByKey(
  sectionKey: string
): Promise<HomepageSection | null> {
  try {
    if (!sectionKey) return null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("section_key", sectionKey)
      .maybeSingle();

    if (error || !data) return null;
    return data as HomepageSection;
  } catch (err) {
    console.error("Error fetching homepage section by key:", err);
    return null;
  }
}

/**
 * Fetch active categories for homepage display (including image fields).
 * Ordered by display_order ASC, name ASC.
 */
export async function getHomepageCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, status, image_url, image_public_id, display_order, created_at, updated_at")
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.warn("Supabase homepage categories query warning:", error.message);
      return [];
    }

    return (data as Category[]) || [];
  } catch (err) {
    console.error("Error fetching homepage categories:", err);
    return [];
  }
}
