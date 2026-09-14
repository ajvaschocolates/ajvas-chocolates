export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  unitPrice: number;
  discountedUnitPrice?: number;
  quantity: number;
  weightGrams: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  imageUrl?: string;
  categoryName?: string;
}

export interface CartContextValue {
  items: CartItem[];
  totalItemsCount: number;
  addItem: (product: {
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
  }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setBuyNowItem: (product: {
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
  }, quantity?: number) => void;
  buyNowItem: CartItem | null;
  lastAddedItem: CartItem | null;
  clearLastAddedItem: () => void;
}
