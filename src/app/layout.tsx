import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AJVAS CHOCOLATES — Artisanal Confections & Thoughtful Gifting",
  description:
    "Handcrafted chocolate confections and keepsake gift hampers for celebrations and thoughtful gestures. Pan-India courier delivery.",
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
      className={`${playfair.variable} ${plusJakarta.variable}`}
    >
      <body className="min-h-screen bg-brand-cream text-brand-espresso font-sans antialiased selection:bg-brand-gold selection:text-brand-espresso">
        {children}
      </body>
    </html>
  );
}
