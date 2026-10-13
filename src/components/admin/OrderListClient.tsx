"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Order, ActiveOrderStatus, ACTIVE_ORDER_STATUSES } from "@/types/orders";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { getOrderStatusStyle } from "@/lib/orders/status-utils";
import OrderStatusBadge from "./OrderStatusBadge";
import WhatsAppShippingModal, { WhatsAppIcon } from "./WhatsAppShippingModal";
import {
  Search,
  ShoppingBag,
  RotateCcw,
  Eye,
  Package,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react";
import AddressSlipPrintModal from "./AddressSlipPrintModal";
import { validateOrderForSlip } from "@/lib/orders/slip-utils";

interface OrderListClientProps {
  initialOrders: Order[];
}

export default function OrderListClient({ initialOrders }: OrderListClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Selection & Print State
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [ordersToPrint, setOrdersToPrint] = useState<Order[]>([]);
  const [autoTriggerPrint, setAutoTriggerPrint] = useState(false);
  const [validationError, setValidationError] = useState<{
    orderId?: string;
    orderNumber?: string;
    message: string;
  } | null>(null);

  // Inline Status Update State
  const [updatingOrderIds, setUpdatingOrderIds] = useState<Set<string>>(new Set());
  const [statusNotification, setStatusNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // WhatsApp Shipping Modal State
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedOrderForWhatsApp, setSelectedOrderForWhatsApp] = useState<Order | null>(null);

  const selectAllRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync when server revalidates props
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.order_status === "pending").length;
  const processingCount = orders.filter((o) => o.order_status === "processing").length;
  const shippedCount = orders.filter((o) => o.order_status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.order_status === "delivered").length;

  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.toLowerCase().includes(q);
      const matchPin = o.shipping_pincode.toLowerCase().includes(q);
      const matchProduct = o.items?.some((item) =>
        item.product_name.toLowerCase().includes(q)
      );
      if (!matchNum && !matchName && !matchPhone && !matchPin && !matchProduct) return false;
    }

    if (statusFilter !== "ALL" && o.order_status !== statusFilter) return false;
    if (paymentFilter !== "ALL" && o.payment_status !== paymentFilter) return false;

    return true;
  });

  // Selection helpers
  const isAllFilteredSelected = useMemo(() => {
    return (
      filteredOrders.length > 0 &&
      filteredOrders.every((o) => selectedOrderIds.has(o.id))
    );
  }, [filteredOrders, selectedOrderIds]);

  const isSomeFilteredSelected = useMemo(() => {
    return filteredOrders.some((o) => selectedOrderIds.has(o.id));
  }, [filteredOrders, selectedOrderIds]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        isSomeFilteredSelected && !isAllFilteredSelected;
    }
  }, [isSomeFilteredSelected, isAllFilteredSelected]);

  function toggleSelectOrder(orderId: string) {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (isAllFilteredSelected) {
        // Deselect displayed orders
        filteredOrders.forEach((o) => next.delete(o.id));
      } else {
        // Select displayed orders
        filteredOrders.forEach((o) => next.add(o.id));
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedOrderIds(new Set());
  }

  // Print Handlers
  function handlePrintSingleOrder(order: Order) {
    const check = validateOrderForSlip(order);
    if (!check.isValid) {
      setValidationError({
        orderId: order.id,
        orderNumber: order.order_number,
        message: `Cannot print address slip for Order #${order.order_number}: ${check.reason}`,
      });
      return;
    }
    setValidationError(null);
    setOrdersToPrint([order]);
    setAutoTriggerPrint(true);
    setPrintModalOpen(true);
  }

  function handlePrintSelected() {
    const selected = orders.filter((o) => selectedOrderIds.has(o.id));
    if (selected.length === 0) return;

    const valid = selected.filter((o) => validateOrderForSlip(o).isValid);
    if (valid.length === 0) {
      setValidationError({
        orderId: selected[0]?.id,
        orderNumber: selected[0]?.order_number,
        message: `None of the ${selected.length} selected orders have a valid 6-digit PIN code and street address. Please update their addresses before printing.`,
      });
      return;
    }

    setValidationError(null);
    setOrdersToPrint(selected);
    setAutoTriggerPrint(true);
    setPrintModalOpen(true);
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
  }

  // Inline Status Update Handler
  async function handleInlineStatusChange(orderId: string, newStatus: ActiveOrderStatus) {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.order_status === newStatus) return;
    if (updatingOrderIds.has(orderId)) return;

    const previousStatus = targetOrder.order_status;
    setStatusNotification(null);

    // Optimistic Update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
    );
    setUpdatingOrderIds((prev) => new Set(prev).add(orderId));

    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setStatusNotification({
          type: "success",
          message: `Order #${targetOrder.order_number} status updated to ${newStatus.toUpperCase()}.`,
        });
      } else {
        // Rollback on server rejection
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, order_status: previousStatus } : o))
        );
        setStatusNotification({
          type: "error",
          message: `Failed to update Order #${targetOrder.order_number}: ${res.error || "Server update failed"}`,
        });
      }
    } catch {
      // Rollback on network failure
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: previousStatus } : o))
      );
      setStatusNotification({
        type: "error",
        message: `Network error updating Order #${targetOrder.order_number}. Changes rolled back.`,
      });
    } finally {
      setUpdatingOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Status Update Feedback Notification */}
      {statusNotification && (
        <div
          role="status"
          className={`p-4 rounded-lg flex items-center justify-between text-xs shadow-xs animate-in fade-in ${
            statusNotification.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-950"
              : "bg-rose-50 border border-rose-300 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{statusNotification.message}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="p-1 hover:opacity-70 transition-opacity shrink-0"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Validation Error Notification */}
      {validationError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between text-amber-950 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{validationError.message}</span>
            {validationError.orderId && (
              <Link
                href={`/admin/orders/${validationError.orderId}`}
                className="font-bold underline text-amber-900 hover:text-amber-950 inline-flex items-center gap-1 ml-1"
              >
                <span>Open Order #{validationError.orderNumber} to Update Address ➔</span>
              </Link>
            )}
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-amber-800 hover:text-amber-950 p-1 shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

        {/* Action Button Strip */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintSelected}
            disabled={selectedOrderIds.size === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold bg-cocoa-950 hover:bg-cocoa-900 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs min-h-[44px]"
            title={
              selectedOrderIds.size === 0
                ? "Select one or more orders to print address slips"
                : `Print address slips for ${selectedOrderIds.size} selected order(s)`
            }
          >
            <Printer className="w-4 h-4" />
            <span>
              Print Selected Address Slips
              {selectedOrderIds.size > 0 ? ` (${selectedOrderIds.size})` : ""}
            </span>
          </button>

          {selectedOrderIds.size > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-2.5 text-xs font-medium text-cocoa-600 hover:text-cocoa-950 bg-parchment-muted rounded border border-parchment-line transition-colors min-h-[44px]"
            >
              Deselect ({selectedOrderIds.size})
            </button>
          )}
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
          {/* Status Filter (Excludes Cancelled) */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none min-h-[44px]"
            aria-label="Filter by order status"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none min-h-[44px]"
            aria-label="Filter by payment state"
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
                  <th scope="col" className="py-3.5 pl-4 pr-1 w-10 text-center">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAll}
                      aria-label="Select all displayed orders"
                      className="w-4 h-4 rounded border-parchment-border text-cocoa-950 focus:ring-cocoa-950 cursor-pointer accent-[#140c08]"
                    />
                  </th>
                  <th scope="col" className="py-3.5 pl-2 pr-3">Order Number</th>
                  <th scope="col" className="py-3.5 px-3">Product</th>
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
                {filteredOrders.map((o) => {
                  const firstItem = o.items?.[0];
                  const imageUrl = firstItem?.product?.images?.[0]?.image_url;
                  const productName = firstItem?.product_name || firstItem?.product?.name;
                  const extraCount = (o.items?.length || 0) - 1;
                  const isSelected = selectedOrderIds.has(o.id);
                  const isUpdatingStatus = updatingOrderIds.has(o.id);
                  const statusStyle = getOrderStatusStyle(o.order_status);

                  return (
                    <tr
                      key={o.id}
                      className={`hover:bg-parchment-muted/30 transition-colors ${
                        isSelected ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-1 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(o.id)}
                          aria-label={`Select order ${o.order_number}`}
                          className="w-4 h-4 rounded border-parchment-border text-cocoa-950 focus:ring-cocoa-950 cursor-pointer accent-[#140c08]"
                        />
                      </td>
                      <td className="py-3.5 pl-2 pr-3 font-mono font-bold text-cocoa-950">
                        {o.order_number}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-11 h-11 rounded-md overflow-hidden bg-white border border-parchment-border shrink-0 flex items-center justify-center shadow-2xs">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={productName || "Product"}
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-parchment-muted text-cocoa-400">
                                <Package className="w-4 h-4 stroke-[1.5]" />
                              </div>
                            )}
                          </div>
                          {productName && (
                            <div className="min-w-0 max-w-[140px]">
                              <div className="font-semibold text-cocoa-950 truncate text-xs" title={productName}>
                                {productName}
                              </div>
                              {extraCount > 0 && (
                                <span className="text-[10px] text-cocoa-600 font-mono block">
                                  +{extraCount} more item{extraCount > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-cocoa-950">{o.customer_name}</div>
                        <div className="text-[11px] text-cocoa-600 font-mono">{o.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-3 text-cocoa-800">
                        <div>
                          {[o.shipping_district || o.shipping_city, o.shipping_state]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
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

                      {/* Phase 4: Inline Status Selector with Color-Coded Badges */}
                      <td className="py-3.5 px-3 text-center">
                        {o.order_status === "cancelled" ? (
                          <OrderStatusBadge
                            status="cancelled"
                            className="cursor-not-allowed opacity-80"
                          />
                        ) : (
                          <div className="relative inline-flex items-center justify-center">
                            {isUpdatingStatus ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${statusStyle.badgeClass} opacity-80 cursor-wait`}
                              >
                                <Loader2 className="w-3 h-3 animate-spin text-current" />
                                <span>Updating...</span>
                              </span>
                            ) : (
                              <div className="relative inline-block">
                                <select
                                  value={o.order_status}
                                  disabled={isUpdatingStatus}
                                  onChange={(e) =>
                                    handleInlineStatusChange(
                                      o.id,
                                      e.target.value as ActiveOrderStatus
                                    )
                                  }
                                  aria-label={`Update status for order ${o.order_number}`}
                                  className={`appearance-none cursor-pointer pl-2.5 pr-6 py-1 rounded text-[10px] font-mono font-bold uppercase transition-colors focus:outline-none focus:ring-1 focus:ring-cocoa-700 disabled:opacity-60 disabled:cursor-not-allowed ${statusStyle.badgeClass}`}
                                >
                                  {ACTIVE_ORDER_STATUSES.map((status) => (
                                    <option
                                      key={status}
                                      value={status}
                                      className="bg-white text-cocoa-950 font-sans text-xs capitalize"
                                    >
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Phase 5: Actions Column with WhatsApp Icon Button */}
                      <td className="py-3.5 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Row-Level WhatsApp Icon Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForWhatsApp(o);
                              setWhatsAppModalOpen(true);
                            }}
                            title="Send WhatsApp shipping notification"
                            aria-label={`Send WhatsApp shipping notification for order ${o.order_number}`}
                            className="inline-flex items-center justify-center p-1.5 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors shadow-2xs shrink-0"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Address Slip Button */}
                          <button
                            type="button"
                            onClick={() => handlePrintSingleOrder(o)}
                            title="Print Address Slip for this order"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-cocoa-800/30 bg-cocoa-950 hover:bg-cocoa-900 text-white text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Slip</span>
                          </button>

                          {/* View Order Details */}
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-parchment-line bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-950 transition-colors whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp Shipping & Tracking Modal */}
      <WhatsAppShippingModal
        isOpen={whatsAppModalOpen}
        onClose={() => {
          setWhatsAppModalOpen(false);
          setSelectedOrderForWhatsApp(null);
        }}
        order={selectedOrderForWhatsApp}
        onOrderUpdated={(updated) => {
          setOrders((prev) =>
            prev.map((ord) => (ord.id === updated.id ? { ...ord, ...updated } : ord))
          );
          setSelectedOrderForWhatsApp((prev) =>
            prev && prev.id === updated.id ? { ...prev, ...updated } : prev
          );
          setStatusNotification({
            type: "success",
            message: `Order #${selectedOrderForWhatsApp?.order_number || ""} updated: status is now ${updated.order_status.toUpperCase()}.`,
          });
        }}
      />

      {/* Address Slip Print Dialog & Printable Sheets */}
      <AddressSlipPrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        orders={ordersToPrint}
        onPrintComplete={clearSelection}
        autoTriggerPrint={autoTriggerPrint}
      />
    </div>
  );
}
