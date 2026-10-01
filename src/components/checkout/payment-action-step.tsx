"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { PaymentState, GuestCustomerFormData } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { Button } from "@/components/ui/button";
import {
  createRazorpayOrderAction,
  verifyAndCreateOrderAction,
} from "@/app/checkout/actions";

interface PaymentActionStepProps {
  canProceed: boolean;
  totalAmount: number | null;
  onInitiatePayment?: () => boolean | void;
  formData: GuestCustomerFormData;
  items: CartItem[];
  subtotal: number;
  shippingAmount: number;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentActionStep({
  canProceed,
  totalAmount,
  onInitiatePayment,
  formData,
  items,
  subtotal,
  shippingAmount,
}: PaymentActionStepProps) {
  const router = useRouter();
  const [paymentState, setPaymentState] = useState<PaymentState>("ready");
  const [notice, setNotice] = useState<string | null>(null);

  const handlePayClick = async () => {
    if (onInitiatePayment) {
      const isValid = onInitiatePayment();
      if (isValid === false) {
        return;
      }
    }

    if (!canProceed || totalAmount === null || totalAmount <= 0) return;

    setPaymentState("processing");
    setNotice(null);

    try {
      // 1. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setPaymentState("ready");
        setNotice(
          "Unable to load Razorpay payment gateway. Please check your internet connection."
        );
        return;
      }

      // 2. Create Razorpay order on server with verified items and metadata
      const orderRes = await createRazorpayOrderAction({
        amount: totalAmount,
        items,
        shippingAmount: shippingAmount ?? 0,
        customerData: formData,
      });
      if (!orderRes.success || !orderRes.orderId || !orderRes.keyId) {
        setPaymentState("ready");
        setNotice(
          orderRes.error ||
            "Failed to initialize payment gateway. Please try again."
        );
        return;
      }

      // 3. Configure Razorpay options
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "AJVAS CHOCOLATES",
        description: "Artisanal Chocolate Gift Order",
        order_id: orderRes.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email || undefined,
          contact: formData.phone,
        },
        theme: {
          color: "#fb0b88",
        },
        modal: {
          ondismiss: () => {
            setPaymentState("ready");
          },
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          setPaymentState("processing");
          setNotice("Verifying payment and confirming your order...");

          const verifyRes = await verifyAndCreateOrderAction({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            customerData: formData,
            items,
            subtotal,
            shippingAmount,
            totalAmount,
          });

          if (verifyRes.success && verifyRes.orderNumber) {
            router.push(
              `/checkout/success?orderNumber=${encodeURIComponent(
                verifyRes.orderNumber
              )}`
            );
          } else {
            setPaymentState("ready");
            setNotice(
              verifyRes.error ||
                "Payment was successful, but order recording encountered an issue. Please contact support."
            );
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", function (failResponse: any) {
        setPaymentState("ready");
        setNotice(
          failResponse.error?.description ||
            "Payment attempt failed. Please try a different card, UPI, or netbanking method."
        );
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay initiation error:", err);
      setPaymentState("ready");
      setNotice(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while starting payment."
      );
    }
  };

  return (
    <div className="bg-transparent p-0 shadow-none rounded-none sm:bg-[#1f110c] sm:rounded-sm sm:p-7 sm:shadow-2xl flex flex-col gap-6">
      {/* Step Heading */}
      <div className="hidden sm:flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#fb0b88] text-white font-sans text-xs font-extrabold flex items-center justify-center shrink-0 shadow-xs">
          2
        </div>
        <div>
          <h2 className="font-pally text-lg sm:text-xl font-bold text-[#faf4f0]">
            Payment
          </h2>
          <p className="font-sans text-xs text-[#a39085] mt-0.5 font-medium">
            Cards, Net Banking, UPI, and Wallets via Razorpay.
          </p>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="p-4 bg-[#140b07] rounded-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#3d101e] flex items-center justify-center text-[#fb0b88] shrink-0">
            <CreditCard className="w-5 h-5 text-[#fb0b88]" />
          </div>
          <div>
            <span className="font-sans text-xs font-bold text-[#faf4f0] block">
              Online Payment
            </span>
            <span className="font-sans text-[11px] text-[#a39085] font-medium">
              Payment will be securely processed through Razorpay.
            </span>
          </div>
        </div>
      </div>

      {/* Notice / Feedback */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-sm bg-[#3d101e] text-[#faf4f0] text-xs font-sans flex items-start gap-2.5"
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
        disabled={
          !canProceed ||
          totalAmount === null ||
          paymentState === "processing"
        }
        onClick={handlePayClick}
        className="w-full min-h-[52px] py-3.5 text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 bg-[#fb0b88] text-white hover:bg-[#d90974] rounded-full shadow-md shadow-[#fb0b88]/20 transition-all border-none"
      >
        {paymentState === "processing" ? (
          <>
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-white" />
            <span>
              {totalAmount !== null
                ? `PAY ₹${totalAmount.toLocaleString("en-IN")}`
                : "Complete Required Steps to Pay"}
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
