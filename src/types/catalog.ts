export type RecordStatus = "active" | "inactive";
export type ProductAvailability = "in_stock" | "low_stock" | "out_of_stock";
export type DiscountType = "none" | "percentage" | "fixed";

export interface Category {
  id: string;
  name: string;
  status: RecordStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  cloudinary_public_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_type: DiscountType;
  discount_value: number;
  status: RecordStatus;
  availability: ProductAvailability;
  weight_grams: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  shipping_kerala?: number;
  shipping_tn_kar?: number;
  shipping_other?: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  category?: Category | null;
}
