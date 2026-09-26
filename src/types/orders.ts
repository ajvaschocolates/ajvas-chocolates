export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type RefundStatus = "none" | "partial" | "full";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
  weight_grams: number;
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string;
  shipping_district: string;
  shipping_pincode: string;
  courier_partner: string | null;
  courier_service_name: string | null;
  awb_number: string | null;
  tracking_url: string | null;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  payment_method?: string | null;
  payment_error_code?: string | null;
  payment_error_description?: string | null;
  refund_status?: RefundStatus;
  refunded_amount?: number;
  refund_notes?: string | null;
  package_weight_grams: number | null;
  package_length_cm?: number | null;
  package_width_cm?: number | null;
  package_height_cm?: number | null;
  package_volume_cm3?: number | null;
  shipping_rate_id: string | null;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  status_history?: OrderStatusHistory[];
}

export type WebhookEventStatus = "received" | "processed" | "failed";

export interface RazorpayWebhookEvent {
  id: string;
  event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: WebhookEventStatus;
  error_message?: string | null;
  processed_at?: string | null;
  created_at: string;
}


