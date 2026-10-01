import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { getPageSections } from "@/lib/supabase/page-sections";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shipping & Delivery — AJVAS CHOCOLATES",
  description:
    "Learn about AJVAS Chocolates' shipping policy, delivery timelines, and how we ensure your chocolates arrive safely across India.",
};

export default async function ShippingDeliveryPage() {
  const sections = await getPageSections("shipping-delivery");

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#fb0b88] block mb-3">
              Delivery Policy
            </span>
            <h1 className="font-pally text-3xl sm:text-4xl text-[#faf4f0] leading-tight mb-4">
              Shipping & Delivery
            </h1>
            <p className="font-sans text-sm text-[#d0c4b8]/80 leading-relaxed mb-10">
              We take great care to deliver your chocolates safely and on time. Here&apos;s everything
              you need to know about our shipping process.
            </p>

            {sections.length > 0 ? (
              <div className="space-y-4">
                {sections.map((item) => (
                  <div key={item.id} className="bg-[#1f110c] rounded-sm p-5">
                    <h2 className="font-pally text-base text-[#faf4f0] mb-2">{item.title}</h2>
                    <p className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-sm text-[#d0c4b8]/60">Content coming soon.</p>
            )}

            <div className="mt-10 bg-[#1f110c] rounded-sm p-5">
              <p className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed">
                Have questions about your delivery?{" "}
                <a href="/contact" className="text-[#fb0b88] hover:underline">Contact us</a>{" "}
                and we&apos;ll be happy to help.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
