-- ============================================================
-- AJVAS CHOCOLATES
-- Gift Purpose Dropdown & Custom Purpose Fee — Database Migration
-- ============================================================
--
-- Migration: 003_gift_purpose_and_custom_fee.sql
-- Date: 2026-10-13
--
-- Purpose:
--   1. Creates public.gift_purposes table to store standard admin-managed
--      gift occasions/purposes (Happy Birthday, Anniversary, etc.)
--   2. Creates public.gift_purpose_settings table for global custom-fee
--      configuration (custom_enabled toggle, custom_fee in INR).
--   3. Adds gift_purpose and gift_purpose_fee columns to public.orders
--      to store the selected purpose and actual fee charged per order.
--   4. Configures Row Level Security (RLS) policies allowing public read
--      for active options/settings, and full admin management via public.is_admin().
--   5. Seeds initial standard options and default fee configuration.
--
-- Compatibility & Safety:
--   - Additive-only schema changes. Existing orders default to NULL purpose and 0.00 fee.
--   - Does NOT drop or modify existing columns or tables.
--   - Uses IF NOT EXISTS clauses for idempotent execution.
-- ============================================================

-- 1. Standard Gift Purposes Table
create table if not exists public.gift_purposes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Constraint: Non-empty name
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gift_purposes_name_not_empty'
  ) then
    alter table public.gift_purposes
      add constraint gift_purposes_name_not_empty
        check (length(trim(name)) > 0);
  end if;
end
$$;

-- Constraint: Prevent adding 'Custom' as a regular standard option
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gift_purposes_not_custom_keyword'
  ) then
    alter table public.gift_purposes
      add constraint gift_purposes_not_custom_keyword
        check (lower(trim(name)) <> 'custom');
  end if;
end
$$;

-- Unique case-insensitive index on trimmed name
create unique index if not exists gift_purposes_name_unique_idx
  on public.gift_purposes (lower(trim(name)));

-- Index for ordering active options
create index if not exists gift_purposes_active_sort_idx
  on public.gift_purposes (is_active, sort_order asc, name asc);

-- Enable Row Level Security
alter table public.gift_purposes enable row level security;

-- RLS Policy: Public read access
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'gift_purposes' and policyname = 'Allow public read access for gift purposes'
  ) then
    create policy "Allow public read access for gift purposes"
      on public.gift_purposes
      for select
      using (true);
  end if;
end
$$;

-- RLS Policy: Admin full access
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'gift_purposes' and policyname = 'Allow admins full access to gift purposes'
  ) then
    create policy "Allow admins full access to gift purposes"
      on public.gift_purposes
      for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end
$$;

-- 2. Gift Purpose Global Settings Table (Singleton pattern: id = 1)
create table if not exists public.gift_purpose_settings (
  id integer primary key default 1 check (id = 1),
  custom_enabled boolean not null default true,
  custom_fee numeric(10, 2) not null default 75.00 check (custom_fee >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security on settings
alter table public.gift_purpose_settings enable row level security;

-- RLS Policy: Public read access
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'gift_purpose_settings' and policyname = 'Allow public read access to gift purpose settings'
  ) then
    create policy "Allow public read access to gift purpose settings"
      on public.gift_purpose_settings
      for select
      using (true);
  end if;
end
$$;

-- RLS Policy: Admin full access
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'gift_purpose_settings' and policyname = 'Allow admins full access to gift purpose settings'
  ) then
    create policy "Allow admins full access to gift purpose settings"
      on public.gift_purpose_settings
      for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end
$$;

-- 3. Add Columns to Orders Table
alter table public.orders
  add column if not exists gift_purpose text;

alter table public.orders
  add column if not exists gift_purpose_fee numeric(10, 2) not null default 0.00;

-- Constraint on gift_purpose_fee: Non-negative
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_gift_purpose_fee_check'
  ) then
    alter table public.orders
      add constraint orders_gift_purpose_fee_check
        check (gift_purpose_fee >= 0);
  end if;
end
$$;

-- Comments for documentation
comment on column public.orders.gift_purpose is
  'Authoritative gift purpose chosen by the customer for this order (standard option or Custom).';

comment on column public.orders.gift_purpose_fee is
  'The fixed fee charged for the custom purpose on this order (0.00 for standard purposes). Charged once per order.';

-- 4. Seed Default Standard Gift Purposes
insert into public.gift_purposes (name, is_active, sort_order)
values
  ('Happy Birthday', true, 1),
  ('Anniversary', true, 2),
  ('Wedding', true, 3),
  ('Engagement', true, 4),
  ('Congratulations', true, 5),
  ('Thank You', true, 6),
  ('Get Well Soon', true, 7),
  ('Festival Gift', true, 8),
  ('Just Because', true, 9)
on conflict (lower(trim(name))) do nothing;

-- 5. Seed Default Settings
insert into public.gift_purpose_settings (id, custom_enabled, custom_fee)
values (1, true, 75.00)
on conflict (id) do nothing;
