import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";

export default function ProductLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-espresso">
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <Container>
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-8 animate-pulse">
            <div className="h-4 w-12 bg-brand-sand/60 rounded" />
            <div className="h-4 w-3 bg-brand-sand/40 rounded" />
            <div className="h-4 w-16 bg-brand-sand/60 rounded" />
            <div className="h-4 w-3 bg-brand-sand/40 rounded" />
            <div className="h-4 w-28 bg-brand-sand/60 rounded" />
          </div>

          {/* Two-Column Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Gallery Skeleton */}
            <div className="lg:col-span-7 flex flex-col gap-4 animate-pulse">
              <div className="w-full aspect-square bg-brand-sand/40 rounded-2xl border border-brand-sand/60" />
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-brand-sand/40 rounded-xl" />
                <div className="w-20 h-20 bg-brand-sand/30 rounded-xl" />
                <div className="w-20 h-20 bg-brand-sand/20 rounded-xl" />
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="lg:col-span-5 flex flex-col gap-6 animate-pulse">
              <div className="h-4 w-24 bg-brand-sand/50 rounded" />
              <div className="h-10 w-3/4 bg-brand-sand/60 rounded" />
              <div className="h-8 w-1/3 bg-brand-sand/60 rounded" />
              <div className="h-px w-full bg-brand-sand/60" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-brand-sand/40 rounded" />
                <div className="h-4 w-5/6 bg-brand-sand/40 rounded" />
                <div className="h-4 w-4/6 bg-brand-sand/40 rounded" />
              </div>
              <div className="h-14 w-full bg-brand-sand/40 rounded-xl" />
              <div className="h-24 w-full bg-brand-sand/30 rounded-xl" />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
