import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AJVAS CHOCOLATES",
  description: "AJVAS Chocolates eCommerce Application Foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
