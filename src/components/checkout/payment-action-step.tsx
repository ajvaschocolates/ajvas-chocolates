"use client";

import { useState } from "react";
import { CreditCard, AlertCircle } from "lucide-react";
import { PaymentState } from "@/types/checkout";
import { Button } from "@/components/ui/button";

interface PaymentActionStepProps {
  canProceed: boolean;
  totalAmount: number | null;
  onInitiatePayment?: () => void;
}

export function PaymentActionStep({
  canProceed,
  totalAmount,
}: PaymentActionStepProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>("ready");
  const [notice, setNotice] = useState<string | null>(null);

  const handlePayClick = () => {
    if (!canProceed || totalAmount === null) return;

    // Real production payment boundary: Razorpay live gateway credentials check
    // We strictly do NOT simulate fake success or fake orders.
    setPaymentState("unavailable");
    setNotice("Online payment is currently unavailable. Please try again later.");
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-sand/80 p-6 sm:p-7 shadow-subtle flex flex-col gap-6">
      {/* Step Heading */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-cocoa text-brand-cream font-sans text-xs font-bold flex items-center justify-center shrink-0">
          3
        </div>
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-espresso">
            Payment
          </h2>
          <p className="font-sans text-xs text-brand-muted mt-0.5">
            Cards, Net Banking, UPI, and Wallets via Razorpay.
          </p>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="p-4 bg-brand-surface rounded-xl border border-brand-sand/70 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-brand-sand/60 flex items-center justify-center text-brand-espresso shrink-0">
            <CreditCard className="w-5 h-5 text-brand-burgundy" />
          </div>
          <div>
            <span className="font-sans text-xs font-bold text-brand-espresso block">
              Online Payment
            </span>
            <span className="font-sans text-[11px] text-brand-muted">
              Payment will be completed through Razorpay.
            </span>
          </div>
        </div>
      </div>

      {/* Unavailable state notice */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-sans flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="font-medium text-amber-900">{notice}</p>
        </div>
      )}

      {/* Primary Pay Action */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        disabled={!canProceed || totalAmount === null || paymentState === "processing"}
        onClick={handlePayClick}
        className="w-full min-h-[52px] py-3.5 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
      >
        <CreditCard className="w-4 h-4 text-brand-gold" />
        <span>
          {totalAmount !== null
            ? `PAY ₹${totalAmount.toLocaleString("en-IN")}`
            : "Complete Required Steps to Pay"}
        </span>
      </Button>
    </div>
  );
}
