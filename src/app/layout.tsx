import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
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
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-brand-cream text-brand-espresso font-sans antialiased selection:bg-brand-gold selection:text-brand-espresso">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

