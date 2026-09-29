"use client";

import { useState } from "react";
import { CreditCard, AlertCircle } from "lucide-react";
import { PaymentState } from "@/types/checkout";
import { Button } from "@/components/ui/button";

interface PaymentActionStepProps {
  canProceed: boolean;
  totalAmount: number | null;
  onInitiatePayment?: () => boolean | void;
}

export function PaymentActionStep({
  canProceed,
  totalAmount,
  onInitiatePayment,
}: PaymentActionStepProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>("ready");
  const [notice, setNotice] = useState<string | null>(null);

  const handlePayClick = () => {
    if (onInitiatePayment) {
      const isValid = onInitiatePayment();
      if (isValid === false) {
        return;
      }
    }

    if (!canProceed || totalAmount === null) return;

    // Real production payment boundary: Razorpay live gateway credentials check
    // We strictly do NOT simulate fake success or fake orders.
    setPaymentState("unavailable");
    setNotice("Online payment is currently unavailable. Please try again later.");
  };

  return (
    <div className="bg-[#1f110c] rounded-2xl border border-[#3d1c12] p-6 sm:p-7 shadow-2xl flex flex-col gap-6">
      {/* Step Heading */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#fb0b88] text-white font-sans text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs">
          2
        </div>
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-extrabold text-[#faf4f0]">
            Payment
          </h2>
          <p className="font-sans text-xs text-[#a39085] mt-0.5 font-medium">
            Cards, Net Banking, UPI, and Wallets via Razorpay.
          </p>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="p-4 bg-[#140b07] rounded-xl border border-[#3d1c12] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3d101e] border border-[#fb0b88]/30 flex items-center justify-center text-[#fb0b88] shrink-0">
            <CreditCard className="w-5 h-5 text-[#fb0b88]" />
          </div>
          <div>
            <span className="font-sans text-xs font-bold text-[#faf4f0] block">
              Online Payment
            </span>
            <span className="font-sans text-[11px] text-[#a39085] font-medium">
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
          className="p-4 rounded-xl bg-[#3d101e] border border-[#fb0b88]/40 text-[#faf4f0] text-xs font-sans flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-[#fb0b88] shrink-0 mt-0.5" />
          <p className="font-medium text-[#faf4f0]">{notice}</p>
        </div>
      )}

      {/* Primary Pay Action */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        disabled={!canProceed || totalAmount === null || paymentState === "processing"}
        onClick={handlePayClick}
        className="w-full min-h-[52px] py-3.5 text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 bg-[#fb0b88] text-white hover:bg-[#d90974] rounded-full shadow-md shadow-[#fb0b88]/20 transition-all border-none"
      >
        <CreditCard className="w-4 h-4 text-white" />
        <span>
          {totalAmount !== null
            ? `PAY ₹${totalAmount.toLocaleString("en-IN")}`
            : "Complete Required Steps to Pay"}
        </span>
      </Button>
    </div>
  );
}
