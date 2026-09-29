"use client";

import { useState, useTransition } from "react";
import {
  Star,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { TestimonialItem, TestimonialsSectionData } from "@/types/cms";
import {
  saveTestimonialAction,
  deleteTestimonialAction,
  updateDecorativeImagesAction,
} from "@/app/admin/testimonials/actions";
import {
  DEFAULT_LEFT_IMAGE,
  DEFAULT_RIGHT_IMAGE,
} from "@/lib/constants/testimonials";

interface TestimonialsManagerProps {
  initialData: TestimonialsSectionData;
}

export default function TestimonialsManager({
  initialData,
}: TestimonialsManagerProps) {
  const [data, setData] = useState<TestimonialsSectionData>(initialData);
  const [isPending, startTransition] = useTransition();

  // Decorative images state
  const [leftImage, setLeftImage] = useState(
    initialData.left_image_url || DEFAULT_LEFT_IMAGE
  );
  const [rightImage, setRightImage] = useState(
    initialData.right_image_url || DEFAULT_RIGHT_IMAGE
  );
  const [imgMessage, setImgMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null);
  const [formAuthor, setFormAuthor] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formStars, setFormStars] = useState(5);
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormAuthor("");
    setFormLocation("");
    setFormAvatar("");
    setFormQuote("");
    setFormStars(5);
    setFormStatus("active");
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormAuthor(item.author);
    setFormLocation(item.location || "");
    setFormAvatar(item.avatar_url || "");
    setFormQuote(item.quote);
    setFormStars(item.stars || 5);
    setFormStatus(item.status || "active");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim()) {
      setModalError("Customer name is required.");
      return;
    }
    if (!formQuote.trim()) {
      setModalError("Quote text is required.");
      return;
    }

    const payload: TestimonialItem = {
      id: editingItem ? editingItem.id : `rev-${Date.now()}`,
      author: formAuthor.trim(),
      location: formLocation.trim() || undefined,
      avatar_url: formAvatar.trim() || undefined,
      quote: formQuote.trim(),
      stars: formStars,
      status: formStatus,
    };

    startTransition(async () => {
      const res = await saveTestimonialAction(payload, !editingItem);
      if (res.success) {
        setData((prev) => {
          const list = prev.testimonials || [];
          if (editingItem) {
            return {
              ...prev,
              testimonials: list.map((t) => (t.id === payload.id ? payload : t)),
            };
          }
          return {
            ...prev,
            testimonials: [payload, ...list],
          };
        });
        setIsModalOpen(false);
      } else {
        setModalError(res.error || "Failed to save testimonial.");
      }
    });
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteTestimonialAction(id);
      if (res.success) {
        setData((prev) => ({
          ...prev,
          testimonials: (prev.testimonials || []).filter((t) => t.id !== id),
        }));
      } else {
        alert(res.error || "Failed to delete testimonial.");
      }
      setDeletingId(null);
    });
  };

  const handleSaveImages = (e: React.FormEvent) => {
    e.preventDefault();
    setImgMessage(null);
    startTransition(async () => {
      const res = await updateDecorativeImagesAction(leftImage, rightImage);
      if (res.success) {
        setImgMessage({
          type: "success",
          text: "Decorative side images saved successfully!",
        });
        setTimeout(() => setImgMessage(null), 3000);
      } else {
        setImgMessage({
          type: "error",
          text: res.error || "Failed to save images.",
        });
      }
    });
  };

  const testimonials = data.testimonials || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cocoa-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-brand-pink" />
            <span className="font-mono text-xs uppercase tracking-wider text-cocoa-500 font-bold">
              Homepage Showcase
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cocoa-950">
            Customer Testimonials
          </h1>
          <p className="text-sm text-cocoa-600 mt-1">
            Manage customer reviews, avatar photos, and the decorative side images
            displayed in the 3-panel layout.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cocoa-900 hover:bg-cocoa-800 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Decorative Side Images Card */}
      <div className="bg-parchment-surface border border-cocoa-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-cocoa-700" />
          <h2 className="font-serif text-lg font-bold text-cocoa-950">
            Decorative Side Images (3-Panel Layout)
          </h2>
        </div>
        <p className="text-xs text-cocoa-600 mb-6">
          The reference design places decorative gourmet chocolate photography on
          the left and right of the center testimonial card.
        </p>

        {imgMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-5 flex items-center gap-2 ${
              imgMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {imgMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{imgMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveImages} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Image URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-cocoa-800">
                Left Image (Top-Down Chocolate Box)
              </label>
              <input
                type="url"
                value={leftImage}
                onChange={(e) => setLeftImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cocoa-200 bg-white focus:outline-none focus:ring-2 focus:ring-cocoa-800"
              />
              <div className="w-full h-36 rounded-xl overflow-hidden border border-cocoa-200/60 bg-cocoa-50 mt-2 relative">
                {leftImage ? (
                  <img
                    src={leftImage}
                    alt="Left preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-cocoa-400">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Right Image URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-cocoa-800">
                Right Image (Golden Truffles in Glass)
              </label>
              <input
                type="url"
                value={rightImage}
                onChange={(e) => setRightImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cocoa-200 bg-white focus:outline-none focus:ring-2 focus:ring-cocoa-800"
              />
              <div className="w-full h-36 rounded-xl overflow-hidden border border-cocoa-200/60 bg-cocoa-50 mt-2 relative">
                {rightImage ? (
                  <img
                    src={rightImage}
                    alt="Right preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-cocoa-400">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-cocoa-900 hover:bg-cocoa-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Side Images</span>
            </button>
          </div>
        </form>
      </div>

      {/* Testimonials List */}
      <div className="bg-parchment-surface border border-cocoa-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-cocoa-950">
            All Reviews ({testimonials.length})
          </h2>
          <span className="text-xs text-cocoa-500 font-mono">
            Active in Carousel:{" "}
            {testimonials.filter((t) => t.status !== "inactive").length}
          </span>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-cocoa-300 rounded-2xl bg-white/40">
            <Sparkles className="w-8 h-8 text-cocoa-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-cocoa-700">
              No customer testimonials yet
            </p>
            <p className="text-xs text-cocoa-500 mt-1">
              Click &quot;Add Testimonial&quot; above to create your first review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-cocoa-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-cocoa-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {/* Customer Avatar & Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-pink/60 bg-cocoa-100 flex-shrink-0">
                        {t.avatar_url ? (
                          <img
                            src={t.avatar_url}
                            alt={t.author}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-cocoa-700">
                            {t.author.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-bold text-cocoa-950 leading-tight">
                          {t.author}
                        </h3>
                        {t.location && (
                          <p className="text-[11px] text-cocoa-500 font-mono">
                            {t.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        t.status === "inactive"
                          ? "bg-cocoa-100 text-cocoa-600"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {t.status === "inactive" ? "Inactive" : "Active"}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400 mb-2.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (t.stars || 5)
                            ? "fill-amber-400 stroke-amber-400"
                            : "stroke-cocoa-200 fill-transparent"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-xs text-cocoa-700 italic leading-relaxed line-clamp-4">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-cocoa-100 mt-4">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 rounded-lg text-cocoa-600 hover:text-cocoa-950 hover:bg-cocoa-50 transition-colors"
                    title="Edit review"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTestimonial(t.id)}
                    disabled={deletingId === t.id}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Delete review"
                  >
                    {deletingId === t.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-cocoa-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-cocoa-100 pb-4 mb-5">
              <h3 className="font-serif text-lg font-bold text-cocoa-950">
                {editingItem ? "Edit Testimonial" : "Add New Testimonial"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-cocoa-400 hover:text-cocoa-800 hover:bg-cocoa-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTestimonial} className="space-y-4">
              {/* Author & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-cocoa-800 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cocoa-200 focus:outline-none focus:ring-2 focus:ring-cocoa-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cocoa-800 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Kochi, Kerala"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cocoa-200 focus:outline-none focus:ring-2 focus:ring-cocoa-800"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-bold text-cocoa-800 mb-1">
                  Avatar Photo URL
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-cocoa-200 focus:outline-none focus:ring-2 focus:ring-cocoa-800"
                  />
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-cocoa-200 bg-cocoa-50 flex-shrink-0">
                    {formAvatar ? (
                      <img
                        src={formAvatar}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-cocoa-400">
                        None
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-cocoa-800 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormStars(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formStars
                            ? "fill-amber-400 stroke-amber-400"
                            : "stroke-cocoa-300 fill-transparent"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-cocoa-600 ml-2">
                    {formStars} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Quote Text */}
              <div>
                <label className="block text-xs font-bold text-cocoa-800 mb-1">
                  Testimonial Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  placeholder="Enter the customer review quote..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cocoa-200 focus:outline-none focus:ring-2 focus:ring-cocoa-800"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-cocoa-800 mb-1">
                  Visibility Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "active" | "inactive")
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-cocoa-200 bg-white focus:outline-none focus:ring-2 focus:ring-cocoa-800"
                >
                  <option value="active">Active (Shown on Homepage)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cocoa-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-cocoa-600 hover:bg-cocoa-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-cocoa-900 hover:bg-cocoa-800 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-sm disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Update Review" : "Save Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
