"use client";

import { useState, useRef, useEffect } from "react";
import { Truck, ChevronDown, Search, Check, X, MapPin } from "lucide-react";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";
import { useDeliveryState } from "@/lib/delivery-estimate";

export function ProductDeliveryEstimate() {
  const { selectedState, setSelectedState, estimate } = useDeliveryState();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
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
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredStates = INDIA_STATES_DISTRICTS.filter((item) =>
    item.state.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setIsOpen(false);
  };

  return (
    <div className="bg-[#1b0e0a] rounded-sm border border-[#3d1c12] p-3.5 sm:p-4 shadow-xl flex flex-col gap-3">
      {/* Component Title Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#c99d52] shrink-0" aria-hidden="true" />
          <h3 className="font-pally text-xs sm:text-sm font-bold tracking-wider text-[#faf4f0]">
            Estimated Delivery
          </h3>
        </div>

        {selectedState && (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-[11px] font-sans font-semibold text-[#c99d52] hover:text-[#fb0b88] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c99d52] rounded-xs px-1"
          >
            Change State
          </button>
        )}
      </div>

      {/* State Selected Display State */}
      {selectedState && estimate.isKnownState ? (
        <div className="bg-[#140b07] border border-[#2d150d] rounded-sm p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all">
          <div className="flex items-center gap-2 text-xs font-sans text-[#d1c2b9]">
            <MapPin className="w-3.5 h-3.5 text-[#c99d52] shrink-0" aria-hidden="true" />
            <span className="font-medium text-[#faf4f0] text-xs sm:text-sm">
              {selectedState}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm sm:text-base text-[#c99d52] tracking-tight">
              {estimate.days}
            </span>
          </div>
        </div>
      ) : (
        /* Prompt to Select State */
        <p className="font-sans text-xs text-[#a39085] leading-relaxed">
          Select your delivery state to see the estimated delivery time
        </p>
      )}

      {/* Custom Luxury Dropdown Selector */}
      <div ref={dropdownRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full px-3.5 py-2.5 min-h-[40px] bg-[#140b07] border rounded-sm text-xs font-sans flex items-center justify-between gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d52] ${
            isOpen
              ? "border-[#c99d52] ring-1 ring-[#c99d52]"
              : "border-[#3d1c12] hover:border-[#5a2e22]"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Select your delivery state"
        >
          <span className={selectedState ? "text-[#faf4f0] font-medium truncate" : "text-[#a39085]"}>
            {selectedState ? `Delivery State: ${selectedState}` : "Select State ▼"}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#c99d52] transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            aria-label="Indian States and Union Territories"
            className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[#160b07] border border-[#3d1c12] rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-[#2d150d] bg-[#120805]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#a39085] absolute left-2.5 pointer-events-none" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search state..."
                  aria-label="Search state list"
                  className="w-full pl-8 pr-7 py-1.5 bg-[#1b0e0a] border border-[#3d1c12] rounded-sm text-xs text-[#faf4f0] placeholder:text-[#a39085]/60 focus:outline-none focus:border-[#c99d52]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-[#a39085] hover:text-[#faf4f0] p-0.5"
                    aria-label="Clear search query"
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
                  const isSelected = selectedState.toLowerCase() === item.state.toLowerCase();
                  return (
                    <button
                      key={item.state}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleStateSelect(item.state)}
                      className={`w-full px-3.5 py-2.5 text-left text-xs font-sans flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:bg-[#25130d] ${
                        isSelected
                          ? "bg-[#25130d] text-[#c99d52] font-semibold"
                          : "text-[#d1c2b9] hover:bg-[#20100a] hover:text-[#faf4f0]"
                      }`}
                    >
                      <span>{item.state}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#c99d52]" aria-hidden="true" />}
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
    </div>
  );
}
