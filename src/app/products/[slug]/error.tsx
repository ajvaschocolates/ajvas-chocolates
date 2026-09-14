"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

interface ProductErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ProductErrorProps) {
  useEffect(() => {
    console.error("PDP route error boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-espresso">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-espresso">
                Unable to Load Product
              </h1>
              <p className="font-sans text-sm text-brand-muted leading-relaxed">
                We encountered an issue loading this product information. Please try again or explore our full catalog.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={reset}
                className="w-full sm:w-auto min-h-[44px] px-6 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </Button>

              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider font-semibold min-h-[44px] px-6 rounded bg-brand-burgundy text-brand-cream hover:bg-brand-wine active:bg-brand-espresso transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              >
                <span>Browse Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
