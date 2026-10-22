"use client";

import { useState, useRef, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Order, ActiveOrderStatus, ACTIVE_ORDER_STATUSES } from "@/types/orders";
import { updateOrderStatusAction, getAdminOrdersForDateAction } from "@/app/admin/orders/actions";
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
  CalendarDays,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import AddressSlipPrintModal from "./AddressSlipPrintModal";
import { validateOrderForSlip } from "@/lib/orders/slip-utils";
import {
  DEFAULT_ORDER_SORT,
  ORDER_SORT_OPTIONS,
  OrderSortOption,
  formatDateKeyLong,
  formatOrderCount,
  formatOrderDateShort,
  formatOrderTime,
  getDateGroupLabel,
  getOrderDateKey,
  getStoreTodayKey,
  groupOrdersByDate,
  isOrderSortOption,
  isValidDateKey,
} from "@/lib/orders/date-utils";

/** Number of columns in the orders table (used by full-width date header rows). */
const TABLE_COLUMN_COUNT = 10;

type TableRow =
  | { type: "header"; key: string; count: number }
  | { type: "order"; order: Order };

interface OrderListClientProps {
  initialOrders: Order[];
  /** Max number of most-recent orders loaded by the page (for the "latest N" notice). */
  loadLimit?: number;
}

export default function OrderListClient({ initialOrders, loadLimit }: OrderListClientProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Date filter & sort state (date is an Asia/Kolkata calendar day "YYYY-MM-DD")
  const [selectedDate, setSelectedDate] = useState("");
  const [sortOption, setSortOption] = useState<OrderSortOption>(DEFAULT_ORDER_SORT);
  // Orders fetched server-side for the selected date (covers days beyond the initial load limit)
  const [dateOrders, setDateOrders] = useState<Order[]>([]);
  const [dateLoading, setDateLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const dateRequestRef = useRef(0);
  const [isRefreshing, startRefresh] = useTransition();

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
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Measure actual rendered admin header and sticky toolbar heights dynamically
  const [adminHeaderHeight, setAdminHeaderHeight] = useState(80);
  const [toolbarHeight, setToolbarHeight] = useState(78);

  useEffect(() => {
    function measureHeader() {
      const headerEl =
        document.querySelector("header.sticky") ||
        document.querySelector("header");
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        if (rect.height > 0) {
          setAdminHeaderHeight(rect.height);
        }
      }
    }

    measureHeader();

    let ro: ResizeObserver | null = null;
    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      if (rect.height > 0) {
        setToolbarHeight(rect.height);
      }

      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
            if (h > 0) setToolbarHeight(h);
          }
        });
        ro.observe(toolbarRef.current);
      }
    }

    window.addEventListener("resize", measureHeader);
    return () => {
      window.removeEventListener("resize", measureHeader);
      ro?.disconnect();
    };
  }, []);

  const tableHeaderTop = adminHeaderHeight + (toolbarHeight || 78);

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

  // Loaded orders plus any historical orders fetched for the selected date (deduped by id;
  // the primary list wins so it always reflects the freshest server data).
  const allOrders = useMemo(() => {
    if (dateOrders.length === 0) return orders;
    const loadedIds = new Set(orders.map((o) => o.id));
    return [...orders, ...dateOrders.filter((o) => !loadedIds.has(o.id))];
  }, [orders, dateOrders]);

  const filteredOrders = allOrders.filter((o) => {
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
    // Date filter uses the placement timestamp (created_at) in Asia/Kolkata
    if (selectedDate && getOrderDateKey(o) !== selectedDate) return false;

    return true;
  });

  // Sorted, date-grouped rows. Groups are derived from matching orders, so empty groups never appear.
  const todayKey = getStoreTodayKey();
  const tableRows: TableRow[] = [];
  for (const group of groupOrdersByDate(filteredOrders, sortOption)) {
    tableRows.push({ type: "header", key: group.key, count: group.orders.length });
    group.orders.forEach((order) => tableRows.push({ type: "order", order }));
  }

  const isLimitReached = typeof loadLimit === "number" && orders.length >= loadLimit;

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
    const selected = allOrders.filter((o) => selectedOrderIds.has(o.id));
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

  // Date filter: fetch the full IST day from the server so historical days beyond the
  // initial load limit are complete. Stale responses are ignored via a request counter.
  async function loadOrdersForDate(dateKey: string) {
    const requestId = ++dateRequestRef.current;
    setDateLoading(true);
    setDateError(null);
    try {
      const res = await getAdminOrdersForDateAction(dateKey);
      if (requestId !== dateRequestRef.current) return;
      setDateOrders(res.orders);
      if (!res.success) {
        setDateError(
          `${res.error || "Could not load orders for this date."} Showing matching orders from the loaded list only.`
        );
      }
    } catch {
      if (requestId !== dateRequestRef.current) return;
      setDateOrders([]);
      setDateError(
        "Network error loading orders for this date. Showing matching orders from the loaded list only."
      );
    } finally {
      if (requestId === dateRequestRef.current) setDateLoading(false);
    }
  }

  function handleDateChange(value: string) {
    if (!value || !isValidDateKey(value)) {
      clearDateFilter();
      return;
    }
    setSelectedDate(value);
    void loadOrdersForDate(value);
  }

  function clearDateFilter() {
    dateRequestRef.current++; // invalidate any in-flight date request
    setSelectedDate("");
    setDateOrders([]);
    setDateLoading(false);
    setDateError(null);
    // Drop selections that only existed in the date-specific result set
    const loadedIds = new Set(orders.map((o) => o.id));
    setSelectedOrderIds((prev) => {
      const next = new Set([...prev].filter((id) => loadedIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }

  // Refresh: re-fetch server data; filter/sort state lives in this component and is preserved.
  function handleRefresh() {
    startRefresh(() => {
      router.refresh();
    });
    if (selectedDate) void loadOrdersForDate(selectedDate);
  }

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setSortOption(DEFAULT_ORDER_SORT);
    clearDateFilter();
  }

  const hasActiveFilters =
    !!searchQuery ||
    statusFilter !== "ALL" ||
    paymentFilter !== "ALL" ||
    !!selectedDate ||
    sortOption !== DEFAULT_ORDER_SORT;

  // Applies a partial update to an order in both the loaded list and date-fetched list
  function patchOrder(orderId: string, patch: Partial<Order>) {
    const apply = (list: Order[]) =>
      list.some((o) => o.id === orderId)
        ? list.map((o) => (o.id === orderId ? { ...o, ...patch } : o))
        : list;
    setOrders(apply);
    setDateOrders(apply);
  }

  // Inline Status Update Handler
  async function handleInlineStatusChange(orderId: string, newStatus: ActiveOrderStatus) {
    const targetOrder = allOrders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.order_status === newStatus) return;
    if (updatingOrderIds.has(orderId)) return;

    const previousStatus = targetOrder.order_status;
    setStatusNotification(null);

    // Optimistic Update
    patchOrder(orderId, { order_status: newStatus });
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
        patchOrder(orderId, { order_status: previousStatus });
        setStatusNotification({
          type: "error",
          message: `Failed to update Order #${targetOrder.order_number}: ${res.error || "Server update failed"}`,
        });
      }
    } catch {
      // Rollback on network failure
      patchOrder(orderId, { order_status: previousStatus });
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
    <div className="p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full space-y-3 sm:space-y-3.5">
      {/* Status Update Feedback Notification */}
      {statusNotification && (
        <div
          role="status"
          className={`py-2.5 px-3.5 rounded-lg flex items-center justify-between text-xs shadow-xs animate-in fade-in ${
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
            className="p-1 hover:opacity-70 transition-opacity shrink-0 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Validation Error Notification */}
      {validationError && (
        <div className="py-2.5 px-3.5 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between text-amber-950 text-xs shadow-xs animate-in fade-in">
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
            className="text-amber-800 hover:text-amber-950 p-1 shrink-0 cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header — Compact Title, Subtitle & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-parchment-border">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-cocoa-600 mb-0.5">
            <span>Store Operations</span>
            <span>/</span>
            <span className="text-cocoa-950 font-medium">Orders</span>
          </div>
          <div className="flex items-baseline gap-2.5 flex-wrap">
            <h1 className="font-sans text-xl sm:text-2xl font-bold text-cocoa-950 tracking-tight">
              Store Orders
            </h1>
            <p className="text-xs text-cocoa-600 hidden sm:inline">
              Manage guest checkout orders, shipping dispatch, and order fulfillment.
            </p>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrintSelected}
            disabled={selectedOrderIds.size === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-cocoa-950 hover:bg-cocoa-900 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs h-8 cursor-pointer"
            title={
              selectedOrderIds.size === 0
                ? "Select one or more orders to print address slips"
                : `Print address slips for ${selectedOrderIds.size} selected order(s)`
            }
          >
            <Printer className="w-3.5 h-3.5" />
            <span>
              Print Selected Address Slips
              {selectedOrderIds.size > 0 ? ` (${selectedOrderIds.size})` : ""}
            </span>
          </button>

          {selectedOrderIds.size > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="px-2.5 py-1.5 text-xs font-medium text-cocoa-600 hover:text-cocoa-950 bg-parchment-muted rounded border border-parchment-line transition-colors h-8 cursor-pointer"
            >
              Deselect ({selectedOrderIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards — 1 Compact Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
        <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-parchment-muted/60 rounded border border-parchment-border flex flex-col justify-center">
          <span className="text-[11px] font-medium text-cocoa-600 truncate">Total Orders</span>
          <span className="text-base sm:text-lg font-bold text-cocoa-950 leading-tight mt-0.5">{totalCount}</span>
        </div>
        <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-50/60 rounded border border-amber-200 flex flex-col justify-center">
          <span className="text-[11px] font-medium text-amber-800 truncate">Pending</span>
          <span className="text-base sm:text-lg font-bold text-amber-950 leading-tight mt-0.5">{pendingCount}</span>
        </div>
        <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-blue-50/60 rounded border border-blue-200 flex flex-col justify-center">
          <span className="text-[11px] font-medium text-blue-800 truncate">Processing</span>
          <span className="text-base sm:text-lg font-bold text-blue-950 leading-tight mt-0.5">{processingCount}</span>
        </div>
        <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-purple-50/60 rounded border border-purple-200 flex flex-col justify-center">
          <span className="text-[11px] font-medium text-purple-800 truncate">Shipped</span>
          <span className="text-base sm:text-lg font-bold text-purple-950 leading-tight mt-0.5">{shippedCount}</span>
        </div>
        <div className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-emerald-50/60 rounded border border-emerald-200 flex flex-col justify-center">
          <span className="text-[11px] font-medium text-emerald-800 truncate">Delivered</span>
          <span className="text-base sm:text-lg font-bold text-emerald-950 leading-tight mt-0.5">{deliveredCount}</span>
        </div>
      </div>

      {/* Sticky Orders Toolbar Container */}
      <div
        ref={toolbarRef}
        style={{ top: `${adminHeaderHeight}px` }}
        className="sticky z-20 -mx-3 sm:-mx-5 lg:-mx-6 px-3 sm:px-5 lg:px-6 py-2 bg-parchment border-b border-parchment-border shadow-xs space-y-1.5"
      >
        {/* Toolbar Row 1: Search, Order Status, Payment Status */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cocoa-600">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer name, phone, or pincode..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-parchment-surface border border-parchment-border rounded text-cocoa-950 placeholder-cocoa-600/70 focus:outline-none focus:border-cocoa-700 h-8"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-cocoa-500 hover:text-cocoa-800 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status & Payment Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none h-8 cursor-pointer"
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
              className="px-2.5 py-1 text-xs font-medium bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus:outline-none h-8 cursor-pointer"
              aria-label="Filter by payment state"
            >
              <option value="ALL">All Payment States</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Payment Paid</option>
              <option value="failed">Payment Failed</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1 text-xs font-medium text-cocoa-600 hover:text-cocoa-950 bg-parchment-muted rounded border border-parchment-line transition-colors flex items-center gap-1 h-8 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Row 2: Date Picker, Sort By, Refresh & Results Count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-parchment-border/40 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Filter */}
            <label
              htmlFor="order-date-filter"
              className="relative inline-flex items-center gap-1.5 pl-2.5 pr-2 bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus-within:border-cocoa-700 h-8 cursor-pointer"
            >
              <CalendarDays className="w-3.5 h-3.5 text-cocoa-600 shrink-0" />
              <span className="text-[11px] font-medium text-cocoa-600 whitespace-nowrap">Date:</span>
              <input
                id="order-date-filter"
                type="date"
                value={selectedDate}
                max={todayKey}
                onChange={(e) => handleDateChange(e.target.value)}
                className="py-1 text-xs font-medium bg-transparent text-cocoa-950 focus:outline-none cursor-pointer"
                aria-label="Filter orders by placement date (IST)"
              />
            </label>

            {selectedDate && (
              <button
                id="clear-date-filter"
                type="button"
                onClick={clearDateFilter}
                className="px-2.5 py-1 text-xs font-semibold text-cocoa-950 bg-amber-50 hover:bg-amber-100 rounded border border-amber-300 transition-colors inline-flex items-center gap-1 h-8 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Clear Date</span>
              </button>
            )}

            {/* Sort Control */}
            <label
              htmlFor="order-sort"
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1 bg-parchment-surface border border-parchment-border rounded text-cocoa-950 focus-within:border-cocoa-700 h-8 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cocoa-600 shrink-0" />
              <span className="text-[11px] font-medium text-cocoa-600 whitespace-nowrap">Sort:</span>
              <select
                id="order-sort"
                value={sortOption}
                onChange={(e) => {
                  if (isOrderSortOption(e.target.value)) setSortOption(e.target.value);
                }}
                className="pr-2 py-1 text-xs font-semibold bg-transparent text-cocoa-950 focus:outline-none cursor-pointer"
              >
                {ORDER_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Refresh Button */}
            <button
              id="refresh-orders"
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-2.5 py-1 text-xs font-medium text-cocoa-950 bg-parchment-surface hover:bg-parchment-muted rounded border border-parchment-border transition-colors inline-flex items-center gap-1 h-8 disabled:opacity-60 disabled:cursor-wait cursor-pointer"
              title="Reload the latest orders (keeps current filters and sort)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>

          {/* Compact Results Summary & Quick Bulk Action */}
          <div className="flex items-center gap-2 text-xs text-cocoa-600 shrink-0 justify-between sm:justify-end" aria-live="polite">
            {selectedOrderIds.size > 0 && (
              <button
                type="button"
                onClick={handlePrintSelected}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-cocoa-950 hover:bg-cocoa-900 text-white text-[11px] font-semibold transition-colors shadow-2xs h-7 cursor-pointer"
                title={`Print address slips for ${selectedOrderIds.size} selected order(s)`}
              >
                <Printer className="w-3 h-3" />
                <span>Print Slips ({selectedOrderIds.size})</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              {selectedDate && dateLoading && <Loader2 className="w-3 h-3 animate-spin text-cocoa-600" />}
              {selectedDate ? (
                <span>
                  <span className="font-semibold text-cocoa-950">
                    {formatDateKeyLong(selectedDate)}:
                  </span>{" "}
                  {dateLoading ? "loading..." : formatOrderCount(filteredOrders.length)}
                </span>
              ) : (
                <span>
                  <span className="font-semibold text-cocoa-950">{formatOrderCount(filteredOrders.length)}</span>{" "}
                  orders (IST)
                </span>
              )}
              {!selectedDate && isLimitReached && (
                <span className="text-[11px] text-cocoa-500 font-mono">
                  (Latest {loadLimit})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date Error notification within sticky toolbar */}
        {dateError && (
          <div className="p-2 bg-amber-50 border border-amber-300 rounded text-amber-950 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{dateError}</span>
          </div>
        )}
      </div>

      {/* Orders Table Area */}
      {filteredOrders.length === 0 ? (
        <div className="py-12 px-4 text-center bg-parchment-surface rounded border border-dashed border-parchment-border space-y-2.5">
          {selectedDate && dateLoading ? (
            <Loader2 className="w-8 h-8 text-cocoa-400 mx-auto animate-spin" />
          ) : (
            <ShoppingBag className="w-8 h-8 text-cocoa-400 mx-auto" />
          )}
          <h3 className="font-sans text-base font-bold text-cocoa-950">
            {selectedDate && dateLoading ? "Loading orders..." : "No orders found"}
          </h3>
          <p className="text-xs text-cocoa-600 max-w-sm mx-auto">
            {selectedDate
              ? dateLoading
                ? `Fetching orders placed on ${formatDateKeyLong(selectedDate)}.`
                : `No orders placed on ${formatDateKeyLong(selectedDate)} match your active filters.`
              : orders.length === 0
              ? "No store orders have been recorded in the database yet."
              : "No orders match your active search and status filter parameters."}
          </p>
        </div>
      ) : (
        <div className="bg-parchment-surface border border-parchment-border rounded shadow-2xs overflow-x-auto lg:overflow-visible">
          <table className="w-full text-left border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="bg-parchment-muted text-[11px] font-bold uppercase tracking-wider text-cocoa-600 border-b border-parchment-border">
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 pl-3 pr-1 w-10 text-center bg-parchment-muted border-b border-parchment-border z-10"
                >
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all displayed orders"
                    className="w-4 h-4 rounded border-parchment-border text-cocoa-950 focus:ring-cocoa-950 cursor-pointer accent-[#140c08]"
                  />
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 pl-2 pr-2.5 bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Order Number
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 px-2.5 bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Product
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 px-2.5 bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 px-2.5 bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Destination
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 px-2 bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Date
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 px-2 text-right bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Total Amount
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 px-2 text-center bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Payment
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 px-2 text-center bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Order Status
                </th>
                <th
                  scope="col"
                  style={{ top: `${tableHeaderTop}px` }}
                  className="lg:sticky py-2.5 pl-2 pr-3 text-right bg-parchment-muted border-b border-parchment-border z-10 whitespace-nowrap"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                if (row.type === "header") {
                  const label = selectedDate
                    ? `Orders for ${formatDateKeyLong(row.key)}`
                    : getDateGroupLabel(row.key, todayKey);
                  return (
                    <tr key={`date-${row.key}`} className="bg-parchment-muted/80">
                      <th
                        scope="colgroup"
                        colSpan={TABLE_COLUMN_COUNT}
                        className="py-2 pl-4 pr-4 text-left border-b border-parchment-border"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <CalendarDays className="w-3.5 h-3.5 text-cocoa-600 shrink-0" />
                          <span className="font-bold text-cocoa-950">{label}</span>
                          <span className="font-mono text-[11px] font-semibold text-cocoa-600">
                            ({formatOrderCount(row.count)})
                          </span>
                        </div>
                      </th>
                    </tr>
                  );
                }

                const o = row.order;
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
                    <td className="py-2 pl-3 pr-1 text-center border-b border-parchment-border">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(o.id)}
                        aria-label={`Select order ${o.order_number}`}
                        className="w-4 h-4 rounded border-parchment-border text-cocoa-950 focus:ring-cocoa-950 cursor-pointer accent-[#140c08]"
                      />
                    </td>
                    <td className="py-2 pl-2 pr-2.5 font-mono font-bold text-cocoa-950 border-b border-parchment-border whitespace-nowrap">
                      {o.order_number}
                    </td>
                    <td className="py-2 px-2.5 border-b border-parchment-border">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white border border-parchment-border shrink-0 flex items-center justify-center shadow-2xs">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={productName || "Product"}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-parchment-muted text-cocoa-400">
                              <Package className="w-3.5 h-3.5 stroke-[1.5]" />
                            </div>
                          )}
                        </div>
                        {productName && (
                          <div className="min-w-0 max-w-[130px]">
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
                    <td className="py-2 px-2.5 border-b border-parchment-border">
                      <div className="font-semibold text-cocoa-950 truncate max-w-[120px]">{o.customer_name}</div>
                      <div className="text-[11px] text-cocoa-600 font-mono">{o.customer_phone}</div>
                    </td>
                    <td className="py-2 px-2.5 text-cocoa-800 border-b border-parchment-border">
                      <div className="truncate max-w-[120px]">
                        {[o.shipping_district || o.shipping_city, o.shipping_state]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      <div className="text-[11px] text-cocoa-600 font-mono">{o.shipping_pincode}</div>
                    </td>
                    <td className="py-2 px-2 text-cocoa-700 whitespace-nowrap font-mono border-b border-parchment-border">
                      <div>{formatOrderDateShort(o.created_at)}</div>
                      {formatOrderTime(o.created_at) && (
                        <div className="text-[10px] text-cocoa-600">{formatOrderTime(o.created_at)}</div>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-cocoa-950 border-b border-parchment-border whitespace-nowrap">
                      ₹{Number(o.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 px-2 text-center border-b border-parchment-border whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
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

                    {/* Inline Status Selector with Color-Coded Badges */}
                    <td className="py-2 px-2 text-center border-b border-parchment-border whitespace-nowrap">
                      {o.order_status === "cancelled" ? (
                        <OrderStatusBadge
                          status="cancelled"
                          className="cursor-not-allowed opacity-80"
                        />
                      ) : (
                        <div className="relative inline-flex items-center justify-center">
                          {isUpdatingStatus ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${statusStyle.badgeClass} opacity-80 cursor-wait`}
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
                                className={`appearance-none cursor-pointer pl-2 pr-5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors focus:outline-none focus:ring-1 focus:ring-cocoa-700 disabled:opacity-60 disabled:cursor-not-allowed ${statusStyle.badgeClass}`}
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
                              <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions Column with WhatsApp, Print Slip, and View */}
                    <td className="py-2 pl-2 pr-3 text-right border-b border-parchment-border whitespace-nowrap">
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
                          className="inline-flex items-center justify-center p-1.5 rounded bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors shadow-2xs shrink-0 cursor-pointer"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5" />
                        </button>

                        {/* Print Address Slip Button */}
                        <button
                          type="button"
                          onClick={() => handlePrintSingleOrder(o)}
                          title="Print Address Slip for this order"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-cocoa-800/30 bg-cocoa-950 hover:bg-cocoa-900 text-white text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print Slip</span>
                        </button>

                        {/* View Order Details */}
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-parchment-line bg-parchment-surface hover:bg-parchment-muted text-xs font-semibold text-cocoa-950 transition-colors whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
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
          patchOrder(updated.id, updated);
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
