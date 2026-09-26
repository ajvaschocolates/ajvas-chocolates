-- ============================================================
-- AJVAS CHOCOLATES
-- Phase 2 Migration Verification Suite (Read-Only)
-- ============================================================
-- File: verify_001_razorpay_payment_foundation.sql
-- Purpose: Safely inspect and verify that all Phase 2 database schema
-- modifications exist and are structured correctly.
-- ============================================================

-- 1. Check updated columns on orders table
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders'
  and column_name in (
    'payment_provider',
    'razorpay_order_id',
    'razorpay_payment_id',
    'razorpay_signature',
    'payment_method',
    'payment_error_code',
    'payment_error_description',
    'refund_status',
    'refunded_amount',
    'refund_notes'
  )
order by column_name;

-- 2. Verify Razorpay partial UNIQUE indexes on orders table
select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'orders'
  and indexname in (
    'orders_razorpay_order_id_unique',
    'orders_razorpay_payment_id_unique'
  );

-- 3. Verify razorpay_webhook_events table structure & columns
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'razorpay_webhook_events'
order by ordinal_position;

-- 4. Verify razorpay_webhook_events indexes
select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'razorpay_webhook_events';

-- 5. Verify RLS status on razorpay_webhook_events
select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relname = 'razorpay_webhook_events';

-- 6. Verify refund_status enum values
select
  enumlabel
from pg_enum
join pg_type on pg_enum.enumtypid = pg_type.oid
where pg_type.typname = 'refund_status';
