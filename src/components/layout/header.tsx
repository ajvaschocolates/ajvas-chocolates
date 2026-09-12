"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { AnnouncementBar } from "./announcement-bar";

export interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export function Header({ cartCount = 0, onOpenCart }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Shop", href: "#gifts" },
    { label: "Collections", href: "#collections" },
    { label: "Occasions", href: "#occasions" },
    { label: "Our Story", href: "#story" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-brand-cream/95 backdrop-blur-md border-b border-brand-sand/80 shadow-subtle">
      <AnnouncementBar />

      <Container className="h-20 flex items-center justify-between gap-6">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 -ml-2 text-brand-espresso hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.slice(0, 4).map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans text-xs uppercase tracking-widest font-semibold text-brand-muted hover:text-brand-espresso transition-colors duration-200 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Brand Logo & Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-3 text-center lg:text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded"
          aria-label="AJVAS Chocolates Home"
        >
          <img
            src="https://lh3.googleusercontent.com/aida/AEtjO1V5QclwgV3AsP6gnpCfo8Asi-7cjnIy1vviI_KaGkOnzp_Akf-JTQPIDTVG5aOLypZVYL6uC5EW9L33oXDpiXCrnd0j1eWl6h8aP_-aggoEyrUcHeFIE-g0I6mDRLJ9VxFGU6jvuBssX_AuHSGpjQNn6BFD2NCtaMNts5ODqzG8cp0l5X6rn6mpPKbTESqatZdyZaxyeZIj87u_sRKv1ZSkBk9H_6MRyqk1-VjIJlFzPtb9H7pYX14UFLY"
            alt="AJVAS Chocolates crest logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col items-start">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-espresso leading-none">
              AJVAS
            </span>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mt-1 leading-none">
              Chocolates
            </span>
          </div>
        </Link>

        {/* Right Actions: Contact & Bag */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="#contact"
            className="hidden md:inline-block font-sans text-xs uppercase tracking-widest font-semibold text-brand-muted hover:text-brand-espresso transition-colors duration-200 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded-sm"
          >
            Contact
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Shopping bag, ${cartCount} items`}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 p-2 font-sans text-xs uppercase tracking-wider font-semibold text-brand-espresso hover:text-brand-burgundy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy rounded"
          >
            <ShoppingBag className="w-5 h-5 text-brand-espresso" />
            <span className="hidden sm:inline">Bag</span>
            <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold text-brand-cream bg-brand-cocoa rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[114px] z-40 bg-brand-espresso/50 backdrop-blur-sm">
          <div className="bg-brand-cream border-b border-brand-sand/80 shadow-drawer p-6 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-4" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-lg font-medium text-brand-espresso hover:text-brand-burgundy transition-colors py-2 flex items-center justify-between border-b border-brand-sand/40 min-h-[44px]"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </a>
              ))}
            </nav>
            <div className="pt-2 text-xs text-brand-muted">
              <p className="font-sans">Pan-India Courier Delivery</p>
              <p className="font-sans text-[11px] mt-1 text-brand-muted/80">Guest Checkout • Packaging for Transit</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
