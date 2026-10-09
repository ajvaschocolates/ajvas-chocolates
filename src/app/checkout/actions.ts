"use server";

import {
  calculateStateShippingServer,
  StateShippingItemInput,
  resolvePincode,
  getCouriersForPincode,
  calculateShippingRateServer,
} from "@/lib/supabase/shipping";
import { lookupPincode, PincodeLookupResult } from "@/lib/supabase/pincode";
import { AvailableCourier, PincodeResolution, ShippingCalculationResult } from "@/types/checkout";

/**
 * Server Action: Calculates state-based shipping amount for checkout (Rule A - PER_UNIT).
 */
export async function calculateStateShippingAction(
  stateName: string,
  items: StateShippingItemInput[]
): Promise<ShippingCalculationResult> {
  return await calculateStateShippingServer(stateName, items);
}

/* Legacy Server Actions (Preserved for compatibility) */

export async function resolvePincodeAction(pincode: string): Promise<PincodeResolution> {
  return await resolvePincode(pincode);
}

export async function lookupPincodeAction(pincode: string): Promise<PincodeLookupResult> {
  return await lookupPincode(pincode);
}

export async function getCouriersForPincodeAction(pincodeId: string): Promise<AvailableCourier[]> {
  return await getCouriersForPincode(pincodeId);
}

export async function calculateShippingRateAction(
  pincodeId: string,
  courierId: string,
  totalWeightGrams: number
): Promise<ShippingCalculationResult> {
  return await calculateShippingRateServer(pincodeId, courierId, totalWeightGrams);
}

/* =========================================================================
   RAZORPAY ORDER CREATION & PAYMENT VERIFICATION ACTIONS
   ========================================================================= */

import crypto from "crypto";
import { createRazorpayServerClient } from "@/lib/razorpay/client";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { GuestCustomerFormData } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { revalidatePath } from "next/cache";

export interface CreateRazorpayOrderResult {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

export interface VerifyOrderInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  customerData: GuestCustomerFormData;
  items: CartItem[];
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
}

export interface VerifyOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

export interface CreateRazorpayOrderInput {
  amount?: number;
  items?: CartItem[];
  shippingAmount?: number;
  customerData?: GuestCustomerFormData;
}

/**
 * Server Action: Creates a Razorpay Order with server-side validated amount and customer notes.
 */
export async function createRazorpayOrderAction(
  input: number | CreateRazorpayOrderInput
): Promise<CreateRazorpayOrderResult> {
  try {
    const rawAmount = typeof input === "number" ? input : input.amount ?? 0;
    const items = typeof input === "object" ? input.items : undefined;
    const shipping = typeof input === "object" ? (input.shippingAmount ?? 0) : 0;
    const customer = typeof input === "object" ? input.customerData : undefined;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      return { success: false, error: "Razorpay Key ID is not configured on server." };
    }

    let verifiedAmount = rawAmount;

    // Server-Side Price Recalculation (Fraud & Tamper Prevention)
    if (items && items.length > 0) {
      const productIds = items.map((i) => i.productId).filter(Boolean);
      if (productIds.length > 0) {
        const supabase = createServiceRoleClient();
        const { data: dbProducts } = await supabase
          .from("products")
          .select("id, price, discount_type, discount_value")
          .in("id", productIds);

        if (dbProducts && dbProducts.length > 0) {
          const productMap = new Map(dbProducts.map((p) => [p.id, p]));
          let calculatedSubtotal = 0;

          for (const item of items) {
            const dbProduct = productMap.get(item.productId);
            if (dbProduct) {
              let price = Number(dbProduct.price);
              if (dbProduct.discount_type === "percentage" && dbProduct.discount_value > 0) {
                price = Math.max(0, Math.round(price * (1 - dbProduct.discount_value / 100)));
              } else if (dbProduct.discount_type === "fixed" && dbProduct.discount_value > 0) {
                price = Math.max(0, price - Number(dbProduct.discount_value));
              }
              calculatedSubtotal += price * (item.quantity || 1);
            } else {
              calculatedSubtotal += (item.discountedUnitPrice ?? item.unitPrice ?? 0) * (item.quantity || 1);
            }
          }

          verifiedAmount = calculatedSubtotal + shipping;
        }
      }
    }

    if (!verifiedAmount || verifiedAmount <= 0) {
      return { success: false, error: "Invalid payment amount." };
    }

    const razorpay = createRazorpayServerClient();
    const amountInPaise = Math.round(verifiedAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        customer_name: customer?.fullName?.slice(0, 40) || "",
        customer_phone: customer?.phone?.slice(0, 15) || "",
        customer_email: customer?.email?.slice(0, 50) || "",
        shipping_city: customer?.city?.slice(0, 30) || "",
        shipping_state: customer?.state?.slice(0, 30) || "",
        shipping_pincode: customer?.pincode?.slice(0, 10) || "",
        items_count: String(items?.length || 0),
      },
    });

    return {
      success: true,
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      keyId,
    };
  } catch (err) {
    console.error("[Razorpay] Order creation failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create payment order.",
    };
  }
}

/**
 * Server Action: Verifies Razorpay payment signature, checks status via Razorpay API,
 * prevents duplicate orders, and creates the order record in database.
 */
export async function verifyAndCreateOrderAction(
  input: VerifyOrderInput
): Promise<VerifyOrderResult> {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return { success: false, error: "Razorpay Key Secret is missing on server." };
    }

    const supabase = createServiceRoleClient();

    // 1. Idempotency Check: Prevent duplicate orders if webhook or retry already processed it
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, order_number, payment_status")
      .or(`razorpay_payment_id.eq.${input.razorpayPaymentId},razorpay_order_id.eq.${input.razorpayOrderId}`)
      .maybeSingle();

    if (existingOrder) {
      return {
        success: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.order_number,
      };
    }

    // 2. Verify Razorpay HMAC SHA256 cryptographic signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== input.razorpaySignature) {
      console.error("[Razorpay] Signature mismatch:", {
        expected: generatedSignature,
        received: input.razorpaySignature,
      });
      return { success: false, error: "Payment verification failed. Invalid signature." };
    }

    // 3. Direct Razorpay REST API Status Check
    try {
      const razorpay = createRazorpayServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payment: any = await razorpay.payments.fetch(input.razorpayPaymentId);

      if (payment) {
        if (payment.status !== "captured" && payment.status !== "authorized") {
          return {
            success: false,
            error: `Payment is not confirmed. Current status: ${payment.status}`,
          };
        }
        if (payment.order_id && payment.order_id !== input.razorpayOrderId) {
          return {
            success: false,
            error: "Payment does not match the expected order.",
          };
        }
      }
    } catch (apiErr) {
      console.warn("[Razorpay API] Fetch payment warning (signature is valid):", apiErr);
    }

    // 4. Insert order using privileged Service Role client
    const currentYear = new Date().getFullYear();
    const orderNumber = `AJV-${currentYear}-${Date.now().toString().slice(-6)}`;

    // Total weight in grams
    const totalWeight = input.items.reduce(
      (acc, item) => acc + (item.weightGrams || 500) * (item.quantity || 1),
      0
    );

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: input.customerData.fullName.trim(),
        customer_phone: input.customerData.phone.trim(),
        customer_email: input.customerData.email?.trim() || null,
        shipping_address_line1: input.customerData.addressLine1.trim(),
        shipping_address_line2: input.customerData.addressLine2?.trim() || null,
        shipping_city: input.customerData.city?.trim() || input.customerData.district.trim(),
        shipping_state: input.customerData.state.trim(),
        shipping_district: input.customerData.district.trim(),
        shipping_pincode: input.customerData.pincode.trim(),
        subtotal: input.subtotal,
        discount_amount: 0,
        shipping_amount: input.shippingAmount,
        total_amount: input.totalAmount,
        currency: "INR",
        order_status: "processing",
        payment_status: "paid",
        payment_provider: "razorpay",
        razorpay_order_id: input.razorpayOrderId,
        razorpay_payment_id: input.razorpayPaymentId,
        razorpay_signature: input.razorpaySignature,
        payment_method: "online",
        package_weight_grams: totalWeight,
        placed_at: new Date().toISOString(),
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      console.error("[Orders] Database order insert failed:", orderErr);
      return {
        success: false,
        error: orderErr?.message || "Failed to record order in database.",
      };
    }

    // 5. Insert order items
    if (input.items && input.items.length > 0) {
      const itemsToInsert = input.items.map((item) => {
        const unitPrice = item.discountedUnitPrice ?? item.unitPrice ?? 0;
        const cleanCustomization = item.customization
          ? item.customization.trim().slice(0, 500)
          : null;

        return {
          order_id: order.id,
          product_id: item.productId || null,
          product_name: item.name,
          product_slug: item.slug || null,
          quantity: item.quantity,
          unit_price: unitPrice,
          discount_amount: 0,
          line_total: unitPrice * item.quantity,
          weight_grams: item.weightGrams || 500,
          customization: cleanCustomization,
        };
      });

      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsErr) {
        console.warn("[Orders] Order items insert warning:", itemsErr.message);
        // Resilient fallback: if the database schema does not yet have 'customization' column,
        // retry insert without that column so the payment and order are never lost
        if (itemsErr.code === "PGRST204" || itemsErr.message?.includes("customization")) {
          const fallbackItems = itemsToInsert.map((item) => {
            const { ...copy } = item;
            delete (copy as { customization?: unknown }).customization;
            return copy;
          });
          const { error: retryErr } = await supabase
            .from("order_items")
            .insert(fallbackItems);
          if (retryErr) {
            console.error("[Orders] Fallback items insert failed:", retryErr.message);
          }
        }
      }
    }

    // 6. Log initial order timeline status (including customer gift request audit snapshot)
    const customizedItems = input.items.filter((i) => i.customization?.trim());
    let statusNote = `Online payment of ₹${input.totalAmount} confirmed via Razorpay (ID: ${input.razorpayPaymentId})`;
    if (customizedItems.length > 0) {
      const giftNotes = customizedItems
        .map((i) => `${i.name}: "${i.customization!.trim().slice(0, 150)}"`)
        .join("; ");
      statusNote += ` | Gift Requests: ${giftNotes}`;
    }

    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: "processing",
      note: statusNote.slice(0, 1000),
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    };
  } catch (err) {
    console.error("[Orders] Unexpected error creating order:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected payment processing error.",
    };
  }
}
