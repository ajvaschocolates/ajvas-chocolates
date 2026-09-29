import Link from "next/link";
import { PackageX, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";


export default function ProductNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main id="main-content" className="flex-1 flex items-center justify-center py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center flex flex-col items-center gap-5 bg-[#1f110c] p-8 rounded-2xl border border-[#3d1c12] shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#140b07] border border-[#3d1c12] flex items-center justify-center text-[#c99d52]">
              <PackageX className="w-8 h-8 text-[#c99d52]" />
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#faf4f0]">
                Product Not Found
              </h1>
              <p className="font-sans text-sm text-[#d1c2b9] leading-relaxed">
                The chocolate confection or gift hamper you requested is unavailable or has been moved.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-2 inline-flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider font-semibold min-h-[48px] px-8 rounded-full bg-[#fb0b88] text-white hover:bg-[#d90974] transition-all shadow-md shadow-[#fb0b88]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
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
