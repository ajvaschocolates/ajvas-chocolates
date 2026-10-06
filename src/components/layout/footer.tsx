"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "./brand-logo";
import { getActiveCategories } from "@/lib/supabase/catalog";
import { Category } from "@/types/catalog";

const socials = [
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    label: "Facebook",
    path: "M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.415V8z",
  },
  {
    label: "YouTube",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "WhatsApp",
    path: "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.147 4.195 4.29-1.128z",
  },
];

const footerSections = [
  {
    key: "shop",
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
    ],
  },
  {
    key: "about",
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping & Delivery", href: "/shipping-delivery" },
      { label: "Refund & Returns", href: "/refund-returns" },
    ],
  },
  {
    key: "support",
    title: "Help",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Care & Instructions", href: "/care-instructions" },
    ],
  },
];

function SocialIcons() {
  return (
    <div className="flex items-center gap-3 mt-1 text-amber-200">
      {socials.map((s) => (
        <a
          key={s.label}
          href="#"
          aria-label={s.label}
          className="w-8 h-8 rounded-full bg-[#180e0a] flex items-center justify-center hover:bg-[#fb0b88] hover:text-white transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}

export interface FooterProps {
  categories?: Category[];
}

export function Footer({ categories: propCategories }: FooterProps = {}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState<Category[]>(propCategories || []);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      return;
    }

    let isMounted = true;
    getActiveCategories()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [propCategories]);

  const shopLinks = useMemo(() => {
    if (categories.length > 0) {
      return [
        { label: "All Products", href: "/shop" },
        ...categories.map((cat) => ({
          label: cat.name,
          href: `/shop?category=${encodeURIComponent(cat.id)}`,
        })),
      ];
    }
    return [{ label: "All Products", href: "/shop" }];
  }, [categories]);


  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 3500);
    }
  };

  const renderNewsletterForm = () => (
    <form onSubmit={handleSubscribe} className="relative w-full">
      <div className="relative flex items-center w-full">
        <input
          type="email"
          required
          value={newsletterEmail}
          onChange={(e) => setNewsletterEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full h-11 bg-[#180e0a] rounded-full pl-4 pr-12 text-xs text-[#faf4f0] placeholder:text-[#d0c4b8]/60 focus:outline-none focus:ring-1 focus:ring-amber-300/40 transition-colors shadow-inner"
        />
        <button
          type="submit"
          aria-label="Subscribe to newsletter"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#fb0b88] hover:bg-[#d90974] flex items-center justify-center text-white shadow-md transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          {subscribed ? (
            <Check className="w-4 h-4 text-white stroke-[2.5]" />
          ) : (
            <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
          )}
        </button>
      </div>
      {subscribed && (
        <p className="text-xs text-emerald-400 font-sans mt-2 transition-opacity">
          Thank you for subscribing!
        </p>
      )}
    </form>
  );

  return (
    <footer className="relative w-full bg-[#241610] pt-12 lg:pt-16 pb-10 text-[#faf4f0]">
      <Container>
        {/* Mobile View */}
        <div className="lg:hidden flex flex-col gap-6 pb-8">
          {/* Brand Info */}
          <div className="flex flex-col items-start gap-3">
            <Link href="/" aria-label="AJVAS Chocolates Home">
              <BrandLogo size="md" />
            </Link>
            <p className="font-sans text-xs text-[#d0c4b8]/80 max-w-sm leading-relaxed mt-1">
              Chocolates crafted for life&apos;s sweetest celebrations. Delivered with love across India.
            </p>
            <SocialIcons />
          </div>

          {/* Accordion Sections */}
          <div className="flex flex-col pt-2">
            {footerSections.map((sec) => {
              const isOpen = Boolean(openSections[sec.key]);
              const links = sec.key === "shop" ? shopLinks : sec.links;
              return (
                <div key={sec.key} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.key)}
                    className="w-full flex items-center justify-between font-pally text-base font-bold text-[#faf4f0] text-left"
                  >
                    <span>{sec.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#d0c4b8]/70 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#fb0b88]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <ul className="flex flex-col gap-2.5 pt-3 pb-1 text-xs text-[#d0c4b8]/80 font-sans font-normal">
                      {links.map((link) => (
                        <li key={link.label}>
                          <a href={link.href} className="hover:text-amber-200 transition-colors block py-0.5">
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Newsletter */}
          <div className="pt-2 flex flex-col gap-2.5 max-w-md w-full">
            <h3 className="font-pally text-base font-bold text-[#faf4f0]">Stay Sweet Updates</h3>
            <p className="font-sans text-xs text-[#d0c4b8]/80">Get exclusive offers and new arrivals.</p>
            <div className="mt-1">
              {renderNewsletterForm()}
            </div>
          </div>
        </div>

        {/* Desktop Footer View */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 xl:gap-12 pb-12">
          {/* Col 1: Brand Info & Socials */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <Link href="/" aria-label="AJVAS Chocolates Home">
              <BrandLogo size="md" />
            </Link>
            <p className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed">
              Chocolates crafted for life&apos;s sweetest celebrations. Delivered with love across India.
            </p>
            <SocialIcons />
          </div>

          {/* Col 2: Shop Links */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-pally text-base font-bold text-[#faf4f0]">Shop</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-[#d0c4b8]/80 font-sans font-normal">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-amber-200 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company Links */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-pally text-base font-bold text-[#faf4f0]">Company</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-[#d0c4b8]/80 font-sans font-normal">
              {footerSections[1].links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-amber-200 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Help Links */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <h3 className="font-pally text-base font-bold text-[#faf4f0]">Help</h3>
            <ul className="flex flex-col gap-2.5 text-xs text-[#d0c4b8]/80 font-sans font-normal">
              {footerSections[2].links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-amber-200 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Newsletter */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h3 className="font-pally text-base font-bold text-[#faf4f0]">Stay Sweet Updates</h3>
            <p className="font-sans text-xs text-[#d0c4b8]/80 leading-relaxed">
              Get exclusive offers and new arrivals.
            </p>
            <div className="mt-1 w-full">
              {renderNewsletterForm()}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#d0c4b8]/70 font-sans">
          <p>© {new Date().getFullYear()} AJVAS Chocolates. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-amber-200 transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="/terms-conditions" className="hover:text-amber-200 transition-colors">Terms &amp; Conditions</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}