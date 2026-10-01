import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Razorpay Webhook Handler
 * Route: POST /api/webhooks/razorpay
 *
 * Automatically confirms and records orders when Razorpay sends server-to-server
 * notifications (payment.captured, order.paid), protecting against network drops,
 * mobile app switching, and browser tab closing.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Cryptographic signature check if webhook secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("[Razorpay Webhook] Invalid webhook signature detected.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    console.log(`[Razorpay Webhook] Processing event: ${event}`);

    // Handle payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payment: any = payload.payload?.payment?.entity;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const order: any = payload.payload?.order?.entity;

      const paymentId = payment?.id;
      const orderId = order?.id || payment?.order_id;

      if (!orderId && !paymentId) {
        return NextResponse.json({ received: true, note: "No payment or order identifier" });
      }

      const supabase = createServiceRoleClient();

      // Check if order was already recorded by the frontend redirect callback
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, payment_status, order_number")
        .or(`razorpay_payment_id.eq.${paymentId},razorpay_order_id.eq.${orderId}`)
        .maybeSingle();

      if (existingOrder) {
        // Ensure marked as paid
        if (existingOrder.payment_status !== "paid") {
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              order_status: "processing",
              razorpay_payment_id: paymentId,
            })
            .eq("id", existingOrder.id);

          await supabase.from("order_status_history").insert({
            order_id: existingOrder.id,
            status: "processing",
            note: `Payment status confirmed via Razorpay Webhook (${event}, ID: ${paymentId})`,
          });
        }

        return NextResponse.json({
          received: true,
          status: "existing_order_updated",
          orderNumber: existingOrder.order_number,
        });
      }

      // If order was NOT yet recorded (e.g., customer closed tab right after bank debit):
      // Recover customer and address details from order notes or payment entity
      const notes = order?.notes || payment?.notes || {};
      const amountInRupees = payment?.amount ? payment.amount / 100 : (order?.amount ? order.amount / 100 : 0);
      const currentYear = new Date().getFullYear();
      const orderNumber = `AJV-${currentYear}-${Date.now().toString().slice(-6)}`;

      const { data: newOrder, error: insertErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: notes.customer_name || payment?.email || "Valued Customer",
          customer_phone: notes.customer_phone || payment?.contact || "",
          customer_email: notes.customer_email || payment?.email || null,
          shipping_address_line1: notes.shipping_city ? `${notes.shipping_city}, ${notes.shipping_state || ""}` : "Address provided on payment",
          shipping_city: notes.shipping_city || "",
          shipping_state: notes.shipping_state || "",
          shipping_district: notes.shipping_state || "",
          shipping_pincode: notes.shipping_pincode || "",
          subtotal: amountInRupees,
          discount_amount: 0,
          shipping_amount: 0,
          total_amount: amountInRupees,
          currency: "INR",
          order_status: "processing",
          payment_status: "paid",
          payment_provider: "razorpay",
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          payment_method: payment?.method || "online",
          package_weight_grams: 500,
          placed_at: new Date().toISOString(),
        })
        .select("id, order_number")
        .single();

      if (insertErr || !newOrder) {
        console.error("[Razorpay Webhook] Failed to auto-create order:", insertErr);
        return NextResponse.json({ error: "Order auto-create failed" }, { status: 500 });
      }

      await supabase.from("order_status_history").insert({
        order_id: newOrder.id,
        status: "processing",
        note: `Order auto-created and paid via Razorpay Webhook (${event}, ID: ${paymentId})`,
      });

      return NextResponse.json({
        received: true,
        status: "new_order_created",
        orderNumber: newOrder.order_number,
      });
    }

    return NextResponse.json({ received: true, event });
  } catch (err) {
    console.error("[Razorpay Webhook] Unexpected error:", err);
    return NextResponse.json({ error: "Internal webhook error" }, { status: 500 });
  }
}
