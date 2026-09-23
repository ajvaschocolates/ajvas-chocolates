"use client";

import { useState, useTransition } from "react";
import { Courier } from "@/types/logistics";
import { createCourierAction, toggleCourierStatusAction } from "@/app/admin/couriers/actions";
import { Truck, Plus, Eye, EyeOff, Loader2, X, AlertTriangle } from "lucide-react";

interface CourierListClientProps {
  initialCouriers: Courier[];
}

export default function CourierListClient({ initialCouriers }: CourierListClientProps) {
  const [couriers, setCouriers] = useState<Courier[]>(initialCouriers);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partner, setPartner] = useState("");
  const [service, setService] = useState("");
  const [modalStatus, setModalStatus] = useState<"active" | "inactive">("active");
  const [modalError, setModalError] = useState<string | null>(null);

  function handleToggleStatus(courier: Courier) {
    setTogglingId(courier.id);
    startTransition(async () => {
      const res = await toggleCourierStatusAction(courier.id, courier.status);
      if (res.success) {
        setCouriers((prev) =>
          prev.map((c) =>
            c.id === courier.id
              ? { ...c, status: courier.status === "active" ? "inactive" : "active" }
              : c
          )
        );
      } else {
        alert(res.error || "Failed to update courier status.");
      }
      setTogglingId(null);
    });
  }

  function handleCreateCourier(e: React.FormEvent) {
    e.preventDefault();
    setModalError(null);

    if (!partner.trim() || !service.trim()) {
      setModalError("Partner name and service name are required.");
      return;
    }

    const formData = new FormData();
    formData.append("courier_partner", partner.trim());
    formData.append("service_name", service.trim());
    formData.append("status", modalStatus);

    startTransition(async () => {
      const res = await createCourierAction(formData);
      if (res.success && res.courierId) {
        setCouriers((prev) => [
          ...prev,
          {
            id: res.courierId!,
            courier_partner: partner.trim(),
            service_name: service.trim(),
            status: modalStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        setIsModalOpen(false);
        setPartner("");
        setService("");
      } else {
        setModalError(res.error || "Failed to create courier.");
      }
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-cocoa-600 mb-1">
            <span>Store Operations</span>
            <span>/</span>
            <span className="text-cocoa-950 font-medium">Couriers</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cocoa-950 tracking-tight">
            Courier Partners
          </h1>
          <p className="text-sm text-cocoa-600 mt-0.5">
            Configure courier partners and service tiers available for guest checkout.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-cocoa-900 hover:bg-cocoa-800 text-white text-sm font-semibold shadow-sm transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Courier Partner</span>
        </button>
      </div>

      {couriers.length === 0 ? (
        <div className="p-12 text-center bg-parchment-surface rounded border border-dashed border-parchment-border space-y-3">
          <Truck className="w-10 h-10 text-cocoa-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-cocoa-950">No couriers configured</h3>
          <p className="text-sm text-cocoa-600 max-w-sm mx-auto">
            Click Add Courier Partner to configure your first shipping carrier.
          </p>
        </div>
      ) : (
        <div className="bg-parchment-surface border border-parchment-border rounded shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-parchment-muted/60 border-b border-parchment-border font-mono text-[11px] uppercase tracking-wider text-cocoa-600">
                <th scope="col" className="py-3.5 pl-4 pr-3">Courier Partner</th>
                <th scope="col" className="py-3.5 px-3">Service Name</th>
                <th scope="col" className="py-3.5 px-3">Status</th>
                <th scope="col" className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border">
              {couriers.map((c) => (
                <tr key={c.id} className="hover:bg-parchment-muted/30 transition-colors">
                  <td className="py-3.5 pl-4 pr-3 font-semibold text-cocoa-950 text-sm">
                    {c.courier_partner}
                  </td>
                  <td className="py-3.5 px-3 text-cocoa-800 font-mono">
                    {c.service_name}
                  </td>
                  <td className="py-3.5 px-3">
                    {c.status === "active" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-200 text-neutral-800 border border-neutral-300">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pl-3 pr-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(c)}
                      disabled={togglingId === c.id || isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-parchment-line bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-950 transition-colors disabled:opacity-50"
                    >
                      {togglingId === c.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : c.status === "active" ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-cocoa-600" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          Activate
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cocoa-200 bg-parchment-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cocoa-100">
              <h3 className="font-serif text-lg font-bold text-cocoa-950">Add Courier Partner</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-cocoa-400 hover:text-cocoa-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourier} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-cocoa-700 mb-1">
                  Courier Partner Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="e.g. Blue Dart, Delhivery, DTDC"
                  required
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-cocoa-700 mb-1">
                  Service Tier Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Express Air, Surface Parcel"
                  required
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-cocoa-700 mb-1">Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as "active" | "inactive")}
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                >
                  <option value="active">Active (Available at checkout)</option>
                  <option value="inactive">Inactive (Disabled)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-cocoa-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-cocoa-200 text-cocoa-700 hover:bg-parchment-hover font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded bg-cocoa-900 text-white font-semibold hover:bg-cocoa-800 disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Courier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
