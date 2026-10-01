import { createClient } from "./server";
import { createServiceRoleClient } from "./service-role";

export type PageSectionPage =
  | "about"
  | "contact"
  | "shipping-delivery"
  | "refund-returns"
  | "faq"
  | "care-instructions"
  | "privacy-policy"
  | "terms-conditions";

export interface PageSection {
  id: string;
  page: PageSectionPage;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all sections for a given page (public — ordered by sort_order).
 * Reads from Supabase DB (page_sections table or homepage_sections fallback).
 */
export async function getPageSections(page: PageSectionPage): Promise<PageSection[]> {
  try {
    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch {
      supabase = await createClient();
    }

    // 1. Try page_sections table
    const { data: pageSecData, error: pageSecError } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page", page)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!pageSecError && pageSecData && pageSecData.length > 0) {
      return pageSecData as PageSection[];
    }

    // 2. Read from homepage_sections table in DB where section_key = 'page_' + page
    const { data: hpData, error: hpError } = await supabase
      .from("homepage_sections")
      .select("section_key, content_json, created_at, updated_at")
      .eq("section_key", `page_${page}`)
      .maybeSingle();

    if (!hpError && hpData?.content_json && Array.isArray(hpData.content_json)) {
      const parsed: PageSection[] = (hpData.content_json as Array<Record<string, unknown>>).map(
        (item, idx) => ({
          id: String(item.id || `${page}-${idx}`),
          page,
          title: String(item.title || ""),
          content: String(item.content || ""),
          sort_order: typeof item.sort_order === "number" ? item.sort_order : idx,
          created_at: String(item.created_at || hpData.created_at || new Date().toISOString()),
          updated_at: String(item.updated_at || hpData.updated_at || new Date().toISOString()),
        })
      );
      parsed.sort((a, b) => a.sort_order - b.sort_order);
      return parsed;
    }

    return [];
  } catch (err) {
    console.error(`Error fetching page sections [${page}]:`, err);
    return [];
  }
}

/**
 * Fetch ALL page sections for admin management (all pages, all rows).
 */
export async function getAllAdminPageSections(): Promise<PageSection[]> {
  try {
    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch {
      supabase = await createClient();
    }

    // 1. Try page_sections table
    const { data: pageSecData, error: pageSecError } = await supabase
      .from("page_sections")
      .select("*")
      .order("page", { ascending: true })
      .order("sort_order", { ascending: true });

    if (!pageSecError && pageSecData && pageSecData.length > 0) {
      return pageSecData as PageSection[];
    }

    // 2. Read all pages from homepage_sections table in DB
    const { data: hpData, error: hpError } = await supabase
      .from("homepage_sections")
      .select("section_key, content_json, created_at, updated_at")
      .like("section_key", "page_%");

    if (!hpError && hpData && hpData.length > 0) {
      const all: PageSection[] = [];
      for (const row of hpData) {
        const pageKey = row.section_key.replace("page_", "") as PageSectionPage;
        if (Array.isArray(row.content_json)) {
          for (let idx = 0; idx < row.content_json.length; idx++) {
            const item = row.content_json[idx] as Record<string, unknown>;
            all.push({
              id: String(item.id || `${pageKey}-${idx}`),
              page: pageKey,
              title: String(item.title || ""),
              content: String(item.content || ""),
              sort_order: typeof item.sort_order === "number" ? item.sort_order : idx,
              created_at: String(item.created_at || row.created_at || new Date().toISOString()),
              updated_at: String(item.updated_at || row.updated_at || new Date().toISOString()),
            });
          }
        }
      }
      all.sort((a, b) => {
        if (a.page !== b.page) return a.page.localeCompare(b.page);
        return a.sort_order - b.sort_order;
      });
      return all;
    }

    return [];
  } catch (err) {
    console.error("Error fetching admin page sections:", err);
    return [];
  }
}
