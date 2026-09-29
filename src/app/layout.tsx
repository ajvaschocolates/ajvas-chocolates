import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Dancing_Script } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
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

export const metadata: Metadata = {
  title: "AJVAS CHOCOLATES — Curated Confections & Thoughtful Gifting",
  description:
    "Explore chocolate gift hampers, keepsake boxes, and curated confections for celebrations and thoughtful gestures. Pan-India courier delivery.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${dancingScript.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#120805] text-[#faf4f0] font-sans antialiased selection:bg-[#fb0b88] selection:text-white"
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

