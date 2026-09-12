import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="w-full bg-brand-surface border-t border-brand-sand pt-16 pb-12 text-brand-espresso">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-brand-sand">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1V5QclwgV3AsP6gnpCfo8Asi-7cjnIy1vviI_KaGkOnzp_Akf-JTQPIDTVG5aOLypZVYL6uC5EW9L33oXDpiXCrnd0j1eWl6h8aP_-aggoEyrUcHeFIE-g0I6mDRLJ9VxFGU6jvuBssX_AuHSGpjQNn6BFD2NCtaMNts5ODqzG8cp0l5X6rn6mpPKbTESqatZdyZaxyeZIj87u_sRKv1ZSkBk9H_6MRyqk1-VjIJlFzPtb9H7pYX14UFLY"
                alt="AJVAS Chocolates logo"
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-brand-espresso leading-none">
                  AJVAS
                </span>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mt-1 leading-none">
                  Chocolates
                </span>
              </div>
            </Link>
            <p className="font-sans text-sm text-brand-muted max-w-sm leading-relaxed mt-1">
              Handcrafted chocolate confections and curated gift hampers for celebrations and thoughtful gestures.
            </p>
          </div>

          {/* Collections Column */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-serif text-base font-semibold text-brand-espresso">
              Collections
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-muted font-sans">
              <li>
                <a href="#collections" className="hover:text-brand-burgundy transition-colors">
                  Gift Hampers
                </a>
              </li>
              <li>
                <a href="#gifts" className="hover:text-brand-burgundy transition-colors">
                  Bonbon Boxes
                </a>
              </li>
              <li>
                <a href="#gifts" className="hover:text-brand-burgundy transition-colors">
                  Roasted Dragees
                </a>
              </li>
              <li>
                <a href="#gifts" className="hover:text-brand-burgundy transition-colors">
                  Dates &amp; Nut Boxes
                </a>
              </li>
            </ul>
          </div>

          {/* Occasions Column */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="font-serif text-base font-semibold text-brand-espresso">
              Occasions
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-muted font-sans">
              <li>
                <a href="#occasions" className="hover:text-brand-burgundy transition-colors">
                  Festive Celebrations
                </a>
              </li>
              <li>
                <a href="#occasions" className="hover:text-brand-burgundy transition-colors">
                  Weddings &amp; Anniversaries
                </a>
              </li>
              <li>
                <a href="#occasions" className="hover:text-brand-burgundy transition-colors">
                  Milestone Birthdays
                </a>
              </li>
              <li>
                <a href="#occasions" className="hover:text-brand-burgundy transition-colors">
                  Corporate &amp; Festive Gifts
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Inquiries & Support */}
          <div className="lg:col-span-3 flex flex-col gap-3" id="contact">
            <h3 className="font-serif text-base font-semibold text-brand-espresso">
              Customer Support
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-brand-muted font-sans">
              <li>
                <a href="#story" className="hover:text-brand-burgundy transition-colors">
                  Our Gifting Philosophy
                </a>
              </li>
              <li>
                <a href="#pincode" className="hover:text-brand-burgundy transition-colors">
                  Check Delivery Availability
                </a>
              </li>
              <li>
                <span className="text-brand-muted">
                  Pan-India Courier Dispatch
                </span>
              </li>
              <li>
                <span className="text-brand-muted">
                  Guest Checkout with Instant Order Tracking
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted font-sans">
          <p>© {new Date().getFullYear()} AJVAS CHOCOLATES. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Direct Delivery across India</span>
            <span>•</span>
            <span>Carefully Packaged</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
