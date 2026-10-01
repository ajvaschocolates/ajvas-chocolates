import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { getPageSections } from "@/lib/supabase/page-sections";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FAQ — AJVAS CHOCOLATES",
  description:
    "Frequently asked questions about AJVAS Chocolates — orders, delivery, gifting, and more.",
};

export default async function FAQPage() {
  const sections = await getPageSections("faq");

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-[#fb0b88] block mb-3">
              Help Centre
            </span>
            <h1 className="font-pally text-3xl sm:text-4xl text-[#faf4f0] leading-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="font-sans text-sm text-[#d0c4b8]/80 leading-relaxed mb-10">
              Can&apos;t find an answer here? Reach out to us on{" "}
              <a href="/contact" className="text-[#fb0b88] hover:underline">our contact page</a>{" "}
              and we&apos;ll be happy to help.
            </p>

            {sections.length > 0 ? (
              <div className="space-y-3">
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
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
