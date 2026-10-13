"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { Order, OrderStatus } from "@/types/orders";
import { updateOrderTrackingAction } from "@/app/admin/orders/actions";
import {
  generateOrderWhatsAppMessage,
  normalizeWhatsAppPhone,
  TRACKING_LABEL_OPTIONS,
  buildWhatsAppChatUrl,
} from "@/lib/whatsapp/order-message";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  X,
  MessageCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";

export function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`fill-current shrink-0 ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

export interface WhatsAppShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdated?: (updated: {
    id: string;
    awb_number?: string | null;
    tracking_url?: string | null;
    order_status: OrderStatus;
  }) => void;
}

export default function WhatsAppShippingModal({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}: WhatsAppShippingModalProps) {
  // Tracking inputs
  const [selectedLabelOption, setSelectedLabelOption] = useState<string>("Tracking ID");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [trackingValue, setTrackingValue] = useState<string>("");
  const [trackingUrlInput, setTrackingUrlInput] = useState<string>("");

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  // Reset state when opening with an order
  useEffect(() => {
    if (order) {
      setTrackingValue(order.awb_number || "");
      setTrackingUrlInput(order.tracking_url || "");
      setSelectedLabelOption("Tracking ID");
      setCustomLabel("");
      setErrorMessage(null);
      setCopied(false);
    }
  }, [order, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const effectiveLabel =
    selectedLabelOption === "Other"
      ? customLabel.trim() || "Tracking ID"
      : selectedLabelOption;

  const normalizedPhone = useMemo(() => {
    return normalizeWhatsAppPhone(order?.customer_phone);
  }, [order?.customer_phone]);

  const liveWhatsAppMessage = useMemo(() => {
    if (!order) return "";
    return generateOrderWhatsAppMessage(order, {
      trackingLabel: effectiveLabel,
      trackingValue: trackingValue.trim(),
      trackingUrl: trackingUrlInput.trim(),
    });
  }, [order, effectiveLabel, trackingValue, trackingUrlInput]);

  if (!isOpen || !order) return null;

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(liveWhatsAppMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("Could not copy message to clipboard.");
    }
  }

  function handleInitiateWhatsApp() {
    if (!order) return;
    setErrorMessage(null);

    // Validate phone
    if (!normalizedPhone) {
      setErrorMessage(
        `Cannot send WhatsApp notification: Customer phone (${order.customer_phone || "empty"}) is invalid.`
      );
      return;
    }

    const trimmedValue = trackingValue.trim();
    const trimmedUrl = trackingUrlInput.trim();

    // If order is processing and requires tracking assignment
    if (order.order_status === "processing" && !trimmedValue) {
      setErrorMessage(
        "Please enter a Tracking ID / AWB Number before initiating shipment notification."
      );
      return;
    }

    if (selectedLabelOption === "Other" && !customLabel.trim()) {
      setErrorMessage("Please specify a custom tracking label name.");
      return;
    }

    // Build URL directly with single encodeURIComponent
    const targetUrl = buildWhatsAppChatUrl(normalizedPhone, liveWhatsAppMessage);

    // Synchronously open WhatsApp window to prevent browser popup blockers
    try {
      if (typeof window !== "undefined") {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      // Browser popup handling
    }

    // Execute server action for tracking update & status transition
    startTransition(async () => {
      try {
        const trackingIdentifier = trimmedValue || order.awb_number || "ASSIGNED";
        const res = await updateOrderTrackingAction(order.id, trackingIdentifier, trimmedUrl);

        if (res.success) {
          const nextStatus: OrderStatus =
            order.order_status === "processing" ? "shipped" : order.order_status;

          // Callback to refresh parent list row
          if (onOrderUpdated) {
            onOrderUpdated({
              id: order.id,
              awb_number: trimmedValue || order.awb_number,
              tracking_url: trimmedUrl || null,
              order_status: nextStatus,
            });
          }

          // Automatically close modal now that WhatsApp action is initiated and persisted
          onClose();
        } else {
          // Partial-success case: WhatsApp window opened, but server action failed
          setErrorMessage(
            `WhatsApp action initiated, but the server failed to update order status: ${res.error || "Unknown server error"}. Please retry.`
          );
        }
      } catch (err) {
        setErrorMessage(
          `WhatsApp action initiated, but a network error occurred while updating status: ${err instanceof Error ? err.message : "Network error"}. Please retry.`
        );
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-parchment-surface rounded-xl border border-parchment-border shadow-elevated overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-parchment-border bg-parchment-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
              <WhatsAppIcon className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="whatsapp-modal-title"
                className="font-sans text-base font-bold text-cocoa-950 flex items-center gap-2"
              >
                <span>WhatsApp Shipping Notification</span>
                <span className="font-mono text-xs text-cocoa-600 font-normal">
                  #{order.order_number}
                </span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-cocoa-600 mt-0.5">
                <span className="font-semibold text-cocoa-900">{order.customer_name}</span>
                <span>•</span>
                <span className="font-mono">{order.customer_phone}</span>
                <span>•</span>
                <OrderStatusBadge status={order.order_status} />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-md text-cocoa-500 hover:text-cocoa-950 hover:bg-parchment-muted transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Status-specific context banner */}
          {order.order_status === "processing" ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Automatic Shipment Transition:</strong> Initiating
                the WhatsApp notification will open WhatsApp and automatically advance this order
                from <span className="font-mono font-bold text-blue-900">Processing</span> to{" "}
                <span className="font-mono font-bold text-purple-900">Shipped</span>.
              </div>
            </div>
          ) : order.order_status === "delivered" ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Order Delivered:</strong> Sending a notification
                will preserve the <span className="font-mono font-bold text-emerald-900">Delivered</span> status
                and will not regress to Shipped.
              </div>
            </div>
          ) : null}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 flex items-start justify-between gap-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-700 hover:text-rose-950"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tracking Configuration Inputs */}
          <div className="space-y-3 p-4 bg-parchment-muted/40 rounded-lg border border-parchment-border">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-cocoa-800">
              Tracking &amp; Dispatch Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  Tracking Label
                </label>
                <select
                  value={selectedLabelOption}
                  onChange={(e) => setSelectedLabelOption(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded border border-cocoa-200 bg-white px-3 py-2 text-xs font-sans text-cocoa-900 focus:outline-none min-h-[40px]"
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
                    disabled={isSubmitting}
                    className="w-full rounded border border-cocoa-200 bg-white px-3 py-2 text-xs font-sans text-cocoa-900 focus:outline-none min-h-[40px]"
                  />
                </div>
              )}

              <div className={selectedLabelOption === "Other" ? "sm:col-span-2" : ""}>
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  {effectiveLabel}{" "}
                  {order.order_status === "processing" && (
                    <span className="text-rose-600">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={trackingValue}
                  onChange={(e) => setTrackingValue(e.target.value)}
                  placeholder="e.g. AWB987654321 or TRK827103"
                  disabled={isSubmitting}
                  required={order.order_status === "processing"}
                  className="w-full rounded border border-cocoa-200 bg-white px-3 py-2 text-xs font-mono text-cocoa-900 focus:outline-none min-h-[40px]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono uppercase text-cocoa-700 mb-1">
                  Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  value={trackingUrlInput}
                  onChange={(e) => setTrackingUrlInput(e.target.value)}
                  placeholder="https://track.courier.com/AWB987654321"
                  disabled={isSubmitting}
                  className="w-full rounded border border-cocoa-200 bg-white px-3 py-2 text-xs font-mono text-cocoa-900 focus:outline-none min-h-[40px]"
                />
              </div>
            </div>
          </div>

          {/* Live Message Preview Accordion */}
          <div className="border border-parchment-border rounded-lg p-3 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-cocoa-900 hover:text-cocoa-950 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>Message Preview</span>
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
              <div className="rounded-md bg-[#efeae2]/60 border border-parchment-border p-3 text-[11px] text-cocoa-900 whitespace-pre-wrap font-sans leading-relaxed select-text max-h-48 overflow-y-auto">
                {liveWhatsAppMessage}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Strip */}
        <div className="px-5 py-3.5 border-t border-parchment-border bg-parchment-muted/60 flex flex-col sm:flex-row sm:items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md border border-cocoa-200 bg-white hover:bg-parchment-muted text-cocoa-800 text-xs font-semibold transition-colors disabled:opacity-50 min-h-[40px]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleInitiateWhatsApp}
            disabled={isSubmitting || !normalizedPhone}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs min-h-[40px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Order...</span>
              </>
            ) : (
              <>
                <WhatsAppIcon className="w-4 h-4" />
                <span>
                  {order.order_status === "processing"
                    ? "Send WhatsApp & Mark Shipped"
                    : "Send WhatsApp Notification"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
