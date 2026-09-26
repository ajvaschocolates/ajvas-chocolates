-- ============================================================
-- AJVAS CHOCOLATES
-- Razorpay Payment Integration — Phase 2 Database Migration
-- ============================================================
--
-- Migration: 001_razorpay_payment_foundation.sql
-- Date: 2026-09-26
--
-- Purpose:
--   Establishes the database schema foundation for production-grade
--   Razorpay payment processing, webhook idempotency, and audit
--   refund tracking.
--
-- Affected Tables:
--   - public.orders (Adds payment method, payment error, refund tracking columns, & UNIQUE constraints)
--   - public.razorpay_webhook_events (New table for webhook idempotency)
--
-- Important Business Rules & Assumptions:
--   1. AJVAS CHOCOLATES IS A MADE-TO-ORDER BUSINESS.
--      Products are produced after order confirmation & payment verification.
--      NO numeric inventory, inventory locks, stock quantities, or reservation logic
--      are implemented in this schema or migration.
--   2. Guest Checkout Security Model:
--      Public (anonymous) users have NO permissions to insert webhook events or
--      modify payment fields directly. Operations are executed strictly via trusted
--      server-side service role execution.
--   3. Unique Payment Identifiers:
--      UNIQUE constraints on razorpay_order_id and razorpay_payment_id prevent
--      duplicate order placement or duplicate payment handling while allowing NULLs
--      for initial pending guest checkout orders.
-- ============================================================


-- ============================================================
-- 1. REFUND STATUS ENUM TYPE
-- ============================================================

do $$
begin
  create type public.refund_status as enum (
    'none',
    'partial',
    'full'
  );
exception
  when duplicate_object then null;
end
$$;


-- ============================================================
-- 2. EXTEND ORDERS TABLE WITH PAYMENT & REFUND FIELDS
-- ============================================================

-- Add payment method detail (e.g. 'upi', 'card', 'netbanking', 'wallet', 'emi')
alter table public.orders
  add column if not exists payment_method text;

-- Add payment failure error code reported by Razorpay
alter table public.orders
  add column if not exists payment_error_code text;

-- Add payment failure error description reported by Razorpay
alter table public.orders
  add column if not exists payment_error_description text;

-- Add refund tracking status (default 'none')
alter table public.orders
  add column if not exists refund_status public.refund_status not null default 'none';

-- Add cumulative refunded amount (default 0.00)
alter table public.orders
  add column if not exists refunded_amount numeric(12,2) not null default 0.00;

-- Add refund notes for admin audit documentation
alter table public.orders
  add column if not exists refund_notes text;


-- Check constraint for non-negative refunded amount
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_refunded_amount_non_negative'
  ) then
    alter table public.orders
      add constraint orders_refunded_amount_non_negative
        check (refunded_amount >= 0);
  end if;
end
$$;


-- ============================================================
-- 3. UNIQUE CONSTRAINTS FOR RAZORPAY IDENTIFIERS
-- ============================================================
-- PostgreSQL UNIQUE indexes permit multiple NULL values.
-- Partial UNIQUE indexes ensure uniqueness for non-null Razorpay IDs.
-- Redundant non-unique lookup indexes are omitted as partial UNIQUE indexes serve lookups.

create unique index if not exists orders_razorpay_order_id_unique
  on public.orders (razorpay_order_id)
  where razorpay_order_id is not null;

create unique index if not exists orders_razorpay_payment_id_unique
  on public.orders (razorpay_payment_id)
  where razorpay_payment_id is not null;


-- ============================================================
-- 4. WEBHOOK EVENT IDEMPOTENCY TABLE
-- ============================================================
-- Stores Razorpay webhook event IDs to guarantee idempotent processing.
-- Prevents duplicate execution if Razorpay re-sends the same event.
--
-- Idempotency Semantics:
-- - event_id UNIQUE index rejects concurrent duplicate insertion.
-- - status tracks state ('received' -> 'processed' or 'failed').
-- - processed_at is NULL initially, populated only upon successful processing.
-- - Allows safe retry if processing fails.

create table if not exists public.razorpay_webhook_events (
  id uuid primary key default gen_random_uuid(),

  event_id text not null,
  event_type text not null,
  payload jsonb not null,

  status text not null default 'received',
  error_message text,

  processed_at timestamptz,
  created_at timestamptz not null default now(),

  constraint razorpay_webhook_events_event_id_not_empty
    check (length(trim(event_id)) > 0),

  constraint razorpay_webhook_events_event_type_not_empty
    check (length(trim(event_type)) > 0),

  constraint razorpay_webhook_events_status_valid
    check (status in ('received', 'processed', 'failed'))
);

-- Unique index on event_id for strict idempotency enforcement
create unique index if not exists razorpay_webhook_events_event_id_unique
  on public.razorpay_webhook_events (event_id);

-- Lookup index by event_type, status, & created_at
create index if not exists razorpay_webhook_events_lookup_idx
  on public.razorpay_webhook_events (event_type, status, created_at desc);


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) FOR WEBHOOK TABLE
-- ============================================================
-- Webhook events must NOT be readable or writable by public/anonymous clients.
-- Trusted server-side endpoints bypass RLS using the service role key.

alter table public.razorpay_webhook_events enable row level security;

-- Admins can view webhook logs for triage/audit
drop policy if exists "Admins can view webhook events"
  on public.razorpay_webhook_events;

create policy "Admins can view webhook events"
  on public.razorpay_webhook_events
  for select
  to authenticated
  using (public.is_admin());


-- ============================================================
-- 6. COMMENTS FOR SCHEMA DOCUMENTATION
-- ============================================================

comment on column public.orders.payment_method is
  'Instrument method returned by Razorpay (e.g., upi, card, netbanking, wallet, emi).';

comment on column public.orders.payment_error_code is
  'Gateway failure error code received from Razorpay upon payment rejection.';

comment on column public.orders.payment_error_description is
  'Human-readable payment failure description received from Razorpay.';

comment on column public.orders.refund_status is
  'Audit status of manual external refunds (none, partial, full).';

comment on column public.orders.refunded_amount is
  'Total cumulative amount refunded manually to the customer.';

comment on column public.orders.refund_notes is
  'Admin audit notes regarding manual refund reconciliation.';

comment on table public.razorpay_webhook_events is
  'Stores Razorpay webhook events and processing status to enforce idempotency and maintain an audit log.';

