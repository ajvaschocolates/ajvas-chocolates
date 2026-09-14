import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "./brand-logo";

export function Footer() {
  return (
    <footer className="w-full bg-brand-surface border-t border-brand-sand pt-16 pb-12 text-brand-espresso">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-brand-sand">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <Link href="/" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded">
              <BrandLogo size="md" />
            </Link>
            <p className="font-sans text-sm text-brand-muted max-w-sm leading-relaxed mt-1">
              Chocolate confections and curated gift hampers for celebrations and thoughtful gestures.
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
                  Guest Checkout &amp; Order Tracking
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
            <span>Packaging for Transit</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
