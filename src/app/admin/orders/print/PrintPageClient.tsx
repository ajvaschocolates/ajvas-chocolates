"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Order } from "@/types/orders";
import AddressSlipSheet from "@/components/admin/AddressSlipSheet";
import {
  chunkOrdersForPrint,
  getPrintPageCount,
  validateOrderForSlip,
} from "@/lib/orders/slip-utils";
import {
  Printer,
  ArrowLeft,
  AlertTriangle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PrintPageClientProps {
  initialOrders: Order[];
  autoPrint?: boolean;
}

export default function PrintPageClient({
  initialOrders,
  autoPrint = false,
}: PrintPageClientProps) {
  const [showExcluded, setShowExcluded] = useState(true);

  // Validate orders
  const { validOrders, invalidOrders } = useMemo(() => {
    const valid: Order[] = [];
    const invalid: { order: Order; reason: string }[] = [];

    initialOrders.forEach((o) => {
      const check = validateOrderForSlip(o);
      if (check.isValid) {
        valid.push(o);
      } else {
        invalid.push({ order: o, reason: check.reason || "Invalid address" });
      }
    });

    return { validOrders: valid, invalidOrders: invalid };
  }, [initialOrders]);

  const pages = useMemo(() => chunkOrdersForPrint(validOrders, 8), [validOrders]);
  const totalSheets = getPrintPageCount(validOrders.length, 8);

  useEffect(() => {
    if (autoPrint && validOrders.length > 0) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, validOrders.length]);

  function handlePrint() {
    window.print();
  }

  if (initialOrders.length === 0) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-parchment-surface border border-parchment-border rounded-xl p-8 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
          <h1 className="text-xl font-bold text-cocoa-950 font-sans">
            No Orders Selected to Print
          </h1>
          <p className="text-sm text-cocoa-600">
            Please return to the store orders dashboard and select one or more orders to print delivery address slips.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-cocoa-950 text-white text-sm font-semibold hover:bg-cocoa-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Store Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="ajvas-print-page" className="min-h-screen bg-neutral-900 text-white">
      {/* ========================================================
          1. SCREEN-ONLY TOP ACTION TOOLBAR
          ======================================================== */}
      <div className="screen-only sticky top-0 z-50 bg-parchment-surface text-cocoa-950 border-b border-parchment-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-parchment-border bg-parchment hover:bg-parchment-muted text-xs font-semibold text-cocoa-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Orders
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-sans text-cocoa-950 leading-tight">
                  Address Slip Printing
                </h1>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                  2×4 Grid • 8 Slips / Sheet
                </span>
              </div>
              <p className="text-xs text-cocoa-600">
                {validOrders.length} printable slip{validOrders.length === 1 ? "" : "s"} across {totalSheets} A4 sheet{totalSheets === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={validOrders.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-cocoa-950 hover:bg-cocoa-900 text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs min-h-[40px]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Valid Slips ({validOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Excluded Orders Warning Strip */}
        {invalidOrders.length > 0 && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 sm:px-6 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>{invalidOrders.length} order{invalidOrders.length > 1 ? "s" : ""} excluded:</strong> Missing or invalid 6-digit Indian PIN code.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowExcluded(!showExcluded)}
                className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2"
              >
                <span>{showExcluded ? "Hide Excluded" : "View Excluded"}</span>
                {showExcluded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showExcluded && (
              <div className="max-h-28 overflow-y-auto rounded border border-amber-200 bg-white/80 p-2 space-y-1 text-[11px] custom-scrollbar">
                {invalidOrders.map((item) => (
                  <div key={`excluded-${item.order.id}`} className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-cocoa-950">
                      {item.order.order_number}: <span className="font-normal font-sans text-amber-800">{item.reason}</span>
                    </span>
                    <Link
                      href={`/admin/orders/${item.order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cocoa-900 hover:text-cocoa-950 font-semibold underline shrink-0"
                    >
                      <span>Correct Address</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Printer setting advice */}
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 sm:px-6 text-[11px] text-blue-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Printer Setup:</strong> Set Paper Size to <strong>A4</strong> and Margins to <strong>None</strong> for exact 105 mm × 74.25 mm label placement.
          </span>
        </div>
      </div>

      {/* ========================================================
          SCREEN PREVIEW CONTAINER
          ======================================================== */}
      <div className="screen-only p-4 sm:p-8 flex flex-col items-center gap-8 bg-neutral-900 custom-scrollbar">
        {validOrders.length === 0 ? (
          <div className="my-16 max-w-md p-6 bg-parchment-surface rounded-xl border border-parchment-border text-center space-y-3 shadow-md text-cocoa-950">
            <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
            <h2 className="font-bold text-base">No Printable Address Slips</h2>
            <p className="text-xs text-cocoa-600">
              None of the requested orders have valid 6-digit PIN codes. Please correct the order addresses in the admin dashboard before printing.
            </p>
          </div>
        ) : (
          pages.map((pageOrders, pIdx) => (
            <div key={`screen-sheet-${pIdx}`} className="flex flex-col items-center">
              <div className="text-neutral-400 text-xs font-mono mb-2 flex items-center gap-2">
                <span>A4 Sheet {pIdx + 1} of {pages.length}</span>
                <span className="text-neutral-600">•</span>
                <span>{pageOrders.filter(Boolean).length} of 8 slots filled</span>
              </div>

              <div
                className="bg-white rounded shadow-2xl overflow-hidden border border-neutral-700"
                style={{
                  width: "210mm",
                  height: "297mm",
                  transform: "scale(0.72)",
                  transformOrigin: "top center",
                  marginBottom: "-83mm",
                }}
              >
                <AddressSlipSheet
                  orders={pageOrders}
                  sheetIndex={pIdx + 1}
                  totalSheets={pages.length}
                  showCutLines={true}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================
          PRINT-ONLY AREA (RENDERED DIRECTLY TO A4 PRINTER)
          ======================================================== */}
      <div className="ajvas-print-area hidden print:block bg-white text-black">
        {pages.map((pageOrders, pIdx) => (
          <AddressSlipSheet
            key={`route-print-sheet-${pIdx}`}
            orders={pageOrders}
            sheetIndex={pIdx + 1}
            totalSheets={pages.length}
            showCutLines={true}
          />
        ))}
      </div>
    </div>
  );
}
