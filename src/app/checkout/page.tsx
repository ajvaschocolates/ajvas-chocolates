import { Suspense } from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CheckoutView } from "@/components/checkout/checkout-view";
import CheckoutLoading from "./loading";

export const metadata: Metadata = {
  title: "Guest Checkout",
  description:
    "Complete your chocolate gift order with dynamic pincode delivery and secure online payment. Pan-India courier delivery.",
  robots: {
    index: false,
    follow: false,
  },
};


import { getGiftPurposeConfig } from "@/lib/supabase/gift-purposes";

export default async function CheckoutPage() {
  const giftPurposeConfig = await getGiftPurposeConfig();

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<CheckoutLoading />}>
          <CheckoutView giftPurposeConfig={giftPurposeConfig} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
