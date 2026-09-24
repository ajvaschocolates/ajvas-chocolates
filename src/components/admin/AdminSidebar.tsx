"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingBag,
  Package,
  Tag,
  Users,
  Truck,
  Receipt,
  X,
  UserCheck,
} from "lucide-react";
import SignOutButton from "./SignOutButton";
import { BrandLogo } from "@/components/layout/brand-logo";

interface AdminSidebarProps {
  userEmail?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  userEmail,
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  interface NavItem {
    name: string;
    href: string;
    icon: typeof LayoutGrid;
    exact?: boolean;
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutGrid,
      exact: true,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tag,
    },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      name: "Couriers",
      href: "/admin/couriers",
      icon: Truck,
    },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-cocoa-950/60 z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Persistent Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-navy text-white flex flex-col border-r border-brand-navy/30 transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:h-screen md:shrink-0`}
      >
        {/* Brand Identity Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/admin" aria-label="AJVAS Admin Dashboard" className="shrink-0">
              <BrandLogo size="sm" />
            </Link>
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-pink border-l border-white/20 pl-3 py-1 font-bold">
              Operations
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden touch-target text-white/80 hover:text-white p-1 rounded"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-brand-pink/20 text-white border-l-4 border-brand-pink shadow-xs"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-brand-pink" : "text-white/70"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[11px] font-mono bg-brand-pink/20 text-brand-pink rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin Identity & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3 shrink-0">
          {userEmail && (
            <div className="flex items-center gap-2.5 px-2 text-xs">
              <UserCheck className="w-4 h-4 text-brand-pink shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] uppercase font-mono text-white/60">
                  Signed in as
                </span>
                <span className="font-medium text-white truncate block">
                  {userEmail}
                </span>
              </div>
            </div>
          )}
          <div className="pt-1">
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
