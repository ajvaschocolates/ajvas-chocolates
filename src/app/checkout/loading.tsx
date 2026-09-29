import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";

export default function CheckoutLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main className="flex-1 py-10 sm:py-16">
        <Container>
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-8 w-56 bg-[#1f110c] rounded mb-8 border border-[#3d1c12]" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="h-44 bg-[#1f110c] rounded-2xl border border-[#3d1c12]" />
                <div className="h-64 bg-[#1f110c] rounded-2xl border border-[#3d1c12]" />
                <div className="h-36 bg-[#1f110c] rounded-2xl border border-[#3d1c12]" />
              </div>
              <div className="lg:col-span-5">
                <div className="h-96 bg-[#1f110c] rounded-2xl border border-[#3d1c12]" />
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
