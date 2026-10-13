"use client";

import { useState, useTransition } from "react";
import {
  Gift,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Sparkles,
  Info,
  X,
} from "lucide-react";
import {
  GiftPurpose,
  GiftPurposeSettings,
  CUSTOM_GIFT_PURPOSE_VALUE,
} from "@/types/gift-purpose";
import {
  saveCustomPurposeFeeSettingsAction,
  createGiftPurposeAction,
  updateGiftPurposeAction,
  toggleGiftPurposeStatusAction,
  deleteGiftPurposeAction,
  reorderGiftPurposesAction,
} from "@/app/admin/gift-purposes/actions";

interface GiftPurposeManagerClientProps {
  initialPurposes: GiftPurpose[];
  initialSettings: GiftPurposeSettings;
}

export default function GiftPurposeManagerClient({
  initialPurposes,
  initialSettings,
}: GiftPurposeManagerClientProps) {
  const [purposes, setPurposes] = useState<GiftPurpose[]>(initialPurposes);
  const [settings, setSettings] = useState<GiftPurposeSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();

  // Settings form state
  const [customEnabled, setCustomEnabled] = useState<boolean>(settings.custom_enabled);
  const [customFeeStr, setCustomFeeStr] = useState<string>(String(settings.custom_fee));
  const [settingsFeedback, setSettingsFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSortOrder, setAddSortOrder] = useState<number>(purposes.length + 1);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit modal state
  const [editingPurpose, setEditingPurpose] = useState<GiftPurpose | null>(null);
  const [editName, setEditName] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete modal state
  const [deletingPurpose, setDeletingPurpose] = useState<GiftPurpose | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Feedback banner for general actions
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Metrics
  const totalCount = purposes.length;
  const activeCount = purposes.filter((p) => p.is_active).length;
  const inactiveCount = totalCount - activeCount;

  // Save Settings Handler
  const handleSaveSettings = () => {
    setSettingsFeedback(null);
    const numericFee = parseFloat(customFeeStr.trim());

    if (isNaN(numericFee) || !isFinite(numericFee) || numericFee < 0) {
      setSettingsFeedback({
        type: "error",
        text: "Please enter a valid, finite non-negative fee amount (₹0 or higher).",
      });
      return;
    }

    startTransition(async () => {
      const res = await saveCustomPurposeFeeSettingsAction({
        custom_enabled: customEnabled,
        custom_fee: numericFee,
      });

      if (res.success) {
        setSettings({
          custom_enabled: customEnabled,
          custom_fee: numericFee,
        });
        setSettingsFeedback({
          type: "success",
          text: "Custom Purpose Fee settings saved successfully.",
        });
        setTimeout(() => setSettingsFeedback(null), 4000);
      } else {
        setSettingsFeedback({
          type: "error",
          text: res.error || "Failed to save settings.",
        });
      }
    });
  };

  // Create Purpose Handler
  const handleCreatePurpose = () => {
    setAddError(null);
    const trimmed = addName.trim();

    if (!trimmed) {
      setAddError("Purpose name cannot be empty.");
      return;
    }

    if (trimmed.toLowerCase() === CUSTOM_GIFT_PURPOSE_VALUE.toLowerCase()) {
      setAddError("'Custom' is reserved and cannot be added as a standard option.");
      return;
    }

    // Client-side duplicate check
    const duplicate = purposes.find(
      (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setAddError(`An option named "${trimmed}" already exists.`);
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmed);
    formData.append("sort_order", String(addSortOrder));
    formData.append("is_active", "true");

    startTransition(async () => {
      const res = await createGiftPurposeAction(formData);
      if (res.success) {
        const newPurpose = (res.data as GiftPurpose) || {
          id: `gp-${Date.now()}`,
          name: trimmed,
          sort_order: addSortOrder,
          is_active: true,
        };
        const updated = [...purposes, newPurpose].sort(
          (a, b) => a.sort_order - b.sort_order
        );
        setPurposes(updated);
        setIsAddModalOpen(false);
        setAddName("");
        setAddSortOrder(updated.length + 1);
        setActionFeedback({
          type: "success",
          text: `Added "${trimmed}" to standard gift purposes.`,
        });
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        setAddError(res.error || "Failed to create purpose.");
      }
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (purpose: GiftPurpose) => {
    setEditingPurpose(purpose);
    setEditName(purpose.name);
    setEditSortOrder(purpose.sort_order);
    setEditIsActive(purpose.is_active);
    setEditError(null);
  };

  // Save Edit Handler
  const handleSaveEdit = () => {
    if (!editingPurpose) return;
    setEditError(null);
    const trimmed = editName.trim();

    if (!trimmed) {
      setEditError("Purpose name cannot be empty.");
      return;
    }

    if (trimmed.toLowerCase() === CUSTOM_GIFT_PURPOSE_VALUE.toLowerCase()) {
      setEditError("'Custom' is reserved and cannot be used.");
      return;
    }

    // Duplicate check against other purposes
    const duplicate = purposes.find(
      (p) =>
        p.id !== editingPurpose.id &&
        p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setEditError(`Another option is already named "${trimmed}".`);
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmed);
    formData.append("sort_order", String(editSortOrder));
    formData.append("is_active", String(editIsActive));

    startTransition(async () => {
      const res = await updateGiftPurposeAction(editingPurpose.id, formData);
      if (res.success) {
        const updated = purposes
          .map((p) =>
            p.id === editingPurpose.id
              ? {
                  ...p,
                  name: trimmed,
                  sort_order: editSortOrder,
                  is_active: editIsActive,
                }
              : p
          )
          .sort((a, b) => a.sort_order - b.sort_order);
        setPurposes(updated);
        setEditingPurpose(null);
        setActionFeedback({
          type: "success",
          text: `Updated "${trimmed}" successfully.`,
        });
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        setEditError(res.error || "Failed to update purpose.");
      }
    });
  };

  // Toggle Status Handler
  const handleToggleStatus = (purpose: GiftPurpose) => {
    startTransition(async () => {
      const res = await toggleGiftPurposeStatusAction(
        purpose.id,
        purpose.is_active
      );
      if (res.success) {
        setPurposes((prev) =>
          prev.map((p) =>
            p.id === purpose.id ? { ...p, is_active: !p.is_active } : p
          )
        );
      } else {
        setActionFeedback({
          type: "error",
          text: res.error || "Failed to toggle status.",
        });
      }
    });
  };

  // Delete Handler
  const handleDelete = () => {
    if (!deletingPurpose) return;
    setDeleteError(null);

    startTransition(async () => {
      const res = await deleteGiftPurposeAction(
        deletingPurpose.id,
        deletingPurpose.name
      );
      if (res.success) {
        setPurposes((prev) => prev.filter((p) => p.id !== deletingPurpose.id));
        setDeletingPurpose(null);
        setActionFeedback({
          type: "success",
          text: `Deleted "${deletingPurpose.name}".`,
        });
        setTimeout(() => setActionFeedback(null), 4000);
      } else {
        setDeleteError(res.error || "Failed to delete purpose.");
      }
    });
  };

  // Move Up / Down Sort Order
  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= purposes.length) return;

    const list = [...purposes];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Re-assign sequence numbers
    const updated = list.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
    }));
    setPurposes(updated);

    startTransition(async () => {
      await reorderGiftPurposesAction(
        updated.map((item) => ({ id: item.id, sort_order: item.sort_order }))
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
              <Gift className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-cocoa-950">
              Gift Purpose &amp; Custom Fee Settings
            </h1>
          </div>
          <p className="text-xs text-cocoa-600 mt-1 font-sans">
            Manage the standard gift occasions shown to customers, and configure the once-per-order Custom Purpose charge.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddName("");
            setAddSortOrder(purposes.length + 1);
            setAddError(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-pink hover:bg-brand-pink/90 text-white font-bold text-xs font-sans shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Standard Purpose</span>
        </button>
      </div>

      {/* Global Action Feedback Alert */}
      {actionFeedback && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 shadow-xs border ${
            actionFeedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {actionFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <p>{actionFeedback.text}</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="p-4 bg-parchment-surface border border-parchment-border rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-600 block">
            Total Standard Options
          </span>
          <span className="text-2xl font-bold font-mono text-cocoa-950 mt-1 block">
            {totalCount}
          </span>
        </div>

        <div className="p-4 bg-parchment-surface border border-parchment-border rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            Active Storefront Options
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-900 mt-1 block">
            {activeCount}
          </span>
        </div>

        <div className="p-4 bg-parchment-surface border border-parchment-border rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cocoa-500 block">
            Inactive / Disabled
          </span>
          <span className="text-2xl font-bold font-mono text-cocoa-600 mt-1 block">
            {inactiveCount}
          </span>
        </div>

        <div className="p-4 bg-parchment-surface border border-parchment-border rounded-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-pink block">
            Custom Purpose Fee
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cocoa-950">
              ₹{settings.custom_fee}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                settings.custom_enabled
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {settings.custom_enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Custom Purpose Fee Configuration */}
      <section className="bg-parchment-surface border border-parchment-border rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="border-b border-parchment-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-serif font-bold text-cocoa-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-pink" />
              <span>Custom Purpose Fee Setting</span>
            </h2>
            <p className="text-xs text-cocoa-600 mt-0.5 font-sans">
              Set the fixed fee charged once per order when a customer chooses &quot;Custom&quot;.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-cocoa-700 bg-parchment-muted px-3 py-1.5 rounded-lg border border-parchment-line">
            <Info className="w-3.5 h-3.5 text-cocoa-600 shrink-0" />
            <span>Charged exactly once per order (regardless of quantity).</span>
          </div>
        </div>

        {/* Feedback Alert for Settings */}
        {settingsFeedback && (
          <div
            role="status"
            className={`p-3 rounded-xl text-xs font-sans font-medium flex items-center gap-2.5 border ${
              settingsFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            {settingsFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <p>{settingsFeedback.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          {/* Custom Option Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-cocoa-950 uppercase tracking-wider block font-sans">
              Custom Option Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCustomEnabled(!customEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  customEnabled ? "bg-emerald-600" : "bg-gray-300"
                }`}
                aria-label="Toggle Custom Option"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    customEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-sans font-semibold text-cocoa-800">
                {customEnabled ? "Enabled for Customers" : "Disabled (Hidden)"}
              </span>
            </div>
            <p className="text-[11px] text-cocoa-500 font-sans">
              When disabled, customers cannot select Custom or bypass the fee rule.
            </p>
          </div>

          {/* Fee Input in INR */}
          <div className="space-y-2">
            <label
              htmlFor="custom-fee-input"
              className="text-xs font-bold text-cocoa-950 uppercase tracking-wider block font-sans"
            >
              Fixed Custom Fee (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-cocoa-500 font-mono font-bold text-sm pointer-events-none">
                ₹
              </span>
              <input
                id="custom-fee-input"
                type="number"
                step="0.01"
                min="0"
                value={customFeeStr}
                onChange={(e) => setCustomFeeStr(e.target.value)}
                placeholder="75.00"
                className="w-full pl-8 pr-4 py-2 bg-white border border-parchment-border rounded-xl text-cocoa-950 font-mono font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-brand-pink"
              />
            </div>
            <p className="text-[11px] text-cocoa-500 font-sans">
              A fee of ₹0 is valid when free custom requests are desired.
            </p>
          </div>

          {/* Save Action */}
          <div>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSaveSettings}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cocoa-950 hover:bg-cocoa-900 text-white font-bold text-xs font-sans transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Save Fee Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Standard Gift Purposes Table */}
      <section className="bg-parchment-surface border border-parchment-border rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="border-b border-parchment-border pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-cocoa-950 flex items-center gap-2">
              <Gift className="w-4 h-4 text-brand-pink" />
              <span>Standard Gift Purposes</span>
            </h2>
            <p className="text-xs text-cocoa-600 mt-0.5 font-sans">
              Active purposes are displayed on the storefront in the configured sort order. Standard purposes carry no fee.
            </p>
          </div>
        </div>

        {/* Purposes Table */}
        <div className="overflow-x-auto rounded-xl border border-parchment-border bg-white">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-parchment-muted/80 text-cocoa-700 font-bold uppercase tracking-wider text-[10px] border-b border-parchment-border">
                <th className="py-3 px-4 w-28 text-center">Sort Order</th>
                <th className="py-3 px-4">Display Name</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
                <th className="py-3 px-4 w-44 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border">
              {purposes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-cocoa-500 italic">
                    No standard gift purposes configured. Click &quot;Add Standard Purpose&quot; to create one.
                  </td>
                </tr>
              ) : (
                purposes.map((purpose, idx) => (
                  <tr
                    key={purpose.id}
                    className="hover:bg-parchment-surface/60 transition-colors"
                  >
                    {/* Sort controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono font-bold text-cocoa-800 w-6 text-center">
                          {purpose.sort_order}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={idx === 0 || isPending}
                            onClick={() => handleMoveOrder(idx, "up")}
                            title="Move Up"
                            className="p-0.5 text-cocoa-500 hover:text-cocoa-950 disabled:opacity-20"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === purposes.length - 1 || isPending}
                            onClick={() => handleMoveOrder(idx, "down")}
                            title="Move Down"
                            className="p-0.5 text-cocoa-500 hover:text-cocoa-950 disabled:opacity-20"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-cocoa-950 text-sm block">
                        {purpose.name}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          purpose.is_active
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {purpose.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(purpose)}
                          disabled={isPending}
                          title={purpose.is_active ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            purpose.is_active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {purpose.is_active ? (
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(purpose)}
                          title="Edit Purpose"
                          className="p-1.5 rounded-lg bg-parchment-muted hover:bg-parchment-surface border border-parchment-line text-cocoa-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingPurpose(purpose);
                            setDeleteError(null);
                          }}
                          title="Delete Purpose"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL 1: Add Standard Purpose Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-parchment-surface border border-parchment-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h3 className="font-serif font-bold text-cocoa-950 text-lg flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-pink" />
                <span>Add Standard Gift Purpose</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-cocoa-500 hover:text-cocoa-950 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <div className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-xs font-bold text-cocoa-950 uppercase tracking-wider block">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Wedding Anniversary, Graduation, etc."
                  className="w-full px-3.5 py-2.5 bg-white border border-parchment-border rounded-xl text-cocoa-950 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-cocoa-950 uppercase tracking-wider block">
                  Sort Order Number
                </label>
                <input
                  type="number"
                  min="0"
                  value={addSortOrder}
                  onChange={(e) => setAddSortOrder(parseInt(e.target.value || "0", 10))}
                  className="w-full px-3.5 py-2.5 bg-white border border-parchment-border rounded-xl text-cocoa-950 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-parchment-border font-sans">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-parchment-muted hover:bg-parchment-line text-cocoa-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !addName.trim()}
                onClick={handleCreatePurpose}
                className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink/90 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Add Purpose</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Standard Purpose Modal */}
      {editingPurpose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-parchment-surface border border-parchment-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-parchment-border pb-3">
              <h3 className="font-serif font-bold text-cocoa-950 text-lg flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-pink" />
                <span>Edit Gift Purpose</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPurpose(null)}
                className="text-cocoa-500 hover:text-cocoa-950 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-xs font-bold text-cocoa-950 uppercase tracking-wider block">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-parchment-border rounded-xl text-cocoa-950 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-cocoa-950 uppercase tracking-wider block">
                  Sort Order Number
                </label>
                <input
                  type="number"
                  min="0"
                  value={editSortOrder}
                  onChange={(e) => setEditSortOrder(parseInt(e.target.value || "0", 10))}
                  className="w-full px-3.5 py-2.5 bg-white border border-parchment-border rounded-xl text-cocoa-950 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs font-bold text-cocoa-950">Active on Storefront</span>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    editIsActive ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      editIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-parchment-border font-sans">
              <button
                type="button"
                onClick={() => setEditingPurpose(null)}
                className="px-4 py-2 rounded-xl bg-parchment-muted hover:bg-parchment-line text-cocoa-800 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !editName.trim()}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-cocoa-950 hover:bg-cocoa-900 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation Modal (With safety check) */}
      {deletingPurpose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-parchment-surface border border-parchment-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-cocoa-950 text-lg">
                  Delete &quot;{deletingPurpose.name}&quot;?
                </h3>
                <span className="text-[11px] text-cocoa-600 block">
                  Permanent removal verification
                </span>
              </div>
            </div>

            {deleteError ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Cannot Delete Historical Record</span>
                </div>
                <p className="text-[11px] leading-relaxed">{deleteError}</p>
              </div>
            ) : (
              <p className="text-xs text-cocoa-700 font-sans leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-cocoa-950">{deletingPurpose.name}</strong>?
                If this purpose was used in past orders, our safety rule will prevent hard deletion to preserve your customer history.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-parchment-border font-sans">
              <button
                type="button"
                onClick={() => setDeletingPurpose(null)}
                className="px-4 py-2 rounded-xl bg-parchment-muted hover:bg-parchment-line text-cocoa-800 text-xs font-bold"
              >
                {deleteError ? "Close" : "Cancel"}
              </button>
              {!deleteError && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDelete}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
