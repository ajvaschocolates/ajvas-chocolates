"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight, X, Copy, Check } from "lucide-react";
import { useCart } from "@/context/cart-context";

// Lightweight celebratory confetti particle canvas
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["#fb0b88", "#ff4081", "#fbbf24", "#34d399", "#60a5fa", "#ffffff", "#ffd700"];
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
      opacity: number;
    }> = [];

    // Emit celebration burst
    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    let animationFrameId: number;
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // gravity
        p.vx *= 0.985; // air resistance
        p.rotation += p.vRot;

        if (frame > 50) {
          p.opacity = Math.max(0, p.opacity - 0.014);
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });

      if (particles.some((p) => p.opacity > 0)) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  );
}

function SuccessModal() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "AJV-ORDER";
  const { clearCart } = useCart();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Clear cart and buy now session on successful checkout
    clearCart();
    try {
      sessionStorage.removeItem("ajvas_buy_now_item");
    } catch {
      // ignore
    }
  }, [clearCart]);

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      {/* Confetti celebration canvas (behind modal) */}
      <ConfettiCanvas />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-[#fb0b88]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-10 h-80 w-80 rounded-full bg-amber-600/10 blur-[100px]" />

      {/* CSS Animation Keyframes for reliable 60fps presentation */}
      <style jsx>{`
        @keyframes modalEnter {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(16px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes badgeEnter {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-35deg);
          }
          75% {
            transform: scale(1.15) rotate(4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        .animate-modal-enter {
          animation: modalEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-badge-enter {
          animation: badgeEnter 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
        }
      `}</style>

      {/* Modal Dialog Card - Completely borderless, always visible and centered */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className="animate-modal-enter relative z-50 w-full max-w-md overflow-hidden rounded-3xl border-0 bg-gradient-to-b from-[#22120b] via-[#190d07] to-[#120704] p-6 text-center shadow-2xl shadow-black sm:p-8"
      >
        {/* Close Button */}
        <Link
          href="/shop"
          className="absolute right-4 top-4 rounded-full p-2 text-[#a39085] transition-colors hover:bg-white/10 hover:text-white"
          title="Close and continue shopping"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Link>

        {/* Animated Celebration Badge */}
        <div className="animate-badge-enter relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-950 to-emerald-900/80 text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
        </div>

        {/* Pill Tag */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="inline-flex items-center gap-1.5  px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-[#fb0b88]">
        
            Payment Received
          </span>
        </div>

        {/* Headline */}
        <h2
          id="modal-headline"
          className="mt-3 font-pally text-3xl tracking-tight text-[#faf4f0] sm:text-4xl"
        >
          Order Confirmed
        </h2>

        {/* Description */}
        <p className="mt-2.5 font-sans text-xs text-[#d0c4b8] leading-relaxed">
          Thank you for ordering with AJVAS Chocolates. Your payment has been received and our chocolatiers are preparing your confection gifts.
        </p>

        {/* Order Details Snippet (Borderless, clean dark glass) */}
        <div className="mt-6 rounded-2xl bg-black/45 p-4 text-left shadow-inner">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="font-sans text-xs text-[#a39085]">Order Reference</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white tracking-wider">
                {orderNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyOrderNumber}
                className="rounded p-1 text-[#a39085] hover:bg-white/10 hover:text-white transition-colors"
                title="Copy Order ID"
                aria-label="Copy order reference"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3">
            <span className="font-sans text-xs text-[#a39085]">Payment Status</span>
            <span className="inline-flex items-center gap-1.5  px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            
              Paid via Razorpay
            </span>
          </div>
        </div>

        {/* Action Buttons - Stacked Vertically */}
        <div className="mt-6 flex flex-col gap-3">
          {/* Top Primary Button: Continue Shopping */}
          <Link
            href="/shop"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#fb0b88] to-[#e00877] px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#fb0b88]/30 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>

          {/* Underneath Secondary Button: Back to Home */}
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-6 py-3.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#d0c4b8] transition-all hover:bg-white/10 hover:text-white active:scale-[0.98]"
          >
            <span>Back to Home</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0d0503] text-[#faf4f0]">
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-[#a39085]">
            Loading confirmation...
          </div>
        }
      >
        <SuccessModal />
      </Suspense>
    </div>
  );
}
