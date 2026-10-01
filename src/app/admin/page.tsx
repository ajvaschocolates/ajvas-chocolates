import { getAdminDashboardMetrics } from "@/lib/supabase/admin-orders";
import Link from "next/link";
import {
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  return (
    <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 flex-1">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-cocoa-950">
          Dashboard
        </h1>
        <p className="text-xs text-cocoa-600 mt-1">
          Store overview and recent order activity
        </p>
      </div>

      {/* Four Summary Boxes */}
      <section aria-label="Dashboard Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Box 1: Total Orders */}
        <div className="bg-parchment-surface border border-parchment-border rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cocoa-600 font-semibold">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-md bg-cocoa-100 flex items-center justify-center text-cocoa-800">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-3 mb-1">
            {metrics.totalOrdersCount}
          </div>
          <p className="text-[11px] text-cocoa-600">
            All-time store orders
          </p>
        </div>

        {/* Box 2: Total Revenue */}
        <div className="bg-parchment-surface border border-parchment-border rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cocoa-600 font-semibold">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-3 mb-1">
            ₹{Number(metrics.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-cocoa-600">
            Paid orders revenue
          </p>
        </div>

        {/* Box 3: Total Completed Orders */}
        <div className="bg-parchment-surface border border-parchment-border rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cocoa-600 font-semibold">
              Total Completed Orders
            </span>
            <div className="w-8 h-8 rounded-md bg-status-greenBg text-status-greenText flex items-center justify-center border border-status-greenBorder">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-3 mb-1">
            {metrics.totalCompletedOrdersCount}
          </div>
          <p className="text-[11px] text-cocoa-600">
            Delivered orders
          </p>
        </div>

        {/* Box 4: Total Pending Orders */}
        <div className="bg-parchment-surface border border-parchment-border rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cocoa-600 font-semibold">
              Total Pending Orders
            </span>
            <div className="w-8 h-8 rounded-md bg-status-amberBg text-status-amberText flex items-center justify-center border border-status-amberBorder">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-3 mb-1">
            {metrics.totalPendingOrdersCount}
          </div>
          <p className="text-[11px] text-cocoa-600">
            Awaiting fulfillment
          </p>
        </div>
      </section>

      {/* Recent Orders Section */}
      <section
        aria-labelledby="recentOrdersHeading"
        className="bg-parchment-surface border border-parchment-border rounded-lg shadow-2xs overflow-hidden"
      >
        <div className="p-4 sm:px-6 border-b border-parchment-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-parchment-muted/50">
          <div>
            <h2
              id="recentOrdersHeading"
              className="text-base font-serif font-bold text-cocoa-950"
            >
              Recent Orders
            </h2>
            <p className="text-xs text-cocoa-600">
              Latest orders placed on the store
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {metrics.recentOrders.length === 0 ? (
          <div className="p-12 text-center text-cocoa-600 space-y-2">
            <ShoppingBag className="w-10 h-10 text-cocoa-400 mx-auto mb-2" />
            <p className="font-serif text-base font-bold text-cocoa-950">No orders recorded yet</p>
            <p className="text-xs text-cocoa-600 max-w-sm mx-auto">
              Guest checkout orders will automatically appear here once placed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-parchment-border bg-parchment-surface font-mono text-[11px] uppercase tracking-wider text-cocoa-600">
                  <th scope="col" className="py-3 px-4 sm:px-6 font-semibold">
                    Order #
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold">
                    Customer
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold">
                    Destination
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold">
                    Date
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-right">
                    Total
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-center">
                    Payment
                  </th>
                  <th scope="col" className="py-3 px-4 font-semibold text-center">
                    Order Status
                  </th>
                  <th scope="col" className="py-3 px-4 sm:px-6 font-semibold text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-border bg-parchment-surface">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-parchment-muted/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-cocoa-950">
                      {order.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-cocoa-950">
                        {order.customer_name || "Guest Customer"}
                      </div>
                      <div className="text-[11px] text-cocoa-600 font-mono">
                        {order.customer_phone || "—"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-cocoa-950">
                        {[order.shipping_district || order.shipping_city, order.shipping_state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </div>
                      <div className="text-[11px] text-cocoa-600 font-mono">
                        {order.shipping_pincode || ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-cocoa-700 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cocoa-950">
                      ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          order.payment_status === "paid"
                            ? "bg-status-greenBg text-status-greenText border border-status-greenBorder"
                            : order.payment_status === "failed"
                            ? "bg-status-redBg text-status-redText border border-status-redBorder"
                            : "bg-status-amberBg text-status-amberText border border-status-amberBorder"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-parchment-muted text-cocoa-900 border border-parchment-border">
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="touch-target px-3 py-1 bg-parchment-surface hover:bg-parchment-muted text-cocoa-900 border border-parchment-line rounded font-semibold text-xs transition-colors"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
