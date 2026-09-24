"use client";

import { useState } from "react";
import { Truck, CheckCircle2 } from "lucide-react";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";

export function ProductPincodeChecker() {
  const [selectedState, setSelectedState] = useState("");

  return (
    <div className="bg-white rounded-xl border border-brand-sand/80 p-4 sm:p-5 shadow-subtle flex flex-col gap-3">
      <div className="flex items-center gap-2 text-brand-espresso">
        <Truck className="w-4 h-4 text-brand-burgundy shrink-0" />
        <h3 className="font-sans text-xs uppercase tracking-wider font-bold text-brand-espresso">
          Pan-India Shipping Options
        </h3>
      </div>

      <p className="font-sans text-xs text-brand-muted leading-relaxed">
        Select your state to preview delivery availability. Standard per-unit shipping charges apply at checkout.
      </p>

      <div className="flex items-center gap-2">
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          aria-label="Select state to check delivery options"
          className="w-full px-3 py-2.5 min-h-[44px] bg-brand-surface border border-brand-sand/80 rounded-lg text-xs text-brand-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy font-sans font-medium"
        >
          <option value="">-- Select Destination State --</option>
          {INDIA_STATES_DISTRICTS.map((item) => (
            <option key={item.state} value={item.state}>
              {item.state}
            </option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-lg text-emerald-900 flex items-start gap-2 text-xs font-sans">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-950 block">Pan-India Delivery Available</span>
            <span className="text-[11px] text-emerald-800">
              Regional shipping rates for {selectedState} will be applied automatically at checkout.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
