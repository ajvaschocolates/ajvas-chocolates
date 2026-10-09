import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { getPageSections } from "@/lib/supabase/page-sections";

import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Refund & Returns Policy",
  description:
    "Understand the refund and returns policy for AJVAS Chocolates orders. We're committed to your satisfaction.",
  alternates: {
    canonical: `${SITE_URL}/refund-returns`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/refund-returns`,
    siteName: BRAND_NAME,
    title: `Refund & Returns Policy | ${BRAND_NAME}`,
    description:
      "Understand the refund and returns policy for AJVAS Chocolates orders. We're committed to your satisfaction.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Refund & Returns Policy | ${BRAND_NAME}`,
    description:
      "Understand the refund and returns policy for AJVAS Chocolates orders. We're committed to your satisfaction.",
    images: [DEFAULT_OG_IMAGE],
  },
};


export default async function RefundReturnsPage() {
  const sections = await getPageSections("refund-returns");

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#fb0b88] block mb-3">
              Returns Policy
            </span>
            <h1 className="font-pally text-3xl sm:text-4xl text-[#faf4f0] leading-tight mb-4">
              Refund & Returns
            </h1>
            <p className="font-sans text-sm text-[#d0c4b8]/80 leading-relaxed mb-10">
              Your satisfaction matters to us. Please read our refund and returns policy carefully
              to understand what we cover and how to raise a concern.
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
                Need to raise a return or refund request?{" "}
                <a href="/contact" className="text-[#fb0b88] hover:underline">Contact us</a>{" "}
                within 48 hours of delivery.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
