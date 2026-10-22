import type { ActiveOrderStatus, OrderStatus } from "@/types/orders";
import { ACTIVE_ORDER_STATUSES } from "@/types/orders";

export interface StatusStyleConfig {
  label: string;
  badgeClass: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

/**
  * Central color-coded status configuration for AJVAS Chocolates orders.
  * Mapping:
  * - Pending: Amber background with readable dark amber text
  * - Processing: Blue background with readable dark blue text
  * - Shipped: Purple/indigo background with readable dark purple text
  * - Delivered: Green background with readable dark green text
  * - Cancelled: Stone/neutral background for historical compatibility
  */
export const ORDER_STATUS_STYLES: Record<OrderStatus, StatusStyleConfig> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-100 text-amber-900 border border-amber-300",
    bgClass: "bg-amber-100",
    textClass: "text-amber-900",
    borderClass: "border-amber-300",
  },
  processing: {
    label: "Processing",
    badgeClass: "bg-blue-100 text-blue-900 border border-blue-300",
    bgClass: "bg-blue-100",
    textClass: "text-blue-900",
    borderClass: "border-blue-300",
  },
  shipped: {
    label: "Shipped",
    badgeClass: "bg-purple-100 text-purple-900 border border-purple-300",
    bgClass: "bg-purple-100",
    textClass: "text-purple-900",
    borderClass: "border-purple-300",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "bg-emerald-100 text-emerald-900 border border-emerald-300",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-900",
    borderClass: "border-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-stone-100 text-stone-700 border border-stone-300",
    bgClass: "bg-stone-100",
    textClass: "text-stone-700",
    borderClass: "border-stone-300",
  },
};

/**
  * Retrieves styling configuration for any order status string.
  */
export function getOrderStatusStyle(status: string | null | undefined): StatusStyleConfig {
  if (!status) {
    return {
      label: "Unknown",
      badgeClass: "bg-stone-100 text-stone-700 border border-stone-300",
      bgClass: "bg-stone-100",
      textClass: "text-stone-700",
      borderClass: "border-stone-300",
    };
  }

  const normalized = status.toLowerCase() as OrderStatus;
  if (ORDER_STATUS_STYLES[normalized]) {
    return ORDER_STATUS_STYLES[normalized];
  }

  // Fallback for custom or unrecognized statuses
  return {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    badgeClass: "bg-stone-100 text-stone-700 border border-stone-300",
    bgClass: "bg-stone-100",
    textClass: "text-stone-700",
    borderClass: "border-stone-300",
  };
}

/**
  * Checks if a status string is a valid active application status (excludes 'cancelled').
  */
export function isValidActiveStatus(status: unknown): status is ActiveOrderStatus {
  return typeof status === "string" && ACTIVE_ORDER_STATUSES.includes(status as ActiveOrderStatus);
}
