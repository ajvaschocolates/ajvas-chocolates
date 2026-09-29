"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { TestimonialItem, TestimonialsSectionData } from "@/types/cms";
import {
  DEFAULT_TESTIMONIALS,
  DEFAULT_LEFT_IMAGE,
  DEFAULT_RIGHT_IMAGE,
} from "@/lib/constants/testimonials";

export async function getAdminTestimonialsDataAction(): Promise<{
  success: boolean;
  data?: TestimonialsSectionData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: section } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("section_key", "testimonials")
      .maybeSingle();

    if (section && section.content_json) {
      const content = section.content_json as TestimonialsSectionData;
      return {
        success: true,
        data: {
          left_image_url: content.left_image_url || DEFAULT_LEFT_IMAGE,
          right_image_url: content.right_image_url || DEFAULT_RIGHT_IMAGE,
          testimonials: content.testimonials && content.testimonials.length > 0
            ? content.testimonials
            : DEFAULT_TESTIMONIALS,
        },
      };
    }

    return {
      success: true,
      data: {
        left_image_url: DEFAULT_LEFT_IMAGE,
        right_image_url: DEFAULT_RIGHT_IMAGE,
        testimonials: DEFAULT_TESTIMONIALS,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load testimonials",
    };
  }
}

export async function saveTestimonialAction(
  testimonial: TestimonialItem,
  isNew: boolean
): Promise<{ success: boolean; error?: string }> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const supabase = await createClient();
    const { data: section } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("section_key", "testimonials")
      .maybeSingle();

    let content: TestimonialsSectionData = {
      left_image_url: DEFAULT_LEFT_IMAGE,
      right_image_url: DEFAULT_RIGHT_IMAGE,
      testimonials: [...DEFAULT_TESTIMONIALS],
    };

    if (section && section.content_json) {
      content = section.content_json as TestimonialsSectionData;
      if (!content.testimonials) content.testimonials = [...DEFAULT_TESTIMONIALS];
    }

    if (isNew) {
      content.testimonials = [testimonial, ...(content.testimonials || [])];
    } else {
      content.testimonials = (content.testimonials || []).map((t) =>
        t.id === testimonial.id ? testimonial : t
      );
    }

    if (section) {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          content_json: content,
          updated_at: new Date().toISOString(),
        })
        .eq("section_key", "testimonials");
      if (error) throw error;
    } else {
      const { error } = await supabase.from("homepage_sections").insert({
        section_key: "testimonials",
        title: "Loved by Chocolate Lovers",
        eyebrow: "HAPPY CUSTOMERS",
        status: "active",
        display_order: 6,
        content_json: content,
      });
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save testimonial",
    };
  }
}

export async function deleteTestimonialAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const supabase = await createClient();
    const { data: section } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("section_key", "testimonials")
      .maybeSingle();

    let content: TestimonialsSectionData = {
      left_image_url: DEFAULT_LEFT_IMAGE,
      right_image_url: DEFAULT_RIGHT_IMAGE,
      testimonials: [...DEFAULT_TESTIMONIALS],
    };

    if (section && section.content_json) {
      content = section.content_json as TestimonialsSectionData;
    }

    content.testimonials = (content.testimonials || []).filter((t) => t.id !== id);

    if (section) {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          content_json: content,
          updated_at: new Date().toISOString(),
        })
        .eq("section_key", "testimonials");
      if (error) throw error;
    } else {
      const { error } = await supabase.from("homepage_sections").insert({
        section_key: "testimonials",
        title: "Loved by Chocolate Lovers",
        eyebrow: "HAPPY CUSTOMERS",
        status: "active",
        display_order: 6,
        content_json: content,
      });
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete testimonial",
    };
  }
}

export async function updateDecorativeImagesAction(
  leftImageUrl: string,
  rightImageUrl: string
): Promise<{ success: boolean; error?: string }> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const supabase = await createClient();
    const { data: section } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("section_key", "testimonials")
      .maybeSingle();

    let content: TestimonialsSectionData = {
      left_image_url: leftImageUrl || DEFAULT_LEFT_IMAGE,
      right_image_url: rightImageUrl || DEFAULT_RIGHT_IMAGE,
      testimonials: [...DEFAULT_TESTIMONIALS],
    };

    if (section && section.content_json) {
      content = section.content_json as TestimonialsSectionData;
      content.left_image_url = leftImageUrl || DEFAULT_LEFT_IMAGE;
      content.right_image_url = rightImageUrl || DEFAULT_RIGHT_IMAGE;
    }

    if (section) {
      const { error } = await supabase
        .from("homepage_sections")
        .update({
          content_json: content,
          updated_at: new Date().toISOString(),
        })
        .eq("section_key", "testimonials");
      if (error) throw error;
    } else {
      const { error } = await supabase.from("homepage_sections").insert({
        section_key: "testimonials",
        title: "Loved by Chocolate Lovers",
        eyebrow: "HAPPY CUSTOMERS",
        status: "active",
        display_order: 6,
        content_json: content,
      });
      if (error) throw error;
    }

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update images",
    };
  }
}
