"use client";

import React, { useMemo } from "react";
import { Sparkles, Info, ChevronDown } from "lucide-react";
import {
  GiftPurposeConfig,
  CUSTOM_GIFT_PURPOSE_VALUE,
  DEFAULT_STANDARD_GIFT_PURPOSES,
  DEFAULT_GIFT_PURPOSE_SETTINGS,
} from "@/types/gift-purpose";

interface GiftCustomizationFieldProps {
  value: string;
  onChange: (value: string) => void;
  descriptionValue?: string;
  onDescriptionChange?: (value: string) => void;
  descriptionError?: string | null;
  config?: GiftPurposeConfig;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function GiftCustomizationField({
  value,
  onChange,
  descriptionValue = "",
  onDescriptionChange,
  descriptionError = null,
  config,
  className = "",
  id = "gift-purpose-dropdown",
  disabled = false,
}: GiftCustomizationFieldProps) {
  // Safe resolved configuration (dynamic DB config or defaults)
  const resolvedConfig = useMemo(() => {
    return (
      config || {
        options: DEFAULT_STANDARD_GIFT_PURPOSES,
        settings: DEFAULT_GIFT_PURPOSE_SETTINGS,
      }
    );
  }, [config]);

  // Active standard options sorted by sort_order
  const activeOptions = useMemo(() => {
    return resolvedConfig.options
      .filter((opt) => opt.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [resolvedConfig.options]);

  const isCustomEnabled = resolvedConfig.settings.custom_enabled;
  const customFee = Number(resolvedConfig.settings.custom_fee || 0);

  // Check if current value is "Custom" or starts with "Custom"
  const isCustomSelected =
    value === CUSTOM_GIFT_PURPOSE_VALUE ||
    value.toLowerCase().startsWith("custom");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    onChange(selected);
  };

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Section Heading & Supporting Helper Text */}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          className="font-pally text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9b8ab]/70 flex items-center justify-between"
        >
          <span>Personalize Your Gift</span>
          {isCustomSelected && (
            <span className="text-[#c99d52] font-mono text-[10px] lowercase tracking-normal">
              +₹{customFee} custom fee
            </span>
          )}
        </label>
        <p
          id={`${id}-hint`}
          className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed"
        >
          Select an occasion or purpose for your gift hamper.
        </p>
      </div>

      {/* Dynamic Gift Purpose Dropdown */}
      <div className="relative">
        <select
          id={id}
          name="gift_purpose"
          value={isCustomSelected ? CUSTOM_GIFT_PURPOSE_VALUE : value}
          onChange={handleSelectChange}
          disabled={disabled}
          aria-describedby={`${id}-hint ${isCustomSelected ? `${id}-custom-notice` : ""}`}
          className="w-full appearance-none rounded-sm bg-[#140b07] border border-[#3d1c12] px-3.5 py-2.5 pr-10 font-sans text-xs sm:text-sm text-[#faf4f0] focus:outline-none focus:border-[#c99d52] focus:ring-1 focus:ring-[#c99d52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed cursor-pointer"
        >
          <option value="" className="bg-[#140b07] text-[#a39085]">
            -- Select Gift Occasion (Optional) --
          </option>

          {/* Admin-Configured Active Standard Options */}
          {activeOptions.map((opt) => (
            <option
              key={opt.id}
              value={opt.name}
              className="bg-[#140b07] text-[#faf4f0]"
            >
              {opt.name}
            </option>
          ))}

          {/* Admin-Configured Custom Option (when enabled) */}
          {isCustomEnabled && (
            <option
              value={CUSTOM_GIFT_PURPOSE_VALUE}
              className="bg-[#1b0e0a] text-[#c99d52] font-semibold"
            >
              Custom (+₹{customFee} Fee)
            </option>
          )}
        </select>

        {/* Custom Dropdown Chevron Icon */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#a39085]"
        >
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Custom Purpose Explanatory Notice */}
      {isCustomSelected && (
        <div
          id={`${id}-custom-notice`}
          role="note"
          aria-live="polite"
          className="p-3 rounded-sm bg-[#22100a] border border-[#c99d52]/40 text-[#faf4f0] text-xs font-sans space-y-1.5 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 text-[#c99d52] font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Custom Gift Purpose Notice</span>
          </div>
          <p className="text-[#d0c4b8] text-[11px] leading-relaxed">
            An additional custom-purpose charge of{" "}
            <strong className="text-[#faf4f0] font-mono font-bold">
              ₹{customFee}
            </strong>{" "}
            applies to this order (charged once per entire order).
          </p>
        </div>
      )}

      {/* Custom Description Text Field (revealed directly below dropdown and notice when Custom is selected) */}
      {isCustomSelected && (
        <div className="flex flex-col gap-1.5 animate-in fade-in duration-200 pt-0.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`${id}-custom-description`}
              className="font-pally text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9b8ab]/90 flex items-center gap-1"
            >
              <span>Describe Your Gift Purpose</span>
              <span className="text-[#fb0b88] font-bold" aria-hidden="true">*</span>
            </label>
            <span
              className={`text-[10px] font-mono ${
                descriptionValue.length > 300 ? "text-[#fb0b88] font-bold" : "text-[#a39085]"
              }`}
            >
              {descriptionValue.length}/300
            </span>
          </div>

          <textarea
            id={`${id}-custom-description`}
            name="custom_gift_purpose_description"
            rows={2}
            maxLength={300}
            required={isCustomSelected}
            disabled={disabled}
            value={descriptionValue}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            placeholder="e.g., Birthday surprise for my wife, 25th wedding anniversary for my parents, or a special congratulations gift..."
            aria-describedby={`${id}-description-helper ${descriptionError ? `${id}-description-error` : ""}`}
            aria-invalid={Boolean(descriptionError)}
            className={`w-full rounded-sm bg-[#140b07] border ${
              descriptionError
                ? "border-[#fb0b88] focus:border-[#fb0b88] focus:ring-[#fb0b88]"
                : "border-[#3d1c12] focus:border-[#c99d52] focus:ring-[#c99d52]"
            } px-3.5 py-2.5 font-sans text-xs sm:text-sm text-[#faf4f0] placeholder:text-[#a39085]/60 focus:outline-none focus:ring-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed resize-none`}
          />

          <p
            id={`${id}-description-helper`}
            className="font-sans text-[11px] text-[#d0c4b8]/75 leading-relaxed"
          >
            Tell us the occasion or purpose so our team can prepare your gift accordingly.
          </p>

          {descriptionError && (
            <p
              id={`${id}-description-error`}
              role="alert"
              className="font-sans text-[11px] text-[#fb0b88] font-medium"
            >
              {descriptionError}
            </p>
          )}
        </div>
      )}

      {/* Standard Purpose Confirmation Notice */}
      {value && !isCustomSelected && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#c99d52]/90 font-sans">
          <Info className="w-3 h-3 text-[#c99d52] shrink-0" />
          <span>No extra fee applies for standard occasions.</span>
        </div>
      )}
    </div>
  );
}
