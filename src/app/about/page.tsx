import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getPageSections } from "@/lib/supabase/page-sections";

import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover the story behind AJVAS Chocolates — curated confections and luxury gift hampers crafted for life's sweetest celebrations.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/about`,
    siteName: BRAND_NAME,
    title: `About Us | ${BRAND_NAME}`,
    description:
      "Discover the story behind AJVAS Chocolates — curated confections and luxury gift hampers crafted for life's sweetest celebrations.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${BRAND_NAME}`,
    description:
      "Discover the story behind AJVAS Chocolates — curated confections and luxury gift hampers crafted for life's sweetest celebrations.",
    images: [DEFAULT_OG_IMAGE],
  },
};


export default async function AboutPage() {
  const sections = await getPageSections("about");

  const quoteSection = sections.find(
    (s) =>
      s.title.toLowerCase().includes("quote") ||
      s.title.toLowerCase().includes("philosophy")
  );
  const generalSections = sections.filter((s) => s.id !== quoteSection?.id);

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24">
          {/* 1. Hero (Hardcoded heading & description): text left, image right */}
          <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="mb-3 block font-sans text-xs font-semibold uppercase tracking-widest text-[#fb0b88]">
                Our Story
              </span>
              <h1 className="mb-5 font-pally text-3xl sm:text-4xl leading-tight text-[#faf4f0]">
                About AJVAS Chocolates
              </h1>
              <p className="max-w-lg font-sans text-sm leading-relaxed text-[#d0c4b8]/80">
                Born from a passion for artisanal craftsmanship and thoughtful gifting, AJVAS
                Chocolates is where every piece tells a story.
              </p>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#1f110c]">
              <Image
                src="/about-image.jpeg"
                alt="AJVAS Chocolates gift hampers"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </section>

          {/* 2. Content Sections fetched from DB */}
          {generalSections.length > 0 ? (
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {generalSections.map((item) => (
                <div key={item.id} className="rounded-sm bg-[#1f110c] p-8 lg:p-10">
                  <span className="mb-3 block font-sans text-xs font-semibold uppercase tracking-widest text-[#fb0b88]">
                    {item.title}
                  </span>
                  <h2 className="mb-3 font-pally text-2xl text-[#faf4f0]">
                    {item.title}
                  </h2>
                  <p className="font-sans text-sm leading-relaxed text-[#d0c4b8]/80">
                    {item.content}
                  </p>
                </div>
              ))}
            </section>
          ) : null}

          {/* 3. Quote + Shop Now CTA */}
          <section className="rounded-sm bg-[#1f110c] px-6 py-12 text-center sm:py-16">
            {quoteSection ? (
              <blockquote className="mx-auto max-w-2xl font-pally text-base sm:text-lg italic leading-relaxed text-[#faf4f0]">
                &ldquo;{quoteSection.content}&rdquo;
              </blockquote>
            ) : null}
            <Link
              href="/shop"
              className="mt-8 inline-block rounded-sm bg-[#fb0b88] px-8 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#d90974]"
            >
              Shop Now
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}