export type RecordStatus = "active" | "inactive";

export interface Courier {
  id: string;
  courier_partner: string;
  service_name: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
}

export interface Pincode {
  id: string;
  pincode: string;
  state: string;
  district: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
}

export interface ShippingRate {
  id: string;
  pincode_id: string;
  courier_id: string;
  min_weight_grams: number;
  max_weight_grams: number | null;
  max_length_cm: number | null;
  max_width_cm: number | null;
  max_height_cm: number | null;
  max_volume_cm3: number | null;
  shipping_amount: number;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
  pincode?: Pincode | null;
  courier?: Courier | null;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  order_count?: number;
}
