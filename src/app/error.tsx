"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("Root application error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-5 bg-[#1f110c] p-8 rounded-2xl border border-[#3d1c12] shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#3d101e] border border-[#fb0b88]/30 flex items-center justify-center text-[#fb0b88]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf4f0]">
                Something Went Wrong
              </h1>
              <p className="font-sans text-sm text-[#d1c2b9] leading-relaxed">
                We encountered an unexpected issue while loading this page. Please try refreshing or return to the homepage.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={reset}
                className="w-full sm:w-auto min-h-[44px] px-6 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#fb0b88] hover:bg-[#d90974] text-white"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider font-semibold min-h-[44px] px-6 rounded-md border border-[#c99d52]/50 text-[#c99d52] hover:bg-[#c99d52]/10 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d52]"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
