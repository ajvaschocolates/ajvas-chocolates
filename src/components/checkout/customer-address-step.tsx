"use client";

import { GuestCustomerFormData } from "@/types/checkout";

interface CustomerAddressStepProps {
  formData: GuestCustomerFormData;
  onChange: (field: keyof GuestCustomerFormData, value: string) => void;
  resolvedDistrict: string;
  resolvedState: string;
  errors: Partial<Record<keyof GuestCustomerFormData, string>>;
}

export function CustomerAddressStep({
  formData,
  onChange,
  resolvedDistrict,
  resolvedState,
  errors,
}: CustomerAddressStepProps) {
  return (
    <div className="bg-white rounded-2xl border border-brand-sand/80 p-6 sm:p-7 shadow-subtle flex flex-col gap-6">
      {/* Step Heading */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-cocoa text-brand-cream font-sans text-xs font-bold flex items-center justify-center shrink-0">
          2
        </div>
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-espresso">
            Contact & Delivery Address
          </h2>
          <p className="font-sans text-xs text-brand-muted mt-0.5">
            Guest checkout. We will use these details to coordinate dispatch and delivery.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
        {/* Full Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label htmlFor="full-name" className="font-semibold uppercase tracking-wider text-brand-espresso block">
            Full Name <span className="text-brand-burgundy">*</span>
          </label>
          <input
            id="full-name"
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="e.g. Ananya Sharma"
            className={`w-full px-4 py-3 min-h-[44px] bg-brand-surface border rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy ${
              errors.fullName ? "border-accent-rose ring-1 ring-accent-rose" : "border-brand-sand/80"
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

        {/* City */}
        <div className="space-y-1.5">
          <label htmlFor="city" className="font-semibold uppercase tracking-wider text-brand-espresso block">
            Town / City
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder={resolvedDistrict || "City"}
            className="w-full px-4 py-3 min-h-[44px] bg-brand-surface border border-brand-sand/80 rounded-xl text-sm font-sans text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          />
        </div>

        {/* Resolved Location Summary */}
        <div className="space-y-1.5">
          <span className="font-semibold uppercase tracking-wider text-brand-muted block">
            Destination District & State
          </span>
          <div className="px-4 py-3 min-h-[44px] bg-brand-sand/30 border border-brand-sand/60 rounded-xl text-sm font-sans text-brand-espresso flex items-center">
            {resolvedDistrict && resolvedState ? (
              <span className="font-medium text-brand-espresso">
                {resolvedDistrict}, {resolvedState}
              </span>
            ) : (
              <span className="text-brand-muted text-xs">
                Auto-populated from Step 1 Pincode
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
