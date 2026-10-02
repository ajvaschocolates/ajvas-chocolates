"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2, FileText } from "lucide-react";
import type { PageSection, PageSectionPage } from "@/lib/supabase/page-sections";
import {
  createPageSectionAction,
  updatePageSectionAction,
  deletePageSectionAction,
} from "@/app/admin/pages/actions";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

const PAGES: { key: PageSectionPage; label: string }[] = [
  { key: "about", label: "About Us" },
  { key: "contact", label: "Contact Us" },
  { key: "shipping-delivery", label: "Shipping & Delivery" },
  { key: "refund-returns", label: "Refund & Returns" },
  { key: "faq", label: "FAQ" },
  { key: "care-instructions", label: "Care & Instructions" },
  { key: "privacy-policy", label: "Privacy Policy" },
  { key: "terms-conditions", label: "Terms & Conditions" },
];

interface Props {
  initialSections: PageSection[];
}

type FormMode = "add" | "edit" | null;

interface FormState {
  mode: FormMode;
  section?: PageSection;
  page?: PageSectionPage;
}

export default function PageSectionsClient({ initialSections }: Props) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [activePage, setActivePage] = useState<PageSectionPage>("about");
  const [form, setForm] = useState<FormState>({ mode: null });
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pageSections = sections.filter((s) => s.page === activePage);

  function openAdd() {
    setForm({ mode: "add", page: activePage });
    setFormTitle("");
    setFormContent("");
    setFormSortOrder(pageSections.length);
    setError(null);
  }

  function openEdit(section: PageSection) {
    setForm({ mode: "edit", section, page: section.page });
    setFormTitle(section.title);
    setFormContent(section.content);
    setFormSortOrder(section.sort_order);
    setError(null);
  }

  function closeForm() {
    setForm({ mode: null });
    setError(null);
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("page", activePage);
    fd.set("title", formTitle);
    fd.set("content", formContent);
    fd.set("sort_order", String(formSortOrder));

    startTransition(async () => {
      setError(null);
      if (form.mode === "add") {
        const res = await createPageSectionAction(fd);
        if (!res.success) { setError(res.error || "Failed."); return; }
        // optimistic: add placeholder, page will revalidate
        setSections((prev) => [
          ...prev,
          {
            id: res.id ?? crypto.randomUUID(),
            page: activePage,
            title: formTitle,
            content: formContent,
            sort_order: formSortOrder,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        flash("Section added.");
      } else if (form.mode === "edit" && form.section) {
        const res = await updatePageSectionAction(form.section.id, fd);
        if (!res.success) { setError(res.error || "Failed."); return; }
        setSections((prev) =>
          prev.map((s) =>
            s.id === form.section!.id
              ? { ...s, title: formTitle, content: formContent, sort_order: formSortOrder }
              : s
          )
        );
        flash("Section updated.");
      }
      closeForm();
    });
  }

  const [deletingSection, setDeletingSection] = useState<PageSection | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleConfirmDeleteSection() {
    if (!deletingSection) return;
    setDeletingId(deletingSection.id);
    setDeleteError(null);
    startTransition(async () => {
      const res = await deletePageSectionAction(deletingSection.id, deletingSection.page);
      setDeletingId(null);
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete section.");
        return;
      }
      setSections((prev) => prev.filter((s) => s.id !== deletingSection.id));
      setDeletingSection(null);
      flash("Section deleted.");
    });
  }

  return (
    <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-cocoa-950 font-mono tracking-tight">
            Pages CMS
          </h1>
          <p className="text-xs text-cocoa-600 mt-0.5">
            Manage content sections for all public information pages.
          </p>
        </div>
        {successMsg && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5">
            <Check className="w-3.5 h-3.5" /> {successMsg}
          </span>
        )}
      </div>

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => { setActivePage(p.key); setForm({ mode: null }); setError(null); }}
            className={`px-3 py-1.5 rounded text-xs font-semibold font-mono transition-colors ${
              activePage === p.key
                ? "bg-cocoa-950 text-white"
                : "bg-parchment-surface border border-parchment-border text-cocoa-700 hover:border-cocoa-600/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Active Page Panel */}
      <div className="bg-parchment-surface border border-parchment-border rounded-lg overflow-hidden">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-parchment-border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cocoa-600" />
            <span className="text-sm font-bold text-cocoa-950">
              {PAGES.find((p) => p.key === activePage)?.label}
            </span>
            <span className="text-xs font-mono text-cocoa-600 bg-parchment-border/60 px-2 py-0.5 rounded">
              {pageSections.length} section{pageSections.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cocoa-950 text-white text-xs font-bold rounded hover:bg-cocoa-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Section
          </button>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mx-5 mt-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <X className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        {/* Add / Edit Form */}
        {form.mode && (
          <div className="mx-5 mt-4 bg-parchment rounded-lg border border-parchment-border p-5">
            <h2 className="text-sm font-bold text-cocoa-950 mb-4">
              {form.mode === "add" ? "Add New Section" : "Edit Section"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-cocoa-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Section heading"
                    className="w-full h-9 px-3 text-sm bg-white border border-parchment-border rounded focus:outline-none focus:ring-1 focus:ring-cocoa-950/30 text-cocoa-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cocoa-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full h-9 px-3 text-sm bg-white border border-parchment-border rounded focus:outline-none focus:ring-1 focus:ring-cocoa-950/30 text-cocoa-950"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-cocoa-700 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Section body text..."
                  className="w-full px-3 py-2 text-sm bg-white border border-parchment-border rounded focus:outline-none focus:ring-1 focus:ring-cocoa-950/30 text-cocoa-950 resize-y"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cocoa-950 text-white text-xs font-bold rounded hover:bg-cocoa-800 transition-colors disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {form.mode === "add" ? "Add Section" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-xs font-semibold text-cocoa-700 bg-white border border-parchment-border rounded hover:border-cocoa-600/40 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sections List */}
        <div className="divide-y divide-parchment-border">
          {pageSections.length === 0 && !form.mode && (
            <div className="px-5 py-10 text-center text-xs text-cocoa-600">
              No sections yet for this page. Click <strong>Add Section</strong> to create one.
            </div>
          )}
          {pageSections
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((section) => (
              <div key={section.id} className="px-5 py-4 flex items-start gap-4 group">
                <div className="w-8 h-8 rounded bg-parchment-border/40 flex items-center justify-center shrink-0 text-xs font-mono font-bold text-cocoa-600 mt-0.5">
                  {section.sort_order}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cocoa-950 leading-snug">{section.title}</p>
                  <p className="text-xs text-cocoa-600 mt-1 leading-relaxed line-clamp-2">{section.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(section)}
                    className="p-1.5 rounded hover:bg-cocoa-950/10 text-cocoa-700 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteError(null);
                      setDeletingSection(section);
                    }}
                    disabled={deletingId === section.id || isPending}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingSection)}
        onClose={() => {
          if (!deletingId) {
            setDeletingSection(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDeleteSection}
        itemType="section"
        itemName={deletingSection?.title}
        isDeleting={Boolean(deletingId)}
        error={deleteError}
      />
    </main>
  );
}
