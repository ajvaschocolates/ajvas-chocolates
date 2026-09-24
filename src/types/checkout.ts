export interface GuestCustomerFormData {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  district: string;
  state: string;
}

export interface AvailableCourier {
  id: string;
  courierPartner: string;
  serviceName: string;
}

export interface PincodeResolution {
  pincodeId?: string;
  pincode: string;
  district: string;
  state: string;
  recognized: boolean;
  error?: string;
}

export type ShippingZone = "kerala" | "tn_kar" | "other";

export interface ShippingCalculationResult {
  success: boolean;
  shippingAmount?: number;
  zone?: ShippingZone;
  error?: string;
}

export type PincodeValidationState =
  | "untouched"
  | "typing"
  | "validating"
  | "valid"
  | "invalid"
  | "unavailable";

export type CourierState =
  | "idle"
  | "loading"
  | "available"
  | "selected"
  | "none_available";

export type ShippingCalculationState =
  | "awaiting_state"
  | "calculating"
  | "calculated"
  | "calculation_failed"
  | "recalculating";

export type PaymentState =
  | "ready"
  | "processing"
  | "verification"
  | "verified"
  | "failed"
  | "cancelled"
  | "pending"
  | "unavailable";

