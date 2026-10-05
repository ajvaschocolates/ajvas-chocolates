"use client";

import { useMemo } from "react";
import { Truck } from "lucide-react";
import { GuestCustomerFormData } from "@/types/checkout";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";
import { getDeliveryEstimateForState, saveSelectedState } from "@/lib/delivery-estimate";

interface CustomerAddressStepProps {
  formData: GuestCustomerFormData;
  onChange: (field: keyof GuestCustomerFormData, value: string) => void;
  errors: Partial<Record<keyof GuestCustomerFormData, string>>;
}

export function CustomerAddressStep({
  formData,
  onChange,
  errors,
}: CustomerAddressStepProps) {
  // Available districts filtered by selected state
  const availableDistricts = useMemo(() => {
    if (!formData.state) return [];
    const entry = INDIA_STATES_DISTRICTS.find(
      (s) => s.state.toLowerCase() === formData.state.trim().toLowerCase()
    );
    return entry ? entry.districts : [];
  }, [formData.state]);

  const deliveryEstimate = useMemo(() => {
    return getDeliveryEstimateForState(formData.state);
  }, [formData.state]);

  const handleStateChange = (newState: string) => {
    onChange("state", newState);
    saveSelectedState(newState);
    onChange("district", ""); // Reset district when state changes
  };

  return (
    <div className="bg-transparent p-0 shadow-none rounded-none sm:bg-[#1f110c] sm:rounded-sm sm:p-7 sm:shadow-2xl flex flex-col gap-6">
      {/* Step Heading */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#fb0b88] text-white font-sans text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs">
          1
        </div>
        <div>
          <h2 className="font-pally text-lg sm:text-xl font-bold text-[#faf4f0]">
            Contact &amp; Delivery Address
          </h2>
          <p className="font-sans text-xs text-[#a39085] mt-0.5 font-medium">
            Guest checkout. Select your delivery State &amp; District to determine shipping rates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
        {/* Full Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="full-name" className="font-bold uppercase tracking-wider text-[#faf4f0] block">
            Full Name <span className="text-[#fb0b88]">*</span>
          </label>
          <input
            id="full-name"
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Full Name"
            className={`w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] placeholder:text-transparent sm:placeholder:text-[#a39085]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
              errors.fullName ? "ring-1 ring-[#fb0b88]" : ""
            }`}
          />
          {errors.fullName && <p className="text-[#fb0b88] text-[11px]">{errors.fullName}</p>}
        </div>

        {/* Mobile Phone */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="font-semibold uppercase tracking-wider text-[#faf4f0] block">
            Mobile Phone <span className="text-[#fb0b88]">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            maxLength={10}
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, ""))}
            placeholder="Mobile Phone"
            className={`w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] placeholder:text-transparent sm:placeholder:text-[#a39085]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
              errors.phone ? "ring-1 ring-[#fb0b88]" : ""
            }`}
          />
          {errors.phone && <p className="text-[#fb0b88] text-[11px]">{errors.phone}</p>}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="font-semibold uppercase tracking-wider text-[#faf4f0] block">
            Email Address <span className="text-[#a39085] font-normal">(Optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Email Address"
            aria-invalid={!!errors.email}
            className={`w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] placeholder:text-transparent sm:placeholder:text-[#a39085]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
              errors.email ? "ring-1 ring-[#fb0b88]" : ""
            }`}
          />
          {errors.email && <p className="text-[#fb0b88] text-[11px]">{errors.email}</p>}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="address1" className="font-semibold uppercase tracking-wider text-[#faf4f0] block">
            Flat, House No., Building, Street <span className="text-[#fb0b88]">*</span>
          </label>
          <input
            id="address1"
            type="text"
            value={formData.addressLine1}
            onChange={(e) => onChange("addressLine1", e.target.value)}
            placeholder="House / Flat / Street"
            className={`w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] placeholder:text-transparent sm:placeholder:text-[#a39085]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
              errors.addressLine1 ? "ring-1 ring-[#fb0b88]" : ""
            }`}
          />
          {errors.addressLine1 && <p className="text-[#fb0b88] text-[11px]">{errors.addressLine1}</p>}
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="address2" className="font-semibold uppercase tracking-wider text-[#faf4f0] block">
            Area, Landmark <span className="text-[#a39085] font-normal">(Optional)</span>
          </label>
          <input
            id="address2"
            type="text"
            value={formData.addressLine2}
            onChange={(e) => onChange("addressLine2", e.target.value)}
            placeholder="Area / Landmark"
            className="w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] placeholder:text-transparent sm:placeholder:text-[#a39085]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
          />
        </div>

        {/* State Selection Dropdown (Pricing & Zone Input) */}
        <div className="space-y-1.5">
          <label htmlFor="state-select" className="font-bold uppercase tracking-wider text-[#faf4f0] block">
            State / UT <span className="text-[#fb0b88]">*</span>
          </label>
          <select
            id="state-select"
            value={formData.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className={`w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] ${
              errors.state ? "ring-1 ring-[#fb0b88]" : ""
            }`}
          >
            <option value="" className="bg-[#140b07] text-[#a39085]">-- Select State --</option>
            {INDIA_STATES_DISTRICTS.map((item) => (
              <option key={item.state} value={item.state} className="bg-[#140b07] text-[#faf4f0]">
                {item.state}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-[#fb0b88] text-[11px]">{errors.state}</p>}
          {deliveryEstimate.isKnownState ? (
            <div className="mt-1.5 p-2.5 bg-[#140b07] border border-[#3d1c12] rounded-md flex items-center gap-2 text-xs font-sans text-[#faf4f0]">
              <Truck className="w-4 h-4 text-[#c99d52] shrink-0" aria-hidden="true" />
              <div>
                <span className="text-[#a39085]">Estimated Delivery: </span>
                <strong className="text-[#c99d52] font-bold">{deliveryEstimate.days}</strong>
                <span className="text-[#a39085] ml-1 text-[11px]">({deliveryEstimate.badgeLabel})</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-[#a39085] mt-1">
              Select state to see estimated delivery time.
            </p>
          )}
        </div>

        {/* District Selection Dropdown (Dependent on State) */}
        <div className="space-y-1.5">
          <label htmlFor="district-select" className="font-bold uppercase tracking-wider text-[#faf4f0] block">
            District <span className="text-[#fb0b88]">*</span>
          </label>
          <select
            id="district-select"
            disabled={!formData.state}
            value={formData.district}
            onChange={(e) => onChange("district", e.target.value)}
            className={`w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] disabled:bg-[#120805] disabled:text-[#a39085]/50 ${
              errors.district ? "ring-1 ring-[#fb0b88]" : ""
            }`}
          >
            <option value="" className="bg-[#140b07] text-[#a39085]">
              {!formData.state ? "-- Select State First --" : "-- Select District --"}
            </option>
            {availableDistricts.map((district) => (
              <option key={district} value={district} className="bg-[#140b07] text-[#faf4f0]">
                {district}
              </option>
            ))}
          </select>
          {errors.district && <p className="text-[#fb0b88] text-[11px]">{errors.district}</p>}
        </div>

        {/* Town / City */}
        <div className="space-y-1.5">
          <label htmlFor="city" className="font-semibold uppercase tracking-wider text-[#faf4f0] block">
            Town / City <span className="text-[#a39085] font-normal">(Optional)</span>
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Town / City"
            className="w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] placeholder:text-transparent sm:placeholder:text-[#a39085]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
          />
        </div>

        {/* Pincode Input (Address & Carrier Fulfillment Only) */}
        <div className="space-y-1.5">
          <label htmlFor="pincode-input" className="font-bold uppercase tracking-wider text-[#faf4f0] block">
            Pincode <span className="text-[#fb0b88]">*</span>
          </label>
          <input
            id="pincode-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={formData.pincode}
            onChange={(e) => onChange("pincode", e.target.value.replace(/\D/g, ""))}
            placeholder="Pincode"
            className={`w-full px-4 py-3 min-h-[44px] bg-[#140b07] rounded-md text-sm font-sans text-[#faf4f0] placeholder:text-transparent sm:placeholder:text-[#a39085]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] tracking-wider ${
              errors.pincode ? "ring-1 ring-[#fb0b88]" : ""
            }`}
          />
          {errors.pincode ? (
            <p className="text-[#fb0b88] text-[11px]">{errors.pincode}</p>
          ) : (
            <p className="text-[11px] text-[#a39085]">Required for shipping label &amp; parcel dispatch.</p>
          )}
        </div>
      </div>
    </div>
  );
}
