"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "./brand-logo";

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const footerSections = [
    {
      key: "shop",
      title: "Shop",
      links: [
        { label: "All Products", href: "/shop" },
        { label: "Gift Hampers", href: "/shop" },
        { label: "Collections", href: "/shop" },
        { label: "Occasions", href: "/#occasions" },
      ],
    },
    {
      key: "about",
      title: "About",
      links: [
        { label: "Our Story", href: "/#story" },
        { label: "Ingredients", href: "/#story" },
        { label: "Packaging & Delivery", href: "/#gifting-experience" },
        { label: "Contact Us", href: "/#contact" },
      ],
    },
    {
      key: "support",
      title: "Support",
      links: [
        { label: "Track Order", href: "/shop" },
        { label: "Returns & Refunds", href: "/shop" },
        { label: "FAQs", href: "/shop" },
        { label: "Custom Orders", href: "/#contact" },
      ],
    },
  ];

  return (
    <footer className="relative w-full bg-[#faf4f0] border-t border-[#ebdcd3] pt-12 lg:pt-16 pb-10 text-brand-espresso">
      <Container>
        {/* Mobile Accordion Footer View */}
        <div className="lg:hidden flex flex-col gap-6 pb-8 border-b border-[#ebdcd3]">
          {/* Brand Info */}
          <div className="flex flex-col items-start gap-3">
            <Link href="/" aria-label="AJVAS Chocolates Home">
              <BrandLogo size="md" />
            </Link>
            <p className="font-sans text-xs text-brand-muted max-w-sm leading-relaxed mt-1">
              Chocolates crafted for life&apos;s sweetest celebrations. Delivered with love across India.
            </p>

            {/* Social Icons (Inline SVGs) */}
            <div className="flex items-center gap-3 mt-2 text-brand-pink">
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.415V8z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.147 4.195 4.29-1.128z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="flex flex-col border-t border-[#ebdcd3] pt-4">
            {footerSections.map((sec) => {
              const isOpen = Boolean(openSections[sec.key]);
              return (
                <div key={sec.key} className="border-b border-[#ebdcd3]/70 py-3">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.key)}
                    className="w-full flex items-center justify-between font-serif text-base font-bold text-brand-espresso text-left"
                  >
                    <span>{sec.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-pink" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <ul className="flex flex-col gap-2 pt-3 pb-1 text-xs text-brand-muted font-sans font-medium">
                      {sec.links.map((link) => (
                        <li key={link.label}>
                          <a href={link.href} className="hover:text-brand-pink transition-colors">
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
        </div>

        {/* Desktop Footer Grid View */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 pb-12 border-b border-[#ebdcd3]">
          {/* Brand Column */}
          <div className="lg:col-span-5 flex flex-col items-start gap-4">
            <Link href="/" aria-label="AJVAS Chocolates Home">
              <BrandLogo size="md" />
            </Link>
            <p className="font-sans text-xs text-brand-muted max-w-sm leading-relaxed">
              Chocolates crafted for life&apos;s sweetest celebrations. Delivered with love across India.
            </p>

            {/* Social Icons (Inline SVGs) */}
            <div className="flex items-center gap-3 mt-2 text-brand-pink">
              <a
                href="#"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.415V8z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-white border border-[#ebdcd3] flex items-center justify-center hover:bg-brand-pink hover:text-white transition-colors shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.147 4.195 4.29-1.128z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Nav Columns */}
          {footerSections.map((sec) => (
            <div key={sec.key} className="lg:col-span-2 flex flex-col gap-3">
              <h3 className="font-serif text-base font-bold text-brand-espresso">
                {sec.title}
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs text-brand-muted font-sans font-medium">
                {sec.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-brand-pink transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-brand-muted font-sans">
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
    </footer>
  );
}
