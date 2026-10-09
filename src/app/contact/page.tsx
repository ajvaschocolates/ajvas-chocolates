import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { getPageSections } from "@/lib/supabase/page-sections";

import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with AJVAS Chocolates for orders, bulk gifting enquiries, or any assistance you need.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/contact`,
    siteName: BRAND_NAME,
    title: `Contact Us | ${BRAND_NAME}`,
    description:
      "Get in touch with AJVAS Chocolates for orders, bulk gifting enquiries, or any assistance you need.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact Us | ${BRAND_NAME}`,
    description:
      "Get in touch with AJVAS Chocolates for orders, bulk gifting enquiries, or any assistance you need.",
    images: [DEFAULT_OG_IMAGE],
  },
};


export default async function ContactPage() {
  const sections = await getPageSections("contact");

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <Container>
          {/* Page Heading (Hardcoded) */}
          <div className="max-w-2xl mb-12">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#fb0b88] block mb-3">
              Get In Touch
            </span>
            <h1 className="font-pally text-3xl sm:text-4xl text-[#faf4f0] leading-tight mb-4">
              Contact Us
            </h1>
            <p className="font-sans text-sm text-[#d0c4b8]/80 leading-relaxed">
              Have a question, a special order request, or a bulk gifting enquiry? We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Contact Details (Fetched from DB) */}
            <div className="space-y-6">
              {sections.length > 0 ? (
                sections.map((item) => {
                  const lines = item.content.split("\n");
                  const val = lines[0];
                  const sub = lines.slice(1).join(" ");
                  return (
                    <div key={item.id} className="bg-[#1f110c] rounded-sm p-5">
                      <p className="font-sans text-xs uppercase tracking-widest text-[#fb0b88] font-semibold mb-1">
                        {item.title}
                      </p>
                      <p className="font-pally text-base text-[#faf4f0]">{val}</p>
                      {sub ? (
                        <p className="font-sans text-xs text-[#d0c4b8]/70 mt-0.5">{sub}</p>
                      ) : null}
                    </div>
                  );
                })
              ) : null}
            </div>

            {/* Right: Contact Form */}
            <div className="bg-[#1f110c] rounded-sm p-6 sm:p-8 space-y-5">
              <h2 className="font-pally text-xl text-[#faf4f0]">Send a Message</h2>

              <div className="space-y-4">
                <div>
                  <label className="font-sans text-xs text-[#d0c4b8]/70 uppercase tracking-wider block mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full h-10 bg-[#120805] rounded-xl px-4 text-sm text-[#faf4f0] focus:outline-none focus:ring-1 focus:ring-[#fb0b88]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs text-[#d0c4b8]/70 uppercase tracking-wider block mb-1.5">
                    Email / WhatsApp
                  </label>
                  <input
                    type="text"
                    className="w-full h-10 bg-[#120805] rounded-xl px-4 text-sm text-[#faf4f0] focus:outline-none focus:ring-1 focus:ring-[#fb0b88]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs text-[#d0c4b8]/70 uppercase tracking-wider block mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-[#120805] rounded-xl px-4 py-2.5 text-sm text-[#faf4f0] focus:outline-none focus:ring-1 focus:ring-[#fb0b88]/50 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest font-bold h-11 px-8 rounded-full bg-[#fb0b88] text-white hover:bg-[#d90974] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#fb0b88]/20"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
