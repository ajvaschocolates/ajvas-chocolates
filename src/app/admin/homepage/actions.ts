"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import {
  generateSignedUploadParams,
  SignedUploadParams,
} from "@/lib/cloudinary/server";

export interface CmsActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export interface CmsUploadSignatureResult {
  success: boolean;
  error?: string;
  params?: SignedUploadParams;
}

/**
 * Server Action to generate signed Cloudinary upload parameters for CMS assets.
 * Enforces admin authorization.
 */
export async function getCloudinaryCmsUploadSignatureAction(
  targetId: string = "cms_banner"
): Promise<CmsUploadSignatureResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const params = generateSignedUploadParams(`cms_${targetId}`);
    return { success: true, params };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate upload signature.",
    };
  }
}

/**
 * Creates a new Hero Banner.
 */
export async function createHeroBannerAction(
  formData: FormData
): Promise<CmsActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const title = (formData.get("title") as string || "").trim();
  const imageUrl = (formData.get("image_url") as string || "").trim();

  if (!title) {
    return { success: false, error: "Banner title is required." };
  }
  if (!imageUrl) {
    return { success: false, error: "Hero image URL is required." };
  }

  const eyebrow = (formData.get("eyebrow") as string || "").trim() || null;
  const description = (formData.get("description") as string || "").trim() || null;
  const imagePublicId = (formData.get("image_public_id") as string || "").trim() || null;
  const primaryCtaText = (formData.get("primary_cta_text") as string || "").trim() || null;
  const primaryCtaLink = (formData.get("primary_cta_link") as string || "").trim() || null;
  const secondaryCtaText = (formData.get("secondary_cta_text") as string || "").trim() || null;
  const secondaryCtaLink = (formData.get("secondary_cta_link") as string || "").trim() || null;
  const status = (formData.get("status") as string || "active") as "active" | "inactive";
  const displayOrderRaw = formData.get("display_order");
  const displayOrder = displayOrderRaw !== null && displayOrderRaw !== "" ? parseInt(String(displayOrderRaw), 10) : 0;

  try {
    const supabase = await createClient();

    const { data: banner, error } = await supabase
      .from("hero_banners")
      .insert({
        eyebrow,
        title,
        description,
        image_url: imageUrl,
        image_public_id: imagePublicId,
        primary_cta_text: primaryCtaText,
        primary_cta_link: primaryCtaLink,
        secondary_cta_text: secondaryCtaText,
        secondary_cta_link: secondaryCtaLink,
        status,
        display_order: isNaN(displayOrder) ? 0 : displayOrder,
      })
      .select("id")
      .single();

    if (error || !banner) {
      return { success: false, error: error?.message || "Failed to create hero banner." };
    }

    revalidatePath("/admin/homepage");
    revalidatePath("/", "layout");

    return { success: true, id: banner.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Updates an existing Hero Banner.
 */
export async function updateHeroBannerAction(
  bannerId: string,
  formData: FormData
): Promise<CmsActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!bannerId) {
    return { success: false, error: "Banner ID is required." };
  }

  const title = (formData.get("title") as string || "").trim();
  const imageUrl = (formData.get("image_url") as string || "").trim();

  if (!title) {
    return { success: false, error: "Banner title is required." };
  }
  if (!imageUrl) {
    return { success: false, error: "Hero image URL is required." };
  }

  const eyebrow = (formData.get("eyebrow") as string || "").trim() || null;
  const description = (formData.get("description") as string || "").trim() || null;
  const imagePublicId = (formData.get("image_public_id") as string || "").trim() || null;
  const primaryCtaText = (formData.get("primary_cta_text") as string || "").trim() || null;
  const primaryCtaLink = (formData.get("primary_cta_link") as string || "").trim() || null;
  const secondaryCtaText = (formData.get("secondary_cta_text") as string || "").trim() || null;
  const secondaryCtaLink = (formData.get("secondary_cta_link") as string || "").trim() || null;
  const status = (formData.get("status") as string || "active") as "active" | "inactive";
  const displayOrderRaw = formData.get("display_order");
  const displayOrder = displayOrderRaw !== null && displayOrderRaw !== "" ? parseInt(String(displayOrderRaw), 10) : 0;

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("hero_banners")
      .update({
        eyebrow,
        title,
        description,
        image_url: imageUrl,
        image_public_id: imagePublicId,
        primary_cta_text: primaryCtaText,
        primary_cta_link: primaryCtaLink,
        secondary_cta_text: secondaryCtaText,
        secondary_cta_link: secondaryCtaLink,
        status,
        display_order: isNaN(displayOrder) ? 0 : displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bannerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/homepage");
    revalidatePath("/", "layout");

    return { success: true, id: bannerId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Toggles Hero Banner status between active and inactive.
 */
export async function toggleHeroBannerStatusAction(
  bannerId: string,
  currentStatus: "active" | "inactive"
): Promise<CmsActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("hero_banners")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bannerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/homepage");
    revalidatePath("/", "layout");

    return { success: true, id: bannerId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Deletes a Hero Banner.
 */
export async function deleteHeroBannerAction(
  bannerId: string
): Promise<CmsActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!bannerId) {
    return { success: false, error: "Banner ID is required for deletion." };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("hero_banners")
      .delete()
      .eq("id", bannerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/homepage");
    revalidatePath("/", "layout");

    return { success: true, id: bannerId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Upserts a Homepage Editorial Section (e.g. brand_story, gifting_experience).
 */
export async function updateHomepageSectionAction(
  sectionKey: string,
  formData: FormData
): Promise<CmsActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!sectionKey) {
    return { success: false, error: "Section key is required." };
  }

  const eyebrow = (formData.get("eyebrow") as string || "").trim() || null;
  const title = (formData.get("title") as string || "").trim() || null;
  const description = (formData.get("description") as string || "").trim() || null;
  const imageUrl = (formData.get("image_url") as string || "").trim() || null;
  const imagePublicId = (formData.get("image_public_id") as string || "").trim() || null;
  const primaryCtaText = (formData.get("primary_cta_text") as string || "").trim() || null;
  const primaryCtaLink = (formData.get("primary_cta_link") as string || "").trim() || null;
  const status = (formData.get("status") as string || "active") as "active" | "inactive";

  const contentJsonRaw = formData.get("content_json");
  let contentJson: unknown = null;
  if (contentJsonRaw && typeof contentJsonRaw === "string" && contentJsonRaw.trim()) {
    try {
      contentJson = JSON.parse(contentJsonRaw);
    } catch {
      return { success: false, error: "Invalid JSON provided for content_json field." };
    }
  }

  try {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("homepage_sections")
      .select("id")
      .eq("section_key", sectionKey)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          eyebrow,
          title,
          description,
          image_url: imageUrl,
          image_public_id: imagePublicId,
          primary_cta_text: primaryCtaText,
          primary_cta_link: primaryCtaLink,
          content_json: contentJson,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("section_key", sectionKey);

      if (error) return { success: false, error: error.message };
    } else {
      const { error } = await supabase
        .from("homepage_sections")
        .insert({
          section_key: sectionKey,
          eyebrow,
          title,
          description,
          image_url: imageUrl,
          image_public_id: imagePublicId,
          primary_cta_text: primaryCtaText,
          primary_cta_link: primaryCtaLink,
          content_json: contentJson,
          status,
        });

      if (error) return { success: false, error: error.message };
    }

    revalidatePath("/admin/homepage");
    revalidatePath("/", "layout");

    return { success: true, id: sectionKey };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}
