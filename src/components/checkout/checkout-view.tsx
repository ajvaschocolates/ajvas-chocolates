"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ShoppingBag, Lock, CreditCard } from "lucide-react";
import { useCart } from "@/context/cart-context";
import type { CartItem } from "@/types/cart";
import { Container } from "@/components/ui/container";
import {
  GuestCustomerFormData,
  ShippingCalculationState,
  ShippingZone,
} from "@/types/checkout";
import { calculateStateShippingAction } from "@/app/checkout/actions";
import { CustomerAddressStep } from "./customer-address-step";
import { PaymentActionStep } from "./payment-action-step";
import { CheckoutSummary } from "./checkout-summary";


const stepLabel =
  "font-pally text-xs font-bold uppercase tracking-[0.2em] text-[#d9b8ab]/80";

export function CheckoutView() {
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get("mode") === "buy-now";

  const {
    items: cartItems,
    subtotal: cartSubtotal,
    isHydrated,
    buyNowItem: contextBuyNowItem,
  } = useCart();

  // Buy Now item state fallback initialized lazily from sessionStorage
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("ajvas_buy_now_item");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse buy now item from sessionStorage:", e);
      }
    }
    return null;
  });

  // Form State
  const [formData, setFormData] = useState<GuestCustomerFormData>({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    district: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof GuestCustomerFormData, string>>
  >({});

  // Shipping calculation state
  const [shippingAmount, setShippingAmount] = useState<number | null>(null);
  const [shippingZone, setShippingZone] = useState<ShippingZone | null>(null);
  const [shippingState, setShippingState] =
    useState<ShippingCalculationState>("awaiting_state");

  // Read Buy Now item from sessionStorage or context on client mount
  useEffect(() => {
    if (isBuyNowMode) {
      if (contextBuyNowItem) {
        setBuyNowItem(contextBuyNowItem);
      } else {
        try {
          const stored = sessionStorage.getItem("ajvas_buy_now_item");
          if (stored) {
            setBuyNowItem(JSON.parse(stored));
          }
        } catch (e) {
          console.error("Failed to parse buy now item from sessionStorage:", e);
        }
      }
    }
  }, [isBuyNowMode, contextBuyNowItem]);

  const effectiveBuyNowItem = buyNowItem || contextBuyNowItem;

  // Determine active checkout items
  const activeItems = useMemo<CartItem[]>(() => {
    if (isBuyNowMode && effectiveBuyNowItem) {
      return [
        {
          productId: effectiveBuyNowItem.productId,
          slug: effectiveBuyNowItem.slug || "",
          name: effectiveBuyNowItem.name,
          unitPrice: effectiveBuyNowItem.unitPrice,
          discountedUnitPrice: effectiveBuyNowItem.discountedUnitPrice,
          quantity: effectiveBuyNowItem.quantity,
          weightGrams: effectiveBuyNowItem.weightGrams ?? 500,
          imageUrl: effectiveBuyNowItem.imageUrl,
        },
      ];
    }
    return cartItems;
  }, [isBuyNowMode, effectiveBuyNowItem, cartItems]);

  // Total weight in grams (sum of quantity * weightGrams)
  const totalWeightGrams = useMemo(() => {
    return activeItems.reduce((acc, item) => {
      const weight = item.weightGrams || 500;
      return acc + weight * item.quantity;
    }, 0);
  }, [activeItems]);

  // Subtotal calculation
  const subtotal = useMemo(() => {
    if (isBuyNowMode && effectiveBuyNowItem) {
      const price =
        effectiveBuyNowItem.discountedUnitPrice ?? effectiveBuyNowItem.unitPrice ?? 0;
      return price * (effectiveBuyNowItem.quantity || 1);
    }
    return cartSubtotal ?? 0;
  }, [isBuyNowMode, effectiveBuyNowItem, cartSubtotal]);

  // Calculate Shipping whenever destination State changes
  useEffect(() => {
    if (!formData.state || formData.state.trim() === "" || activeItems.length === 0) {
      setShippingAmount(null);
      setShippingZone(null);
      setShippingState("awaiting_state");
      return;
    }

    setShippingState("calculating");

    const shippingItems = activeItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    calculateStateShippingAction(formData.state, shippingItems)
      .then((result) => {
        if (result.success && typeof result.shippingAmount === "number") {
          setShippingAmount(result.shippingAmount);
          setShippingZone(result.zone || null);
          setShippingState("calculated");
        } else {
          setShippingAmount(null);
          setShippingZone(null);
          setShippingState("calculation_failed");
        }
      })
      .catch((err) => {
        console.error("Shipping rate calculation failed:", err);
        setShippingAmount(null);
        setShippingZone(null);
        setShippingState("calculation_failed");
      });
  }, [formData.state, activeItems]);

  // Input Field Change Handler
  const handleFieldChange = (
    field: keyof GuestCustomerFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for edited field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Form Validation Handler
  const validateForm = useCallback(() => {
    const errors: Partial<Record<keyof GuestCustomerFormData, string>> = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = "Please enter your street address.";
    }
    if (!formData.state.trim()) {
      errors.state = "Please select your delivery state.";
    }
    if (!formData.district.trim()) {
      errors.district = "Please select your delivery district.";
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Please enter a valid 6-digit pincode.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const isFormValid =
    formData.fullName.trim().length > 0 &&
    /^\d{10}$/.test(formData.phone.trim()) &&
    (!formData.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) &&
    formData.addressLine1.trim().length > 0 &&
    formData.state.trim().length > 0 &&
    formData.district.trim().length > 0 &&
    /^\d{6}$/.test(formData.pincode.trim());

  const canProceedToPayment =
    isFormValid &&
    shippingAmount !== null &&
    shippingState === "calculated";

  const totalPayable = shippingAmount !== null ? subtotal + shippingAmount : null;

  // Hydration Loading Skeleton
  if (!isHydrated) {
    return (
      <div className="w-full bg-[#120805] py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-6xl animate-pulse">
            <div className="mb-8 h-10 w-56 rounded-sm bg-[#1f110c]" />
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-7">
                <div className="h-44 rounded-sm bg-[#1f110c]" />
                <div className="h-64 rounded-sm bg-[#1f110c]" />
              </div>
              <div className="lg:col-span-5">
                <div className="h-80 rounded-sm bg-[#1f110c]" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Empty Checkout State
  if (activeItems.length === 0) {
    return (
      <div className="w-full bg-[#120805] pt-28 pb-16 sm:pb-24">
        <Container>
          <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-sm bg-[#1f110c] p-8 text-center sm:p-10">
            <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-[#2a1610] text-[#fb0b88]">
              <ShoppingBag className="h-9 w-9" />
            </div>

            <div className="space-y-2">
              <span className={stepLabel}>Checkout</span>
              <h1 className="font-pally text-3xl font-bold tracking-tight text-[#faf4f0] sm:text-4xl">
                No items to checkout.
              </h1>
              <p className="mx-auto max-w-sm font-sans text-sm leading-relaxed text-[#d0c4b8]/80">
                Your shopping bag is empty. Please add confections or gift hampers before proceeding
                to checkout.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-3 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-sm bg-[#fb0b88] px-8 font-sans text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#d90974] focus-visible:outline-none"
            >
              <span>Continue Shopping</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-[#120805] pt-24 pb-28 text-[#faf4f0] sm:pt-28 sm:pb-32 lg:pb-16">
      {/* Soft warm glow background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,#3a0b07_0%,#1f0a05_40%,#120805_75%)]"
      />

      <Container>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="mb-2 block font-sans text-xs font-semibold uppercase tracking-widest text-[#fb0b88]">
                Secure Checkout
              </span>
              <h1 className="font-pally text-3xl tracking-tight text-[#faf4f0] sm:text-4xl lg:text-5xl">
                Guest Checkout
              </h1>
              <p className="mt-2 max-w-xl font-sans text-xs leading-relaxed text-[#d0c4b8]/75 sm:text-sm">
                Direct order dispatch. No account required. Shipping is calculated by state.
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex w-fit items-center gap-1.5 rounded-sm bg-[#1f110c] px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#faf4f0] transition-colors hover:bg-[#fb0b88] focus-visible:outline-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {/* Step indicator */}
          <ol className="flex flex-wrap items-center gap-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]">
            <li className="flex items-center gap-2 text-[#faf4f0]">
              <span className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#fb0b88] text-white">
                1
              </span>
              Delivery Details
            </li>
            <li aria-hidden="true" className="h-px w-8 bg-[#3d1c12]" />
            <li
              className={`flex items-center gap-2 ${
                canProceedToPayment ? "text-[#faf4f0]" : "text-[#d9b8ab]/50"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-sm ${
                  canProceedToPayment ? "bg-[#fb0b88] text-white" : "bg-[#1f110c] text-[#d9b8ab]/60"
                }`}
              >
                2
              </span>
              Payment
            </li>
          </ol>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: steps */}
            <div className="flex flex-col gap-8 lg:col-span-7">
              <div className="flex flex-col gap-3">
                <h2 className={stepLabel}>1 · Contact &amp; Address</h2>
                <CustomerAddressStep
                  formData={formData}
                  onChange={handleFieldChange}
                  errors={formErrors}
                />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className={stepLabel}>2 · Payment</h2>
                <PaymentActionStep
                  canProceed={canProceedToPayment}
                  totalAmount={totalPayable}
                  onInitiatePayment={validateForm}
                  formData={formData}
                  items={activeItems}
                  subtotal={subtotal}
                  shippingAmount={shippingAmount || 0}
                />
              </div>
            </div>

            {/* Right: sticky order summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="flex flex-col gap-3">
                <h2 className={stepLabel}>Order Summary</h2>
                <CheckoutSummary
                  items={activeItems}
                  subtotal={subtotal}
                  shippingAmount={shippingAmount}
                  shippingZone={shippingZone}
                  shippingState={shippingState}
                  totalWeightGrams={totalWeightGrams}
                  isBuyNowMode={isBuyNowMode}
                />
                <p className="mt-1 flex items-center gap-2 font-sans text-[11px] text-[#d0c4b8]/60">
                  <Lock className="h-3.5 w-3.5 text-[#fb0b88]" />
                  Your details are used only to deliver this order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile View: Fixed Bottom Navbar with Price and Pay Now button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block border-t border-[#3d1c12] bg-[#1a0e0a]/95 px-4 py-3 backdrop-blur-md shadow-2xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="block font-sans text-[10px] font-semibold uppercase tracking-wider text-[#d0c4b8]/70">
              Total Payable
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-pally text-xl font-bold text-[#faf4f0]">
                ₹{(totalPayable ?? subtotal ?? 0).toLocaleString("en-IN")}
              </span>
              {shippingAmount === null && (
                <span className="font-sans text-[10px] text-[#fb0b88]">
                  + shipping
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const isValid = validateForm();
              if (!isValid) {
                const firstErr = document.querySelector<HTMLElement>(
                  "[aria-invalid='true'], input.ring-\\[\\#fb0b88\\], select.ring-\\[\\#fb0b88\\], input.border-\\[\\#fb0b88\\], select.border-\\[\\#fb0b88\\]"
                );
                if (firstErr) {
                  firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
                  firstErr.focus();
                } else {
                  window.scrollTo({ top: 150, behavior: "smooth" });
                }
              } else {
                // If form is valid, trigger payment action or scroll to payment button
                const payBtn = document.querySelector<HTMLButtonElement>(
                  "button[type='button'].bg-\\[\\#fb0b88\\]"
                );
                if (payBtn) {
                  payBtn.click();
                }
              }
            }}
            disabled={activeItems.length === 0}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#fb0b88] px-6 font-sans text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#fb0b88]/25 transition-all hover:bg-[#d90974] active:scale-95 disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            <span>Pay Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}