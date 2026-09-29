"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Heart, Search, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "./brand-logo";
import { useCart } from "@/context/cart-context";

export interface SearchSuggestion {
  label: string;
  href?: string; // defaults to /shop?q=<label>
}

export interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  /** If provided, clicking the bag calls this instead of opening the built-in right drawer */
  onOpenCart?: () => void;
  /** Custom content for the built-in right cart drawer (e.g. your cart items list) */
  cartContent?: ReactNode;
  /** Products / keywords used for search suggestions */
  suggestions?: SearchSuggestion[];
}

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/shop" },
  { label: "Occasions", href: "/#occasions" },
  { label: "Our Story", href: "/#story" },
];

// Fallback suggestions – replace with real product names via the `suggestions` prop
const defaultSuggestions: SearchSuggestion[] = [
  { label: "Chocolate hampers" },
  { label: "Truffles" },
  { label: "Dragees" },
  { label: "Dark chocolate" },
  { label: "Gift boxes" },
  { label: "Wedding favours" },
  { label: "Diwali gifts" },
  { label: "Birthday hampers" },
];

const iconBtn =
  "relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white hover:text-[#fb0b88] transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] shrink-0";

export function Header({
  cartCount,
  wishlistCount = 0,
  onOpenCart,
  cartContent,
  suggestions = defaultSuggestions,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();
  const displayCartCount = cartCount !== undefined ? cartCount : cart.totalItemsCount;

  const anyOpen = menuOpen || searchOpen || cartOpen;

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  }, [pathname]);

  // Escape closes panels + lock page scroll while a panel is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [anyOpen]);

  // Hide navbar on scroll down, reveal on scroll up or after scrolling stops
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setNavVisible(true);
      } else if (currentY > lastScrollY.current + 5) {
        setNavVisible(false);
      } else if (currentY < lastScrollY.current - 5) {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;

      // Bring navbar back to same position once scrolling pauses
      clearTimeout(timer);
      timer = setTimeout(() => {
        setNavVisible(true);
      }, 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Focus the search input when the search modal opens
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    setQuery("");
  }, [searchOpen]);

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return suggestions.slice(0, 6);
    const q = trimmed.toLowerCase();
    return suggestions.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 8);
  }, [trimmed, suggestions]);

  const goToSearch = (q: string, href?: string) => {
    setSearchOpen(false);
    router.push(href ?? `/shop?q=${encodeURIComponent(q)}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed) goToSearch(trimmed);
  };

  const handleCartClick = () => {
    if (onOpenCart) onOpenCart();
    else setCartOpen(true);
  };

  const cartLabel = `Shopping bag, ${displayCartCount} items`;

  const badge = (n: number) =>
    n > 0 ? (
      <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-[#fb0b88] rounded-full flex items-center justify-center">
        {n}
      </span>
    ) : null;

  return (
    <header className="fixed top-0 left-0 w-full z-[100] text-white pointer-events-none">

      {/* Centered glass navbar pill */}
      <div
        className={`flex justify-center px-2 sm:px-4 pt-3 sm:pt-5 pointer-events-auto transition-transform duration-300 ease-in-out ${
          navVisible ? "translate-y-0" : "-translate-y-[150%]"
        }`}
      >
        <div className="w-full max-w-3xl h-16 sm:h-16 flex items-center justify-between px-3 sm:px-5 rounded-md sm:rounded-2xl bg-white/10 backdrop-blur-md shadow-lg shadow-black/20">
          {/* Left actions: Menubar & Search */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className={iconBtn}
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              aria-expanded={searchOpen}
              className={iconBtn}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>

          {/* Centered Brand Logo */}
          <Link
            href="/"
            aria-label="AJVAS Chocolates Home"
            className="flex items-center justify-center shrink min-w-0 px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] rounded"
          >
            <BrandLogo size="md" />
          </Link>

          {/* Right actions: Wishlist & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${wishlistCount} items`}
              className={iconBtn}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              {badge(wishlistCount)}
            </Link>
            <button type="button" onClick={handleCartClick} aria-label={cartLabel} className={iconBtn}>
              <ShoppingBag className="w-5 h-5 text-white" />
              {badge(displayCartCount)}
            </button>
          </div>
        </div>
      </div>

      {/* ───────── Desktop Left Menu Drawer (untouched on desktop) ───────── */}
      <div
        className={`hidden sm:block fixed inset-0 z-[150] transition-all duration-300 pointer-events-auto ${
          menuOpen ? "visible" : "invisible pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute left-0 top-0 h-full min-h-[100dvh] w-[300px] max-w-[85vw] bg-black border-r border-white/10 flex flex-col shadow-2xl transition-transform duration-300 z-10 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Navigation menu"
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
            <span className="font-heading text-sm font-normal">Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation menu"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:text-[#fb0b88] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5 py-3 space-y-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`font-heading text-md py-2.5 flex items-center transition-colors hover:text-[#fb0b88] ${
                    isActive ? "text-[#fb0b88]" : "text-white"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>

      {/* ───────── Mobile Fullscreen Menu with Motion Animation (only on mobile) ───────── */}
      <div className="sm:hidden">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[150] bg-[#120805]/95 backdrop-blur-xl flex flex-col pointer-events-auto text-white"
            >
              {/* Top Bar with Close button (borderless) */}
              <div className="w-full flex items-center justify-between px-6 pt-6">
                <span className="font-heading text-sm uppercase tracking-widest text-white/50">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white/80 hover:text-[#fb0b88] hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Centered navigation items cascading one by one with motion */}
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <motion.nav
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: 0.1,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col items-center justify-center space-y-5 text-center"
                  aria-label="Main Navigation"
                >
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                    return (
                      <motion.div
                        key={link.label}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          show: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.35, ease: "easeOut" },
                          },
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className={`font-heading text-2xl tracking-wide transition-all duration-200 block py-1.5 px-4 ${
                            isActive
                              ? "text-[#fb0b88] font-semibold"
                              : "text-white/90 hover:text-[#fb0b88]"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ───────── Centered search modal with suggestions ───────── */}
      <div
        className={`fixed inset-0 z-[150] flex items-start justify-center px-4 pt-[12vh] transition-all duration-200 pointer-events-auto ${
          searchOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        aria-hidden={!searchOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close search"
          onClick={() => setSearchOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className={`relative w-full max-w-2xl transition-transform duration-200 ${
            searchOpen ? "translate-y-0" : "-translate-y-3"
          }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="flex items-center gap-3 bg-white text-[#262626] rounded-full h-14 pl-5 pr-2 shadow-2xl"
          >
            <Search className="w-5 h-5 text-[#262626]/60 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chocolates, hampers, truffles..."
              aria-label="Search products"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent font-sans text-base placeholder:text-[#262626]/50 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#262626]/60 hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="h-10 px-5 rounded-full bg-[#fb0b88] hover:bg-[#d90974] text-white font-sans text-sm font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Suggestions */}
          <div className="mt-3 bg-white text-[#262626] rounded-2xl shadow-2xl overflow-hidden">
            <p className="px-5 pt-4 pb-2 font-sans text-xs font-semibold text-[#262626]/55">
              {trimmed ? "Suggestions" : "Popular searches"}
            </p>
            {filtered.length > 0 ? (
              <ul className="pb-2">
                {filtered.map((s) => (
                  <li key={s.label}>
                    <button
                      type="button"
                      onClick={() => goToSearch(s.label, s.href)}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-left font-sans text-sm hover:bg-[#fb0b88]/10 transition-colors"
                    >
                      <Search className="w-4 h-4 text-[#262626]/40 shrink-0" />
                      <span>{s.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 pb-4 font-sans text-sm text-[#262626]/60">
                No matches. Press Enter to search the shop for “{trimmed}”.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ───────── Right cart drawer ───────── */}
      {!onOpenCart && (
        <div
          className={`fixed inset-0 z-[150] transition-all duration-300 pointer-events-auto ${
            cartOpen ? "visible" : "invisible pointer-events-none"
          }`}
          aria-hidden={!cartOpen}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
            className={`absolute inset-0 bg-black/60 cursor-default transition-opacity duration-300 ${
              cartOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            className={`absolute right-0 top-0 h-full min-h-[100dvh] w-[400px] max-w-[90vw] bg-[#120805] text-white shadow-2xl flex flex-col transition-transform duration-300 ${
              cartOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between h-16 px-5">
              <span className="font-heading text-lg">
                Your bag ({displayCartCount})
              </span>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:text-[#fb0b88] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cartContent ??
                (displayCartCount === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <ShoppingBag className="w-10 h-10 text-white/30" />
                    <p className="font-heading text-sm text-white/70">Your bag is empty.</p>
                    <Link
                      href="/shop"
                      onClick={() => setCartOpen(false)}
                      className="font-heading text-sm text-[#fb0b88] hover:underline"
                    >
                      Start shopping
                    </Link>
                  </div>
                ) : (
                  <p className="font-heading text-sm text-white/70">
                    You have {displayCartCount} item{displayCartCount > 1 ? "s" : ""} in your bag.
                  </p>
                ))}
            </div>

            {displayCartCount > 0 && (
              <div className="px-5 py-4 grid gap-2">
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="h-11 flex items-center justify-center rounded-full bg-[#fb0b88] hover:bg-[#d90974] text-white font-heading text-sm transition-colors"
                >
                  View bag &amp; checkout
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}