"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function PincodeCheckerSection() {
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setMessage("Please enter a valid 6-digit Indian pincode.");
      return;
    }
    setMessage(
      "Courier partner availability and shipping rates are calculated during checkout based on destination pincode."
    );
  };

  return (
    <section className="w-full bg-white py-10 border-b border-brand-sand/60" id="pincode">
      <Container>
        <div className="max-w-4xl mx-auto bg-[#e8f8f7] p-6 sm:p-8 rounded-3xl border border-[#00b4d8]/20 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-[#00b4d8]/15 flex items-center justify-center text-[#00b4d8] shrink-0 border border-[#00b4d8]/30">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-brand-navy">
                Delivery Availability
              </h3>
              <p className="font-sans text-xs sm:text-sm text-brand-muted mt-0.5 font-medium">
                Enter your pincode to check delivery options and estimated timelines.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ""));
                setMessage(null);
              }}
              placeholder="Enter pincode"
              className="px-5 py-2.5 min-h-[44px] bg-white border border-[#00b4d8]/30 rounded-full text-sm text-brand-navy placeholder:text-brand-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink w-full sm:w-48 font-sans font-medium"
              aria-label="Enter 6-digit destination pincode"
            />
            <Button type="submit" variant="primary" size="md" className="whitespace-nowrap min-h-[44px] bg-brand-pink text-white hover:bg-brand-pink-hover rounded-full px-6 shadow-md">
              Check
            </Button>
          </form>
        </div>

        {message && (
          <p className="max-w-4xl mx-auto text-center font-sans text-xs text-brand-muted mt-3 font-medium">
            {message}
          </p>
        )}
      </Container>
    </section>
  );
}
