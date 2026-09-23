"use client";

import { useState, useTransition } from "react";
import { ShippingRate, Pincode, Courier } from "@/types/logistics";
import { createShippingRateAction, toggleShippingRateStatusAction } from "@/app/admin/shipping-rates/actions";
import { Receipt, Plus, Eye, EyeOff, Loader2, X, AlertTriangle } from "lucide-react";

interface ShippingRateListClientProps {
  initialRates: ShippingRate[];
  pincodes: Pincode[];
  couriers: Courier[];
}

export default function ShippingRateListClient({
  initialRates,
  pincodes,
  couriers,
}: ShippingRateListClientProps) {
  const [rates, setRates] = useState<ShippingRate[]>(initialRates);
  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pincodeId, setPincodeId] = useState("");
  const [courierId, setCourierId] = useState("");
  const [minWeight, setMinWeight] = useState("1");
  const [maxWeight, setMaxWeight] = useState("");
  const [shippingAmount, setShippingAmount] = useState("150");
  const [modalStatus, setModalStatus] = useState<"active" | "inactive">("active");
  const [modalError, setModalError] = useState<string | null>(null);

  function handleToggleStatus(rate: ShippingRate) {
    setTogglingId(rate.id);
    startTransition(async () => {
      const res = await toggleShippingRateStatusAction(rate.id, rate.status);
      if (res.success) {
        setRates((prev) =>
          prev.map((r) =>
            r.id === rate.id
              ? { ...r, status: rate.status === "active" ? "inactive" : "active" }
              : r
          )
        );
      } else {
        alert(res.error || "Failed to update shipping rate status.");
      }
      setTogglingId(null);
    });
  }

  function handleCreateRate(e: React.FormEvent) {
    e.preventDefault();
    setModalError(null);

    if (!pincodeId || !courierId) {
      setModalError("Pincode and courier selection are required.");
      return;
    }

    const formData = new FormData();
    formData.append("pincode_id", pincodeId);
    formData.append("courier_id", courierId);
    formData.append("min_weight_grams", minWeight);
    formData.append("max_weight_grams", maxWeight);
    formData.append("shipping_amount", shippingAmount);
    formData.append("status", modalStatus);

    startTransition(async () => {
      const res = await createShippingRateAction(formData);
      if (res.success && res.rateId) {
        const selectedPin = pincodes.find((p) => p.id === pincodeId);
        const selectedCour = couriers.find((c) => c.id === courierId);

        setRates((prev) => [
          {
            id: res.rateId!,
            pincode_id: pincodeId,
            courier_id: courierId,
            min_weight_grams: parseInt(minWeight, 10),
            max_weight_grams: maxWeight ? parseInt(maxWeight, 10) : null,
            max_length_cm: null,
            max_width_cm: null,
            max_height_cm: null,
            max_volume_cm3: null,
            shipping_amount: parseFloat(shippingAmount),
            status: modalStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            pincode: selectedPin || null,
            courier: selectedCour || null,
          },
          ...prev,
        ]);
        setIsModalOpen(false);
      } else {
        setModalError(res.error || "Failed to create shipping rate rule.");
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
            <span className="text-cocoa-950 font-medium">Shipping Rates</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cocoa-950 tracking-tight">
            Shipping Rates Matrix
          </h1>
          <p className="text-sm text-cocoa-600 mt-0.5">
            Configure destination pincode rate thresholds and package weight rules.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-cocoa-900 hover:bg-cocoa-800 text-white text-sm font-semibold shadow-sm transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shipping Rate Rule</span>
        </button>
      </div>

      {rates.length === 0 ? (
        <div className="p-12 text-center bg-parchment-surface rounded border border-dashed border-parchment-border space-y-3">
          <Receipt className="w-10 h-10 text-cocoa-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-cocoa-950">No shipping rate rules configured</h3>
          <p className="text-sm text-cocoa-600 max-w-sm mx-auto">
            Click Add Shipping Rate Rule to configure destination rates for guest checkout.
          </p>
        </div>
      ) : (
        <div className="bg-parchment-surface border border-parchment-border rounded shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-parchment-muted/60 border-b border-parchment-border font-mono text-[11px] uppercase tracking-wider text-cocoa-600">
                  <th scope="col" className="py-3.5 pl-4 pr-3">Destination Pincode</th>
                  <th scope="col" className="py-3.5 px-3">Courier Partner</th>
                  <th scope="col" className="py-3.5 px-3">Weight Threshold</th>
                  <th scope="col" className="py-3.5 px-3 text-right">Shipping Fee</th>
                  <th scope="col" className="py-3.5 px-3 text-center">Status</th>
                  <th scope="col" className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-border">
                {rates.map((r) => (
                  <tr key={r.id} className="hover:bg-parchment-muted/30 transition-colors">
                    <td className="py-3.5 pl-4 pr-3 font-mono font-bold text-cocoa-950">
                      {r.pincode?.pincode || "Destination Pin"}
                      <div className="text-[11px] text-cocoa-600 font-normal">
                        {r.pincode?.district}, {r.pincode?.state}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-cocoa-900">
                      {r.courier?.courier_partner} ({r.courier?.service_name})
                    </td>
                    <td className="py-3.5 px-3 font-mono text-cocoa-800">
                      {r.min_weight_grams}g – {r.max_weight_grams ? `${r.max_weight_grams}g` : "No limit"}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-cocoa-950">
                      ₹{Number(r.shipping_amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {r.status === "active" ? (
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
                        onClick={() => handleToggleStatus(r)}
                        disabled={togglingId === r.id || isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-parchment-line bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-950 transition-colors disabled:opacity-50"
                      >
                        {togglingId === r.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : r.status === "active" ? (
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
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cocoa-200 bg-parchment-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cocoa-100">
              <h3 className="font-serif text-lg font-bold text-cocoa-950">Add Shipping Rate Rule</h3>
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

            <form onSubmit={handleCreateRate} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase text-cocoa-700 mb-1">
                  Destination Pincode <span className="text-rose-600">*</span>
                </label>
                <select
                  value={pincodeId}
                  onChange={(e) => setPincodeId(e.target.value)}
                  required
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                >
                  <option value="">Select Pincode</option>
                  {pincodes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pincode} ({p.district}, {p.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono uppercase text-cocoa-700 mb-1">
                  Courier Partner <span className="text-rose-600">*</span>
                </label>
                <select
                  value={courierId}
                  onChange={(e) => setCourierId(e.target.value)}
                  required
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                >
                  <option value="">Select Courier</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courier_partner} ({c.service_name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono uppercase text-cocoa-700 mb-1">Min Weight (g)</label>
                  <input
                    type="number"
                    value={minWeight}
                    onChange={(e) => setMinWeight(e.target.value)}
                    required
                    min="1"
                    className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase text-cocoa-700 mb-1">Max Weight (g)</label>
                  <input
                    type="number"
                    value={maxWeight}
                    onChange={(e) => setMaxWeight(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase text-cocoa-700 mb-1">
                  Shipping Fee (₹) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  value={shippingAmount}
                  onChange={(e) => setShippingAmount(e.target.value)}
                  required
                  min="0"
                  step="1"
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs text-cocoa-900 focus:outline-none min-h-[44px]"
                />
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
                  <span>Save Shipping Rate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
