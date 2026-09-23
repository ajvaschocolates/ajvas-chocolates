"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/orders";
import { updateOrderStatusAction, updateOrderTrackingAction } from "@/app/admin/orders/actions";
import {
  ArrowLeft,
  Truck,
  User,
  MapPin,
  CreditCard,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface OrderDetailClientProps {
  initialOrder: Order;
}

export default function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>(order.order_status);
  const [statusNote, setStatusNote] = useState("");
  const [awbInput, setAwbInput] = useState(order.awb_number || "");
  const [trackingUrlInput, setTrackingUrlInput] = useState(order.tracking_url || "");

  const [isPending, startTransition] = useTransition();
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingSuccess, setTrackingSuccess] = useState<string | null>(null);

  function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    setStatusError(null);
    setStatusSuccess(null);

    startTransition(async () => {
      const res = await updateOrderStatusAction(order.id, targetStatus, statusNote);
      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          order_status: targetStatus,
          status_history: [
            {
              id: crypto.randomUUID(),
              order_id: prev.id,
              status: targetStatus,
              note: statusNote || `Status updated to ${targetStatus}`,
              changed_by: "Admin",
              created_at: new Date().toISOString(),
            },
            ...(prev.status_history || []),
          ],
        }));
        setStatusSuccess(`Order status updated to ${targetStatus}`);
        setStatusNote("");
      } else {
        setStatusError(res.error || "Failed to update order status.");
      }
    });
  }

  function handleTrackingUpdate(e: React.FormEvent) {
    e.preventDefault();
    setTrackingError(null);
    setTrackingSuccess(null);

    if (!awbInput.trim()) {
      setTrackingError("AWB tracking number is required.");
      return;
    }

    startTransition(async () => {
      const res = await updateOrderTrackingAction(order.id, awbInput.trim(), trackingUrlInput.trim());
      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          awb_number: awbInput.trim(),
          tracking_url: trackingUrlInput.trim() || null,
          order_status: "shipped",
        }));
        setTrackingSuccess("Tracking details updated successfully. Order marked as shipped.");
      } else {
        setTrackingError(res.error || "Failed to update tracking details.");
      }
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-parchment-border">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs text-cocoa-600 hover:text-cocoa-950 font-medium mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cocoa-950 tracking-tight">
              Order {order.order_number}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                order.payment_status === "paid"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : order.payment_status === "failed"
                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              Payment: {order.payment_status}
            </span>
          </div>
          <p className="text-xs text-cocoa-600 font-mono mt-1">
            Placed on {new Date(order.created_at).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Order Items & Customer Snapshot */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Address Card */}
          <div className="bg-parchment-surface border border-parchment-border rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-cocoa-950 flex items-center gap-2">
              <User className="w-4 h-4 text-cocoa-600" /> Customer &amp; Address Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="block text-[11px] text-cocoa-600 font-mono uppercase">Recipient Name</span>
                <span className="font-semibold text-cocoa-950">{order.customer_name}</span>
              </div>
              <div>
                <span className="block text-[11px] text-cocoa-600 font-mono uppercase">Contact Phone</span>
                <span className="font-semibold text-cocoa-950 font-mono">{order.customer_phone}</span>
              </div>
              <div>
                <span className="block text-[11px] text-cocoa-600 font-mono uppercase">Email Address</span>
                <span className="text-cocoa-950 font-mono">{order.customer_email || "Not provided (Guest)"}</span>
              </div>
              <div>
                <span className="block text-[11px] text-cocoa-600 font-mono uppercase">Destination Pincode</span>
                <span className="font-semibold text-cocoa-950 font-mono">{order.shipping_pincode}</span>
              </div>
              <div className="sm:col-span-2 border-t border-parchment-border pt-3">
                <span className="block text-[11px] text-cocoa-600 font-mono uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cocoa-600" /> Shipping Address
                </span>
                <p className="text-cocoa-900 leading-relaxed font-sans">
                  {order.shipping_address_line1}
                  {order.shipping_address_line2 && `, ${order.shipping_address_line2}`}
                  <br />
                  {order.shipping_district}, {order.shipping_state} – {order.shipping_pincode}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items List */}
          <div className="bg-parchment-surface border border-parchment-border rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-cocoa-950 flex items-center gap-2">
              <Package className="w-4 h-4 text-cocoa-600" /> Purchased Confections &amp; Items
            </h2>

            {order.items && order.items.length > 0 ? (
              <div className="divide-y divide-parchment-border text-xs">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-cocoa-950 text-sm">{item.product_name}</div>
                      <div className="text-[11px] text-cocoa-600 font-mono">
                        Weight: {item.weight_grams}g • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-cocoa-950">
                      ₹{Number(item.line_total || 0).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-cocoa-600 italic">No item snapshots attached to order record.</p>
            )}

            {/* Financial Breakdown */}
            <div className="border-t border-parchment-border pt-4 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-cocoa-700">
                <span>Subtotal</span>
                <span className="font-mono">₹{Number(order.subtotal || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-cocoa-700">
                <span>Shipping Fee</span>
                <span className="font-mono">₹{Number(order.shipping_amount || 0).toLocaleString("en-IN")}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Discount</span>
                  <span className="font-mono">-₹{Number(order.discount_amount).toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-cocoa-950 border-t border-parchment-border pt-2">
                <span>Total Amount Payable</span>
                <span className="font-mono text-base">₹{Number(order.total_amount || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Actions, Courier & Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Status Management */}
          <div className="bg-parchment-surface border border-parchment-border rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-cocoa-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cocoa-600" /> Update Order Status
            </h2>

            {statusSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-medium">
                {statusSuccess}
              </div>
            )}
            {statusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 font-medium">
                {statusError}
              </div>
            )}

            <form onSubmit={handleStatusUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  Current Status: <span className="font-bold text-cocoa-950 uppercase">{order.order_status}</span>
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-sans text-cocoa-900 focus:outline-none min-h-[44px]"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  Note / Reason (Optional)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Package packed and ready for dispatch"
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-sans text-cocoa-900 focus:outline-none min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || targetStatus === order.order_status}
                className="w-full min-h-[44px] rounded bg-cocoa-900 text-white font-semibold hover:bg-cocoa-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Update Status</span>
              </button>
            </form>
          </div>

          {/* Courier & Tracking Assignment */}
          <div className="bg-parchment-surface border border-parchment-border rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-cocoa-950 flex items-center gap-2">
              <Truck className="w-4 h-4 text-cocoa-600" /> Shipping &amp; AWB Tracking
            </h2>

            {trackingSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-medium">
                {trackingSuccess}
              </div>
            )}
            {trackingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-900 font-medium">
                {trackingError}
              </div>
            )}

            <form onSubmit={handleTrackingUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  Courier Partner
                </label>
                <input
                  type="text"
                  disabled
                  value={`${order.courier_partner || "Standard Air"} (${order.courier_service_name || "Express"})`}
                  className="w-full rounded border border-cocoa-200 bg-parchment-muted px-3 py-2 text-xs text-cocoa-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  AWB Tracking Number <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={awbInput}
                  onChange={(e) => setAwbInput(e.target.value)}
                  placeholder="e.g. AWB987654321"
                  required
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-mono text-cocoa-900 focus:outline-none min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  value={trackingUrlInput}
                  onChange={(e) => setTrackingUrlInput(e.target.value)}
                  placeholder="https://track.courier.com/AWB987654321"
                  className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-mono text-cocoa-900 focus:outline-none min-h-[44px]"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full min-h-[44px] rounded bg-emerald-800 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Tracking &amp; Mark Shipped</span>
              </button>
            </form>
          </div>

          {/* Timeline & Audit History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-parchment-surface border border-parchment-border rounded-xl p-5 shadow-2xs space-y-3">
              <h2 className="text-sm font-serif font-bold text-cocoa-950">Status Timeline</h2>
              <div className="space-y-2 text-xs">
                {order.status_history.map((hist) => (
                  <div key={hist.id} className="p-2.5 rounded bg-parchment-muted/60 border border-parchment-line">
                    <div className="flex items-center justify-between font-mono font-bold text-cocoa-950 uppercase">
                      <span>{hist.status}</span>
                      <span className="text-[10px] text-cocoa-600 font-normal">
                        {new Date(hist.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {hist.note && <p className="text-cocoa-700 mt-1 leading-normal">{hist.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
