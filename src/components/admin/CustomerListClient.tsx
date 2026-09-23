"use client";

import { useState } from "react";
import { Customer } from "@/types/logistics";
import { Users, Search, ShoppingBag } from "lucide-react";

interface CustomerListClientProps {
  initialCustomers: Customer[];
}

export default function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.full_name.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q) || false;
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-cocoa-600 mb-1">
            <span>Store Operations</span>
            <span>/</span>
            <span className="text-cocoa-950 font-medium">Customers</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-cocoa-950 tracking-tight">
            Guest Customers
          </h1>
          <p className="text-sm text-cocoa-600 mt-0.5">
            View guest checkout recipient profiles and order histories.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cocoa-600">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer name, phone, or email..."
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-parchment-surface border border-parchment-border rounded text-cocoa-950 placeholder-cocoa-600/70 focus:outline-none focus:border-cocoa-700 min-h-[44px]"
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="p-12 text-center bg-parchment-surface rounded border border-dashed border-parchment-border space-y-3">
          <Users className="w-10 h-10 text-cocoa-400 mx-auto" />
          <h3 className="font-sans text-lg font-bold text-cocoa-950">No customers found</h3>
          <p className="text-sm text-cocoa-600 max-w-sm mx-auto">
            {customers.length === 0
              ? "Guest customer profiles will automatically populate here upon placing orders."
              : "No customer records match your active search query."}
          </p>
        </div>
      ) : (
        <div className="bg-parchment-surface border border-parchment-border rounded shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-parchment-muted/60 border-b border-parchment-border font-mono text-[11px] uppercase tracking-wider text-cocoa-600">
                  <th scope="col" className="py-3.5 pl-4 pr-3">Customer Name</th>
                  <th scope="col" className="py-3.5 px-3">Mobile Phone</th>
                  <th scope="col" className="py-3.5 px-3">Email Address</th>
                  <th scope="col" className="py-3.5 px-3 text-center">Orders Placed</th>
                  <th scope="col" className="py-3.5 pl-3 pr-4 text-right">First Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-border">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-parchment-muted/30 transition-colors">
                    <td className="py-3.5 pl-4 pr-3 font-semibold text-cocoa-950 text-sm">
                      {c.full_name}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-cocoa-900">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-cocoa-700">
                      {c.email || "Not provided"}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-cocoa-950">
                      {c.order_count || 0}
                    </td>
                    <td className="py-3.5 pl-3 pr-4 text-right font-mono text-cocoa-600 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
