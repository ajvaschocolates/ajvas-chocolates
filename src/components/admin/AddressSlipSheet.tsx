"use client";

import React from "react";
import { Order } from "@/types/orders";
import AddressSlip from "./AddressSlip";

interface AddressSlipSheetProps {
  /**
   * Array of exactly 8 slots (Order or null for empty cells)
   */
  orders: (Order | null)[];
  sheetIndex?: number;
  totalSheets?: number;
  showCutLines?: boolean;
}

export default function AddressSlipSheet({
  orders,
  sheetIndex,
  totalSheets,
  showCutLines = true,
}: AddressSlipSheetProps) {
  // Ensure we have exactly 8 slots
  const slots: (Order | null)[] = [...orders];
  while (slots.length < 8) {
    slots.push(null);
  }

  return (
    <div
      className="address-sheet relative bg-white box-border overflow-hidden select-none"
      style={{
        width: "210mm",
        height: "297mm",
        maxHeight: "297mm",
        minHeight: "297mm",
        display: "grid",
        gridTemplateColumns: "105mm 105mm",
        gridTemplateRows: "74.25mm 74.25mm 74.25mm 74.25mm",
        gap: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      data-sheet-index={sheetIndex}
      data-total-sheets={totalSheets}
    >
      {slots.slice(0, 8).map((order, idx) => {
        const columnIndex = idx % 2; // 0 for left, 1 for right
        const rowIndex = Math.floor(idx / 2); // 0, 1, 2, 3 for 4 rows
        const key = order ? `order-${order.id}-${idx}` : `empty-${sheetIndex ?? 0}-${idx}`;

        return (
          <AddressSlip
            key={key}
            order={order}
            columnIndex={columnIndex}
            rowIndex={rowIndex}
            showCutLines={showCutLines}
          />
        );
      })}
    </div>
  );
}
