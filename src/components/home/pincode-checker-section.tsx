"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
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
      "Courier partner availability and shipping rates are calculated during checkout based on destination pincode and combined package weight."
    );
  };

  return (
    <section className="w-full bg-brand-surface py-12 border-b border-brand-sand/60" id="pincode">
      <Container>
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-brand-border/60 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan shrink-0 border border-accent-cyan/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-espresso">
                Delivery Availability
              </h3>
              <p className="font-sans text-xs sm:text-sm text-brand-muted mt-0.5">
                Pan-India courier delivery across supported destination pincodes.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full sm:w-auto">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ""));
                setMessage(null);
              }}
              placeholder="6-digit Pincode"
              className="px-4 py-2.5 min-h-[44px] bg-brand-surface border border-brand-border rounded text-sm text-brand-espresso placeholder:text-brand-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy focus:border-brand-gold w-full sm:w-44 font-sans"
              aria-label="Enter 6-digit destination pincode"
            />
            <Button type="submit" variant="primary" size="md" className="whitespace-nowrap min-h-[44px]">
              Check
            </Button>
          </form>
        </div>

        {message && (
          <p className="max-w-4xl mx-auto text-center font-sans text-xs text-brand-muted mt-3">
            {message}
          </p>
        )}
      </Container>
    </section>
  );
}
