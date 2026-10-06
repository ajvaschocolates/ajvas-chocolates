export const SITE_URL = "https://ajvaschocolates.com";
export const BRAND_NAME = "AJVAS Chocolates";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/ajvaslogo-png.png`;

/**
 * Truncates a description string cleanly without breaking mid-word or leaving dangling punctuation.
 */
export function truncateDescription(
  text: string | null | undefined,
  maxLength: number = 155
): string {
  if (!text) {
    return "Explore chocolate gift hampers, keepsake boxes, and curated confections for celebrations and thoughtful gestures. Pan-India courier delivery.";
  }

  // Clean newlines, tabs, multiple spaces, and quotes
  const cleaned = text
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const sub = cleaned.slice(0, maxLength);
  const lastSpaceIndex = sub.lastIndexOf(" ");

  if (lastSpaceIndex > 60) {
    return sub.slice(0, lastSpaceIndex).replace(/[.,;:!?\s]+$/, "") + "...";
  }

  return sub.replace(/[.,;:!?\s]+$/, "") + "...";
}

/**
 * Safely serializes an object into a JSON string suitable for inline JSON-LD script tags,
 * escaping any HTML tag opening characters to prevent XSS / script breakage.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
