"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/orders";
import { updateOrderStatusAction, updateOrderTrackingAction } from "@/app/admin/orders/actions";
import {
  generateOrderWhatsAppMessage,
  openWhatsAppChat,
  normalizeWhatsAppPhone,
  TRACKING_LABEL_OPTIONS,
  buildWhatsAppChatUrl,
} from "@/lib/whatsapp/order-message";
import {
  ArrowLeft,
  Truck,
  User,
  MapPin,
  Package,
  Clock,
  Loader2,
  Gift,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

interface OrderDetailClientProps {
  initialOrder: Order;
}

export default function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [targetStatus, setTargetStatus] = useState<OrderStatus>(order.order_status);
  const [statusNote, setStatusNote] = useState("");

  // Tracking state & dynamic labels
  const [selectedLabelOption, setSelectedLabelOption] = useState<string>("Tracking ID");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [trackingValue, setTrackingValue] = useState<string>(order.awb_number || "");
  const [trackingUrlInput, setTrackingUrlInput] = useState<string>(order.tracking_url || "");
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(true);
  const [whatsappPopupUrl, setWhatsappPopupUrl] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [trackingSuccess, setTrackingSuccess] = useState<string | null>(null);

  const effectiveLabel =
    selectedLabelOption === "Other"
      ? (customLabel.trim() || "Tracking ID")
      : selectedLabelOption;

  const normalizedPhone = useMemo(() => {
    return normalizeWhatsAppPhone(order.customer_phone);
  }, [order.customer_phone]);

  const liveWhatsAppMessage = useMemo(() => {
    return generateOrderWhatsAppMessage(order, {
      trackingLabel: effectiveLabel,
      trackingValue: trackingValue.trim(),
      trackingUrl: trackingUrlInput.trim(),
    });
  }, [order, effectiveLabel, trackingValue, trackingUrlInput]);

  const directWhatsAppUrl = useMemo(() => {
    if (!normalizedPhone) return null;
    return buildWhatsAppChatUrl(normalizedPhone, liveWhatsAppMessage);
  }, [normalizedPhone, liveWhatsAppMessage]);

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

  function handleSaveTracking(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setTrackingError(null);
    setTrackingSuccess(null);

    const trimmedValue = trackingValue.trim();
    if (!trimmedValue) {
      setTrackingError("Tracking number / identifier is required.");
      return;
    }

    startTransition(async () => {
      const res = await updateOrderTrackingAction(order.id, trimmedValue, trackingUrlInput.trim());
      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          awb_number: trimmedValue,
          tracking_url: trackingUrlInput.trim() || null,
          order_status: "shipped",
        }));
        setTrackingSuccess("Tracking details saved successfully! Order marked as Shipped.");
      } else {
        setTrackingError(res.error || "Failed to update tracking details.");
      }
    });
  }

  function handleSendWhatsApp() {
    setTrackingError(null);
    setTrackingSuccess(null);
    setWhatsappPopupUrl(null);

    if (!normalizedPhone) {
      setTrackingError(
        `Cannot open WhatsApp: Customer phone number (${order.customer_phone || "empty"}) is invalid.`
      );
      return;
    }

    // Auto-save tracking details if modified
    const trimmedValue = trackingValue.trim();
    if (trimmedValue && trimmedValue !== order.awb_number) {
      startTransition(async () => {
        const res = await updateOrderTrackingAction(order.id, trimmedValue, trackingUrlInput.trim());
        if (res.success) {
          setOrder((prev) => ({
            ...prev,
            awb_number: trimmedValue,
            tracking_url: trackingUrlInput.trim() || null,
            order_status: "shipped",
          }));
        }
      });
    }

    const openResult = openWhatsAppChat(order.customer_phone, liveWhatsAppMessage);
    if (!openResult.success) {
      if (openResult.url) {
        setWhatsappPopupUrl(openResult.url);
        setTrackingError(openResult.error || "Popup was blocked. Please click the direct link below.");
      } else {
        setTrackingError(openResult.error || "Could not launch WhatsApp.");
      }
    } else {
      setTrackingSuccess("WhatsApp launched with order & tracking details!");
      if (openResult.url) {
        setWhatsappPopupUrl(openResult.url);
      }
    }
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(liveWhatsAppMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setTrackingError("Could not copy message to clipboard.");
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
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
            <h1 className="font-sans text-2xl sm:text-3xl font-bold text-cocoa-950 tracking-tight">
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
                {order.items.map((item) => {
                  const effectiveWeight = item.weight_grams || item.product?.weight_grams;
                  const effectiveLength = item.length_cm ?? item.product?.length_cm;
                  const effectiveWidth = item.width_cm ?? item.product?.width_cm;
                  const effectiveHeight = item.height_cm ?? item.product?.height_cm;
                  const hasDimensions = Boolean(effectiveLength && effectiveWidth && effectiveHeight);
                  const imageUrl = item.product?.images?.[0]?.image_url;

                  return (
                    <div key={item.id} className="py-4 space-y-3">
                      {/* Product Header Row: Thumbnail (left) + Details & Pricing (right) */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Left: Product Thumbnail Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-white/90 border border-parchment-border shrink-0 flex items-center justify-center shadow-2xs">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product_name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-cocoa-400 bg-parchment-muted/50">
                              <Package className="w-6 h-6 stroke-[1.5]" />
                              <span className="text-[9px] font-mono mt-1 uppercase text-cocoa-500 font-medium">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Right: Product Name, Specifications & Pricing */}
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-1.5 min-w-0">
                            <h3 className="font-sans text-sm sm:text-base font-bold text-cocoa-950 tracking-tight leading-snug">
                              {item.product_name}
                            </h3>

                            {/* Specifications */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cocoa-700">
                              {effectiveWeight && effectiveWeight > 0 ? (
                                <span className="inline-flex items-center gap-1 font-mono">
                                  <span className="text-cocoa-500 font-sans">Net Weight:</span>
                                  <strong className="font-semibold text-cocoa-900">{effectiveWeight}g</strong>
                                </span>
                              ) : null}

                              {hasDimensions && (
                                <>
                                  {effectiveWeight && effectiveWeight > 0 ? (
                                    <span className="text-cocoa-300" aria-hidden="true">•</span>
                                  ) : null}
                                  <span className="inline-flex items-center gap-1 font-mono">
                                    <span className="text-cocoa-500 font-sans">Size:</span>
                                    <span className="text-cocoa-900 font-medium">
                                      {effectiveLength} × {effectiveWidth} × {effectiveHeight} cm
                                    </span>
                                  </span>
                                </>
                              )}

                              {item.product_slug && (
                                <>
                                  {((effectiveWeight && effectiveWeight > 0) || hasDimensions) && (
                                    <span className="text-cocoa-300" aria-hidden="true">•</span>
                                  )}
                                  <span className="text-[11px] text-cocoa-500 font-mono">
                                    {item.product_slug}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Quantity and Unit Price */}
                            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-mono text-cocoa-700">
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-parchment-muted border border-parchment-border font-semibold text-cocoa-900">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-cocoa-400">×</span>
                              <span>₹{Number(item.unit_price || 0).toLocaleString("en-IN")} unit price</span>
                              {Number(item.discount_amount || 0) > 0 && (
                                <span className="text-emerald-700 text-[11px]">
                                  (-₹{Number(item.discount_amount).toLocaleString("en-IN")} discount)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-left sm:text-right shrink-0">
                            <span className="block text-[10px] font-mono uppercase tracking-wider text-cocoa-500">
                              Item Total
                            </span>
                            <span className="font-mono font-bold text-base text-cocoa-950">
                              ₹{Number(item.line_total || (item.unit_price * item.quantity) || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Gift Request Display */}
                      <div className="p-3 rounded-lg bg-parchment-muted/70 border border-parchment-border text-xs">
                        <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cocoa-700 mb-1 flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-cocoa-600" />
                          <span>Customer Gift Request</span>
                        </div>
                        {(() => {
                          let text = item.customization?.trim();
                          if (!text && order.status_history) {
                            for (const hist of order.status_history) {
                              if (hist.note?.includes("Gift Requests:")) {
                                const match = hist.note.split("Gift Requests:")[1];
                                if (match && match.includes(item.product_name)) {
                                  text = match.trim();
                                  break;
                                }
                              }
                            }
                          }
                          return text && text.length > 0 ? (
                            <p className="font-sans text-xs text-cocoa-950 whitespace-pre-wrap leading-relaxed break-words bg-white/60 p-2.5 rounded border border-parchment-line font-medium">
                              {text}
                            </p>
                          ) : (
                            <p className="font-sans text-xs text-cocoa-500 italic">
                              No customization provided
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-sans font-bold text-cocoa-950 flex items-center gap-2">
                <Truck className="w-4 h-4 text-cocoa-600" /> Shipping &amp; Tracking Details
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase font-semibold">
                Fulfillment
              </span>
            </div>

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

            <form onSubmit={handleSaveTracking} className="space-y-3.5 text-xs">
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

              {/* Dynamic Tracking Identifier & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                    Tracking Label
                  </label>
                  <select
                    value={selectedLabelOption}
                    onChange={(e) => setSelectedLabelOption(e.target.value)}
                    className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-sans text-cocoa-900 focus:outline-none min-h-[44px]"
                  >
                    {TRACKING_LABEL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLabelOption === "Other" && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                      Custom Label Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="e.g. Reference Code"
                      className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-sans text-cocoa-900 focus:outline-none min-h-[44px]"
                    />
                  </div>
                )}

                <div className={selectedLabelOption === "Other" ? "sm:col-span-2" : ""}>
                  <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                    {effectiveLabel} <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={trackingValue}
                    onChange={(e) => setTrackingValue(e.target.value)}
                    placeholder="e.g. AWB987654321 or TRK827103"
                    required
                    className="w-full rounded border border-cocoa-200 bg-parchment-surface px-3 py-2 text-xs font-mono text-cocoa-900 focus:outline-none min-h-[44px]"
                  />
                </div>
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

              {/* Action Buttons: Save Tracking Details & Send via WhatsApp */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 min-h-[44px] rounded border border-cocoa-300 bg-white hover:bg-parchment-muted text-cocoa-950 font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cocoa-700" />
                  ) : (
                    <Save className="w-4 h-4 text-cocoa-700" />
                  )}
                  <span>Save Tracking</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={isPending}
                  className="flex-1 min-h-[44px] rounded bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Direct Link fallback if popup was blocked */}
              {whatsappPopupUrl && (
                <div className="pt-1 text-center">
                  <a
                    href={whatsappPopupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Popup blocked? Click here to open WhatsApp directly
                  </a>
                </div>
              )}
            </form>

            {/* Live WhatsApp Message Preview with Copy Button */}
            <div className="border-t border-parchment-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-cocoa-900 hover:text-cocoa-950 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp Message Preview</span>
                  {isPreviewOpen ? (
                    <EyeOff className="w-3.5 h-3.5 text-cocoa-500 ml-1" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-cocoa-500 ml-1" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {normalizedPhone ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      +{normalizedPhone}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                      No Valid Phone
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-cocoa-200 bg-white hover:bg-parchment-muted text-[11px] font-medium text-cocoa-800 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-cocoa-600" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isPreviewOpen && (
                <div className="relative rounded-lg bg-[#efeae2]/50 border border-parchment-border p-3.5 shadow-inner">
                  <div className="bg-white rounded-lg p-3.5 border border-emerald-100 shadow-xs text-[11px] text-cocoa-900 whitespace-pre-wrap font-sans leading-relaxed select-text max-h-72 overflow-y-auto">
                    {liveWhatsAppMessage}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-cocoa-500 font-mono">
                    <span>Includes gift requests &amp; tracking info</span>
                    <span>Live dynamic preview</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Audit History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-parchment-surface border border-parchment-border rounded-xl p-5 shadow-2xs space-y-3">
              <h2 className="text-sm font-sans font-bold text-cocoa-950">Status Timeline</h2>
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
