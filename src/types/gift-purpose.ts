export interface GiftPurpose {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface GiftPurposeSettings {
  custom_enabled: boolean;
  custom_fee: number;
}

export interface GiftPurposeConfig {
  options: GiftPurpose[];
  settings: GiftPurposeSettings;
}

export const CUSTOM_GIFT_PURPOSE_VALUE = "Custom";

export const DEFAULT_STANDARD_GIFT_PURPOSES: Array<Omit<GiftPurpose, "created_at" | "updated_at">> = [
  { id: "gp-birthday", name: "Happy Birthday", is_active: true, sort_order: 1 },
  { id: "gp-anniversary", name: "Anniversary", is_active: true, sort_order: 2 },
  { id: "gp-wedding", name: "Wedding", is_active: true, sort_order: 3 },
  { id: "gp-engagement", name: "Engagement", is_active: true, sort_order: 4 },
  { id: "gp-congrats", name: "Congratulations", is_active: true, sort_order: 5 },
  { id: "gp-thankyou", name: "Thank You", is_active: true, sort_order: 6 },
  { id: "gp-getwell", name: "Get Well Soon", is_active: true, sort_order: 7 },
  { id: "gp-festival", name: "Festival Gift", is_active: true, sort_order: 8 },
  { id: "gp-justbecause", name: "Just Because", is_active: true, sort_order: 9 },
];

export const DEFAULT_GIFT_PURPOSE_SETTINGS: GiftPurposeSettings = {
  custom_enabled: true,
  custom_fee: 75,
};
