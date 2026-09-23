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
    {
      name: "Shipping Rates",
      href: "/admin/shipping-rates",
      icon: Receipt,
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-cocoa-900 text-parchment-surface flex flex-col border-r border-cocoa-800 transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:h-screen md:shrink-0`}
      >
        {/* Brand Identity Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-cocoa-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cocoa-800 border border-cocoa-700 flex items-center justify-center text-amber-100 font-serif font-bold text-sm tracking-wider shadow-inner">
              A
            </div>
            <div>
              <span className="font-serif font-bold text-base tracking-wide text-white block leading-tight">
                AJVAS
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200/70">
                Store Operations
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden touch-target text-cocoa-100 hover:text-white p-1 rounded"
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-cocoa-800 text-white border-l-4 border-amber-200 shadow-sm"
                    : "text-cocoa-100/80 hover:text-white hover:bg-cocoa-800/60"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-amber-200" : "text-cocoa-100/70"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[11px] font-mono bg-amber-200/20 text-amber-200 rounded font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Admin Identity & Logout */}
        <div className="p-4 border-t border-cocoa-800 bg-cocoa-950/40 space-y-3 shrink-0">
          {userEmail && (
            <div className="flex items-center gap-2.5 px-2 text-xs">
              <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] uppercase font-mono text-cocoa-100/60">
                  Signed in as
                </span>
                <span className="font-medium text-cocoa-100 truncate block">
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
