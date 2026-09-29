import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Shopping Bag — AJVAS CHOCOLATES",
  description:
    "Review your selected chocolate gifts, confections, and gift hampers. Pan-India courier delivery.",
};

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main id="main-content" className="flex-1">
        <CartView />
      </main>
      <Footer />
    </div>
  );
}
