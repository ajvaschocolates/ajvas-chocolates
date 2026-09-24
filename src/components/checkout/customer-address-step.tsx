"use client";

import { useMemo } from "react";
import { GuestCustomerFormData } from "@/types/checkout";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";

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

  const handleStateChange = (newState: string) => {
    onChange("state", newState);
    onChange("district", ""); // Reset district when state changes
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-sand/80 p-6 sm:p-7 shadow-subtle flex flex-col gap-6">
      {/* Step Heading */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-pink text-white font-sans text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs">
          1
        </div>
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-extrabold text-brand-navy">
            Contact &amp; Delivery Address
          </h2>
          <p className="font-sans text-xs text-brand-muted mt-0.5 font-medium">
            Guest checkout. Select your delivery State &amp; District to determine shipping rates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
        {/* Full Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="full-name" className="font-bold uppercase tracking-wider text-brand-navy block">
            Full Name <span className="text-brand-pink">*</span>
          </label>
          <input
            id="full-name"
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="e.g. Ananya Sharma"
            className={`w-full px-4 py-3 min-h-[44px] bg-white border rounded-xl text-sm font-sans text-brand-navy placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              errors.fullName ? "border-brand-pink ring-1 ring-brand-pink" : "border-brand-sand/80"
            }`}
          />
          {errors.fullName && <p className="text-accent-rose text-[11px]">{errors.fullName}</p>}
        </div>

        {/* Mobile Phone */}
        <div className="space-y-1.5">
          <label htmlFor="phone" className="font-semibold uppercase tracking-wider text-brand-espresso block">
            Mobile Phone <span className="text-brand-burgundy">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            maxLength={10}
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile number"
            className={`w-full px-4 py-3 min-h-[44px] bg-brand-surface border rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy ${
              errors.phone ? "border-accent-rose ring-1 ring-accent-rose" : "border-brand-sand/80"
            }`}
          />
          {errors.phone && <p className="text-accent-rose text-[11px]">{errors.phone}</p>}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="font-semibold uppercase tracking-wider text-brand-espresso block">
            Email Address <span className="text-brand-muted font-normal">(Optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="For order receipt"
            aria-invalid={!!errors.email}
            className={`w-full px-4 py-3 min-h-[44px] bg-brand-surface border rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy ${
              errors.email ? "border-accent-rose ring-1 ring-accent-rose" : "border-brand-sand/80"
            }`}
          />
          {errors.email && <p className="text-accent-rose text-[11px]">{errors.email}</p>}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="address1" className="font-semibold uppercase tracking-wider text-brand-espresso block">
            Flat, House No., Building, Street <span className="text-brand-burgundy">*</span>
          </label>
          <input
            id="address1"
            type="text"
            value={formData.addressLine1}
            onChange={(e) => onChange("addressLine1", e.target.value)}
            placeholder="House / Flat No., Apartment / Wing, Street Name"
            className={`w-full px-4 py-3 min-h-[44px] bg-brand-surface border rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy ${
              errors.addressLine1 ? "border-accent-rose ring-1 ring-accent-rose" : "border-brand-sand/80"
            }`}
          />
          {errors.addressLine1 && <p className="text-accent-rose text-[11px]">{errors.addressLine1}</p>}
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="address2" className="font-semibold uppercase tracking-wider text-brand-espresso block">
            Area, Landmark <span className="text-brand-muted font-normal">(Optional)</span>
          </label>
          <input
            id="address2"
            type="text"
            value={formData.addressLine2}
            onChange={(e) => onChange("addressLine2", e.target.value)}
            placeholder="Nearby landmark or colony"
            className="w-full px-4 py-3 min-h-[44px] bg-brand-surface border border-brand-sand/80 rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          />
        </div>

        {/* State Selection Dropdown (Pricing & Zone Input) */}
        <div className="space-y-1.5">
          <label htmlFor="state-select" className="font-bold uppercase tracking-wider text-brand-navy block">
            State / UT <span className="text-brand-pink">*</span>
          </label>
          <select
            id="state-select"
            value={formData.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className={`w-full px-4 py-3 min-h-[44px] bg-white border rounded-xl text-sm font-sans text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              errors.state ? "border-brand-pink ring-1 ring-brand-pink" : "border-brand-sand/80"
            }`}
          >
            <option value="">-- Select State --</option>
            {INDIA_STATES_DISTRICTS.map((item) => (
              <option key={item.state} value={item.state}>
                {item.state}
              </option>
            ))}
          </select>
          {errors.state && <p className="text-accent-rose text-[11px]">{errors.state}</p>}
        </div>

        {/* District Selection Dropdown (Dependent on State) */}
        <div className="space-y-1.5">
          <label htmlFor="district-select" className="font-bold uppercase tracking-wider text-brand-navy block">
            District <span className="text-brand-pink">*</span>
          </label>
          <select
            id="district-select"
            disabled={!formData.state}
            value={formData.district}
            onChange={(e) => onChange("district", e.target.value)}
            className={`w-full px-4 py-3 min-h-[44px] bg-white border rounded-xl text-sm font-sans text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink disabled:bg-gray-100 disabled:text-gray-400 ${
              errors.district ? "border-brand-pink ring-1 ring-brand-pink" : "border-brand-sand/80"
            }`}
          >
            <option value="">
              {!formData.state ? "-- Select State First --" : "-- Select District --"}
            </option>
            {availableDistricts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.district && <p className="text-accent-rose text-[11px]">{errors.district}</p>}
        </div>

        {/* Town / City */}
        <div className="space-y-1.5">
          <label htmlFor="city" className="font-semibold uppercase tracking-wider text-brand-espresso block">
            Town / City <span className="text-brand-muted font-normal">(Optional)</span>
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Town or City Name"
            className="w-full px-4 py-3 min-h-[44px] bg-brand-surface border border-brand-sand/80 rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          />
        </div>

        {/* Pincode Input (Address & Carrier Fulfillment Only) */}
        <div className="space-y-1.5">
          <label htmlFor="pincode-input" className="font-bold uppercase tracking-wider text-brand-navy block">
            Pincode <span className="text-brand-pink">*</span>
          </label>
          <input
            id="pincode-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={formData.pincode}
            onChange={(e) => onChange("pincode", e.target.value.replace(/\D/g, ""))}
            placeholder="6-digit Pincode"
            className={`w-full px-4 py-3 min-h-[44px] bg-white border rounded-xl text-sm font-sans text-brand-navy placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink tracking-wider ${
              errors.pincode ? "border-brand-pink ring-1 ring-brand-pink" : "border-brand-sand/80"
            }`}
          />
          {errors.pincode ? (
            <p className="text-accent-rose text-[11px]">{errors.pincode}</p>
          ) : (
            <p className="text-[11px] text-brand-muted">Required for shipping label &amp; parcel dispatch.</p>
          )}
        </div>
      </div>
    </div>
  );
}
