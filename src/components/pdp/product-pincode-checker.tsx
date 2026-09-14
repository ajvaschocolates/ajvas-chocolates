"use client";

import { useState } from "react";
import { MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { lookupPincodeAction } from "@/app/checkout/actions";
import type { PincodeLookupResult } from "@/lib/supabase/pincode";
import { Button } from "@/components/ui/button";

export function ProductPincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeLookupResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim().replace(/\D/g, "");
    if (clean.length !== 6) {
      setResult({
        recognized: false,
        error: "Please enter a valid 6-digit Indian pincode.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await lookupPincodeAction(clean);
      setResult(res);
    } catch {
      setResult({
        recognized: false,
        error: "Unable to verify pincode at this time.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-brand-sand/80 p-4 sm:p-5 shadow-subtle flex flex-col gap-3">
      <div className="flex items-center gap-2 text-brand-espresso">
        <MapPin className="w-4 h-4 text-brand-burgundy shrink-0" />
        <h3 className="font-sans text-xs uppercase tracking-wider font-bold text-brand-espresso">
          Delivery Availability
        </h3>
      </div>

      <form onSubmit={handleCheck} className="flex items-center gap-2">
        <input
          type="text"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ""));
            if (result) setResult(null);
          }}
          placeholder="Enter 6-digit Pincode"
          aria-label="Enter 6-digit destination pincode"
          className="flex-1 px-3 py-2.5 min-h-[44px] bg-brand-surface border border-brand-sand/80 rounded-lg text-sm text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy font-sans"
        />
        <Button
          type="submit"
          variant="secondary"
          size="md"
          disabled={loading || pincode.length !== 6}
          className="min-h-[44px] px-5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Checking
            </span>
          ) : (
            "Check"
          )}
        </Button>
      </form>

      {/* Result feedback */}
      {result && (
        <div className="text-xs font-sans mt-1">
          {result.recognized ? (
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-emerald-900 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Location found</span>
              </div>
              <p className="text-emerald-800">
                {result.district}, {result.state}
              </p>
              <p className="text-[11px] text-emerald-700/90 mt-1 pt-1 border-t border-emerald-200/60">
                Courier partner selection and applicable shipping charges are calculated during checkout based on destination pincode and combined shipment package metrics.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{result.error || "Pincode not recognized in delivery network"}</span>
              </div>
              <p className="text-[11px] text-amber-800/90">
                Please verify the 6-digit pincode or try another destination. Dynamic courier options are finalized during checkout.
              </p>
            </div>
          )}
        </div>
      )}

      {!result && (
        <p className="font-sans text-[11px] text-brand-muted">
          Pan-India courier delivery. Shipping rates and carrier options are computed at checkout based on destination and package metrics.
        </p>
      )}
    </div>
  );
}
