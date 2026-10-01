"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import type { PageSectionPage, PageSection } from "@/lib/supabase/page-sections";

export interface PageSectionActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

const VALID_PAGES: PageSectionPage[] = [
  "about",
  "contact",
  "shipping-delivery",
  "refund-returns",
  "faq",
  "care-instructions",
  "privacy-policy",
  "terms-conditions",
];

const PAGE_ROUTE_MAP: Record<PageSectionPage, string> = {
  about: "/about",
  contact: "/contact",
  "shipping-delivery": "/shipping-delivery",
  "refund-returns": "/refund-returns",
  faq: "/faq",
  "care-instructions": "/care-instructions",
  "privacy-policy": "/privacy-policy",
  "terms-conditions": "/terms-conditions",
};

async function requireAdmin() {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    throw new Error("Unauthorized: Admin privileges required.");
  }
}

function getDbClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return null;
  }
}

/** Create a new page section */
export async function createPageSectionAction(
  formData: FormData
): Promise<PageSectionActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const page = (formData.get("page") as PageSectionPage || "").trim();
  const title = (formData.get("title") as string || "").trim();
  const content = (formData.get("content") as string || "").trim();
  const sortOrderRaw = formData.get("sort_order");
  const sortOrder = sortOrderRaw !== null && sortOrderRaw !== "" ? parseInt(String(sortOrderRaw), 10) : 0;

  if (!VALID_PAGES.includes(page as PageSectionPage)) {
    return { success: false, error: "Invalid page selected." };
  }
  if (!title) return { success: false, error: "Title is required." };
  if (!content) return { success: false, error: "Content is required." };

  const newId = crypto.randomUUID();
  const now = new Date().toISOString();
  const newSection: PageSection = {
    id: newId,
    page: page as PageSectionPage,
    title,
    content,
    sort_order: isNaN(sortOrder) ? 0 : sortOrder,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = (await getDbClient()) || (await createClient());

    // 1. Try page_sections table
    try {
      await supabase.from("page_sections").insert({
        id: newId,
        page,
        title,
        content,
        sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      });
    } catch {
      // ignore
    }

    // 2. Also persist in homepage_sections table
    const section_key = `page_${page}`;
    const { data: existing } = await supabase
      .from("homepage_sections")
      .select("content_json")
      .eq("section_key", section_key)
      .maybeSingle();

    const currentSections: PageSection[] = Array.isArray(existing?.content_json)
      ? (existing.content_json as PageSection[])
      : [];
    currentSections.push(newSection);

    await supabase.from("homepage_sections").upsert(
      {
        section_key,
        title: page,
        content_json: currentSections,
        status: "active",
        display_order: 0,
        updated_at: now,
      },
      { onConflict: "section_key" }
    );

    revalidatePath("/admin/pages");
    revalidatePath(PAGE_ROUTE_MAP[page as PageSectionPage]);
    return { success: true, id: newId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create section." };
  }
}

/** Update an existing page section */
export async function updatePageSectionAction(
  id: string,
  formData: FormData
): Promise<PageSectionActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!id) return { success: false, error: "Section ID is required." };

  const title = (formData.get("title") as string || "").trim();
  const content = (formData.get("content") as string || "").trim();
  const sortOrderRaw = formData.get("sort_order");
  const sortOrder = sortOrderRaw !== null && sortOrderRaw !== "" ? parseInt(String(sortOrderRaw), 10) : 0;
  const page = (formData.get("page") as PageSectionPage || "").trim();

  if (!title) return { success: false, error: "Title is required." };
  if (!content) return { success: false, error: "Content is required." };

  const now = new Date().toISOString();

  try {
    const supabase = (await getDbClient()) || (await createClient());

    // 1. Try page_sections table
    try {
      await supabase
        .from("page_sections")
        .update({
          title,
          content,
          sort_order: isNaN(sortOrder) ? 0 : sortOrder,
          updated_at: now,
        })
        .eq("id", id);
    } catch {
      // ignore
    }

    // 2. Also persist in homepage_sections table
    if (VALID_PAGES.includes(page as PageSectionPage)) {
      const section_key = `page_${page}`;
      const { data: existing } = await supabase
        .from("homepage_sections")
        .select("content_json")
        .eq("section_key", section_key)
        .maybeSingle();

      if (Array.isArray(existing?.content_json)) {
        const currentSections = (existing.content_json as PageSection[]).map((s) =>
          s.id === id
            ? {
                ...s,
                title,
                content,
                sort_order: isNaN(sortOrder) ? 0 : sortOrder,
                updated_at: now,
              }
            : s
        );

        await supabase.from("homepage_sections").upsert(
          {
            section_key,
            title: page,
            content_json: currentSections,
            status: "active",
            display_order: 0,
            updated_at: now,
          },
          { onConflict: "section_key" }
        );
      }
    }

    revalidatePath("/admin/pages");
    if (VALID_PAGES.includes(page as PageSectionPage)) {
      revalidatePath(PAGE_ROUTE_MAP[page as PageSectionPage]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update section." };
  }
}

/** Delete a page section */
export async function deletePageSectionAction(
  id: string,
  page: PageSectionPage
): Promise<PageSectionActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!id) return { success: false, error: "Section ID is required." };

  const now = new Date().toISOString();

  try {
    const supabase = (await getDbClient()) || (await createClient());

    // 1. Try page_sections table
    try {
      await supabase.from("page_sections").delete().eq("id", id);
    } catch {
      // ignore
    }

    // 2. Also persist in homepage_sections table
    if (VALID_PAGES.includes(page)) {
      const section_key = `page_${page}`;
      const { data: existing } = await supabase
        .from("homepage_sections")
        .select("content_json")
        .eq("section_key", section_key)
        .maybeSingle();

      if (Array.isArray(existing?.content_json)) {
        const currentSections = (existing.content_json as PageSection[]).filter(
          (s) => s.id !== id
        );

        await supabase.from("homepage_sections").upsert(
          {
            section_key,
            title: page,
            content_json: currentSections,
            status: "active",
            display_order: 0,
            updated_at: now,
          },
          { onConflict: "section_key" }
        );
      }
    }

    revalidatePath("/admin/pages");
    if (VALID_PAGES.includes(page)) {
      revalidatePath(PAGE_ROUTE_MAP[page]);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete section." };
  }
}
