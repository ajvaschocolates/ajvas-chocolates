import Link from "next/link";
import { PackageX, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";


export default function ProductNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-espresso">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-sand/40 border border-brand-sand/80 flex items-center justify-center text-brand-muted">
              <PackageX className="w-8 h-8 text-brand-espresso" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-espresso">
                Product Not Found
              </h1>
              <p className="font-sans text-sm text-brand-muted leading-relaxed">
                The chocolate confection or gift hamper you requested is unavailable or has been moved.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-2 inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider font-semibold min-h-[48px] px-8 rounded bg-brand-cocoa text-brand-cream hover:bg-brand-espresso active:bg-black transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              <span>Browse Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
