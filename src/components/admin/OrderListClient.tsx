"use client";

import { useState } from "react";
import Link from "next/link";
import { Order } from "@/types/orders";
import {
  Search,
  ShoppingBag,
  RotateCcw,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface OrderListClientProps {
  initialOrders: Order[];
}

export default function OrderListClient({ initialOrders }: OrderListClientProps) {
  const [orders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.order_status === "pending").length;
  const processingCount = orders.filter((o) => o.order_status === "processing").length;
  const shippedCount = orders.filter((o) => o.order_status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.order_status === "delivered").length;
  const failedCount = orders.filter((o) => o.payment_status === "failed").length;

  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.toLowerCase().includes(q);
      const matchPin = o.shipping_pincode.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone && !matchPin) return false;
    }

    if (statusFilter !== "ALL" && o.order_status !== statusFilter) return false;
    if (paymentFilter !== "ALL" && o.payment_status !== paymentFilter) return false;

    return true;
  });

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-parchment-border">
        <div>
          <div className="flex items-center gap-2 text-xs text-cocoa-600 mb-1">
            <span>Store Operations</span>
            <span>/</span>
            <span className="text-cocoa-950 font-medium">Orders</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-cocoa-950 tracking-tight">
            Store Orders
          </h1>
          <p className="text-sm text-cocoa-600 mt-0.5">
            Manage guest checkout orders, shipping dispatch, and order fulfillment.
          </p>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-border">
          <span className="block text-xs font-medium text-cocoa-600">Total Orders</span>
          <span className="block text-xl font-bold text-cocoa-950 mt-0.5">{totalCount}</span>
        </div>
        <div className="p-3 bg-amber-50/60 rounded border border-amber-200">
          <span className="block text-xs font-medium text-amber-800">Pending</span>
          <span className="block text-xl font-bold text-amber-950 mt-0.5">{pendingCount}</span>
        </div>
        <div className="p-3 bg-blue-50/60 rounded border border-blue-200">
          <span className="block text-xs font-medium text-blue-800">Processing</span>
          <span className="block text-xl font-bold text-blue-950 mt-0.5">{processingCount}</span>
        </div>
        <div className="p-3 bg-purple-50/60 rounded border border-purple-200">
          <span className="block text-xs font-medium text-purple-800">Shipped</span>
          <span className="block text-xl font-bold text-purple-950 mt-0.5">{shippedCount}</span>
        </div>
        <div className="p-3 bg-emerald-50/60 rounded border border-emerald-200">
          <span className="block text-xs font-medium text-emerald-800">Delivered</span>
          <span className="block text-xl font-bold text-emerald-950 mt-0.5">{deliveredCount}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cocoa-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, customer name, phone, or pincode..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-parchment-surface border border-parchment-border rounded text-cocoa-950 placeholder-cocoa-600/70 focus:outline-none focus:border-cocoa-700 min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none min-h-[44px]"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none min-h-[44px]"
          >
            <option value="ALL">All Payment States</option>
            <option value="pending">Payment Pending</option>
            <option value="paid">Payment Paid</option>
            <option value="failed">Payment Failed</option>
          </select>

          {(searchQuery || statusFilter !== "ALL" || paymentFilter !== "ALL") && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-medium text-cocoa-600 hover:text-cocoa-950 bg-parchment-muted rounded border border-parchment-line transition-colors flex items-center gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 px-4 text-center bg-parchment-surface rounded border border-dashed border-parchment-border space-y-3">
          <ShoppingBag className="w-10 h-10 text-cocoa-400 mx-auto" />
          <h3 className="font-sans text-lg font-bold text-cocoa-950">No orders found</h3>
          <p className="text-sm text-cocoa-600 max-w-sm mx-auto">
            {orders.length === 0
              ? "No store orders have been recorded in the database yet."
              : "No orders match your active search and status filter parameters."}
          </p>
        </div>
      ) : (
        <div className="bg-parchment-surface border border-parchment-border rounded shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-parchment-muted/60 border-b border-parchment-border text-[11px] font-bold uppercase tracking-wider text-cocoa-600">
                  <th scope="col" className="py-3.5 pl-4 pr-3">Order Number</th>
                  <th scope="col" className="py-3.5 px-3">Customer</th>
                  <th scope="col" className="py-3.5 px-3">Destination</th>
                  <th scope="col" className="py-3.5 px-3">Date</th>
                  <th scope="col" className="py-3.5 px-3 text-right">Total Amount</th>
                  <th scope="col" className="py-3.5 px-3 text-center">Payment</th>
                  <th scope="col" className="py-3.5 px-3 text-center">Order Status</th>
                  <th scope="col" className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-border">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-parchment-muted/30 transition-colors">
                    <td className="py-3.5 pl-4 pr-3 font-mono font-bold text-cocoa-950">
                      {o.order_number}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-cocoa-950">{o.customer_name}</div>
                      <div className="text-[11px] text-cocoa-600 font-mono">{o.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-3 text-cocoa-800">
                      <div>{o.shipping_district}, {o.shipping_state}</div>
                      <div className="text-[11px] text-cocoa-600 font-mono">{o.shipping_pincode}</div>
                    </td>
                    <td className="py-3.5 px-3 text-cocoa-700 whitespace-nowrap font-mono">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-cocoa-950">
                      ₹{Number(o.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          o.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : o.payment_status === "failed"
                            ? "bg-rose-100 text-rose-900 border border-rose-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-parchment-muted text-cocoa-900 border border-parchment-border">
                        {o.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 pr-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-parchment-line bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-950 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
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
