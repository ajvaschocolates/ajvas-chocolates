"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CheckCircle2, AlertCircle, Loader2, Truck } from "lucide-react";
import {
  AvailableCourier,
  PincodeResolution,
  PincodeValidationState,
  CourierState,
} from "@/types/checkout";
import { resolvePincodeAction, getCouriersForPincodeAction } from "@/app/checkout/actions";
import { Badge } from "@/components/ui/badge";

interface PincodeCourierStepProps {
  pincode: string;
  onPincodeChange: (pincode: string) => void;
  onResolutionChange: (resolution: PincodeResolution | null) => void;
  selectedCourierId: string | null;
  onCourierSelect: (courierId: string) => void;
}

export function PincodeCourierStep({
  pincode,
  onPincodeChange,
  onResolutionChange,
  selectedCourierId,
  onCourierSelect,
}: PincodeCourierStepProps) {
  const [pincodeState, setPincodeState] = useState<PincodeValidationState>("untouched");
  const [resolution, setResolution] = useState<PincodeResolution | null>(null);
  const [courierState, setCourierState] = useState<CourierState>("idle");
  const [couriers, setCouriers] = useState<AvailableCourier[]>([]);

  const lookupCache = useRef<Record<string, PincodeResolution>>({});
  const courierCache = useRef<Record<string, AvailableCourier[]>>({});

  // Keep latest callbacks/values in refs so effects and async handlers are decoupled from parent renders
  const onResolutionChangeRef = useRef(onResolutionChange);
  onResolutionChangeRef.current = onResolutionChange;

  const onCourierSelectRef = useRef(onCourierSelect);
  onCourierSelectRef.current = onCourierSelect;

  const selectedCourierIdRef = useRef(selectedCourierId);
  selectedCourierIdRef.current = selectedCourierId;

  const loadCouriers = useCallback(async (pincodeId: string) => {
    if (courierCache.current[pincodeId]) {
      const cachedCouriers = courierCache.current[pincodeId];
      setCouriers(cachedCouriers);
      setCourierState(cachedCouriers.length > 0 ? "available" : "none_available");
      if (cachedCouriers.length === 1 && !selectedCourierIdRef.current) {
        onCourierSelectRef.current(cachedCouriers[0].id);
      }
      return;
    }

    setCourierState("loading");
    try {
      const list = await getCouriersForPincodeAction(pincodeId);
      courierCache.current[pincodeId] = list;
      setCouriers(list);
      setCourierState(list.length > 0 ? "available" : "none_available");
      if (list.length === 1 && !selectedCourierIdRef.current) {
        onCourierSelectRef.current(list[0].id);
      }
    } catch {
      setCouriers([]);
      setCourierState("none_available");
    }
  }, []);

  // Debounced pincode lookup with guarded state updates
  useEffect(() => {
    const clean = pincode.trim().replace(/\D/g, "");

    if (clean.length === 0) {
      setPincodeState((prev) => (prev !== "untouched" ? "untouched" : prev));
      setResolution((prev) => {
        if (prev !== null) {
          onResolutionChangeRef.current(null);
          return null;
        }
        return prev;
      });
      setCouriers((prev) => (prev.length > 0 ? [] : prev));
      setCourierState((prev) => (prev !== "idle" ? "idle" : prev));
      return;
    }

    if (clean.length < 6) {
      setPincodeState((prev) => (prev !== "typing" ? "typing" : prev));
      setResolution((prev) => {
        if (prev !== null) {
          onResolutionChangeRef.current(null);
          return null;
        }
        return prev;
      });
      setCouriers((prev) => (prev.length > 0 ? [] : prev));
      setCourierState((prev) => (prev !== "idle" ? "idle" : prev));
      return;
    }

    // If cached for this exact 6-digit pincode
    if (lookupCache.current[clean]) {
      const cached = lookupCache.current[clean];
      setResolution(cached);
      onResolutionChangeRef.current(cached);
      setPincodeState(cached.recognized ? "valid" : "invalid");
      if (cached.recognized && cached.pincodeId) {
        loadCouriers(cached.pincodeId);
      } else {
        setCouriers([]);
        setCourierState("idle");
      }
      return;
    }

    // Trigger debounced lookup
    setPincodeState("validating");
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const res = await resolvePincodeAction(clean);
        if (isCancelled) return;

        lookupCache.current[clean] = res;
        setResolution(res);
        onResolutionChangeRef.current(res);
        setPincodeState(res.recognized ? "valid" : "invalid");

        if (res.recognized && res.pincodeId) {
          loadCouriers(res.pincodeId);
        } else {
          setCouriers([]);
          setCourierState("idle");
        }
      } catch {
        if (isCancelled) return;
        const fallbackRes: PincodeResolution = {
          pincode: clean,
          district: "",
          state: "",
          recognized: false,
          error: "Unable to verify destination pincode.",
        };
        setResolution(fallbackRes);
        onResolutionChangeRef.current(fallbackRes);
        setPincodeState("invalid");
        setCouriers([]);
        setCourierState("idle");
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [pincode, loadCouriers]);

  return (
    <div className="bg-white rounded-2xl border border-brand-sand/80 p-6 sm:p-7 shadow-subtle flex flex-col gap-6">
      {/* Step Heading */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-cocoa text-brand-cream font-sans text-xs font-bold flex items-center justify-center shrink-0">
          1
        </div>
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-espresso">
            Delivery Location & Courier
          </h2>
          <p className="font-sans text-xs text-brand-muted mt-0.5">
            Enter destination pincode to resolve location and view available delivery partners.
          </p>
        </div>
      </div>

      {/* Pincode Input */}
      <div className="space-y-2">
        <label
          htmlFor="pincode-input"
          className="block font-sans text-xs font-semibold uppercase tracking-wider text-brand-espresso"
        >
          Destination Pincode <span className="text-brand-burgundy">*</span>
        </label>
        <div className="relative max-w-xs">
          <input
            id="pincode-input"
            type="text"
            maxLength={6}
            value={pincode}
            onChange={(e) => onPincodeChange(e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit Pincode"
            aria-describedby="pincode-status"
            className="w-full px-4 py-3 min-h-[44px] bg-brand-surface border border-brand-sand/80 rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy tracking-wider"
          />
          {pincodeState === "validating" && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gold">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>

        {/* Pincode Feedback Region */}
        <div id="pincode-status" aria-live="polite" className="text-xs font-sans mt-2">
          {pincodeState === "valid" && resolution?.recognized && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="cyan" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Pincode Validated
                  </Badge>
                  <span className="font-semibold text-emerald-950">
                    {resolution.district}, {resolution.state}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Location recognized. Select your preferred courier service below.
                </p>
              </div>
            </div>
          )}

          {pincodeState === "invalid" && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {resolution?.error || "Pincode not recognized in delivery network."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Available Courier Partner Selection */}
      {resolution?.recognized && (
        <div className="space-y-3 pt-3 border-t border-brand-sand/60">
          <label className="block font-sans text-xs font-semibold uppercase tracking-wider text-brand-espresso">
            Available Courier Services <span className="text-brand-burgundy">*</span>
          </label>

          {courierState === "loading" && (
            <div className="p-4 bg-brand-surface rounded-xl border border-brand-sand/60 flex items-center gap-2.5 text-xs text-brand-muted font-sans">
              <Loader2 className="w-4 h-4 animate-spin text-brand-gold shrink-0" />
              <span>Checking available delivery partners for {resolution.district}...</span>
            </div>
          )}

          {courierState === "available" && (
            <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Select delivery partner">
              {couriers.map((courier) => {
                const isSelected = selectedCourierId === courier.id;
                return (
                  <button
                    key={courier.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onCourierSelect(courier.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 min-h-[52px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy ${
                      isSelected
                        ? "border-brand-burgundy bg-brand-surface ring-2 ring-brand-burgundy/20 shadow-subtle"
                        : "border-brand-sand/80 bg-white hover:border-brand-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-brand-burgundy bg-brand-burgundy" : "border-brand-muted"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-sans text-sm font-bold text-brand-espresso block">
                          {courier.courierPartner}
                        </span>
                        <span className="font-sans text-xs text-brand-muted">
                          {courier.serviceName}
                        </span>
                      </div>
                    </div>
                    <Truck className={`w-4 h-4 shrink-0 ${isSelected ? "text-brand-burgundy" : "text-brand-sand"}`} />
                  </button>
                );
              })}
            </div>
          )}

          {courierState === "none_available" && (
            <div className="p-4 bg-brand-surface rounded-xl border border-brand-sand/70 text-xs font-sans text-brand-muted space-y-1">
              <p className="font-semibold text-brand-espresso">
                Delivery partner currently unconfigured for this destination.
              </p>
              <p className="text-[11px]">
                Please enter a different destination pincode or contact our support team.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
