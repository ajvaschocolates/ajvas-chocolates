"use client";

import React from "react";

interface GiftCustomizationFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function GiftCustomizationField({
  value,
  onChange,
  maxLength = 500,
  className = "",
  id = "gift-customization-field",
  disabled = false,
}: GiftCustomizationFieldProps) {
  const currentLength = value.length;
  const isNearLimit = maxLength - currentLength <= 50;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value.slice(0, maxLength);
    onChange(nextVal);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Section Heading & Supporting Helper Text */}
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor={id}
          className="font-pally text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9b8ab]/70"
        >
          Personalize Your Gift
        </label>
        <p
          id={`${id}-hint`}
          className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed"
        >
          Tell us what you&apos;re celebrating or who this gift is for.
        </p>
      </div>

      {/* Multiline Customization Textarea */}
      <div className="relative">
        <textarea
          id={id}
          name="customization"
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          disabled={disabled}
          rows={3}
          aria-describedby={`${id}-hint ${id}-counter`}
          placeholder="E.g., Birthday gift for Mom, wedding anniversary hamper, marriage gift, or any special occasion..."
          className="w-full resize-y min-h-[84px] max-h-[180px] rounded-sm bg-[#140b07] border border-[#3d1c12] px-3 py-2.5 font-sans text-xs sm:text-sm text-[#faf4f0] placeholder:text-[#a39085]/75 placeholder:font-normal focus:outline-none focus:border-[#c99d52] focus:ring-1 focus:ring-[#c99d52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
        />

        {/* Character Limit Counter */}
        <div className="flex justify-end pt-1">
          <span
            id={`${id}-counter`}
            aria-live="polite"
            className={`font-mono text-[10px] tracking-wider transition-colors ${
              isNearLimit ? "text-[#fb0b88] font-bold" : "text-[#a39085]"
            }`}
          >
            {currentLength} / {maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}
