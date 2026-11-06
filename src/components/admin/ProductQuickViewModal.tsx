"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Order, OrderItem } from "@/types/orders";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  X,
  Package,
  Eye,
  Gift,
  Scale,
  Box,
  Tag,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";
import { formatOrderDateShort, formatOrderTime } from "@/lib/orders/date-utils";

export interface ProductQuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  /** Specific order item to display initially */
  initialItem?: OrderItem | null;
}

export default function ProductQuickViewModal({
  isOpen,
  onClose,
  order,
  initialItem,
}: ProductQuickViewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useMemo(() => {
    return order?.items && order.items.length > 0 ? order.items : [];
  }, [order?.items]);

  // Synchronize active item when modal opens or initialItem changes
  useEffect(() => {
    if (isOpen && items.length > 0) {
      if (initialItem) {
        const foundIndex = items.findIndex(
          (it) => it.id === initialItem.id || (it.product_id && it.product_id === initialItem.product_id)
        );
        setSelectedItemIndex(foundIndex >= 0 ? foundIndex : 0);
      } else {
        setSelectedItemIndex(0);
      }
      setSelectedImageIndex(0);
    }
  }, [isOpen, initialItem, items]);

  // Reset selected image when changing active item
  const handleSelectItem = useCallback((idx: number) => {
    setSelectedItemIndex(idx);
    setSelectedImageIndex(0);
  }, []);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!mounted || !isOpen || !order) return null;

  const currentItem = items[selectedItemIndex] || items[0];
  const productName = currentItem?.product_name || currentItem?.product?.name || "Product";
  
  // Images
  const productImages = currentItem?.product?.images && currentItem.product.images.length > 0
    ? currentItem.product.images
    : [];
  const currentImageUrl = productImages[selectedImageIndex]?.image_url || productImages[0]?.image_url;

  // Specifications
  const effectiveWeight = currentItem?.weight_grams || currentItem?.product?.weight_grams;
  const effectiveLength = currentItem?.length_cm ?? currentItem?.product?.length_cm;
  const effectiveWidth = currentItem?.width_cm ?? currentItem?.product?.width_cm;
  const effectiveHeight = currentItem?.height_cm ?? currentItem?.product?.height_cm;
  const hasDimensions = Boolean(effectiveLength && effectiveWidth && effectiveHeight);

  // Pricing & Quantities
  const quantity = currentItem?.quantity ?? 1;
  const unitPrice = currentItem?.unit_price ?? (
    currentItem?.line_total && quantity > 0
      ? currentItem.line_total / quantity
      : 0
  );
  const lineTotal = currentItem?.line_total ?? (unitPrice * quantity);
  const discountAmount = currentItem?.discount_amount ?? 0;

  // Customization & Gift details
  const itemCustomization = currentItem?.customization?.trim();
  const orderGiftPurpose = order.gift_purpose?.trim();
  const orderGiftDescription = (
    order.custom_gift_purpose_description ||
    order.gift_purpose_description
  )?.trim();
  const giftFee = order.gift_purpose_fee;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-quickview-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-cocoa-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-parchment-surface rounded-2xl border border-parchment-border shadow-elevated overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-parchment-border bg-parchment-muted/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cocoa-950 text-amber-300/90 flex items-center justify-center shrink-0 shadow-2xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-cocoa-700">
                  Product Quick-View
                </span>
                <span className="text-cocoa-300">•</span>
                <span className="font-mono text-xs font-bold text-cocoa-950">
                  Order #{order.order_number}
                </span>
                <OrderStatusBadge status={order.order_status} />
              </div>
              <p className="text-[11px] text-cocoa-600 truncate">
                Customer: <strong className="text-cocoa-900 font-semibold">{order.customer_name}</strong>
                {order.customer_phone && <span className="font-mono ml-1.5">({order.customer_phone})</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick-view modal"
            className="p-1.5 rounded-lg text-cocoa-500 hover:text-cocoa-950 hover:bg-parchment-muted transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Item Tabs (Rendered only when order has multiple items) */}
        {items.length > 1 && (
          <div className="px-5 py-2.5 bg-parchment-muted/30 border-b border-parchment-border overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cocoa-600 font-semibold mr-1">
                Order Items ({items.length}):
              </span>
              {items.map((item, idx) => {
                const isSelected = idx === selectedItemIndex;
                const thumb = item.product?.images?.[0]?.image_url;
                const name = item.product_name || item.product?.name || `Item ${idx + 1}`;

                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => handleSelectItem(idx)}
                    role="tab"
                    aria-selected={isSelected}
                    className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-cocoa-950 text-white border-cocoa-950 shadow-2xs"
                        : "bg-white text-cocoa-800 border-parchment-border hover:bg-parchment-muted/80 hover:text-cocoa-950"
                    }`}
                  >
                    <div className="w-5 h-5 rounded bg-white/90 border border-parchment-border shrink-0 overflow-hidden flex items-center justify-center">
                      {thumb ? (
                        <img src={thumb} alt={name} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-3 h-3 text-cocoa-400" />
                      )}
                    </div>
                    <span className="max-w-[120px] truncate">{name}</span>
                    <span
                      className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                        isSelected ? "bg-white/20 text-white" : "bg-parchment-muted text-cocoa-600"
                      }`}
                    >
                      ×{item.quantity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-5 sm:p-6 max-h-[calc(85vh-130px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Product Image Preview */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="relative w-full aspect-square rounded-xl bg-white border border-parchment-border overflow-hidden flex items-center justify-center p-3 shadow-2xs group">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={productName}
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-cocoa-400 bg-parchment-muted/40 rounded-lg">
                    <Package className="w-12 h-12 stroke-[1.25] text-cocoa-300" />
                    <span className="text-xs font-mono font-medium text-cocoa-500 uppercase mt-2">
                      No Image Available
                    </span>
                  </div>
                )}

                {/* Quantity Pill Overlay on image */}
                <div className="absolute top-2.5 left-2.5 bg-cocoa-950/85 backdrop-blur-xs text-white text-[11px] font-mono font-semibold px-2 py-0.5 rounded shadow-2xs">
                  Qty: {quantity}
                </div>
              </div>

              {/* Multiple Product Images Gallery Selector */}
              {productImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {productImages.map((img, imgIdx) => (
                    <button
                      key={imgIdx}
                      type="button"
                      onClick={() => setSelectedImageIndex(imgIdx)}
                      className={`relative w-12 h-12 rounded-lg bg-white border overflow-hidden shrink-0 transition-all cursor-pointer ${
                        imgIdx === selectedImageIndex
                          ? "border-amber-600 ring-2 ring-amber-500/40"
                          : "border-parchment-border opacity-70 hover:opacity-100"
                      }`}
                      aria-label={`View product image ${imgIdx + 1}`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${productName} thumbnail ${imgIdx + 1}`}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Information & Financial Breakdown */}
            <div className="md:col-span-7 space-y-4">
              {/* Product Header */}
              <div>
                {currentItem?.product_slug && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mb-1.5">
                    <Tag className="w-3 h-3 text-amber-700" />
                    <span>{currentItem.product_slug}</span>
                  </div>
                )}
                <h2
                  id="product-quickview-title"
                  className="font-serif text-xl sm:text-2xl font-bold text-cocoa-950 leading-tight"
                >
                  {productName}
                </h2>
              </div>

              {/* Pricing & Quantity Card */}
              <div className="p-3.5 rounded-xl bg-parchment-muted/50 border border-parchment-border space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center sm:text-left">
                  {/* Quantity */}
                  <div className="bg-white p-2.5 rounded-lg border border-parchment-border/80">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-cocoa-600">
                      Quantity
                    </span>
                    <span className="font-mono text-base font-bold text-cocoa-950">
                      {quantity} {quantity === 1 ? "unit" : "units"}
                    </span>
                  </div>

                  {/* Unit Price */}
                  <div className="bg-white p-2.5 rounded-lg border border-parchment-border/80">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-cocoa-600">
                      Unit Price
                    </span>
                    <span className="font-mono text-base font-semibold text-cocoa-900">
                      ₹{Number(unitPrice || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Total Item Price */}
                  <div className="bg-white p-2.5 rounded-lg border border-amber-300/80 bg-gradient-to-br from-amber-50/40 to-white">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold">
                      Item Total
                    </span>
                    <span className="font-mono text-base font-bold text-cocoa-950">
                      ₹{Number(lineTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {discountAmount > 0 && (
                  <div className="text-right text-[11px] font-mono text-emerald-800">
                    Discount applied: -₹{Number(discountAmount).toLocaleString("en-IN")}
                  </div>
                )}
              </div>

              {/* Product Specifications / Variants */}
              {(effectiveWeight || hasDimensions) && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-cocoa-600 font-bold block">
                    Product Specifications
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {effectiveWeight && effectiveWeight > 0 ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-parchment-border font-mono text-cocoa-800">
                        <Scale className="w-3.5 h-3.5 text-cocoa-500" />
                        <span className="text-cocoa-500 font-sans text-[11px]">Net Weight:</span>
                        <strong className="font-semibold text-cocoa-950">{effectiveWeight}g</strong>
                      </div>
                    ) : null}

                    {hasDimensions && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-parchment-border font-mono text-cocoa-800">
                        <Box className="w-3.5 h-3.5 text-cocoa-500" />
                        <span className="text-cocoa-500 font-sans text-[11px]">Dimensions:</span>
                        <span className="font-medium text-cocoa-950">
                          {effectiveLength} × {effectiveWidth} × {effectiveHeight} cm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Item-Level Gift Customization */}
              {itemCustomization ? (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 text-xs space-y-1.5">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-amber-700" />
                    <span>Personalized Item Customization</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 text-cocoa-950 font-sans leading-relaxed whitespace-pre-wrap break-words">
                    &ldquo;{itemCustomization}&rdquo;
                  </div>
                </div>
              ) : null}

              {/* Order-Level Gift Purpose (if applicable) */}
              {orderGiftPurpose && (
                <div className="p-3 rounded-xl bg-parchment-muted/60 border border-parchment-border text-xs space-y-1">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cocoa-700 flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-cocoa-500" />
                    <span>Order Occasion / Gift Purpose</span>
                  </div>
                  <div className="text-cocoa-900 font-semibold flex items-center gap-2">
                    <span>{orderGiftPurpose}</span>
                    {giftFee && giftFee > 0 ? (
                      <span className="text-[11px] font-mono text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded">
                        +₹{giftFee} fee
                      </span>
                    ) : null}
                  </div>
                  {orderGiftDescription && (
                    <p className="text-[11px] text-cocoa-700 italic">
                      {orderGiftDescription}
                    </p>
                  )}
                </div>
              )}

              {/* Order Placement Snapshot */}
              <div className="pt-1 text-[11px] text-cocoa-600 font-mono flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-cocoa-500" />
                <span>
                  Placed on {formatOrderDateShort(order.created_at)}
                  {formatOrderTime(order.created_at) && ` at ${formatOrderTime(order.created_at)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-parchment-border bg-parchment-muted/40">
          <div className="text-xs text-cocoa-600 w-full sm:w-auto text-center sm:text-left">
            <span>Overall Order Total: </span>
            <strong className="font-mono font-bold text-cocoa-950">
              ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
            {/* View Full Order Details button */}
            <Link
              href={`/admin/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-border bg-white hover:bg-parchment-muted text-xs font-semibold text-cocoa-950 transition-colors shadow-2xs whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Order Details</span>
            </Link>

            {/* Obvious Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-cocoa-950 hover:bg-cocoa-900 text-white text-xs font-semibold transition-colors shadow-2xs whitespace-nowrap cursor-pointer flex-1 sm:flex-initial"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

