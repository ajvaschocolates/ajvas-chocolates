"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Search, User, ArrowRight } from "lucide-react";
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
  const pathname = usePathname();
  const cart = useCart();
  const displayCartCount = cartCount !== undefined ? cartCount : cart.totalItemsCount;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Collections", href: "/shop" },
    { label: "Occasions", href: "/#occasions" },
    { label: "Our Story", href: "/#story" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-[#140b07]/95 backdrop-blur-md border-b border-[#2d1810] text-[#faf4f0] shadow-md">
      <AnnouncementBar />

      <Container className="h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Mobile Left Hamburger Menu Toggle */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="w-10 h-10 flex items-center justify-center p-2 text-[#faf4f0] hover:text-[#fb0b88] transition-colors rounded-full"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Brand Logo - Centered on Mobile, Left-aligned on Desktop */}
        <div className="flex items-center gap-8 lg:gap-12">
          <Link
            href="/"
            className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] rounded py-1"
            aria-label="AJVAS Chocolates Home"
          >
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`relative font-sans text-xs uppercase tracking-widest font-semibold transition-colors duration-200 py-2.5 whitespace-nowrap ${
                    isActive
                      ? "text-[#fb0b88] font-bold"
                      : "text-[#faf4f0]/85 hover:text-[#fb0b88]"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#fb0b88] rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Header Right Actions: Search, Account, Cart */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Toggle Button */}
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search catalog"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center p-2 text-[#faf4f0]/90 hover:text-[#fb0b88] transition-colors rounded-full hover:bg-white/5"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* User Account Link (Desktop) */}
          <Link
            href="/admin"
            aria-label="Account"
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center p-2 text-[#faf4f0]/90 hover:text-[#fb0b88] transition-colors rounded-full hover:bg-white/5"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          {/* Cart Icon / Bag */}
          {onOpenCart ? (
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Shopping bag, ${displayCartCount} items`}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center p-2 text-[#faf4f0]/90 hover:text-[#fb0b88] transition-colors rounded-full hover:bg-white/5"
            >
              <ShoppingBag className="w-5 h-5 text-[#faf4f0]" />
              {displayCartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[10px] font-bold text-white bg-[#fb0b88] rounded-full flex items-center justify-center shadow-md">
                  {displayCartCount}
                </span>
              )}
            </button>
          ) : (
            <Link
              href="/cart"
              aria-label={`Shopping bag, ${displayCartCount} items`}
              className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center p-2 text-[#faf4f0]/90 hover:text-[#fb0b88] transition-colors rounded-full hover:bg-white/5"
            >
              <ShoppingBag className="w-5 h-5 text-[#faf4f0]" />
              {displayCartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 text-[10px] font-bold text-white bg-[#fb0b88] rounded-full flex items-center justify-center shadow-md">
                  {displayCartCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </Container>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="bg-[#1c0e09] border-t border-b border-[#3d1c12] px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <Container>
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 max-w-2xl mx-auto">
              <Search className="w-4 h-4 text-[#c99d52] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chocolate hampers, truffles, dragees..."
                className="flex-1 bg-transparent font-sans text-sm text-[#faf4f0] placeholder:text-[#faf4f0]/50 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="font-sans text-xs uppercase tracking-wider font-semibold text-white px-4 py-1.5 bg-[#fb0b88] rounded-full hover:bg-[#d90974] shadow-md"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-[#faf4f0]/60 hover:text-[#faf4f0] p-1"
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
        <div className="lg:hidden fixed inset-0 top-[102px] z-40 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#170c08] border-b border-[#3d1c12] text-[#faf4f0] shadow-drawer p-6 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-3" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-lg font-bold text-[#faf4f0] hover:text-[#fb0b88] transition-colors py-2.5 flex items-center justify-between border-b border-[#2d1810] min-h-[44px]"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#fb0b88]" />
                </a>
              ))}
            </nav>
            <div className="pt-5 mt-2 text-xs text-[#faf4f0]/70 space-y-1">
              <p className="font-sans font-bold text-amber-200">Pan-India Delivery</p>
              <p className="font-sans text-[11px] text-[#faf4f0]/60">Keepsake Box • Temperature Controlled Packaging</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
