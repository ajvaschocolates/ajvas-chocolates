-- ============================================================
-- AJVAS CHOCOLATES
-- Product Weight Visibility Toggle — Database Migration
-- ============================================================
--
-- Migration: 005_add_show_weight_to_products.sql
-- Date: 2026-11-06
--
-- Purpose:
--   Adds the 'show_weight' boolean column to public.products to control
--   per-product visibility of weight in the storefront Product Specifications
--   section. Defaults to true to preserve existing storefront behavior.
--
-- Target Table:
--   - public.products (Adds show_weight boolean column)
--
-- Compatibility:
--   - Fully additive and backward compatible.
--   - Existing products default to true (weight remains visible).
--   - RLS policies and table grants remain unchanged.
-- ============================================================

-- 1. Add column to public.products table if it does not exist
alter table public.products
  add column if not exists show_weight boolean not null default true;

-- 2. Backfill existing records if any have null
update public.products
  set show_weight = true
  where show_weight is null;

-- 3. Documentation comment
comment on column public.products.show_weight is
  'Controls whether the product weight is displayed in the storefront Product Specifications section (true = show, false = hide).';

