import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Truck,
  TrendingUp,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

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
              20 Requires Action
            </span>
          </div>
          <span className="text-xs text-cocoa-600 font-mono">
            Live Stream
          </span>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Orders to Process */}
          <div className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors">
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight">
              Orders to Process
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              12
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Paid
            </div>
          </div>

          {/* Card 2: Awaiting Dispatch */}
          <div className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors">
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight">
              Awaiting Dispatch
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              5
            </div>
            <div className="text-[11px] text-blue-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Ready
              for courier
            </div>
          </div>

          {/* Card 3: Payment Issues */}
          <div className="bg-parchment-surface border border-status-redBorder bg-status-redBg/30 rounded p-4 shadow-2xs hover:border-status-redBorder transition-colors">
            <div className="text-[11px] font-medium text-status-redText leading-tight">
              Payment Issues
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-status-redText mt-2 mb-1">
              2
            </div>
            <div className="text-[11px] text-status-redText/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Failed
              callbacks
            </div>
          </div>

          {/* Card 4: Shipping Issues */}
          <div className="bg-parchment-surface border border-amber-300 bg-amber-50/40 rounded p-4 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="text-[11px] font-medium text-amber-900 leading-tight">
              Shipping Issues
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 mt-2 mb-1">
              1
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Rate
              recalc retry
            </div>
          </div>

          {/* Card 5: Tracking Pending */}
          <div className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors">
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight">
              Missing AWB / Track
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              3
            </div>
            <div className="text-[11px] text-cocoa-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cocoa-600"></span>{" "}
              Manifest needed
            </div>
          </div>

          {/* Card 6: Products Attention */}
          <div className="bg-parchment-surface border border-parchment-border rounded p-4 shadow-2xs hover:border-cocoa-600/40 transition-colors">
            <div className="text-[11px] font-medium text-cocoa-600 leading-tight">
              Product Inventory
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cocoa-950 mt-2 mb-1">
              1
            </div>
            <div className="text-[11px] text-amber-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> 1
              Low stock item
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ORDERS NEEDING DIRECT OPERATIONAL ATTENTION */}
      <section aria-labelledby="attentionOrdersHeading">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2
              id="attentionOrdersHeading"
              className="text-sm font-serif font-bold text-cocoa-950"
            >
              Orders Needing Attention
            </h2>
            <span className="text-xs text-cocoa-600">
              (Unresolved anomalies, payment failures, or courier holds)
            </span>
          </div>
          <span className="text-xs text-burgundy font-medium">
            Immediate Resolution Required
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Item 1: Payment Failed */}
          <div className="bg-parchment-surface border border-status-redBorder/80 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-status-redBorder transition-colors">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 mt-1 shrink-0"></span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-cocoa-950">
                    AJV-000131
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-status-redBg text-status-redText border border-status-redBorder">
                    Payment: Failed
                  </span>
                  <span className="text-xs text-cocoa-600 font-mono">
                    ₹3,450 • Razorpay Callback Error
                  </span>
                </div>
                <div className="text-xs text-cocoa-700 mt-1">
                  Customer:{" "}
                  <span className="font-medium text-cocoa-950">
                    Customer A
                  </span>{" "}
                  (+91 XXXXX XXXXX) • Pincode: 682016 (Ernakulam, KL)
                </div>
                <div className="text-[11px] text-status-redText font-medium mt-0.5">
                  Customer reached payment gateway; card transaction declined
                  by issuing bank. Order unconfirmed.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center shrink-0">
              <Link
                href="/admin/orders"
                className="touch-target px-3.5 py-1.5 bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-900 border border-parchment-line rounded transition-colors focus:ring-2 focus:ring-cocoa-700"
              >
                View Order
              </Link>
            </div>
          </div>

          {/* Item 2: Shipping Calculation Holds */}
          <div className="bg-parchment-surface border border-amber-300 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-amber-400 transition-colors">
            <div className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-sm text-cocoa-950">
                    AJV-000129
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-status-amberBg text-status-amberText border border-status-amberBorder">
                    Shipping: Recalc Required
                  </span>
                  <span className="text-xs text-cocoa-600 font-mono">
                    ₹4,300 • Combined Shipment
                  </span>
                </div>
                <div className="text-xs text-cocoa-700 mt-1">
                  Customer:{" "}
                  <span className="font-medium text-cocoa-950">
                    Customer B
                  </span>{" "}
                  (+91 XXXXX XXXXX) • Destination Pincode: 560034 (Bengaluru,
                  KA)
                </div>
                <div className="text-[11px] text-amber-900 font-medium mt-0.5">
                  Courier quote pending. Package awaiting rate assignment.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center shrink-0">
              <Link
                href="/admin/orders"
                className="touch-target px-3.5 py-1.5 bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-900 border border-parchment-line rounded transition-colors focus:ring-2 focus:ring-cocoa-700"
              >
                View Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECENT ORDERS DATA TABLE */}
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
              Recent Orders
            </h2>
            <p className="text-xs text-cocoa-600">
              Authoritative orders stream bound to guest checkout data.
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

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-parchment-border bg-parchment-surface font-mono text-[11px] uppercase tracking-wider text-cocoa-600">
                <th scope="col" className="py-3 px-4 sm:px-6 font-semibold">
                  Order
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Customer
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Destination
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Date &amp; Time
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Items
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
                <th scope="col" className="py-3 px-4 font-semibold">
                  Courier
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 sm:px-6 font-semibold text-right"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-border bg-parchment-surface">
              <tr className="hover:bg-parchment-muted/40 transition-colors">
                <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-cocoa-950">
                  AJV-000123
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-cocoa-950">Customer D</div>
                  <div className="text-[11px] text-cocoa-600 font-mono">
                    +91 XXXXX XXXXX
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-cocoa-950">Ernakulam, KL</div>
                  <div className="text-[11px] text-cocoa-600 font-mono">
                    682001
                  </div>
                </td>
                <td className="py-3.5 px-4 text-cocoa-700 whitespace-nowrap">
                  <div>Oct 24, 2025</div>
                  <div className="text-[11px] text-cocoa-600 font-mono">
                    14:32 IST
                  </div>
                </td>
                <td className="py-3.5 px-4 text-cocoa-800">
                  <span className="font-medium">The Grand Velvet Hamper</span>{" "}
                  (1)
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-cocoa-950">
                  ₹4,385
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-status-greenBg text-status-greenText border border-status-greenBorder">
                    Paid
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-status-amberBg text-status-amberText border border-status-amberBorder">
                    Processing
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-cocoa-950">
                    DTDC Priority Air
                  </div>
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-right">
                  <Link
                    href="/admin/orders"
                    className="touch-target px-3 py-1 bg-parchment-surface hover:bg-parchment-muted text-cocoa-900 border border-parchment-line rounded font-semibold text-xs transition-colors"
                  >
                    View Order
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: SECONDARY METRICS & LOGISTICS MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Courier Operations */}
        <div className="bg-parchment-surface border border-parchment-border rounded-md p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-border">
            <h3 className="text-sm font-serif font-bold text-cocoa-950">
              Courier Operations
            </h3>
            <span className="text-[11px] font-mono text-cocoa-600">
              Active Partners
            </span>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-line flex items-center justify-between">
              <div>
                <div className="font-bold text-cocoa-950">
                  Blue Dart Express
                </div>
                <div className="text-[11px] text-cocoa-600">
                  Standard &amp; Express
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-cocoa-950">
                  Active
                </div>
              </div>
            </div>
            <div className="p-3 bg-parchment-muted/60 rounded border border-parchment-line flex items-center justify-between">
              <div>
                <div className="font-bold text-cocoa-950">
                  Delhivery Surface
                </div>
                <div className="text-[11px] text-cocoa-600">
                  Surface Parcel
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-cocoa-950">
                  Active
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-parchment-border flex items-center justify-between text-xs">
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
              1 Item Low
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded border border-parchment-line bg-parchment-surface">
              <div>
                <div className="font-medium text-cocoa-950">
                  The Grand Velvet Hamper
                </div>
                <div className="text-[11px] text-cocoa-600 font-mono">
                  ₹3,450 • In Stock
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-status-greenBg text-status-greenText border border-status-greenBorder">
                In Stock
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded border border-status-amberBorder bg-status-amberBg/20">
              <div>
                <div className="font-medium text-cocoa-950">
                  The Petite Chocolate Selection
                </div>
                <div className="text-[11px] text-cocoa-600 font-mono">
                  ₹1,100 • Low Stock
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-status-amberBg text-status-amberText border border-status-amberBorder">
                Low Stock
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
              Store Activity
            </h3>
            <span className="text-[11px] font-mono text-cocoa-600">
              Live Operations
            </span>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            <div className="p-3 bg-parchment-muted/50 rounded border border-parchment-line">
              <div className="text-[11px] text-cocoa-600">Orders Today</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-cocoa-950">
                  14
                </span>
              </div>
            </div>

            <div className="p-3 bg-parchment-muted/50 rounded border border-parchment-line">
              <div className="text-[11px] text-cocoa-600">
                Revenue Today (Captured)
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-cocoa-950">
                  ₹52,620
                </span>
                <span className="text-[11px] text-cocoa-600 font-mono">
                  Razorpay Handoff
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-parchment-border flex items-center justify-between text-xs">
            <span className="text-cocoa-600">Guest Customers</span>
            <span className="font-mono text-cocoa-800">
              48 Unique Recipients
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
