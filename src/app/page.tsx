export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-950 text-neutral-100">
      <div className="max-w-md w-full p-8 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur text-center space-y-4 shadow-xl">
        <h1 className="text-3xl font-bold tracking-wider text-amber-400">
          AJVAS CHOCOLATES
        </h1>
        <div className="h-px bg-neutral-800 w-full" />
        <p className="text-sm text-neutral-400">
          Application foundation initialized successfully.
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
          Ready for Development
        </span>
      </div>
    </main>
  );
}
