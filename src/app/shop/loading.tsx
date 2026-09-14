import { Container } from "@/components/ui/container";

export default function ShopLoading() {
  return (
    <div className="w-full bg-brand-cream min-h-screen pt-10 pb-20">
      <Container>
        {/* Header Skeleton */}
        <div className="max-w-2xl mb-10">
          <div className="h-4 w-32 bg-brand-sand/60 rounded animate-pulse mb-3" />
          <div className="h-10 w-72 bg-brand-sand/70 rounded animate-pulse mb-4" />
          <div className="h-5 w-full max-w-lg bg-brand-sand/50 rounded animate-pulse" />
        </div>

        {/* Category Pills Skeleton */}
        <div className="flex gap-3 mb-8 overflow-hidden">
          <div className="h-10 w-32 bg-brand-sand/60 rounded-full animate-pulse shrink-0" />
          <div className="h-10 w-28 bg-brand-sand/50 rounded-full animate-pulse shrink-0" />
          <div className="h-10 w-36 bg-brand-sand/50 rounded-full animate-pulse shrink-0" />
          <div className="h-10 w-28 bg-brand-sand/50 rounded-full animate-pulse shrink-0" />
        </div>

        {/* Toolbar Skeleton */}
        <div className="h-16 w-full bg-white rounded-xl border border-brand-border/40 shadow-subtle mb-10 animate-pulse" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-brand-border/60 rounded-xl overflow-hidden shadow-subtle flex flex-col justify-between"
            >
              <div className="w-full aspect-[4/5] bg-brand-surface animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-20 bg-brand-sand/60 rounded" />
                <div className="h-6 w-3/4 bg-brand-sand/80 rounded" />
                <div className="h-4 w-full bg-brand-sand/40 rounded" />
                <div className="pt-2 flex justify-between items-center">
                  <div className="h-5 w-16 bg-brand-sand/70 rounded" />
                  <div className="h-8 w-24 bg-brand-sand/60 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
