import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAdminDashboardMetrics } from "@/lib/supabase/admin-orders";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Truck,
  TrendingUp,
  ShoppingBag,
  Users,
  ShieldCheck,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const metrics = await getAdminDashboardMetrics();
  const actionItemsCount =
    metrics.ordersToProcessCount +
    metrics.paymentIssuesCount +
    metrics.shippingHoldsCount +
    metrics.missingTrackingCount +
    metrics.lowStockCount;

  return (
    <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8 flex-1">
      {/* SECTION 1: ATTENTION / ACTION TRIAGE */}
      <section aria-labelledby="triageHeading">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2
              id="triageHeading"
              className="text-xs font-mono uppercase tracking-wider text-cocoa-600 font-semibold"
            >
              Triage &amp; Operational Action Items
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-burgundy/10 text-burgundy">
              {actionItemsCount} {actionItemsCount === 1 ? "Item" : "Items"} Requiring Attention
            </span>
          </div>
          <span className="text-xs text-cocoa-600 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live Database Sync
          </span>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Orders to Process */}
          <Link
            href="/admin/orders"
            className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors block group"
          >
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight group-hover:text-cocoa-950">
              Orders to Process
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              {metrics.ordersToProcessCount}
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Paid / Pending
            </div>
          </Link>

          {/* Card 2: Awaiting Dispatch */}
          <Link
            href="/admin/orders"
            className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors block group"
          >
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight group-hover:text-cocoa-950">
              Awaiting Dispatch
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              {metrics.awaitingDispatchCount}
            </div>
            <div className="text-[11px] text-blue-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Processing
            </div>
          </Link>

          {/* Card 3: Payment Issues */}
          <Link
            href="/admin/orders"
            className="bg-parchment-surface border border-status-redBorder bg-status-redBg/30 rounded p-4 shadow-2xs hover:border-status-redBorder transition-colors block group"
          >
            <div className="text-[11px] font-medium text-status-redText leading-tight">
              Payment Issues
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-status-redText mt-2 mb-1">
              {metrics.paymentIssuesCount}
            </div>
            <div className="text-[11px] text-status-redText/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Failed payments
            </div>
          </Link>

          {/* Card 4: Shipping Holds */}
          <Link
            href="/admin/orders"
            className="bg-parchment-surface border border-amber-300 bg-amber-50/40 rounded p-4 shadow-2xs hover:border-amber-400 transition-colors block group"
          >
            <div className="text-[11px] font-medium text-amber-900 leading-tight">
              Shipping Holds
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 mt-2 mb-1">
              {metrics.shippingHoldsCount}
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Unassigned courier
            </div>
          </Link>

          {/* Card 5: Missing AWB / Tracking */}
          <Link
            href="/admin/orders"
            className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors block group"
          >
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight group-hover:text-cocoa-950">
              Missing AWB / Track
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              {metrics.missingTrackingCount}
            </div>
            <div className="text-[11px] text-cocoa-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cocoa-600"></span> Manifest needed
            </div>
          </Link>

          {/* Card 6: Product Inventory Attention */}
          <Link
            href="/admin/products"
            className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors block group"
          >
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight group-hover:text-cocoa-950">
              Low / Out of Stock
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              {metrics.lowStockCount + metrics.outOfStockCount}
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Stock warning
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 2: RECENT ORDERS STREAM */}
      <section
        aria-labelledby="recentOrdersHeading"
        className="bg-parchment-surface border border-parchment-border rounded-md shadow-2xs overflow-hidden"
      >
        <div className="p-4 sm:px-6 border-b border-parchment-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-parchment-muted/50">
          <div>
            <h2
              id="recentOrdersHeading"
              className="text-base font-serif font-bold text-cocoa-950"
            >
              Recent Store Orders
            </h2>
            <p className="text-xs text-cocoa-600">
              Real-time store orders stream from Supabase database.
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
            <p className="font-serif text-base font-bold text-cocoa-950">No store orders recorded yet</p>
            <p className="text-xs text-cocoa-600 max-w-sm mx-auto">
              Guest checkout orders will automatically stream into this dashboard upon placement.
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
                      <div className="font-medium text-cocoa-950">{order.customer_name}</div>
                      <div className="text-[11px] text-cocoa-600 font-mono">
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-cocoa-950">
                        {order.shipping_district}, {order.shipping_state}
                      </div>
                      <div className="text-[11px] text-cocoa-600 font-mono">
                        {order.shipping_pincode}
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

      {/* SECTION 3: SECONDARY METRICS & LOGISTICS MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Courier Operations */}
        <div className="bg-parchment-surface border border-parchment-border rounded-md p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-border">
            <h3 className="text-sm font-serif font-bold text-cocoa-950">
              Courier Operations
            </h3>
            <span className="text-[11px] font-mono text-cocoa-600">
              {metrics.activeCouriersCount} Active Partners
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs text-cocoa-700 leading-relaxed">
            <p>
              Couriers dynamically resolve based on the customer&apos;s 6-digit destination pincode.
            </p>
            <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-line flex items-center justify-between font-mono">
              <span>Active Partners</span>
              <span className="font-bold text-cocoa-950">{metrics.activeCouriersCount}</span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-parchment-border flex items-center justify-between text-xs">
            <span className="text-cocoa-600">Pincode Service Matrix</span>
            <Link
              href="/admin/shipping-rates"
              className="text-burgundy font-semibold hover:underline"
            >
              Configure Rates →
            </Link>
          </div>
        </div>

        {/* Column 2: Inventory & Catalog Status */}
        <div className="bg-parchment-surface border border-parchment-border rounded-md p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-border">
            <h3 className="text-sm font-serif font-bold text-cocoa-950">
              Product Inventory
            </h3>
            <span className="text-[11px] font-mono text-amber-800">
              {metrics.lowStockCount} Low Stock
            </span>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded border border-parchment-line bg-parchment-surface">
              <div>
                <div className="font-medium text-cocoa-950">Total Catalog Items</div>
                <div className="text-[11px] text-cocoa-600 font-mono">
                  {metrics.activeProductsCount} Active on Storefront
                </div>
              </div>
              <span className="font-mono font-bold text-cocoa-950 text-base">
                {metrics.totalProductsCount}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded border border-status-amberBorder bg-status-amberBg/20">
              <div>
                <div className="font-medium text-cocoa-950">Inventory Warnings</div>
                <div className="text-[11px] text-cocoa-600 font-mono">
                  {metrics.lowStockCount} Low Stock • {metrics.outOfStockCount} Sold Out
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-status-amberBg text-status-amberText border border-status-amberBorder">
                Warning
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-parchment-border flex items-center justify-between text-xs">
            <span className="text-cocoa-600">Catalog Capacity</span>
            <Link
              href="/admin/products"
              className="text-burgundy font-semibold hover:underline"
            >
              Manage Catalog →
            </Link>
          </div>
        </div>

        {/* Column 3: Store Activity */}
        <div className="bg-parchment-surface border border-parchment-border rounded-md p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-border">
            <h3 className="text-sm font-serif font-bold text-cocoa-950">
              Today&apos;s Store Performance
            </h3>
            <span className="text-[11px] font-mono text-cocoa-600">
              Live Operations
            </span>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="p-3 bg-parchment-muted/50 rounded border border-parchment-line">
              <div className="text-[11px] text-cocoa-600">Orders Placed Today</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-cocoa-950">
                  {metrics.ordersTodayCount}
                </span>
              </div>
            </div>

            <div className="p-3 bg-parchment-muted/50 rounded border border-parchment-line">
              <div className="text-[11px] text-cocoa-600">Revenue Today (Captured)</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-cocoa-950">
                  ₹{metrics.revenueToday.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-cocoa-600 font-mono">
                  Confirmed Payments
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-parchment-border flex items-center justify-between text-xs">
            <span className="text-cocoa-600">Registered Customers</span>
            <Link href="/admin/customers" className="font-mono text-burgundy hover:underline">
              {metrics.totalCustomersCount} Recipients →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
