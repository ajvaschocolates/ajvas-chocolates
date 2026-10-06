import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Dancing_Script } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import { BackToTop } from "@/components/ui/back-to-top";
import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AJVAS Chocolates — Premium Chocolate Gifting",
    template: "%s | AJVAS Chocolates",
  },
  description:
    "Discover premium handcrafted chocolates, luxury gift hampers and elegant chocolate gifts from AJVAS Chocolates. Shop curated chocolate gifting across India.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: "AJVAS Chocolates — Premium Chocolate Gifting",
    description:
      "Discover premium handcrafted chocolates, luxury gift hampers and elegant chocolate gifts from AJVAS Chocolates. Shop curated chocolate gifting across India.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "AJVAS Chocolates Brand Logo & Luxury Gifting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AJVAS Chocolates — Premium Chocolate Gifting",
    description:
      "Discover premium handcrafted chocolates, luxury gift hampers and elegant chocolate gifts from AJVAS Chocolates. Shop curated chocolate gifting across India.",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description:
      "Premium handcrafted chocolates, luxury gift hampers, and curated confections delivered across India.",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${dancingScript.variable}`}
    >
      <head>
        <JsonLd data={[organizationSchema, websiteSchema]} />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#120805] text-[#faf4f0] font-sans antialiased selection:bg-[#fb0b88] selection:text-white"
      >
        <CartProvider>
          {children}
          <BackToTop />
        </CartProvider>
      </body>
    </html>
  );
}


