"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart-context";
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

export function CheckoutView() {
  const searchParams = useSearchParams();
  const isBuyNowMode = searchParams.get("mode") === "buy-now";
  const { items, buyNowItem, isHydrated } = useCart();

  // Active items for checkout
  const activeItems = useMemo(() => {
    if (isBuyNowMode && buyNowItem) {
      return [buyNowItem];
    }
    return items;
  }, [isBuyNowMode, buyNowItem, items]);

  const subtotal = useMemo(() => {
    return activeItems.reduce((acc, item) => {
      const price = item.discountedUnitPrice ?? item.unitPrice;
      return acc + price * item.quantity;
    }, 0);
  }, [activeItems]);

  const totalWeightGrams = useMemo(() => {
    return activeItems.reduce((acc, item) => acc + (item.weightGrams || 500) * item.quantity, 0);
  }, [activeItems]);

  // Form State
  const [formData, setFormData] = useState<GuestCustomerFormData>({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
    district: "",
    state: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof GuestCustomerFormData, string>>>({});
  const [shippingAmount, setShippingAmount] = useState<number | null>(null);
  const [shippingZone, setShippingZone] = useState<ShippingZone | null>(null);
  const [shippingState, setShippingState] = useState<ShippingCalculationState>("awaiting_state");

  const handleFieldChange = useCallback((field: keyof GuestCustomerFormData, value: string) => {
    setFormData((prev) => {
      if (prev[field] === value) return prev;
      return { ...prev, [field]: value };
    });
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: undefined };
    });
  }, []);

  // Recalculate shipping whenever selected State or active items/quantities change
  useEffect(() => {
    if (!formData.state || activeItems.length === 0) {
      setShippingAmount(null);
      setShippingZone(null);
      setShippingState("awaiting_state");
      return;
    }

    let isMounted = true;
    setShippingState("calculating");

    const itemsPayload = activeItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const runCalculation = async () => {
      const res = await calculateStateShippingAction(formData.state, itemsPayload);

      if (!isMounted) return;

      if (res.success && res.shippingAmount !== undefined) {
        setShippingAmount(res.shippingAmount);
        setShippingZone(res.zone || null);
        setShippingState("calculated");
      } else {
        setShippingAmount(null);
        setShippingZone(null);
        setShippingState("calculation_failed");
      }
    };

    runCalculation();

    return () => {
      isMounted = false;
    };
  }, [formData.state, activeItems]);

  // Form Validation
  const validateForm = useCallback((): boolean => {
    const errors: Partial<Record<keyof GuestCustomerFormData, string>> = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    }
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Please enter a valid 10-digit mobile number.";
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
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
      <div className="w-full py-10 sm:py-16">
        <Container>
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-8 w-48 bg-brand-sand/60 rounded mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="h-44 bg-brand-sand/40 rounded-2xl" />
                <div className="h-64 bg-brand-sand/40 rounded-2xl" />
              </div>
              <div className="lg:col-span-5">
                <div className="h-80 bg-brand-sand/40 rounded-2xl" />
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
      <div className="w-full py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-brand-surface border border-brand-sand/80 flex items-center justify-center text-brand-muted shadow-subtle">
              <ShoppingBag className="w-9 h-9 text-brand-espresso" />
            </div>

            <div className="space-y-2">
              <span className="font-sans text-xs uppercase tracking-widest font-semibold text-brand-burgundy">
                CHECKOUT
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-espresso tracking-tight">
                No items to checkout.
              </h1>
              <p className="font-sans text-sm text-brand-muted leading-relaxed max-w-sm mx-auto">
                Your shopping bag is empty. Please add confections or gift hampers before proceeding to checkout.
              </p>
            </div>

            <Link
              href="/cart"
              className="mt-3 inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest font-semibold min-h-[50px] px-8 rounded-lg bg-brand-cocoa text-brand-cream hover:bg-brand-espresso active:bg-black transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              <span>Return to Bag</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-12">
      <Container>
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Header Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-brand-sand/70 pb-5">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-espresso tracking-tight">
                Guest Checkout
              </h1>
              <p className="font-sans text-xs text-brand-muted mt-1">
                Direct order dispatch. No customer account required. State-based shipping calculation.
              </p>
            </div>

            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 font-sans text-xs text-brand-muted hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Bag</span>
            </Link>
          </div>

          {/* Two-Column Checkout Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Checkout Steps */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Step 1: Contact & Delivery Address Form */}
              <CustomerAddressStep
                formData={formData}
                onChange={handleFieldChange}
                errors={formErrors}
              />

              {/* Step 2: Payment Handoff */}
              <PaymentActionStep
                canProceed={canProceedToPayment}
                totalAmount={totalPayable}
                onInitiatePayment={validateForm}
              />
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <CheckoutSummary
                items={activeItems}
                subtotal={subtotal}
                shippingAmount={shippingAmount}
                shippingZone={shippingZone}
                shippingState={shippingState}
                totalWeightGrams={totalWeightGrams}
                isBuyNowMode={isBuyNowMode}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
