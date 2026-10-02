"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, X, XCircle } from "lucide-react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  itemType?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  error?: string | null;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  description,
  children,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDeleting = false,
  error = null,
}: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    },
    [onClose, isDeleting]
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

  if (!mounted || !isOpen) return null;

  const defaultTitle =
    title ||
    (itemType
      ? `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`
      : "Confirm Deletion");

  const defaultConfirmText =
    confirmText !== "Delete"
      ? confirmText
      : itemType
      ? `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`
      : "Delete";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-dialog-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-parchment-border bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-rose-100 p-2 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3
              id="delete-confirm-dialog-title"
              className="font-serif text-lg font-bold text-cocoa-950"
            >
              {defaultTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-cocoa-400 hover:text-cocoa-700 hover:bg-parchment-muted transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content / Description */}
        <div className="mt-3">
          {description ? (
            <div className="text-xs text-cocoa-700 leading-relaxed">
              {description}
            </div>
          ) : itemName ? (
            <p className="text-xs text-cocoa-700 leading-relaxed">
              Are you sure you want to delete{" "}
              {itemType ? `${itemType.toLowerCase()} ` : ""}
              <span className="font-bold text-cocoa-950">
                &ldquo;{itemName}&rdquo;
              </span>
              ? This action cannot be undone.
            </p>
          ) : (
            <p className="text-xs text-cocoa-700 leading-relaxed">
              Are you sure you want to delete this {itemType || "item"}? This
              action cannot be undone.
            </p>
          )}

          {children}
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <XCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-parchment-border mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-parchment-border bg-white text-xs font-semibold text-cocoa-800 hover:bg-parchment-muted transition shadow-2xs disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              defaultConfirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeleteConfirmModal;
