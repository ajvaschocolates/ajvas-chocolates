"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { HeroBanner, HomepageSection } from "@/types/cms";
import ProductSingleImageUploader from "@/components/admin/ProductSingleImageUploader";
import {
  getCloudinaryCmsUploadSignatureAction,
  createHeroBannerAction,
  updateHeroBannerAction,
  toggleHeroBannerStatusAction,
  deleteHeroBannerAction,
  updateHomepageSectionAction,
} from "@/app/admin/homepage/actions";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface HomepageCmsClientProps {
  initialBanners: HeroBanner[];
  initialSections: HomepageSection[];
}

export default function HomepageCmsClient({
  initialBanners,
  initialSections,
}: HomepageCmsClientProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "editorial" | "gifting_cta">("hero");
  const [isPending, startTransition] = useTransition();

  // Banners State
  const [banners, setBanners] = useState<HeroBanner[]>(initialBanners);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  // Hero Form Fields
  const [heroTitle, setHeroTitle] = useState("");
  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImagePublicId, setHeroImagePublicId] = useState("");
  const [heroPrimaryCtaText, setHeroPrimaryCtaText] = useState("");
  const [heroPrimaryCtaLink, setHeroPrimaryCtaLink] = useState("");
  const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState("");
  const [heroSecondaryCtaLink, setHeroSecondaryCtaLink] = useState("");
  const [heroStatus, setHeroStatus] = useState<"active" | "inactive">("active");
  const [heroDisplayOrder, setHeroDisplayOrder] = useState(0);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [heroSuccess, setHeroSuccess] = useState<string | null>(null);
  const [isHeroSubmitting, setIsHeroSubmitting] = useState(false);
  const [togglingBannerId, setTogglingBannerId] = useState<string | null>(null);

  // Editorial Sections State (Gifting Experience & Brand Story)
  const brandStorySection = initialSections.find((s) => s.section_key === "brand_story") || null;
  const giftingExpSection = initialSections.find((s) => s.section_key === "gifting_experience") || null;
  const giftingCtaSection = initialSections.find((s) => s.section_key === "gifting_cta") || null;

  // Gifting Experience Form State (Card 1: Truffles)
  const [geEyebrow, setGeEyebrow] = useState(giftingExpSection?.eyebrow || "TRUFFLES");
  const [geTitle, setGeTitle] = useState(giftingExpSection?.title || "A Thoughtfully Curated Gifting Experience");
  const [geDescription, setGeDescription] = useState(
    giftingExpSection?.description ||
      "Velvety single-origin cocoa truffles handcrafted for your sweetest celebrations."
  );
  const [geImageUrl, setGeImageUrl] = useState(giftingExpSection?.image_url || "");
  const [geImagePublicId, setGeImagePublicId] = useState(giftingExpSection?.image_public_id || "");
  const [gePrimaryLink, setGePrimaryLink] = useState(giftingExpSection?.primary_cta_link || "/shop");
  const [geStatus, setGeStatus] = useState<"active" | "inactive">(giftingExpSection?.status || "active");
  const [geFeedback, setGeFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isGeSubmitting, setIsGeSubmitting] = useState(false);

  // Brand Story Form State (Card 2: Choco Bites / Artisanal Confections)
  const [bsEyebrow, setBsEyebrow] = useState(brandStorySection?.eyebrow || "CHOCO BITES");
  const [bsTitle, setBsTitle] = useState(brandStorySection?.title || "Chocolates made for human moments.");
  const [bsDescription, setBsDescription] = useState(
    brandStorySection?.description ||
      "Artisanal barks, crunchy cookies and assorted confections baked to golden perfection."
  );
  const [bsImageUrl, setBsImageUrl] = useState(brandStorySection?.image_url || "");
  const [bsImagePublicId, setBsImagePublicId] = useState(brandStorySection?.image_public_id || "");
  const [bsPrimaryLink, setBsPrimaryLink] = useState(brandStorySection?.primary_cta_link || "/shop");
  const [bsStatus, setBsStatus] = useState<"active" | "inactive">(brandStorySection?.status || "active");
  const [bsFeedback, setBsFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isBsSubmitting, setIsBsSubmitting] = useState(false);

  // Gifting CTA Form State (Final CTA Banner)
  const [ctaTitle, setCtaTitle] = useState(giftingCtaSection?.title || "Find something worth gifting.");
  const [ctaDescription, setCtaDescription] = useState(
    giftingCtaSection?.description ||
      "Browse our curated collection or reach out for a custom, personalized hamper."
  );
  const [ctaImageUrl, setCtaImageUrl] = useState(giftingCtaSection?.image_url || "");
  const [ctaImagePublicId, setCtaImagePublicId] = useState(giftingCtaSection?.image_public_id || "");
  const [ctaPrimaryText, setCtaPrimaryText] = useState(giftingCtaSection?.primary_cta_text || "SHOP ALL GIFTS");
  const [ctaPrimaryLink, setCtaPrimaryLink] = useState(giftingCtaSection?.primary_cta_link || "/shop");
  const [ctaStatus, setCtaStatus] = useState<"active" | "inactive">(giftingCtaSection?.status || "active");
  const [ctaFeedback, setCtaFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isCtaSubmitting, setIsCtaSubmitting] = useState(false);

  // Prevent background page scrolling when modal is open
  useEffect(() => {
    if (isBannerModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isBannerModalOpen]);

  // Open Hero Create Modal
  function handleOpenCreateHero() {
    setEditingBanner(null);
    setHeroTitle("");
    setHeroEyebrow("PREMIUM CHOCOLATES & GIFTING");
    setHeroDescription("");
    setHeroImageUrl("");
    setHeroImagePublicId("");
    setHeroPrimaryCtaText("SHOP GIFTS");
    setHeroPrimaryCtaLink("/shop");
    setHeroSecondaryCtaText("EXPLORE CHOCOLATES");
    setHeroSecondaryCtaLink("/shop");
    setHeroStatus("active");
    setHeroDisplayOrder(banners.length);
    setHeroError(null);
    setHeroSuccess(null);
    setIsBannerModalOpen(true);
  }

  // Open Hero Edit Modal
  function handleOpenEditHero(banner: HeroBanner) {
    setEditingBanner(banner);
    setHeroTitle(banner.title);
    setHeroEyebrow(banner.eyebrow || "");
    setHeroDescription(banner.description || "");
    setHeroImageUrl(banner.image_url);
    setHeroImagePublicId(banner.image_public_id || "");
    setHeroPrimaryCtaText(banner.primary_cta_text || "");
    setHeroPrimaryCtaLink(banner.primary_cta_link || "");
    setHeroSecondaryCtaText(banner.secondary_cta_text || "");
    setHeroSecondaryCtaLink(banner.secondary_cta_link || "");
    setHeroStatus(banner.status);
    setHeroDisplayOrder(banner.display_order ?? 0);
    setHeroError(null);
    setHeroSuccess(null);
    setIsBannerModalOpen(true);
  }

  // Submit Hero Form
  async function handleSubmitHero(e: React.FormEvent) {
    e.preventDefault();
    setHeroError(null);
    setHeroSuccess(null);

    if (!heroTitle.trim()) {
      setHeroError("Banner headline/title is required.");
      return;
    }
    if (!heroImageUrl.trim()) {
      setHeroError("Hero image is required.");
      return;
    }

    setIsHeroSubmitting(true);
    const formData = new FormData();
    formData.append("title", heroTitle.trim());
    formData.append("eyebrow", heroEyebrow.trim());
    formData.append("description", heroDescription.trim());
    formData.append("image_url", heroImageUrl.trim());
    formData.append("image_public_id", heroImagePublicId.trim());
    formData.append("primary_cta_text", heroPrimaryCtaText.trim());
    formData.append("primary_cta_link", heroPrimaryCtaLink.trim());
    formData.append("secondary_cta_text", heroSecondaryCtaText.trim());
    formData.append("secondary_cta_link", heroSecondaryCtaLink.trim());
    formData.append("status", heroStatus);
    formData.append("display_order", String(heroDisplayOrder));

    startTransition(async () => {
      let res;
      if (editingBanner) {
        res = await updateHeroBannerAction(editingBanner.id, formData);
      } else {
        res = await createHeroBannerAction(formData);
      }

      setIsHeroSubmitting(false);

      if (res.success) {
        setHeroSuccess(editingBanner ? "Hero banner updated successfully!" : "Hero banner created successfully!");
        setTimeout(() => {
          setIsBannerModalOpen(false);
          window.location.reload();
        }, 1000);
      } else {
        setHeroError(res.error || "Failed to save hero banner.");
      }
    });
  }

  // Toggle Hero Banner Status
  async function handleToggleBannerStatus(banner: HeroBanner) {
    setTogglingBannerId(banner.id);
    startTransition(async () => {
      const res = await toggleHeroBannerStatusAction(banner.id, banner.status);
      setTogglingBannerId(null);
      if (res.success) {
        setBanners((prev) =>
          prev.map((b) =>
            b.id === banner.id ? { ...b, status: b.status === "active" ? "inactive" : "active" } : b
          )
        );
      }
    });
  }

  // Delete Hero Banner
  async function handleDeleteBanner(bannerId: string) {
    if (!confirm("Are you sure you want to delete this hero banner?")) return;
    startTransition(async () => {
      const res = await deleteHeroBannerAction(bannerId);
      if (res.success) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      } else {
        alert(res.error || "Failed to delete banner.");
      }
    });
  }

  // Submit Gifting Experience Form (Card 1: Truffles)
  async function handleSubmitGiftingExperience(e: React.FormEvent) {
    e.preventDefault();
    setGeFeedback(null);
    setIsGeSubmitting(true);

    const formData = new FormData();
    formData.append("eyebrow", geEyebrow.trim());
    formData.append("title", geTitle.trim());
    formData.append("description", geDescription.trim());
    formData.append("image_url", geImageUrl.trim());
    formData.append("image_public_id", geImagePublicId.trim());
    formData.append("primary_cta_link", gePrimaryLink.trim());
    formData.append("status", geStatus);

    startTransition(async () => {
      const res = await updateHomepageSectionAction("gifting_experience", formData);
      setIsGeSubmitting(false);
      if (res.success) {
        setGeFeedback({ type: "success", msg: "Gifting Experience card updated successfully!" });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setGeFeedback({ type: "error", msg: res.error || "Failed to update Gifting Experience card." });
      }
    });
  }

  // Submit Brand Story Form (Card 2: Choco Bites)
  async function handleSubmitBrandStory(e: React.FormEvent) {
    e.preventDefault();
    setBsFeedback(null);
    setIsBsSubmitting(true);

    const formData = new FormData();
    formData.append("eyebrow", bsEyebrow.trim());
    formData.append("title", bsTitle.trim());
    formData.append("description", bsDescription.trim());
    formData.append("image_url", bsImageUrl.trim());
    formData.append("image_public_id", bsImagePublicId.trim());
    formData.append("primary_cta_link", bsPrimaryLink.trim());
    formData.append("status", bsStatus);

    startTransition(async () => {
      const res = await updateHomepageSectionAction("brand_story", formData);
      setIsBsSubmitting(false);
      if (res.success) {
        setBsFeedback({ type: "success", msg: "Brand Story card updated successfully!" });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setBsFeedback({ type: "error", msg: res.error || "Failed to update Brand Story card." });
      }
    });
  }

  // Submit Final CTA Form
  async function handleSubmitGiftingCta(e: React.FormEvent) {
    e.preventDefault();
    setCtaFeedback(null);
    setIsCtaSubmitting(true);

    const formData = new FormData();
    formData.append("title", ctaTitle.trim());
    formData.append("description", ctaDescription.trim());
    formData.append("image_url", ctaImageUrl.trim());
    formData.append("image_public_id", ctaImagePublicId.trim());
    formData.append("primary_cta_text", ctaPrimaryText.trim());
    formData.append("primary_cta_link", ctaPrimaryLink.trim());
    formData.append("status", ctaStatus);

    startTransition(async () => {
      const res = await updateHomepageSectionAction("gifting_cta", formData);
      setIsCtaSubmitting(false);
      if (res.success) {
        setCtaFeedback({ type: "success", msg: "Final CTA section updated successfully!" });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setCtaFeedback({ type: "error", msg: res.error || "Failed to update Final CTA section." });
      }
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header matching Admin Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-cocoa-950">
            Homepage CMS
          </h1>
          <p className="text-xs text-cocoa-600 mt-1">
            Manage live homepage sections, promotional banners, and editorial showcase content
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-parchment-border bg-parchment-surface text-cocoa-700 hover:bg-parchment-muted text-xs font-semibold shadow-2xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Homepage</span>
            <ExternalLink className="w-3 h-3 ml-0.5 text-cocoa-400" />
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-parchment-border pb-3">
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-3.5 py-2 rounded text-xs font-medium transition-colors ${
            activeTab === "hero"
              ? "bg-cocoa-950 text-white shadow-2xs"
              : "bg-parchment-surface hover:bg-parchment-muted text-cocoa-700 border border-parchment-border"
          }`}
        >
          Hero Banners ({banners.length})
        </button>

        <button
          onClick={() => setActiveTab("editorial")}
          className={`px-3.5 py-2 rounded text-xs font-medium transition-colors ${
            activeTab === "editorial"
              ? "bg-cocoa-950 text-white shadow-2xs"
              : "bg-parchment-surface hover:bg-parchment-muted text-cocoa-700 border border-parchment-border"
          }`}
        >
          Gifting &amp; Brand Story
        </button>

        <button
          onClick={() => setActiveTab("gifting_cta")}
          className={`px-3.5 py-2 rounded text-xs font-medium transition-colors ${
            activeTab === "gifting_cta"
              ? "bg-cocoa-950 text-white shadow-2xs"
              : "bg-parchment-surface hover:bg-parchment-muted text-cocoa-700 border border-parchment-border"
          }`}
        >
          Final CTA Banner
        </button>
      </div>

      {/* TAB 1: HERO BANNERS */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-cocoa-950">
                Hero Canvas Banners
              </h2>
              <p className="text-xs text-cocoa-600 mt-0.5">
                Displays full-screen at the very top of the homepage with responsive image, title accent, and action button.
              </p>
            </div>
            <button
              onClick={handleOpenCreateHero}
              className="inline-flex items-center gap-2 rounded bg-cocoa-950 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cocoa-800 transition-colors self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Add Hero Banner
            </button>
          </div>

          {banners.length === 0 ? (
            <div className="rounded-lg border border-dashed border-parchment-border p-8 text-center bg-parchment-surface">
              <p className="font-serif text-base font-bold text-cocoa-800">No hero banners created</p>
              <p className="font-sans text-xs text-cocoa-600 mt-1 max-w-md mx-auto">
                Add your first banner to configure the homepage headline, subtext, background image, and CTA button.
              </p>
              <button
                onClick={handleOpenCreateHero}
                className="mt-4 inline-flex items-center gap-2 rounded bg-cocoa-950 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cocoa-800"
              >
                <Plus className="h-4 w-4" />
                Create Hero Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="rounded-lg border border-parchment-border bg-parchment-surface overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/9] w-full bg-cocoa-100 overflow-hidden">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-cocoa-400 text-xs">
                        No image uploaded
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs">
                      Status: {banner.status}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {banner.eyebrow && (
                        <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-cocoa-600 block mb-1">
                          {banner.eyebrow}
                        </span>
                      )}
                      <h3 className="font-serif text-base sm:text-lg font-bold text-cocoa-950 leading-snug">
                        {banner.title}
                      </h3>
                      {banner.description && (
                        <p className="font-sans text-xs text-cocoa-600 line-clamp-2 mt-1">
                          {banner.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px] font-mono text-cocoa-600 pt-3 border-t border-parchment-border">
                      <div>
                        Button CTA: <span className="font-semibold text-cocoa-900">{banner.secondary_cta_text || banner.primary_cta_text || "EXPLORE CHOCOLATES"}</span>
                        {" "}→ <span className="text-cocoa-700">{banner.secondary_cta_link || banner.primary_cta_link || "/shop"}</span>
                      </div>
                      <div>
                        Order: {banner.display_order ?? 0}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleToggleBannerStatus(banner)}
                        disabled={togglingBannerId === banner.id}
                        className="px-3 py-1.5 rounded border border-parchment-border text-xs font-medium text-cocoa-700 hover:bg-parchment-muted inline-flex items-center gap-1.5 transition-colors"
                      >
                        {togglingBannerId === banner.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : banner.status === "active" ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            Activate
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEditHero(banner)}
                        className="px-3 py-1.5 rounded bg-cocoa-950 text-white text-xs font-semibold hover:bg-cocoa-800 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="px-2.5 py-1.5 rounded text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-medium inline-flex items-center transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMBINED GIFTING & BRAND STORY (DUO CARDS) */}
      {activeTab === "editorial" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-cocoa-950">
              Gifting &amp; Brand Story Showcase
            </h2>
            <p className="text-xs text-cocoa-600 mt-0.5">
              Configures the editorial duo cards displayed together on the homepage: Card 1 (Truffles) on the left, Card 2 (Choco Bites) on the right.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Card 1: Gifting Experience (Truffles) */}
            <form onSubmit={handleSubmitGiftingExperience} className="rounded-lg border border-parchment-border bg-parchment-surface p-5 sm:p-6 shadow-2xs space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cocoa-500 font-bold">
                    Card 1 • Left Showcase
                  </span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-cocoa-950">
                  Gifting Experience (Truffles)
                </h3>
                <p className="text-xs text-cocoa-600 mt-0.5">
                  Handcrafted truffles showcase card with image on left and text on right.
                </p>
              </div>

              {geFeedback && (
                <div className={`p-3.5 rounded text-xs font-medium flex items-center gap-2.5 ${
                  geFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-rose-50 text-rose-900 border border-rose-200"
                }`}>
                  {geFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{geFeedback.msg}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Card Title (e.g. TRUFFLES)
                    </label>
                    <input
                      type="text"
                      value={geEyebrow}
                      onChange={(e) => setGeEyebrow(e.target.value)}
                      placeholder="TRUFFLES"
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Status
                    </label>
                    <select
                      value={geStatus}
                      onChange={(e) => setGeStatus(e.target.value as "active" | "inactive")}
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Secondary Headline Title
                  </label>
                  <input
                    type="text"
                    value={geTitle}
                    onChange={(e) => setGeTitle(e.target.value)}
                    placeholder="A Thoughtfully Curated Gifting Experience"
                    className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={geDescription}
                    onChange={(e) => setGeDescription(e.target.value)}
                    className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    &quot;Read More&quot; Button Link
                  </label>
                  <input
                    type="text"
                    value={gePrimaryLink}
                    onChange={(e) => setGePrimaryLink(e.target.value)}
                    placeholder="/shop"
                    className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs font-mono text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Card Image (Cloudinary Upload)
                  </label>
                  <ProductSingleImageUploader
                    currentImageUrl={geImageUrl}
                    currentPublicId={geImagePublicId}
                    productId="gifting_experience"
                    getSignatureAction={getCloudinaryCmsUploadSignatureAction}
                    onImageChange={(url, publicId) => {
                      setGeImageUrl(url);
                      setGeImagePublicId(publicId || "");
                    }}
                    title="Gifting Experience Photo"
                    description="Upload a photo for the left half of Card 1."
                    dropzoneText="Click or Drag & Drop image"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-parchment-border flex justify-end">
                <button
                  type="submit"
                  disabled={isGeSubmitting || isPending}
                  className="inline-flex items-center gap-2 rounded bg-cocoa-950 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-cocoa-800 disabled:opacity-50 transition-colors"
                >
                  {isGeSubmitting || isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Gifting Card"
                  )}
                </button>
              </div>
            </form>

            {/* Card 2: Brand Story (Choco Bites) */}
            <form onSubmit={handleSubmitBrandStory} className="rounded-lg border border-parchment-border bg-parchment-surface p-5 sm:p-6 shadow-2xs space-y-5">
              <div>
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-cocoa-500 font-bold">
                    Card 2 • Right Showcase
                  </span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-cocoa-950">
                  Brand Story (Choco Bites)
                </h3>
                <p className="text-xs text-cocoa-600 mt-0.5">
                  Artisanal confections showcase card with text on left and image on right.
                </p>
              </div>

              {bsFeedback && (
                <div className={`p-3.5 rounded text-xs font-medium flex items-center gap-2.5 ${
                  bsFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-rose-50 text-rose-900 border border-rose-200"
                }`}>
                  {bsFeedback.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  )}
                  <span>{bsFeedback.msg}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Card Title (e.g. CHOCO BITES)
                    </label>
                    <input
                      type="text"
                      value={bsEyebrow}
                      onChange={(e) => setBsEyebrow(e.target.value)}
                      placeholder="CHOCO BITES"
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Status
                    </label>
                    <select
                      value={bsStatus}
                      onChange={(e) => setBsStatus(e.target.value as "active" | "inactive")}
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Secondary Headline Title
                  </label>
                  <input
                    type="text"
                    value={bsTitle}
                    onChange={(e) => setBsTitle(e.target.value)}
                    placeholder="Chocolates made for human moments."
                    className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={bsDescription}
                    onChange={(e) => setBsDescription(e.target.value)}
                    className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    &quot;Read More&quot; Button Link
                  </label>
                  <input
                    type="text"
                    value={bsPrimaryLink}
                    onChange={(e) => setBsPrimaryLink(e.target.value)}
                    placeholder="/shop"
                    className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs font-mono text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Card Image (Cloudinary Upload)
                  </label>
                  <ProductSingleImageUploader
                    currentImageUrl={bsImageUrl}
                    currentPublicId={bsImagePublicId}
                    productId="brand_story"
                    getSignatureAction={getCloudinaryCmsUploadSignatureAction}
                    onImageChange={(url, publicId) => {
                      setBsImageUrl(url);
                      setBsImagePublicId(publicId || "");
                    }}
                    title="Brand Story Photo"
                    description="Upload a photo for the right half of Card 2."
                    dropzoneText="Click or Drag & Drop image"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-parchment-border flex justify-end">
                <button
                  type="submit"
                  disabled={isBsSubmitting || isPending}
                  className="inline-flex items-center gap-2 rounded bg-cocoa-950 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-cocoa-800 disabled:opacity-50 transition-colors"
                >
                  {isBsSubmitting || isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Story Card"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: FINAL GIFTING CTA BANNER */}
      {activeTab === "gifting_cta" && (
        <form onSubmit={handleSubmitGiftingCta} className="rounded-lg border border-parchment-border bg-parchment-surface p-5 sm:p-6 shadow-2xs space-y-5 max-w-3xl">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-wider text-cocoa-500 font-bold">
                Bottom Homepage Section
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-cocoa-950">
              Final Gifting CTA Banner
            </h2>
            <p className="text-xs text-cocoa-600 mt-0.5">
              Displays right above the footer with full-width background photo, accent title, and gift shopping button.
            </p>
          </div>

          {ctaFeedback && (
            <div className={`p-3.5 rounded text-xs font-medium flex items-center gap-2.5 ${
              ctaFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-rose-50 text-rose-900 border border-rose-200"
            }`}>
              {ctaFeedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{ctaFeedback.msg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                  Headline Title
                </label>
                <input
                  type="text"
                  value={ctaTitle}
                  onChange={(e) => setCtaTitle(e.target.value)}
                  placeholder="Find something worth gifting."
                  className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs font-bold text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                  Status
                </label>
                <select
                  value={ctaStatus}
                  onChange={(e) => setCtaStatus(e.target.value as "active" | "inactive")}
                  className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                Description Paragraph
              </label>
              <textarea
                rows={3}
                value={ctaDescription}
                onChange={(e) => setCtaDescription(e.target.value)}
                placeholder="Browse our curated collection or reach out for a custom, personalized hamper."
                className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                  Primary CTA Button Text
                </label>
                <input
                  type="text"
                  value={ctaPrimaryText}
                  onChange={(e) => setCtaPrimaryText(e.target.value)}
                  placeholder="SHOP ALL GIFTS"
                  className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                  Primary CTA Button Link
                </label>
                <input
                  type="text"
                  value={ctaPrimaryLink}
                  onChange={(e) => setCtaPrimaryLink(e.target.value)}
                  placeholder="/shop"
                  className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs font-mono text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                Full-Width Background Image (Cloudinary Upload)
              </label>
              <ProductSingleImageUploader
                currentImageUrl={ctaImageUrl}
                currentPublicId={ctaImagePublicId}
                productId="gifting_cta"
                getSignatureAction={getCloudinaryCmsUploadSignatureAction}
                onImageChange={(url, publicId) => {
                  setCtaImageUrl(url);
                  setCtaImagePublicId(publicId || "");
                }}
                title="CTA Section Background Image"
                description="Upload a high-resolution background photo for your 'Find something worth gifting' section."
                dropzoneText="Click or Drag & Drop background image"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-parchment-border flex justify-end">
            <button
              type="submit"
              disabled={isCtaSubmitting || isPending}
              className="inline-flex items-center gap-2 rounded bg-cocoa-950 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-cocoa-800 disabled:opacity-50 transition-colors"
            >
              {isCtaSubmitting || isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Final CTA Banner"
              )}
            </button>
          </div>
        </form>
      )}

      {/* HERO BANNER MODAL */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="flex flex-col w-[calc(100vw-24px)] md:w-full md:max-w-[760px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-24px)] md:max-h-[calc(100vh-40px)] rounded-lg border border-parchment-border bg-parchment-surface shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between p-4 md:p-5 border-b border-parchment-border bg-parchment-surface">
              <div>
                <h3 className="font-serif text-lg font-bold text-cocoa-950">
                  {editingBanner ? "Edit Hero Banner" : "Add Hero Banner"}
                </h3>
                <p className="font-sans text-xs text-cocoa-600 mt-0.5">
                  Upload a high-resolution image and configure homepage banner CTAs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                disabled={isHeroSubmitting}
                className="rounded p-1.5 text-cocoa-400 hover:bg-parchment-muted hover:text-cocoa-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitHero} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-3.5 custom-scrollbar">
                {heroError && (
                  <div className="flex items-start gap-2 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{heroError}</span>
                  </div>
                )}

                {heroSuccess && (
                  <div className="flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{heroSuccess}</span>
                  </div>
                )}

                {/* Eyebrow Tag & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Tag / Eyebrow Text
                    </label>
                    <input
                      type="text"
                      value={heroEyebrow}
                      onChange={(e) => setHeroEyebrow(e.target.value)}
                      placeholder="e.g. PREMIUM CHOCOLATES & GIFTING"
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Headline Title <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="e.g. Small Bites Big Emotions"
                      required
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs font-bold text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Description Paragraph
                  </label>
                  <textarea
                    rows={2}
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    placeholder="Handcrafted chocolates made with premium ingredients..."
                    className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                  />
                </div>

                {/* Homepage Hero Action Button */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 font-semibold">
                    Homepage Action Button (Text &amp; Link)
                  </label>
                  <p className="text-[11px] text-cocoa-500 mb-1">
                    Displayed on the main hero overlay banner.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={heroSecondaryCtaText}
                      onChange={(e) => setHeroSecondaryCtaText(e.target.value)}
                      placeholder="EXPLORE CHOCOLATES"
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                    <input
                      type="text"
                      value={heroSecondaryCtaLink}
                      onChange={(e) => setHeroSecondaryCtaLink(e.target.value)}
                      placeholder="/shop"
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 font-mono focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                  </div>
                </div>

                {/* Optional Secondary Action Button */}
                <div className="space-y-1">
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 font-semibold">
                    Alternate Button (Text &amp; Link)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={heroPrimaryCtaText}
                      onChange={(e) => setHeroPrimaryCtaText(e.target.value)}
                      placeholder="SHOP GIFTS"
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                    <input
                      type="text"
                      value={heroPrimaryCtaLink}
                      onChange={(e) => setHeroPrimaryCtaLink(e.target.value)}
                      placeholder="/shop"
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 font-mono focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                  </div>
                </div>

                {/* Hero Showcase Image */}
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                    Hero Background Image <span className="text-rose-600">*</span>
                  </label>
                  <ProductSingleImageUploader
                    currentImageUrl={heroImageUrl}
                    currentPublicId={heroImagePublicId}
                    productId={editingBanner?.id || "hero_banner"}
                    getSignatureAction={getCloudinaryCmsUploadSignatureAction}
                    onImageChange={(url, publicId) => {
                      setHeroImageUrl(url);
                      setHeroImagePublicId(publicId || "");
                    }}
                    title="Hero Background Image"
                    description="Upload a high-resolution full-bleed image for your hero background canvas."
                    dropzoneText="Click or Drag & Drop hero background image"
                  />
                </div>

                {/* Status & Display Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Status
                    </label>
                    <select
                      value={heroStatus}
                      onChange={(e) => setHeroStatus(e.target.value as "active" | "inactive")}
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-semibold">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={heroDisplayOrder}
                      onChange={(e) => setHeroDisplayOrder(parseInt(e.target.value || "0", 10))}
                      min={0}
                      className="w-full rounded border border-parchment-border bg-white px-3 py-2 text-xs text-cocoa-950 focus:border-cocoa-800 focus:outline-none focus:ring-1 focus:ring-cocoa-800"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="shrink-0 flex items-center justify-end gap-3 p-4 border-t border-parchment-border bg-parchment-surface">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  disabled={isHeroSubmitting}
                  className="rounded border border-parchment-border bg-white px-4 py-2 text-xs font-semibold text-cocoa-700 hover:bg-parchment-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHeroSubmitting || isPending}
                  className="inline-flex items-center gap-2 rounded bg-cocoa-950 px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-cocoa-800 disabled:opacity-50 transition-colors"
                >
                  {isHeroSubmitting || isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Banner...
                    </>
                  ) : (
                    "Save Banner"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
