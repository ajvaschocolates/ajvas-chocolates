import { RecordStatus } from "./catalog";

export interface HeroBanner {
  id: string;
  eyebrow?: string | null;
  title: string;
  description?: string | null;
  image_url: string;
  image_public_id?: string | null;
  primary_cta_text?: string | null;
  primary_cta_link?: string | null;
  secondary_cta_text?: string | null;
  secondary_cta_link?: string | null;
  status: RecordStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface FeaturePillar {
  title: string;
  sub: string;
  icon_name?: string;
}

export interface HomepageSection {
  id: string;
  section_key: string;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  image_public_id?: string | null;
  primary_cta_text?: string | null;
  primary_cta_link?: string | null;
  secondary_cta_text?: string | null;
  secondary_cta_link?: string | null;
  content_json?: {
    pillars?: FeaturePillar[];
    [key: string]: unknown;
  } | null;
  status: RecordStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}
