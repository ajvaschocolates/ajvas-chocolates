-- ============================================================
-- AJVAS CHOCOLATES
-- Custom Gift Purpose Description — Database Migration
-- ============================================================
--
-- Migration: 004_add_custom_gift_purpose_description.sql
-- Date: 2026-10-13
--
-- Purpose:
--   Adds the optional 'custom_gift_purpose_description' column to
--   public.orders to persist the customer-provided description when
--   Gift Purpose is 'Custom' (max 300 characters).
--
-- Target Table:
--   - public.orders (Adds custom_gift_purpose_description text column)
--
-- Compatibility:
--   - Existing orders remain untouched with NULL value.
--   - Fully additive and backward compatible.
--   - RLS policies and table grants remain unchanged.
-- ============================================================

-- 1. Add column to public.orders table if it does not exist
alter table public.orders
  add column if not exists custom_gift_purpose_description text;

-- 2. Add check constraint enforcing max 300 characters when provided
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_custom_gift_purpose_description_length_check'
  ) then
    alter table public.orders
      add constraint orders_custom_gift_purpose_description_length_check
        check (
          custom_gift_purpose_description is null
          or length(custom_gift_purpose_description) <= 300
        );
  end if;
end
$$;

-- 3. Documentation comment
comment on column public.orders.custom_gift_purpose_description is
  'Customer-entered description of custom occasion or purpose when Gift Purpose is Custom (max 300 characters).';
