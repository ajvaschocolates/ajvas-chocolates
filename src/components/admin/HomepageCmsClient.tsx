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
  Tag,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface HomepageCmsClientProps {
  initialBanners: HeroBanner[];
  initialSections: HomepageSection[];
}

export default function HomepageCmsClient({
  initialBanners,
  initialSections,
}: HomepageCmsClientProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "brand_story" | "gifting_experience">("hero");
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

  // Editorial Sections State
  const brandStorySection = initialSections.find((s) => s.section_key === "brand_story") || null;
  const giftingExpSection = initialSections.find((s) => s.section_key === "gifting_experience") || null;

  // Brand Story Form State
  const [bsEyebrow, setBsEyebrow] = useState(brandStorySection?.eyebrow || "The Ajvas Philosophy");
  const [bsTitle, setBsTitle] = useState(brandStorySection?.title || "Chocolates made for human moments.");
  const [bsDescription, setBsDescription] = useState(brandStorySection?.description || "Ajvas was founded on a simple premise: a box of chocolates should feel like a celebration before it's even opened.");
  const [bsImageUrl, setBsImageUrl] = useState(brandStorySection?.image_url || "");
  const [bsImagePublicId, setBsImagePublicId] = useState(brandStorySection?.image_public_id || "");
  const [bsStatus, setBsStatus] = useState<"active" | "inactive">(brandStorySection?.status || "active");
  const [bsFeedback, setBsFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isBsSubmitting, setIsBsSubmitting] = useState(false);

  // Gifting Experience Form State
  const [geTitle, setGeTitle] = useState(giftingExpSection?.title || "Chocolates made for human moments.");
  const [geDescription, setGeDescription] = useState(giftingExpSection?.description || "More than chocolates, we create moments of joy. Crafted with care, premium ingredients, and a belief in the power of thoughtful gifting.");
  const [geImageUrl, setGeImageUrl] = useState(giftingExpSection?.image_url || "");
  const [geImagePublicId, setGeImagePublicId] = useState(giftingExpSection?.image_public_id || "");
  const [geStatus, setGeStatus] = useState<"active" | "inactive">(giftingExpSection?.status || "active");
  const [geFeedback, setGeFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isGeSubmitting, setIsGeSubmitting] = useState(false);

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
    setHeroEyebrow("Celebration & Gifting");
    setHeroDescription("");
    setHeroImageUrl("");
    setHeroImagePublicId("");
    setHeroPrimaryCtaText("Shop Gifts");
    setHeroPrimaryCtaLink("#collections");
    setHeroSecondaryCtaText("Explore Chocolates");
    setHeroSecondaryCtaLink("#gifts");
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

  // Submit Brand Story Form
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
    formData.append("status", bsStatus);

    startTransition(async () => {
      const res = await updateHomepageSectionAction("brand_story", formData);
      setIsBsSubmitting(false);
      if (res.success) {
        setBsFeedback({ type: "success", msg: "Brand Story section updated successfully!" });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setBsFeedback({ type: "error", msg: res.error || "Failed to update Brand Story section." });
      }
    });
  }

  // Submit Gifting Experience Form
  async function handleSubmitGiftingExperience(e: React.FormEvent) {
    e.preventDefault();
    setGeFeedback(null);
    setIsGeSubmitting(true);

    const formData = new FormData();
    formData.append("title", geTitle.trim());
    formData.append("description", geDescription.trim());
    formData.append("image_url", geImageUrl.trim());
    formData.append("image_public_id", geImagePublicId.trim());
    formData.append("status", geStatus);

    startTransition(async () => {
      const res = await updateHomepageSectionAction("gifting_experience", formData);
      setIsGeSubmitting(false);
      if (res.success) {
        setGeFeedback({ type: "success", msg: "Gifting Experience section updated successfully!" });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setGeFeedback({ type: "error", msg: res.error || "Failed to update Gifting Experience section." });
      }
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl border border-cocoa-200 bg-parchment-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-pink/10 text-brand-pink border border-brand-pink/20 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-cocoa-950">Homepage CMS</h1>
              <p className="font-sans text-xs text-cocoa-600 mt-0.5">
                Manage live homepage content, promotional sections and occasion imagery.
              </p>
            </div>
          </div>

          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 rounded-xl bg-cocoa-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-cocoa-800 transition-colors shrink-0"
          >
            <Tag className="h-4 w-4 text-brand-pink" />
            <span>Manage Occasion Images</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tab Selector */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-cocoa-100 pt-4">
          <button
            onClick={() => setActiveTab("hero")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "hero"
                ? "bg-brand-pink text-white shadow-xs"
                : "bg-parchment-surface text-cocoa-700 hover:bg-parchment-hover border border-cocoa-200/60"
            }`}
          >
            Hero Showcase ({banners.length})
          </button>
          <button
            onClick={() => setActiveTab("brand_story")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "brand_story"
                ? "bg-brand-pink text-white shadow-xs"
                : "bg-parchment-surface text-cocoa-700 hover:bg-parchment-hover border border-cocoa-200/60"
            }`}
          >
            Brand Story
          </button>
          <button
            onClick={() => setActiveTab("gifting_experience")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === "gifting_experience"
                ? "bg-brand-pink text-white shadow-xs"
                : "bg-parchment-surface text-cocoa-700 hover:bg-parchment-hover border border-cocoa-200/60"
            }`}
          >
            Gifting Experience
          </button>
        </div>
      </div>

      {/* TAB 1: HERO BANNERS */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-cocoa-950">Hero Banners</h2>
            <button
              onClick={handleOpenCreateHero}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-4 py-2 text-xs font-bold text-cocoa-950 shadow-sm hover:bg-gold-500"
            >
              <Plus className="h-4 w-4" />
              Add Hero Banner
            </button>
          </div>

          {banners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cocoa-300 p-8 text-center bg-parchment-card">
              <p className="font-serif text-lg font-bold text-cocoa-800">No active hero banners found</p>
              <p className="font-sans text-xs text-cocoa-600 mt-1 max-w-md mx-auto">
                Create your first hero banner to customize the top section of the homepage with Cloudinary images and custom CTAs.
              </p>
              <button
                onClick={handleOpenCreateHero}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-pink px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-pink-hover"
              >
                <Plus className="h-4 w-4" />
                Create Hero Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="rounded-2xl border border-cocoa-200 bg-parchment-card overflow-hidden shadow-sm flex flex-col justify-between"
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
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                      Status: {banner.status}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {banner.eyebrow && (
                        <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-brand-pink block mb-1">
                          {banner.eyebrow}
                        </span>
                      )}
                      <h3 className="font-serif text-lg font-bold text-cocoa-950 leading-snug">
                        {banner.title}
                      </h3>
                      {banner.description && (
                        <p className="font-sans text-xs text-cocoa-600 line-clamp-2 mt-1">
                          {banner.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-cocoa-500 pt-3 border-t border-cocoa-100">
                      <span>Primary: {banner.primary_cta_text || "Shop"} ({banner.primary_cta_link || "#"})</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleToggleBannerStatus(banner)}
                        disabled={togglingBannerId === banner.id}
                        className="px-3 py-1.5 rounded-lg border border-cocoa-200 text-xs font-semibold text-cocoa-700 hover:bg-parchment-hover inline-flex items-center gap-1.5"
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
                        className="px-3 py-1.5 rounded-lg bg-cocoa-900 text-white text-xs font-semibold hover:bg-cocoa-800 inline-flex items-center gap-1.5"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center"
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

      {/* TAB 2: BRAND STORY */}
      {activeTab === "brand_story" && (
        <form onSubmit={handleSubmitBrandStory} className="rounded-2xl border border-cocoa-200 bg-parchment-card p-6 shadow-sm space-y-6 max-w-3xl">
          <h2 className="font-serif text-xl font-bold text-cocoa-950">Brand Story Section</h2>

          {bsFeedback && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-sans font-medium ${
              bsFeedback.type === "success" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-rose-50 text-rose-900 border border-rose-200"
            }`}>
              {bsFeedback.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />}
              <span>{bsFeedback.msg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-cocoa-700 mb-1">
                Eyebrow Badge Tag
              </label>
              <input
                type="text"
                value={bsEyebrow}
                onChange={(e) => setBsEyebrow(e.target.value)}
                placeholder="e.g. The Ajvas Philosophy"
                className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3.5 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-cocoa-700 mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={bsTitle}
                onChange={(e) => setBsTitle(e.target.value)}
                placeholder="e.g. Chocolates made for human moments."
                className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3.5 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-cocoa-700 mb-1">
                Description Paragraph
              </label>
              <textarea
                rows={4}
                value={bsDescription}
                onChange={(e) => setBsDescription(e.target.value)}
                className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3.5 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-cocoa-700 mb-1">
                Section Image (Cloudinary Upload)
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
                title="Brand Story Image"
                description="Upload a high-resolution photo for your brand story section."
                dropzoneText="Click or Drag & Drop image"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-cocoa-100 flex justify-end">
            <button
              type="submit"
              disabled={isBsSubmitting || isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-6 py-2.5 text-xs font-bold text-cocoa-950 shadow-sm hover:bg-gold-500 disabled:opacity-50"
            >
              {isBsSubmitting || isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Brand Story"
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: GIFTING EXPERIENCE */}
      {activeTab === "gifting_experience" && (
        <form onSubmit={handleSubmitGiftingExperience} className="rounded-2xl border border-cocoa-200 bg-parchment-card p-6 shadow-sm space-y-6 max-w-3xl">
          <h2 className="font-serif text-xl font-bold text-cocoa-950">Gifting Experience Section</h2>

          {geFeedback && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-sans font-medium ${
              geFeedback.type === "success" ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-rose-50 text-rose-900 border border-rose-200"
            }`}>
              {geFeedback.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />}
              <span>{geFeedback.msg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-cocoa-700 mb-1">
                Headline Title
              </label>
              <input
                type="text"
                value={geTitle}
                onChange={(e) => setGeTitle(e.target.value)}
                placeholder="e.g. Chocolates made for human moments."
                className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3.5 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-cocoa-700 mb-1">
                Description Paragraph
              </label>
              <textarea
                rows={4}
                value={geDescription}
                onChange={(e) => setGeDescription(e.target.value)}
                className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3.5 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-cocoa-700 mb-1">
                Section Image (Cloudinary Upload)
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
                title="Gifting Experience Image"
                description="Upload a high-resolution photo for your gifting experience section."
                dropzoneText="Click or Drag & Drop image"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-cocoa-100 flex justify-end">
            <button
              type="submit"
              disabled={isGeSubmitting || isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-6 py-2.5 text-xs font-bold text-cocoa-950 shadow-sm hover:bg-gold-500 disabled:opacity-50"
            >
              {isGeSubmitting || isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Gifting Experience"
              )}
            </button>
          </div>
        </form>
      )}

      {/* HERO BANNER MODAL */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex flex-col w-[calc(100vw-24px)] md:w-full md:max-w-[760px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-24px)] md:max-h-[calc(100vh-40px)] rounded-2xl border border-cocoa-200 bg-parchment-card shadow-2xl overflow-hidden">
            {/* Modal Header (Fixed) */}
            <div className="shrink-0 flex items-center justify-between p-4 md:p-5 border-b border-cocoa-100 bg-parchment-card">
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
                className="rounded-lg p-1.5 text-cocoa-400 hover:bg-parchment-hover hover:text-cocoa-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Architecture */}
            <form onSubmit={handleSubmitHero} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-3.5">
                {heroError && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{heroError}</span>
                  </div>
                )}

                {heroSuccess && (
                  <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{heroSuccess}</span>
                  </div>
                )}

                {/* Eyebrow Tag & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                      Tag / Eyebrow Text
                    </label>
                    <input
                      type="text"
                      value={heroEyebrow}
                      onChange={(e) => setHeroEyebrow(e.target.value)}
                      placeholder="e.g. Celebration & Gifting"
                      className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                      Headline Title <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="e.g. Gifts worth opening slowly."
                      required
                      className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-bold text-cocoa-900 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    placeholder="Chocolates crafted for life's celebrations..."
                    className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                  />
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                      Primary CTA (Text &amp; Link)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={heroPrimaryCtaText}
                        onChange={(e) => setHeroPrimaryCtaText(e.target.value)}
                        placeholder="Shop Gifts"
                        className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={heroPrimaryCtaLink}
                        onChange={(e) => setHeroPrimaryCtaLink(e.target.value)}
                        placeholder="#collections"
                        className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 font-mono focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                      Secondary CTA (Text &amp; Link)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={heroSecondaryCtaText}
                        onChange={(e) => setHeroSecondaryCtaText(e.target.value)}
                        placeholder="Explore Chocolates"
                        className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={heroSecondaryCtaLink}
                        onChange={(e) => setHeroSecondaryCtaLink(e.target.value)}
                        placeholder="#gifts"
                        className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 font-mono focus:border-gold-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Showcase Image */}
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                    Hero Showcase Image <span className="text-rose-600">*</span>
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
                    title="Hero Showcase Image"
                    description="Upload a high-resolution image for your homepage hero banner."
                    dropzoneText="Click or Drag & Drop image"
                  />
                </div>

                {/* Status & Display Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                      Status
                    </label>
                    <select
                      value={heroStatus}
                      onChange={(e) => setHeroStatus(e.target.value as "active" | "inactive")}
                      className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] uppercase tracking-wider text-cocoa-700 mb-1 font-bold">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={heroDisplayOrder}
                      onChange={(e) => setHeroDisplayOrder(parseInt(e.target.value || "0", 10))}
                      min={0}
                      className="w-full rounded-lg border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer (Fixed) */}
              <div className="shrink-0 flex items-center justify-end gap-3 p-4 md:p-5 border-t border-cocoa-100 bg-parchment-card">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  disabled={isHeroSubmitting}
                  className="rounded-lg border border-cocoa-200 px-4 py-2 font-mono text-xs text-cocoa-700 hover:bg-parchment-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHeroSubmitting || isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold-600 px-5 py-2 text-xs font-bold text-cocoa-950 shadow-sm hover:bg-gold-500 disabled:opacity-50 transition-colors"
                >
                  {isHeroSubmitting || isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingBanner ? (
                    "Save Changes"
                  ) : (
                    "Create Hero Banner"
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
