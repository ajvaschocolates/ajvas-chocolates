"use client";

import { useState } from "react";
import { CreditCard, Lock, AlertCircle } from "lucide-react";
import { PaymentState } from "@/types/checkout";
import { Button } from "@/components/ui/button";

interface PaymentActionStepProps {
  canProceed: boolean;
  totalAmount: number | null;
  onInitiatePayment: () => void;
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
    // We strictly do NOT simulate fake success.
    setPaymentState("unavailable");
    setNotice(
      "Payment integration boundary: Razorpay live gateway credentials are required to initiate real transactions. Order remains unplaced."
    );
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
            Payment & Confirmation
          </h2>
          <p className="font-sans text-xs text-brand-muted mt-0.5">
            Cards, Net Banking, UPI, and Wallets via Razorpay gateway.
          </p>
        </div>
      </div>

      <div className="p-4 bg-brand-surface rounded-xl border border-brand-sand/70 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-brand-sand/60 flex items-center justify-center text-brand-espresso shrink-0">
            <CreditCard className="w-5 h-5 text-brand-burgundy" />
          </div>
          <div>
            <span className="font-sans text-xs font-bold text-brand-espresso block">
              Online Payment Handoff
            </span>
            <span className="font-sans text-[11px] text-brand-muted">
              Official Razorpay payment modal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand-muted font-sans">
          <Lock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
          <span>Verified Gateway</span>
        </div>
      </div>

      {/* Integration Notice / Error feedback */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-sans flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{notice}</p>
            <p className="text-[11px] text-amber-800">
              Payment verification will automatically transition to Order Confirmation once backend credentials and webhooks are active.
            </p>
          </div>
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
        <Lock className="w-4 h-4 text-brand-gold" />
        <span>
          {totalAmount !== null
            ? `Pay ₹${totalAmount.toLocaleString("en-IN")}`
            : "Complete Required Steps to Pay"}
        </span>
      </Button>
    </div>
  );
}
