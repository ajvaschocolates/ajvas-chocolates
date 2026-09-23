import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "./brand-logo";

export function Footer() {
  return (
    <footer className="relative w-full bg-[#fdf2f5] border-t border-brand-sand/80 pt-16 pb-12 text-brand-navy">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-brand-sand/80">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <Link href="/" aria-label="AJVAS Chocolates Home" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded">
              <BrandLogo size="md" />
            </Link>
            <p className="font-sans text-sm text-brand-muted max-w-sm leading-relaxed mt-1">
              Chocolates crafted for life&apos;s sweetest celebrations. Delivered with love across India.
            </p>
          </div>

          {/* Shop Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Shop
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-muted font-sans font-medium">
              <li>
                <Link href="/shop" className="hover:text-brand-pink transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <a href="#collections" className="hover:text-brand-pink transition-colors">
                  Gift Hampers
                </a>
              </li>
              <li>
                <a href="#collections" className="hover:text-brand-pink transition-colors">
                  Collections
                </a>
              </li>
              <li>
                <a href="#occasions" className="hover:text-brand-pink transition-colors">
                  Occasions
                </a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              About
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-muted font-sans font-medium">
              <li>
                <a href="#story" className="hover:text-brand-pink transition-colors">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-brand-pink transition-colors">
                  Ingredients
                </a>
              </li>
              <li>
                <a href="#pincode" className="hover:text-brand-pink transition-colors">
                  Shipping &amp; Delivery
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-brand-pink transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-2 flex flex-col gap-3" id="contact">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-muted font-sans font-medium">
              <li>
                <a href="#pincode" className="hover:text-brand-pink transition-colors">
                  Track Order
                </a>
              </li>
              <li>
                <a href="#pincode" className="hover:text-brand-pink transition-colors">
                  Returns &amp; Refunds
                </a>
              </li>
              <li>
                <a href="#pincode" className="hover:text-brand-pink transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-brand-pink transition-colors">
                  Custom Orders
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-serif text-lg font-bold text-brand-navy">
              Follow Us
            </h3>
            <div className="flex items-center gap-3 text-brand-pink">
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors">
                <span className="font-bold text-xs">IG</span>
              </a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors">
                <span className="font-bold text-xs">FB</span>
              </a>
              <a href="#" aria-label="YouTube" className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors">
                <span className="font-bold text-xs">YT</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted font-sans font-medium">
          <p>© {new Date().getFullYear()} AJVAS Chocolates. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-brand-pink">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-brand-pink">Terms of Service</a>
            <span>|</span>
            <a href="#" className="hover:text-brand-pink">Cookie Policy</a>
          </div>
        </div>
      </Container>

      {/* Floating Chat/Support Action Widget */}
      <button
        type="button"
        aria-label="Customer support widget"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-brand-pink text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      >
        <span className="font-bold text-sm">💬</span>
      </button>
    </footer>
  );
}
