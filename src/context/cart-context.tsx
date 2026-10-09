"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { CartItem, CartContextValue } from "@/types/cart";

const CART_STORAGE_KEY = "ajvas_cart_items_v1";

const CartContext = createContext<CartContextValue | null>(null);

function calculateDiscountedPrice(
  price: number,
  discountType: "none" | "percentage" | "fixed",
  discountValue: number
): number | undefined {
  if (discountType === "percentage" && discountValue > 0) {
    return Math.max(0, Math.round(price * (1 - discountValue / 100)));
  }
  if (discountType === "fixed" && discountValue > 0) {
    return Math.max(0, price - discountValue);
  }
  return undefined;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItemState] = useState<CartItem | null>(null);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Safe client hydration from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
      const storedBuyNow = sessionStorage.getItem("ajvas_buy_now_item");
      if (storedBuyNow) {
        setBuyNowItemState(JSON.parse(storedBuyNow));
      }
    } catch (e) {
      console.warn("Failed to load cart from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage whenever items change (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist cart to localStorage", e);
    }
  }, [items, isHydrated]);

  const addItem = useCallback(
    (
      product: {
        id: string;
        slug: string;
        name: string;
        price: number;
        discount_type: "none" | "percentage" | "fixed";
        discount_value: number;
        weight_grams: number;
        length_cm?: number | null;
        width_cm?: number | null;
        height_cm?: number | null;
        images?: Array<{ image_url: string }>;
        category?: { name: string } | null;
      },
      quantity: number = 1,
      customization?: string
    ) => {
      const validQty = Math.max(1, Math.floor(quantity));
      const discounted = calculateDiscountedPrice(
        product.price,
        product.discount_type,
        product.discount_value
      );
      const imageUrl = product.images && product.images.length > 0 ? product.images[0].image_url : undefined;
      const categoryName = product.category?.name;
      const cleanCustomization = customization?.trim() || undefined;

      setItems((prev) => {
        const existingIdx = prev.findIndex(
          (item) =>
            item.productId === product.id &&
            (item.customization || undefined) === cleanCustomization
        );
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + validQty,
          };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            unitPrice: product.price,
            discountedUnitPrice: discounted,
            quantity: validQty,
            weightGrams: product.weight_grams,
            lengthCm: product.length_cm,
            widthCm: product.width_cm,
            heightCm: product.height_cm,
            imageUrl,
            categoryName,
            customization: cleanCustomization,
          },
        ];
      });

      const addedItemObj: CartItem = {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: product.price,
        discountedUnitPrice: discounted,
        quantity: validQty,
        weightGrams: product.weight_grams,
        lengthCm: product.length_cm,
        widthCm: product.width_cm,
        heightCm: product.height_cm,
        imageUrl,
        categoryName,
        customization: cleanCustomization,
      };
      setLastAddedItem(addedItemObj);
    },
    []
  );

  const removeItem = useCallback((productId: string, customization?: string) => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.productId !== productId) return true;
        if (customization !== undefined) {
          return (item.customization || undefined) !== (customization?.trim() || undefined);
        }
        return false;
      })
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, customization?: string) => {
      if (quantity <= 0) {
        removeItem(productId, customization);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.productId !== productId) return item;
          if (customization !== undefined) {
            if ((item.customization || undefined) !== (customization?.trim() || undefined)) {
              return item;
            }
          }
          return { ...item, quantity: Math.floor(quantity) };
        })
      );
    },
    [removeItem]
  );

  const setBuyNowItem = useCallback(
    (
      product: {
        id: string;
        slug: string;
        name: string;
        price: number;
        discount_type: "none" | "percentage" | "fixed";
        discount_value: number;
        weight_grams: number;
        length_cm?: number | null;
        width_cm?: number | null;
        height_cm?: number | null;
        images?: Array<{ image_url: string }>;
        category?: { name: string } | null;
      },
      quantity: number = 1,
      customization?: string
    ) => {
      const validQty = Math.max(1, Math.floor(quantity));
      const discounted = calculateDiscountedPrice(
        product.price,
        product.discount_type,
        product.discount_value
      );
      const imageUrl = product.images && product.images.length > 0 ? product.images[0].image_url : undefined;
      const categoryName = product.category?.name;
      const cleanCustomization = customization?.trim() || undefined;

      const item: CartItem = {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unitPrice: product.price,
        discountedUnitPrice: discounted,
        quantity: validQty,
        weightGrams: product.weight_grams,
        lengthCm: product.length_cm,
        widthCm: product.width_cm,
        heightCm: product.height_cm,
        imageUrl,
        categoryName,
        customization: cleanCustomization,
      };

      setBuyNowItemState(item);
      try {
        sessionStorage.setItem("ajvas_buy_now_item", JSON.stringify(item));
      } catch (e) {
        console.warn("Failed to persist buy now item to sessionStorage", e);
      }
    },
    []
  );

  const clearLastAddedItem = useCallback(() => {
    setLastAddedItem(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setBuyNowItemState(null);
    setLastAddedItem(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem("ajvas_buy_now_item");
    } catch (e) {
      console.warn("Failed to clear cart in localStorage/sessionStorage", e);
    }
  }, []);

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = item.discountedUnitPrice ?? item.unitPrice;
      return acc + price * item.quantity;
    }, 0);
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItemsCount,
      subtotal,
      isHydrated,
      addItem,
      removeItem,
      updateQuantity,
      setBuyNowItem,
      buyNowItem,
      lastAddedItem,
      clearLastAddedItem,
      clearCart,
    }),
    [items, totalItemsCount, subtotal, isHydrated, addItem, removeItem, updateQuantity, setBuyNowItem, buyNowItem, lastAddedItem, clearLastAddedItem, clearCart]
  );


  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
