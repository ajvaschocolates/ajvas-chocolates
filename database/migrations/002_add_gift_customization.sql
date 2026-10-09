-- ============================================================
-- AJVAS CHOCOLATES
-- Product Gift Customization Feature — Database Migration
-- ============================================================
--
-- Migration: 002_add_gift_customization.sql
-- Date: 2026-10-09
--
-- Purpose:
--   Adds the optional 'customization' column to public.order_items
--   to store personalized customer gift requests / celebration messages
--   (up to 500 characters).
--
-- Target Table:
--   - public.order_items (Adds customization text column)
--
-- Compatibility:
--   - Existing order items without customization will simply have NULL.
--   - Fully compatible with existing queries and row-level security.
-- ============================================================

-- Add customization column to order_items if it doesn't already exist
alter table public.order_items
  add column if not exists customization text;

-- Add check constraint enforcing max 500 characters when provided
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_customization_length_check'
  ) then
    alter table public.order_items
      add constraint order_items_customization_length_check
        check (customization is null or length(customization) <= 500);
  end if;
end
$$;

-- Add comment explaining the field
comment on column public.order_items.customization is
  'Personalized customer gift message or celebration request entered on the product detail page.';
