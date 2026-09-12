-- ============================================================
-- AJVAS CHOCOLATES
-- Initial Supabase Database Schema
-- ============================================================
--
-- Purpose:
--   Authoritative database foundation for the AJVAS CHOCOLATES
--   ecommerce application.
--
-- Stack:
--   Next.js + TypeScript + Supabase + Cloudinary + Razorpay
--
-- Important business rules:
--   - Customer checkout is guest checkout.
--   - Customers do not require accounts.
--   - Admin access uses Supabase Auth + admin_users.
--   - Shipping depends on destination pincode, selected courier/service,
--     and the combined shipment package metrics.
--   - Cart = ONE combined shipment/package.
--   - Buy Now = selected product/package shipment.
--   - Historical orders preserve their recorded prices, courier,
--     shipping amount, and product/package information.
--
-- This file is the initial schema baseline.
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- 2. ENUM TYPES
-- ============================================================

do $$
begin

  create type public.record_status as enum (
    'active',
    'inactive'
  );

exception
  when duplicate_object then null;
end
$$;


do $$
begin

  create type public.product_availability as enum (
    'in_stock',
    'low_stock',
    'out_of_stock'
  );

exception
  when duplicate_object then null;
end
$$;


do $$
begin

  create type public.discount_type as enum (
    'none',
    'percentage',
    'fixed'
  );

exception
  when duplicate_object then null;
end
$$;


do $$
begin

  create type public.order_status as enum (
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  );

exception
  when duplicate_object then null;
end
$$;


do $$
begin

  create type public.payment_status as enum (
    'pending',
    'paid',
    'failed'
  );

exception
  when duplicate_object then null;
end
$$;


-- ============================================================
-- 3. COMMON UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- 4. CATEGORIES
-- ============================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  status public.record_status not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_name_not_empty
    check (length(trim(name)) > 0)
);

create unique index if not exists categories_name_lower_unique
  on public.categories (lower(name));

create index if not exists categories_status_idx
  on public.categories (status);

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();


-- ============================================================
-- 5. PRODUCTS
-- ============================================================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),

  category_id uuid references public.categories(id)
    on delete restrict,

  name text not null,
  slug text not null unique,
  description text,

  price numeric(12,2) not null,
  discount_type public.discount_type not null default 'none',
  discount_value numeric(12,2) not null default 0,

  status public.record_status not null default 'active',
  availability public.product_availability not null default 'in_stock',

  -- Package metrics used for shipping calculation.
  weight_grams integer not null,
  length_cm numeric(10,2),
  width_cm numeric(10,2),
  height_cm numeric(10,2),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_name_not_empty
    check (length(trim(name)) > 0),

  constraint products_slug_not_empty
    check (length(trim(slug)) > 0),

  constraint products_price_non_negative
    check (price >= 0),

  constraint products_discount_value_non_negative
    check (discount_value >= 0),

  constraint products_weight_positive
    check (weight_grams > 0),

  constraint products_length_positive
    check (length_cm is null or length_cm > 0),

  constraint products_width_positive
    check (width_cm is null or width_cm > 0),

  constraint products_height_positive
    check (height_cm is null or height_cm > 0),

  constraint products_percentage_discount_valid
    check (
      discount_type <> 'percentage'
      or discount_value <= 100
    )
);

create index if not exists products_category_id_idx
  on public.products (category_id);

create index if not exists products_status_idx
  on public.products (status);

create index if not exists products_availability_idx
  on public.products (availability);

create index if not exists products_created_at_idx
  on public.products (created_at desc);

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();


-- ============================================================
-- 6. PRODUCT IMAGES
-- ============================================================

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null references public.products(id)
    on delete cascade,

  -- Cloudinary information.
  cloudinary_public_id text not null,
  image_url text not null,

  alt_text text,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint product_images_sort_order_non_negative
    check (sort_order >= 0),

  constraint product_images_public_id_not_empty
    check (length(trim(cloudinary_public_id)) > 0),

  constraint product_images_url_not_empty
    check (length(trim(image_url)) > 0)
);

create index if not exists product_images_product_id_idx
  on public.product_images (product_id);

create index if not exists product_images_sort_order_idx
  on public.product_images (product_id, sort_order);

create trigger product_images_set_updated_at
before update on public.product_images
for each row
execute function public.set_updated_at();


-- ============================================================
-- 7. PINCODES
-- ============================================================

create table if not exists public.pincodes (
  id uuid primary key default gen_random_uuid(),

  pincode varchar(6) not null unique,

  state text not null,
  district text not null,

  status public.record_status not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pincodes_format
    check (pincode ~ '^[0-9]{6}$'),

  constraint pincodes_state_not_empty
    check (length(trim(state)) > 0),

  constraint pincodes_district_not_empty
    check (length(trim(district)) > 0)
);

create index if not exists pincodes_state_idx
  on public.pincodes (state);

create index if not exists pincodes_district_idx
  on public.pincodes (district);

create index if not exists pincodes_status_idx
  on public.pincodes (status);

create trigger pincodes_set_updated_at
before update on public.pincodes
for each row
execute function public.set_updated_at();


-- ============================================================
-- 8. COURIERS
-- ============================================================

create table if not exists public.couriers (
  id uuid primary key default gen_random_uuid(),

  courier_partner text not null,
  service_name text not null,

  status public.record_status not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint couriers_partner_not_empty
    check (length(trim(courier_partner)) > 0),

  constraint couriers_service_not_empty
    check (length(trim(service_name)) > 0),

  constraint couriers_partner_service_unique
    unique (courier_partner, service_name)
);

create index if not exists couriers_status_idx
  on public.couriers (status);

create trigger couriers_set_updated_at
before update on public.couriers
for each row
execute function public.set_updated_at();


-- ============================================================
-- 9. PINCODE ↔ COURIER AVAILABILITY
-- ============================================================

create table if not exists public.pincode_couriers (
  id uuid primary key default gen_random_uuid(),

  pincode_id uuid not null references public.pincodes(id)
    on delete cascade,

  courier_id uuid not null references public.couriers(id)
    on delete cascade,

  status public.record_status not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint pincode_couriers_unique
    unique (pincode_id, courier_id)
);

create index if not exists pincode_couriers_pincode_id_idx
  on public.pincode_couriers (pincode_id);

create index if not exists pincode_couriers_courier_id_idx
  on public.pincode_couriers (courier_id);

create index if not exists pincode_couriers_status_idx
  on public.pincode_couriers (status);

create trigger pincode_couriers_set_updated_at
before update on public.pincode_couriers
for each row
execute function public.set_updated_at();


-- ============================================================
-- 10. SHIPPING RATES
-- ============================================================
--
-- Core model:
--
-- Destination Pincode
--       +
-- Selected Courier / Service
--       +
-- Combined Shipment Package Metrics
--       ↓
-- Applicable Shipping Rate
--       ↓
-- Calculated Shipping Amount
--
-- The actual rate-selection algorithm belongs in application/server
-- logic and should not be exposed to customers.
--
-- This table supports weight and package-dimension thresholds.
-- Admin validation will prevent overlapping rules.
-- ============================================================

create table if not exists public.shipping_rates (
  id uuid primary key default gen_random_uuid(),

  pincode_id uuid not null references public.pincodes(id)
    on delete restrict,

  courier_id uuid not null references public.couriers(id)
    on delete restrict,

  min_weight_grams integer not null,
  max_weight_grams integer,

  max_length_cm numeric(10,2),
  max_width_cm numeric(10,2),
  max_height_cm numeric(10,2),

  max_volume_cm3 numeric(14,2),

  shipping_amount numeric(12,2) not null,

  status public.record_status not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shipping_rates_min_weight_positive
    check (min_weight_grams > 0),

  constraint shipping_rates_max_weight_valid
    check (
      max_weight_grams is null
      or max_weight_grams >= min_weight_grams
    ),

  constraint shipping_rates_length_positive
    check (
      max_length_cm is null
      or max_length_cm > 0
    ),

  constraint shipping_rates_width_positive
    check (
      max_width_cm is null
      or max_width_cm > 0
    ),

  constraint shipping_rates_height_positive
    check (
      max_height_cm is null
      or max_height_cm > 0
    ),

  constraint shipping_rates_volume_positive
    check (
      max_volume_cm3 is null
      or max_volume_cm3 > 0
    ),

  constraint shipping_rates_amount_non_negative
    check (shipping_amount >= 0)
);

create index if not exists shipping_rates_pincode_id_idx
  on public.shipping_rates (pincode_id);

create index if not exists shipping_rates_courier_id_idx
  on public.shipping_rates (courier_id);

create index if not exists shipping_rates_lookup_idx
  on public.shipping_rates (
    pincode_id,
    courier_id,
    min_weight_grams,
    max_weight_grams
  );

create index if not exists shipping_rates_status_idx
  on public.shipping_rates (status);

create trigger shipping_rates_set_updated_at
before update on public.shipping_rates
for each row
execute function public.set_updated_at();


-- ============================================================
-- 11. CUSTOMERS
-- ============================================================
--
-- Customers are guest-checkout customers.
-- No auth.users relationship is intentionally created here.
-- ============================================================

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  phone text not null,
  email text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customers_name_not_empty
    check (length(trim(full_name)) > 0),

  constraint customers_phone_not_empty
    check (length(trim(phone)) > 0)
);

create index if not exists customers_phone_idx
  on public.customers (phone);

create index if not exists customers_email_idx
  on public.customers (lower(email));

create index if not exists customers_created_at_idx
  on public.customers (created_at desc);

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();


-- ============================================================
-- 12. ORDERS
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  order_number text not null unique,

  customer_id uuid references public.customers(id)
    on delete set null,

  -- Customer snapshot.
  customer_name text not null,
  customer_phone text not null,
  customer_email text,

  -- Shipping address snapshot.
  shipping_address_line1 text not null,
  shipping_address_line2 text,
  shipping_city text,
  shipping_state text not null,
  shipping_district text not null,
  shipping_pincode varchar(6) not null,

  -- Courier snapshot.
  courier_partner text,
  courier_service_name text,

  awb_number text,
  tracking_url text,

  -- Financial snapshot.
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,

  currency varchar(3) not null default 'INR',

  -- Order/payment state.
  order_status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',

  payment_provider text default 'razorpay',
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,

  -- Combined shipment snapshot.
  package_weight_grams integer,
  package_length_cm numeric(10,2),
  package_width_cm numeric(10,2),
  package_height_cm numeric(10,2),
  package_volume_cm3 numeric(14,2),

  -- Snapshot of the selected shipping rate.
  shipping_rate_id uuid references public.shipping_rates(id)
    on delete set null,

  placed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orders_number_not_empty
    check (length(trim(order_number)) > 0),

  constraint orders_customer_name_not_empty
    check (length(trim(customer_name)) > 0),

  constraint orders_customer_phone_not_empty
    check (length(trim(customer_phone)) > 0),

  constraint orders_pincode_format
    check (shipping_pincode ~ '^[0-9]{6}$'),

  constraint orders_subtotal_non_negative
    check (subtotal >= 0),

  constraint orders_discount_non_negative
    check (discount_amount >= 0),

  constraint orders_shipping_non_negative
    check (shipping_amount >= 0),

  constraint orders_total_non_negative
    check (total_amount >= 0),

  constraint orders_currency
    check (currency = 'INR'),

  constraint orders_package_weight_positive
    check (
      package_weight_grams is null
      or package_weight_grams > 0
    ),

  constraint orders_package_length_positive
    check (
      package_length_cm is null
      or package_length_cm > 0
    ),

  constraint orders_package_width_positive
    check (
      package_width_cm is null
      or package_width_cm > 0
    ),

  constraint orders_package_height_positive
    check (
      package_height_cm is null
      or package_height_cm > 0
    ),

  constraint orders_package_volume_positive
    check (
      package_volume_cm3 is null
      or package_volume_cm3 > 0
    )
);

create index if not exists orders_customer_id_idx
  on public.orders (customer_id);

create index if not exists orders_order_status_idx
  on public.orders (order_status);

create index if not exists orders_payment_status_idx
  on public.orders (payment_status);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_pincode_idx
  on public.orders (shipping_pincode);

create index if not exists orders_phone_idx
  on public.orders (customer_phone);

create index if not exists orders_awb_idx
  on public.orders (awb_number);

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();


-- ============================================================
-- 13. ORDER ITEMS
-- ============================================================
--
-- Product information is intentionally snapshotted here.
-- This protects historical orders if the product changes later.
-- ============================================================

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null references public.orders(id)
    on delete cascade,

  product_id uuid references public.products(id)
    on delete set null,

  product_name text not null,
  product_slug text,

  quantity integer not null,

  unit_price numeric(12,2) not null,
  discount_amount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null,

  -- Product/package snapshot at order time.
  weight_grams integer not null,
  length_cm numeric(10,2),
  width_cm numeric(10,2),
  height_cm numeric(10,2),

  created_at timestamptz not null default now(),

  constraint order_items_product_name_not_empty
    check (length(trim(product_name)) > 0),

  constraint order_items_quantity_positive
    check (quantity > 0),

  constraint order_items_unit_price_non_negative
    check (unit_price >= 0),

  constraint order_items_discount_non_negative
    check (discount_amount >= 0),

  constraint order_items_line_total_non_negative
    check (line_total >= 0),

  constraint order_items_weight_positive
    check (weight_grams > 0),

  constraint order_items_length_positive
    check (
      length_cm is null
      or length_cm > 0
    ),

  constraint order_items_width_positive
    check (
      width_cm is null
      or width_cm > 0
    ),

  constraint order_items_height_positive
    check (
      height_cm is null
      or height_cm > 0
    )
);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists order_items_product_id_idx
  on public.order_items (product_id);


-- ============================================================
-- 14. ORDER STATUS HISTORY
-- ============================================================

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null references public.orders(id)
    on delete cascade,

  status public.order_status not null,

  note text,

  changed_by uuid references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists order_status_history_order_id_idx
  on public.order_status_history (order_id, created_at desc);

create index if not exists order_status_history_created_at_idx
  on public.order_status_history (created_at desc);


-- ============================================================
-- 15. ADMIN USERS
-- ============================================================
--
-- Supabase Authentication handles the actual login credentials.
--
-- This table identifies which authenticated users are allowed to
-- access the AJVAS admin area.
--
-- After creating your first user in:
--
-- Supabase → Authentication → Users
--
-- you will insert that user's UUID into this table.
-- ============================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id)
    on delete cascade,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 16. ADMIN CHECK FUNCTION
-- ============================================================
--
-- Security-definer function prevents RLS recursion while checking
-- whether the current authenticated user is an admin.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;


-- ============================================================
-- 17. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

alter table public.pincodes enable row level security;
alter table public.couriers enable row level security;
alter table public.pincode_couriers enable row level security;
alter table public.shipping_rates enable row level security;

alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

alter table public.admin_users enable row level security;


-- ============================================================
-- 18. PUBLIC CATALOG READ POLICIES
-- ============================================================
--
-- Customers can browse only active catalog records.
-- ============================================================

drop policy if exists "Public can read active categories"
on public.categories;

create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (
  status = 'active'
);


drop policy if exists "Public can read active products"
on public.products;

create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (
  status = 'active'
);


drop policy if exists "Public can read images for active products"
on public.product_images;

create policy "Public can read images for active products"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.status = 'active'
  )
);


-- ============================================================
-- 19. ADMIN CATEGORY POLICIES
-- ============================================================

drop policy if exists "Admins can manage categories"
on public.categories;

create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 20. ADMIN PRODUCT POLICIES
-- ============================================================

drop policy if exists "Admins can manage products"
on public.products;

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can manage product images"
on public.product_images;

create policy "Admins can manage product images"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 21. SHIPPING DATA POLICIES
-- ============================================================
--
-- IMPORTANT:
-- Anonymous users should NOT directly read shipping-rate rules.
--
-- The production Next.js server will perform shipping resolution
-- server-side using a protected Supabase server credential.
--
-- This prevents customers from directly browsing the internal
-- shipping-rate rule table.
-- ============================================================

drop policy if exists "Admins can manage pincodes"
on public.pincodes;

create policy "Admins can manage pincodes"
on public.pincodes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can manage couriers"
on public.couriers;

create policy "Admins can manage couriers"
on public.couriers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can manage pincode courier availability"
on public.pincode_couriers;

create policy "Admins can manage pincode courier availability"
on public.pincode_couriers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can manage shipping rates"
on public.shipping_rates;

create policy "Admins can manage shipping rates"
on public.shipping_rates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 22. CUSTOMER / ORDER ADMIN POLICIES
-- ============================================================

drop policy if exists "Admins can manage customers"
on public.customers;

create policy "Admins can manage customers"
on public.customers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can manage orders"
on public.orders;

create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can manage order items"
on public.order_items;

create policy "Admins can manage order items"
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can manage order status history"
on public.order_status_history;

create policy "Admins can manage order status history"
on public.order_status_history
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ============================================================
-- 23. ADMIN USER POLICIES
-- ============================================================

drop policy if exists "Admins can read admin users"
on public.admin_users;

create policy "Admins can read admin users"
on public.admin_users
for select
to authenticated
using (public.is_admin());


-- ============================================================
-- 24. BASIC DATABASE COMMENTS
-- ============================================================

comment on table public.products is
'AJVAS CHOCOLATES product catalog. Package metrics are stored for shipping calculation.';

comment on table public.product_images is
'Product media metadata. Actual image files are stored in Cloudinary.';

comment on table public.pincodes is
'Destination pincode master data containing state and district.';

comment on table public.couriers is
'Configured courier partners and service names.';

comment on table public.pincode_couriers is
'Maps destination pincodes to courier services available for checkout.';

comment on table public.shipping_rates is
'Shipping rate rules selected using destination pincode, courier/service, and package metrics.';

comment on table public.customers is
'Guest checkout customers associated with store orders.';

comment on table public.orders is
'Guest ecommerce orders with historical customer, address, courier, payment, shipping, and package snapshots.';

comment on table public.order_items is
'Historical product and pricing snapshot for each order item.';

comment on table public.order_status_history is
'Timeline of order status changes.';

comment on table public.admin_users is
'Authenticated Supabase users authorized to access the AJVAS admin application.';


-- ============================================================
-- 25. FINAL SCHEMA CHECK
-- ============================================================
--
-- This query is intentionally included at the end so you can
-- verify that the expected tables were created.
-- ============================================================

select
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'categories',
    'products',
    'product_images',
    'pincodes',
    'couriers',
    'pincode_couriers',
    'shipping_rates',
    'customers',
    'orders',
    'order_items',
    'order_status_history',
    'admin_users'
  )
order by table_name;