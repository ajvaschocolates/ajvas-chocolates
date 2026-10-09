"use client";

import { useState, useEffect, useCallback } from "react";
export const DELIVERY_STATE_STORAGE_KEY = "ajvas_selected_state";
export const DELIVERY_STATE_EVENT_NAME = "ajvas_delivery_state_change";

export interface DeliveryEstimateInfo {
  state: string | null;
  days: string | null; // e.g. "1–5 working days", "4–7 working days", "7–10 working days" or null
  isKnownState: boolean;
  displayText: string;
  badgeLabel?: string;
}

/**
 * Returns the estimated delivery time string based on destination Indian State / UT.
 * Rules:
 * - Kerala -> "1–5 working days"
 * - Karnataka -> "4–7 working days"
 * - Tamil Nadu -> "4–7 working days"
 * - Other states/UTs -> "7–10 working days"
 */
export function getDeliveryEstimateForState(stateName?: string | null): DeliveryEstimateInfo {
  if (!stateName || !stateName.trim()) {
    return {
      state: null,
      days: null,
      isKnownState: false,
      displayText: "Estimated delivery time will be shown after selecting your delivery state.",
      badgeLabel: undefined,
    };
  }

  const clean = stateName.trim();
  const lower = clean.toLowerCase();

  let days = "7–10 working days";

  if (lower === "kerala") {
    days = "1–5 working days";
  } else if (lower === "karnataka" || lower === "tamil nadu") {
    days = "4–7 working days";
  } else {
    days = "7–10 working days";
  }

  return {
    state: clean,
    days,
    isKnownState: true,
    displayText: days,
    badgeLabel: `Based on delivery to ${clean}`,
  };
}

/**
 * Safely reads stored destination state from browser storage.
 */
export function getSelectedState(): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      localStorage.getItem(DELIVERY_STATE_STORAGE_KEY) ||
      sessionStorage.getItem(DELIVERY_STATE_STORAGE_KEY) ||
      ""
    );
  } catch {
    return "";
  }
}

/**
 * Persists selected destination state and notifies active components.
 */
export function saveSelectedState(stateName: string): void {
  if (typeof window === "undefined") return;
  const cleanState = stateName.trim();
  try {
    if (cleanState) {
      localStorage.setItem(DELIVERY_STATE_STORAGE_KEY, cleanState);
      sessionStorage.setItem(DELIVERY_STATE_STORAGE_KEY, cleanState);
    } else {
      localStorage.removeItem(DELIVERY_STATE_STORAGE_KEY);
      sessionStorage.removeItem(DELIVERY_STATE_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota/security exceptions
  }

  // Notify listeners in same tab & across components
  window.dispatchEvent(
    new CustomEvent(DELIVERY_STATE_EVENT_NAME, { detail: cleanState })
  );
}

/**
 * Custom React Hook for reactive delivery state across PDP, Cart, and Checkout.
 */
export function useDeliveryState() {
  const [selectedState, setSelectedStateInternal] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initial = getSelectedState();
    setSelectedStateInternal(initial);
    setIsHydrated(true);

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail !== undefined) {
        setSelectedStateInternal(customEvent.detail);
      } else {
        setSelectedStateInternal(getSelectedState());
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === DELIVERY_STATE_STORAGE_KEY || e.key === null) {
        setSelectedStateInternal(getSelectedState());
      }
    };

    window.addEventListener(DELIVERY_STATE_EVENT_NAME, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener(DELIVERY_STATE_EVENT_NAME, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const setSelectedState = useCallback((newState: string) => {
    setSelectedStateInternal(newState);
    saveSelectedState(newState);
  }, []);

  const estimate = getDeliveryEstimateForState(selectedState);

  return {
    selectedState,
    setSelectedState,
    estimate,
    isHydrated,
  };
}
