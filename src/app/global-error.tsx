"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Critical root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#120805] text-[#faf4f0] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-5 bg-[#1f110c] p-8 rounded-2xl border border-[#3d1c12] shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#3d101e] border border-[#fb0b88]/30 flex items-center justify-center text-[#fb0b88]">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#faf4f0]">
              Application Error
            </h1>
            <p className="text-sm text-[#d1c2b9] leading-relaxed">
              A critical error occurred while initializing the page. Please try again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-[#fb0b88] hover:bg-[#d90974] text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload</span>
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider border border-[#c99d52]/50 text-[#c99d52] hover:bg-[#c99d52]/10 transition-colors"
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
