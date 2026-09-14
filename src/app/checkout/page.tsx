import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckoutView } from "@/components/checkout/checkout-view";
import CheckoutLoading from "./loading";

export const metadata: Metadata = {
  title: "Guest Checkout — AJVAS CHOCOLATES",
  description:
    "Complete your chocolate gift order with dynamic pincode delivery and secure online payment. Pan-India courier delivery.",
};

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-espresso">
      <Header />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<CheckoutLoading />}>
          <CheckoutView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
