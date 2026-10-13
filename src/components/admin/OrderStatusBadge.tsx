import React from "react";
import { OrderStatus } from "@/types/orders";
import { getOrderStatusStyle } from "@/lib/orders/status-utils";

interface OrderStatusBadgeProps {
  status: OrderStatus | string | null | undefined;
  className?: string;
}

export default function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const config = getOrderStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${config.badgeClass} ${className}`}
    >
      {config.label}
    </span>
  );
}
