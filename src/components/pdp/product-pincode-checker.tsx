"use client";

import { useState, useRef, useEffect } from "react";
import { Truck, CheckCircle2, ChevronDown, Search, Check, X } from "lucide-react";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";

export function ProductPincodeChecker() {
  const [selectedState, setSelectedState] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Restore previously selected state if available
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("ajvas_selected_state") ||
        sessionStorage.getItem("ajvas_selected_state");
      if (saved) {
        setSelectedState(saved);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredStates = INDIA_STATES_DISTRICTS.filter((item) =>
    item.state.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

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

      {/* Custom Luxury Dropdown */}
      <div ref={dropdownRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full px-3 py-2 min-h-[38px] bg-[#140b07] border rounded-sm text-xs font-sans flex items-center justify-between gap-2 transition-all cursor-pointer ${
            isOpen
              ? "border-[#c99d52] ring-1 ring-[#c99d52]"
              : "border-[#3d1c12] hover:border-[#5a2e22]"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select state to check delivery options"
        >
          <span className={selectedState ? "text-[#faf4f0] font-medium" : "text-[#a39085]"}>
            {selectedState || "-- Select Destination State --"}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#c99d52] transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#160b07] border border-[#3d1c12] rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-[#2d150d] bg-[#120805]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#a39085] absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search state..."
                  className="w-full pl-8 pr-7 py-1.5 bg-[#1b0e0a] border border-[#3d1c12] rounded-sm text-xs text-[#faf4f0] placeholder:text-[#a39085]/60 focus:outline-none focus:border-[#c99d52]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-[#a39085] hover:text-[#faf4f0] p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* States List */}
            <div className="max-h-52 overflow-y-auto divide-y divide-[#241109] scrollbar-thin scrollbar-thumb-[#3d2017]">
              {filteredStates.length > 0 ? (
                filteredStates.map((item) => {
                  const isSelected = selectedState === item.state;
                  return (
                    <button
                      key={item.state}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedState(item.state);
                        try {
                          localStorage.setItem("ajvas_selected_state", item.state);
                          sessionStorage.setItem("ajvas_selected_state", item.state);
                        } catch {
                          // ignore storage errors
                        }
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-sans flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-[#25130d] text-[#c99d52] font-semibold"
                          : "text-[#d1c2b9] hover:bg-[#20100a] hover:text-[#faf4f0]"
                      }`}
                    >
                      <span>{item.state}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c99d52]" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-xs text-[#a39085]">
                  No state found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
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
