"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, ArrowRight, Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { AnnouncementBar } from "./announcement-bar";
import { BrandLogo } from "./brand-logo";
import { useCart } from "@/context/cart-context";

export interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
}

export function Header({ cartCount, onOpenCart }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const cart = useCart();
  const displayCartCount = cartCount !== undefined ? cartCount : cart.totalItemsCount;

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/shop" },
    { label: "Occasions", href: "/#occasions" },
    { label: "Our Story", href: "/#story" },
    { label: "Contact", href: "/#contact" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-brand-sand/80 shadow-subtle">
      <AnnouncementBar />

      <Container className="h-20 sm:h-24 flex items-center justify-between gap-4 lg:gap-8">
        {/* Left Side: Brand Logo & Desktop Navigation */}
        <div className="flex items-center gap-6 lg:gap-10 xl:gap-12 min-w-0">
          <Link
            href="/"
            className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded shrink-0 py-1"
            aria-label="AJVAS Chocolates Home"
          >
            <BrandLogo size="lg" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Main Navigation">
            {navLinks.slice(0, 4).map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-sans text-xs uppercase tracking-widest font-bold text-brand-navy/80 hover:text-brand-pink transition-colors duration-200 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-sm whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right Side: Search, Contact & Bag controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Search Toggle Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search catalog"
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 text-brand-navy hover:text-brand-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-full"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Contact Link (Desktop) */}
          <Link
            href="/#contact"
            className="hidden md:inline-block font-sans text-xs uppercase tracking-widest font-bold text-brand-navy/80 hover:text-brand-pink transition-colors duration-200 py-2 px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-sm"
          >
            Contact
          </Link>

          {/* Shopping Bag Button / Link */}
          {onOpenCart ? (
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Shopping bag, ${displayCartCount} items`}
              className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center gap-2 p-2 font-sans text-xs uppercase tracking-wider font-bold text-brand-navy hover:text-brand-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-full"
            >
              <ShoppingBag className="w-5 h-5 text-brand-navy" />
              <span className="hidden sm:inline">Bag</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-extrabold text-white bg-brand-pink rounded-full shadow-xs">
                {displayCartCount}
              </span>
            </button>
          ) : (
            <Link
              href="/cart"
              aria-label={`Shopping bag, ${displayCartCount} items`}
              className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center gap-2 p-2 font-sans text-xs uppercase tracking-wider font-bold text-brand-navy hover:text-brand-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-full"
            >
              <ShoppingBag className="w-5 h-5 text-brand-navy" />
              <span className="hidden sm:inline">Bag</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-extrabold text-white bg-brand-pink rounded-full shadow-xs">
                {displayCartCount}
              </span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 text-brand-navy hover:text-brand-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-full"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="bg-white border-t border-b border-brand-sand/80 px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <Container>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
              <Search className="w-4 h-4 text-brand-muted shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chocolate gift hampers, bonbons, roasted dragees..."
                className="flex-1 bg-transparent font-sans text-sm text-brand-navy placeholder:text-brand-muted/70 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="font-sans text-xs uppercase tracking-wider font-semibold text-white px-4 py-1.5 bg-brand-pink rounded-full hover:bg-brand-pink-hover shadow-xs"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-brand-muted hover:text-brand-navy p-1"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </Container>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[114px] sm:top-[122px] z-40 bg-brand-navy/40 backdrop-blur-sm">
          <div className="bg-white border-b border-brand-sand/80 shadow-drawer p-6 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-4" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-lg font-bold text-brand-navy hover:text-brand-pink transition-colors py-2 flex items-center justify-between border-b border-brand-sand/40 min-h-[44px]"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-brand-pink" />
                </a>
              ))}
            </nav>
            <div className="pt-4 text-xs text-brand-muted">
              <p className="font-sans font-bold text-brand-navy">Pan-India Courier Delivery</p>
              <p className="font-sans text-[11px] mt-1 text-brand-muted/80">Guest Checkout • Temperature Controlled Packaging</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

