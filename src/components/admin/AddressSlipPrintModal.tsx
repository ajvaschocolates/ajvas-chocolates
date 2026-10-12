"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Order } from "@/types/orders";
import {
  chunkOrdersForPrint,
  getPrintPageCount,
  validateOrderForSlip,
} from "@/lib/orders/slip-utils";
import AddressSlipSheet from "./AddressSlipSheet";
import {
  Printer,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InvalidOrderEntry {
  order: Order;
  reason: string;
}

interface AddressSlipPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onPrintComplete?: () => void;
  autoTriggerPrint?: boolean;
}

export default function AddressSlipPrintModal({
  isOpen,
  onClose,
  orders,
  onPrintComplete,
  autoTriggerPrint = false,
}: AddressSlipPrintModalProps) {
  const [mounted, setMounted] = useState(false);
  const [clearSelectionOnDone, setClearSelectionOnDone] = useState(true);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [showInvalidDetails, setShowInvalidDetails] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Separate valid orders from orders lacking valid delivery addresses / PIN codes
  const { validOrders, invalidOrders } = useMemo(() => {
    const valid: Order[] = [];
    const invalid: InvalidOrderEntry[] = [];

    // Deduplicate by ID to prevent accidental duplicate slips
    const seen = new Set<string>();
    orders.forEach((o) => {
      if (!seen.has(o.id)) {
        seen.add(o.id);
        const check = validateOrderForSlip(o);
        if (check.isValid) {
          valid.push(o);
        } else {
          invalid.push({
            order: o,
            reason: check.reason || "Invalid address",
          });
        }
      }
    });

    return { validOrders: valid, invalidOrders: invalid };
  }, [orders]);

  // Chunk valid orders into pages of 8 slips
  const pages = useMemo(() => {
    return chunkOrdersForPrint(validOrders, 8);
  }, [validOrders]);

  const totalSheets = getPrintPageCount(validOrders.length, 8);

  // Trigger browser print dialog
  const handlePrint = useCallback(() => {
    if (validOrders.length === 0) return;

    // Listen for afterprint event to clean up and clear selection
    const handleAfterPrint = () => {
      window.removeEventListener("afterprint", handleAfterPrint);
      setHasPrinted(true);
      if (clearSelectionOnDone && onPrintComplete) {
        onPrintComplete();
      }
    };

    window.addEventListener("afterprint", handleAfterPrint);

    // Small delay ensures DOM paint is complete before print dialog freeze
    setTimeout(() => {
      window.print();
    }, 120);
  }, [validOrders.length, clearSelectionOnDone, onPrintComplete]);

  // Handle auto-triggering print if requested and there are valid orders
  useEffect(() => {
    if (isOpen && autoTriggerPrint && validOrders.length > 0 && !hasPrinted) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoTriggerPrint, validOrders.length, hasPrinted, handlePrint]);

  // Escape key handler to close modal
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div id="ajvas-print-portal">
      {/* ========================================================
          1. SCREEN-ONLY INTERACTIVE PREVIEW MODAL
          ======================================================== */}
      <div className="screen-only fixed inset-0 z-[9999] flex flex-col bg-cocoa-950/80 backdrop-blur-xs text-cocoa-950 animate-in fade-in duration-200">
        {/* Modal Header Toolbar */}
        <header className="bg-parchment-surface border-b border-parchment-border px-4 py-3 sm:px-6 flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cocoa-950 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-sans text-cocoa-950 leading-tight">
                  Address Slip Printing
                </h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                  A4 • 8 Slips / Sheet
                </span>
              </div>
              <p className="text-xs text-cocoa-600">
                Arranged in a 2-column × 4-row grid (105 mm × 74.25 mm per slip)
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

            <button
              onClick={onClose}
              className="p-2 rounded-md text-cocoa-600 hover:text-cocoa-950 hover:bg-parchment-muted transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Modal Control & Information Bar */}
        <div className="bg-parchment border-b border-parchment-border px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs text-cocoa-800 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <FileText className="w-3.5 h-3.5 text-cocoa-600" />
              <span>
                <strong>{validOrders.length}</strong> printable {validOrders.length === 1 ? "slip" : "slips"}
              </span>
            </span>

            <span className="text-cocoa-400">•</span>

            <span className="inline-flex items-center gap-1.5 font-medium">
              <span>
                <strong>{totalSheets}</strong> A4 {totalSheets === 1 ? "sheet" : "sheets"}
              </span>
            </span>

            {invalidOrders.length > 0 && (
              <>
                <span className="text-cocoa-400">•</span>
                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {invalidOrders.length} excluded (invalid / missing PIN)
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-cocoa-700">
              <input
                type="checkbox"
                checked={clearSelectionOnDone}
                onChange={(e) => setClearSelectionOnDone(e.target.checked)}
                className="rounded border-cocoa-400 text-cocoa-950 focus:ring-cocoa-950 w-3.5 h-3.5"
              />
              <span>Clear table selection after printing</span>
            </label>
          </div>
        </div>

        {/* Excluded Orders Warning Banner (if any invalid orders were selected) */}
        {invalidOrders.length > 0 && (
          <div className="bg-amber-50/95 border-b border-amber-200 px-4 py-2.5 sm:px-6 text-xs text-amber-950 shrink-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>{invalidOrders.length} order{invalidOrders.length > 1 ? "s" : ""} cannot be printed</strong> because they lack a valid 6-digit PIN code or street address.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInvalidDetails(!showInvalidDetails)}
                className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2"
              >
                <span>{showInvalidDetails ? "Hide Details" : "View Excluded Orders"}</span>
                {showInvalidDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showInvalidDetails && (
              <div className="max-h-36 overflow-y-auto rounded border border-amber-200 bg-white/80 p-2 space-y-1.5 custom-scrollbar text-[11px]">
                {invalidOrders.map((item) => (
                  <div
                    key={`invalid-${item.order.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-1 px-2 rounded bg-amber-50/50 hover:bg-amber-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-bold text-cocoa-950">
                        {item.order.order_number}
                      </span>
                      <span className="text-cocoa-700 truncate max-w-[150px]">
                        ({item.order.customer_name})
                      </span>
                      <span className="text-amber-800 font-medium">
                        — {item.reason}
                      </span>
                    </div>

                    <Link
                      href={`/admin/orders/${item.order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cocoa-900 hover:text-cocoa-950 font-semibold underline underline-offset-2 shrink-0"
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

        {/* Printer Setup Guidance Strip */}
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 sm:px-6 flex items-center justify-between gap-2 text-[11px] text-blue-900 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Printer Recommendation:</strong> Set <strong>Margins: None</strong> and <strong>Paper Size: A4</strong> in the browser print dialog for exact label alignment.
            </span>
          </div>
          {hasPrinted && (
            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Printed
            </span>
          )}
        </div>

        {/* Scrollable Sheet Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-8 bg-neutral-900/60 custom-scrollbar">
          {validOrders.length === 0 ? (
            <div className="my-auto max-w-md p-6 bg-parchment-surface rounded-xl border border-parchment-border text-center space-y-3 shadow-md">
              <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-bold text-cocoa-950 text-base">No Printable Address Slips</h3>
              <p className="text-xs text-cocoa-600 leading-relaxed">
                {invalidOrders.length > 0
                  ? "None of the selected orders have a valid 6-digit Indian PIN code and street address. Delivery slips require a verified PIN code."
                  : "No orders are currently selected for printing."}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-cocoa-950 text-white rounded text-xs font-semibold hover:bg-cocoa-900"
              >
                Close Dialog
              </button>
            </div>
          ) : (
            pages.map((pageOrders, pIdx) => (
              <div key={`preview-sheet-${pIdx}`} className="flex flex-col items-center">
                <div className="text-neutral-300 text-xs font-mono mb-2 flex items-center gap-2">
                  <span>Sheet {pIdx + 1} of {pages.length}</span>
                  <span className="text-neutral-500">•</span>
                  <span>{pageOrders.filter(Boolean).length} of 8 slots filled</span>
                </div>

                {/* Scaled visual sheet preview */}
                <div
                  className="bg-white rounded shadow-2xl overflow-hidden border border-neutral-300"
                  style={{
                    width: "210mm",
                    height: "297mm",
                    transform: "scale(0.7)",
                    transformOrigin: "top center",
                    marginBottom: "-89mm", // Compensate for scale bounding box
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
      </div>

      {/* ========================================================
          2. PRINT-ONLY AREA (RENDERED DIRECTLY TO A4 PRINTER)
          Exact 1:1 scale (210mm x 297mm), zero screen scale,
          no shadows, no modal chrome. ONLY valid orders are rendered.
          ======================================================== */}
      <div className="ajvas-print-area hidden print:block">
        {pages.map((pageOrders, pIdx) => (
          <AddressSlipSheet
            key={`print-sheet-${pIdx}`}
            orders={pageOrders}
            sheetIndex={pIdx + 1}
            totalSheets={pages.length}
            showCutLines={true}
          />
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
