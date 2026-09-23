"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, RefreshCw } from "lucide-react";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Store Operations Overview",
  },
  "/admin/orders": {
    title: "Orders",
    subtitle: "Customer Consignments & Order Stream",
  },
  "/admin/products": {
    title: "Products",
    subtitle: "Confectionery Catalog & Packaging Specs",
  },
  "/admin/categories": {
    title: "Categories",
    subtitle: "Product Collections & Groupings",
  },
  "/admin/customers": {
    title: "Customers",
    subtitle: "Guest Checkout Customer Records",
  },
  "/admin/couriers": {
    title: "Couriers",
    subtitle: "Courier Partners & Service Services",
  },
  "/admin/shipping-rates": {
    title: "Shipping Rates",
    subtitle: "Pincode Logistics & Rate Matrix",
  },
};

export default function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const pathname = usePathname();
  const [refreshing, setRefreshing] = useState(false);

  const currentMeta = PAGE_META[pathname] || {
    title: "Admin Portal",
    subtitle: "Store Operations",
  };

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }

  return (
    <header className="h-20 bg-white border-b border-brand-sand/80 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden touch-target text-brand-navy hover:text-brand-pink p-2 -ml-2 rounded-full"
          aria-label="Open Navigation"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-brand-navy leading-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-brand-muted flex items-center gap-2 mt-0.5 font-medium">
            <span>{currentMeta.subtitle}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={handleRefresh}
          className="touch-target inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-brand-navy bg-brand-pink-light/50 hover:bg-brand-pink hover:text-white border border-brand-pink/30 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-pink cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
