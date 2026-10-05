import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { getPageSections } from "@/lib/supabase/page-sections";

import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Care & Instructions",
  description:
    "How to store, handle, and enjoy your AJVAS Chocolates to keep them fresh and delicious.",
  alternates: {
    canonical: `${SITE_URL}/care-instructions`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/care-instructions`,
    siteName: BRAND_NAME,
    title: `Care & Instructions | ${BRAND_NAME}`,
    description:
      "How to store, handle, and enjoy your AJVAS Chocolates to keep them fresh and delicious.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Care & Instructions | ${BRAND_NAME}`,
    description:
      "How to store, handle, and enjoy your AJVAS Chocolates to keep them fresh and delicious.",
    images: [DEFAULT_OG_IMAGE],
  },
};


export default async function CareInstructionsPage() {
  const sections = await getPageSections("care-instructions");

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Page Heading (Hardcoded) */}
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#fb0b88] block mb-3">
              Product Care
            </span>
            <h1 className="font-pally text-3xl sm:text-4xl text-[#faf4f0] leading-tight mb-4">
              Care & Instructions
            </h1>
            <p className="font-sans text-sm text-[#d0c4b8]/80 leading-relaxed mb-10">
              To enjoy our chocolates at their finest, here&apos;s how to store and handle them properly.
            </p>

            {/* Care Items (Fetched from DB) */}
            {sections.length > 0 ? (
              <div className="space-y-3">
                {sections.map((item) => (
                  <div key={item.id} className="bg-[#1f110c] rounded-sm p-5">
                    <h2 className="font-pally text-base text-[#faf4f0] mb-2">
                      {item.title}
                    </h2>
                    <p className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Closing note */}
            <div className="mt-10 bg-[#1f110c] rounded-sm p-5">
              <p className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed">
                Have a specific question about one of our products?{" "}
                <a href="/contact" className="text-[#fb0b88] hover:underline">
                  Contact us
                </a>{" "}
                — we&apos;re always happy to help.
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
