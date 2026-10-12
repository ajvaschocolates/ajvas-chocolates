"use client";

import React from "react";
import { Order } from "@/types/orders";
import { formatSlipAddress } from "@/lib/orders/slip-utils";

interface AddressSlipProps {
  order: Order | null;
  columnIndex?: number; // 0 (left) or 1 (right)
  rowIndex?: number;    // 0, 1, 2, or 3
  showCutLines?: boolean;
}

export default function AddressSlip({
  order,
  columnIndex = 0,
  rowIndex = 0,
  showCutLines = true,
}: AddressSlipProps) {
  // Border cut-lines:
  // Column 0 has a right dashed border separating it from Column 1.
  // Rows 0, 1, 2 have a bottom dashed border separating them from the next row down.
  const cutLineClasses = showCutLines
    ? `${columnIndex === 0 ? "border-r border-dashed border-neutral-300" : ""} ${
        rowIndex < 3 ? "border-b border-dashed border-neutral-300" : ""
      }`
    : "";

  // Render empty placeholder cell to preserve exact 2x4 A4 physical geometry
  if (!order) {
    return (
      <div
        className={`address-slip empty-cell relative box-border overflow-hidden bg-white ${cutLineClasses}`}
        style={{
          width: "105mm",
          height: "74.25mm",
          maxHeight: "74.25mm",
          boxSizing: "border-box",
        }}
        aria-hidden="true"
      >
        <div className="empty-cell-text w-full h-full flex items-center justify-center text-neutral-300 font-mono text-[9px] uppercase tracking-widest select-none">
          [ Empty Slot ]
        </div>
      </div>
    );
  }

  const {
    recipientName,
    phone,
    line1,
    line2,
    destination,
    pincode,
  } = formatSlipAddress(order);

  return (
    <div
      className={`address-slip relative box-border overflow-hidden bg-white text-black p-[3.5mm] flex flex-col justify-between ${cutLineClasses}`}
      style={{
        width: "105mm",
        height: "74.25mm",
        maxHeight: "74.25mm",
        boxSizing: "border-box",
      }}
    >
      {/* 1. Header Strip: Brand & Order Identification */}
      <div className="flex items-start justify-between border-b border-neutral-900 pb-[1.5mm] mb-[1.5mm] leading-none shrink-0">
        <div className="min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="font-sans font-black tracking-wider text-[11px] text-neutral-950 uppercase">
              AJVAS CHOCOLATES
            </span>
            <span className="text-[6.5px] font-mono uppercase bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded border border-neutral-300 font-bold leading-none">
              DELIVERY SLIP
            </span>
          </div>
          <div className="text-[7px] font-sans text-neutral-500 tracking-wide mt-0.5">
            Artisanal Confections • Express Parcel
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-[6.5px] font-mono uppercase text-neutral-500 font-semibold">
            ORDER #
          </div>
          <div className="font-mono font-bold text-[10.5px] text-neutral-950 tracking-tight mt-0.5">
            {order.order_number}
          </div>
        </div>
      </div>

      {/* 2. Recipient & Full Delivery Address Body */}
      <div className="flex-1 flex flex-col justify-start min-h-0 overflow-hidden leading-tight">
        {/* Recipient meta & Phone number */}
        <div className="flex items-center justify-between gap-1 mb-1 shrink-0">
          <span className="text-[7.5px] font-mono uppercase tracking-wider text-neutral-500 font-bold">
            SHIP TO:
          </span>
          {phone ? (
            <span className="text-[9.5px] font-mono font-bold text-neutral-950 tracking-tight">
              📞 {phone}
            </span>
          ) : null}
        </div>

        {/* Prominent Recipient Name */}
        <div className="font-sans font-extrabold text-[12.5px] text-neutral-950 uppercase tracking-tight truncate mb-1 shrink-0">
          {recipientName}
        </div>

        {/* Full Delivery Address Lines */}
        <div className="text-[9px] text-neutral-800 leading-snug font-normal space-y-0.5 overflow-hidden">
          {line1 ? (
            <div className="break-words line-clamp-2">
              {line1}
            </div>
          ) : null}

          {line2 ? (
            <div className="text-neutral-700 break-words line-clamp-1 text-[8.5px]">
              <span className="font-semibold text-neutral-900">Area / Landmark:</span> {line2}
            </div>
          ) : null}

          {destination ? (
            <div className="font-semibold text-neutral-950 break-words line-clamp-1 text-[9px] mt-0.5">
              {destination}
            </div>
          ) : null}
        </div>
      </div>

      {/* 3. Footer Strip: High-Contrast Mandatory PIN Badge & Return Origin */}
      <div className="flex items-end justify-between border-t border-neutral-300 pt-[1.5mm] mt-[1.2mm] shrink-0">
        {/* Mandatory Prominent PIN Code Badge */}
        <div className="flex items-center gap-1.5">
          <div
            className="bg-neutral-950 text-white px-2.5 py-1 rounded font-mono font-black text-[12px] tracking-widest leading-none shadow-2xs border border-neutral-950 inline-flex items-center gap-1.5"
            title={`PIN Code: ${pincode}`}
          >
            <span className="text-[7.5px] font-sans font-bold text-neutral-300 uppercase tracking-normal">
              PIN CODE
            </span>
            <span className="text-[12px] tracking-widest">{pincode}</span>
          </div>
        </div>

        {/* Sender Return Origin */}
        <div className="text-right text-[7px] text-neutral-500 leading-tight">
          <div className="font-semibold text-neutral-800">SENDER: AJVAS CHOCOLATES</div>
          <div>ajvaschocolates.com</div>
        </div>
      </div>
    </div>
  );
}
