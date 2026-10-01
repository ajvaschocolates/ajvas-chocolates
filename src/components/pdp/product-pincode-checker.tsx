"use client";

import { useState } from "react";
import { Truck, CheckCircle2 } from "lucide-react";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";

export function ProductPincodeChecker() {
  const [selectedState, setSelectedState] = useState("");

  return (
    <div className="bg-[#1b0e0a] rounded-sm border border-[#3d1c12] p-3 sm:p-3.5 shadow-xl flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-[#faf4f0]">
        <Truck className="w-3.5 h-3.5 text-[#c99d52] shrink-0" />
        <h3 className="font-pally text-xs tracking-wider font-bold text-[#c99d52]">
          Pan-India Shipping Options
        </h3>
      </div>

      <p className="font-sans text-[11px] text-[#a39085] leading-relaxed">
        Select your state to preview delivery availability. Standard per-unit shipping charges apply at checkout.
      </p>

      <div className="flex items-center gap-2">
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          aria-label="Select state to check delivery options"
          className="w-full px-2.5 py-2 min-h-[38px] bg-[#140b07] border border-[#3d1c12] rounded-sm text-xs text-[#faf4f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d52] font-sans font-medium"
        >
          <option value="" className="bg-[#140b07] text-[#a39085]">-- Select Destination State --</option>
          {INDIA_STATES_DISTRICTS.map((item) => (
            <option key={item.state} value={item.state} className="bg-[#140b07] text-[#faf4f0]">
              {item.state}
            </option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div className="p-2.5 bg-[#1e0c13] border border-[#3d101e] rounded-sm text-[#faf4f0] flex items-start gap-2 text-xs font-sans">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#c99d52] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-xs text-[#faf4f0] block">Pan-India Delivery Available</span>
            <span className="text-[10px] text-[#d1c2b9]">
              Regional shipping rates for {selectedState} will be applied automatically at checkout.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
