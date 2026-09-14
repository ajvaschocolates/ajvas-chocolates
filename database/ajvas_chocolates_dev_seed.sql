-- ============================================================
-- AJVAS CHOCOLATES — Development Seed Script
-- File: database/ajvas_chocolates_dev_seed.sql
-- ============================================================
-- Purpose:
--   Populates a minimal, realistic test dataset for testing:
--     - Screen #1: Homepage (Curated Collections & Featured Items)
--     - Screen #2: Shop Collections (/shop filters, sorting, availability)
--     - Screen #3: Product Detail / PDP (/products/[slug], discounts, package specs)
--     - Screen #4: Cart (/cart, line totals, consolidated weight)
--     - Screen #5: Checkout (/checkout, pincode resolution, couriers, shipping rates)
--
-- Safety & Idempotency:
--   - Safe to run multiple times in Supabase SQL Editor.
--   - Does NOT alter database schema or RLS policies.
--   - Does NOT insert orders, payments, or customer data.
--   - Does NOT insert fake reviews, ratings, or forbidden legacy claims.
-- ============================================================

do $$
declare
  v_cat_hampers_id uuid;
  v_cat_truffles_id uuid;

  v_pin_mumbai_id uuid;
  v_pin_bengaluru_id uuid;
  v_pin_delhi_id uuid;

  v_courier_bluedart_id uuid;
  v_courier_delhivery_id uuid;
begin

  -- ============================================================
  -- 1. CATEGORIES (2 Active Categories)
  -- ============================================================
  insert into public.categories (name, status)
  values ('Gift Hampers', 'active')
  on conflict (lower(name)) do update
    set status = 'active', updated_at = now()
  returning id into v_cat_hampers_id;

  if v_cat_hampers_id is null then
    select id into v_cat_hampers_id from public.categories where lower(name) = lower('Gift Hampers');
  end if;

  insert into public.categories (name, status)
  values ('Truffle Collections', 'active')
  on conflict (lower(name)) do update
    set status = 'active', updated_at = now()
  returning id into v_cat_truffles_id;

  if v_cat_truffles_id is null then
    select id into v_cat_truffles_id from public.categories where lower(name) = lower('Truffle Collections');
  end if;


  -- ============================================================
  -- 2. PRODUCTS (3 Active Products with Package Metrics & Pricing)
  -- ============================================================

  -- Product 1: The Grand Velvet Hamper (Standard Price, Gift Hamper)
  insert into public.products (
    category_id,
    name,
    slug,
    description,
    price,
    discount_type,
    discount_value,
    status,
    availability,
    weight_grams,
    length_cm,
    width_cm,
    height_cm
  ) values (
    v_cat_hampers_id,
    'The Grand Velvet Hamper',
    'grand-velvet-hamper',
    'A signature presentation hamper featuring an assortment of dark chocolate bars, roasted nut clusters, and velvet truffle selections for celebrations and memorable occasions.',
    3450.00,
    'none',
    0,
    'active',
    'in_stock',
    1200,
    28.00,
    20.00,
    12.00
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    status = excluded.status,
    availability = excluded.availability,
    weight_grams = excluded.weight_grams,
    length_cm = excluded.length_cm,
    width_cm = excluded.width_cm,
    height_cm = excluded.height_cm,
    updated_at = now();

  -- Product 2: The Noir Truffle Keepsake Box (Percentage Discount, Truffles)
  insert into public.products (
    category_id,
    name,
    slug,
    description,
    price,
    discount_type,
    discount_value,
    status,
    availability,
    weight_grams,
    length_cm,
    width_cm,
    height_cm
  ) values (
    v_cat_truffles_id,
    'The Noir Truffle Keepsake Box',
    'noir-truffle-keepsake-box',
    'Sixteen rich dark chocolate ganache truffles dusted in fine cocoa, presented in an elegant structured keepsake box for gifting.',
    1850.00,
    'percentage',
    10.00,
    'active',
    'in_stock',
    650,
    22.00,
    16.00,
    8.00
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    status = excluded.status,
    availability = excluded.availability,
    weight_grams = excluded.weight_grams,
    length_cm = excluded.length_cm,
    width_cm = excluded.width_cm,
    height_cm = excluded.height_cm,
    updated_at = now();

  -- Product 3: The Petite Chocolate Selection (Fixed Discount, Low Stock)
  insert into public.products (
    category_id,
    name,
    slug,
    description,
    price,
    discount_type,
    discount_value,
    status,
    availability,
    weight_grams,
    length_cm,
    width_cm,
    height_cm
  ) values (
    v_cat_hampers_id,
    'The Petite Chocolate Selection',
    'petite-confection-selection',
    'A compact gift selection of crisp chocolate pralines and roasted almond thins curated for thoughtful gestures.',
    1250.00,
    'fixed',
    150.00,
    'active',
    'low_stock',
    450,
    18.00,
    14.00,
    6.00
  )
  on conflict (slug) do update set
    category_id = excluded.category_id,
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    discount_type = excluded.discount_type,
    discount_value = excluded.discount_value,
    status = excluded.status,
    availability = excluded.availability,
    weight_grams = excluded.weight_grams,
    length_cm = excluded.length_cm,
    width_cm = excluded.width_cm,
    height_cm = excluded.height_cm,
    updated_at = now();


  -- ============================================================
  -- 3. PINCODES (3 Test Locations)
  -- ============================================================
  insert into public.pincodes (pincode, state, district, status)
  values ('400001', 'Maharashtra', 'Mumbai', 'active')
  on conflict (pincode) do update set
    state = excluded.state,
    district = excluded.district,
    status = excluded.status,
    updated_at = now()
  returning id into v_pin_mumbai_id;

  if v_pin_mumbai_id is null then
    select id into v_pin_mumbai_id from public.pincodes where pincode = '400001';
  end if;

  insert into public.pincodes (pincode, state, district, status)
  values ('560001', 'Karnataka', 'Bengaluru', 'active')
  on conflict (pincode) do update set
    state = excluded.state,
    district = excluded.district,
    status = excluded.status,
    updated_at = now()
  returning id into v_pin_bengaluru_id;

  if v_pin_bengaluru_id is null then
    select id into v_pin_bengaluru_id from public.pincodes where pincode = '560001';
  end if;

  insert into public.pincodes (pincode, state, district, status)
  values ('110001', 'Delhi', 'New Delhi', 'active')
  on conflict (pincode) do update set
    state = excluded.state,
    district = excluded.district,
    status = excluded.status,
    updated_at = now()
  returning id into v_pin_delhi_id;

  if v_pin_delhi_id is null then
    select id into v_pin_delhi_id from public.pincodes where pincode = '110001';
  end if;


  -- ============================================================
  -- 4. COURIERS (2 Active Carrier Services)
  -- ============================================================
  insert into public.couriers (courier_partner, service_name, status)
  values ('Blue Dart', 'Standard Service', 'active')
  on conflict (courier_partner, service_name) do update set
    status = excluded.status,
    updated_at = now()
  returning id into v_courier_bluedart_id;

  if v_courier_bluedart_id is null then
    select id into v_courier_bluedart_id from public.couriers
    where courier_partner = 'Blue Dart' and service_name = 'Standard Service';
  end if;

  insert into public.couriers (courier_partner, service_name, status)
  values ('Delhivery', 'Surface Parcel', 'active')
  on conflict (courier_partner, service_name) do update set
    status = excluded.status,
    updated_at = now()
  returning id into v_courier_delhivery_id;

  if v_courier_delhivery_id is null then
    select id into v_courier_delhivery_id from public.couriers
    where courier_partner = 'Delhivery' and service_name = 'Surface Parcel';
  end if;


  -- ============================================================
  -- 5. PINCODE ↔ COURIER MAPPINGS
  -- ============================================================
  insert into public.pincode_couriers (pincode_id, courier_id, status)
  values
    (v_pin_mumbai_id, v_courier_bluedart_id, 'active'),
    (v_pin_mumbai_id, v_courier_delhivery_id, 'active'),
    (v_pin_bengaluru_id, v_courier_bluedart_id, 'active'),
    (v_pin_bengaluru_id, v_courier_delhivery_id, 'active'),
    (v_pin_delhi_id, v_courier_bluedart_id, 'active'),
    (v_pin_delhi_id, v_courier_delhivery_id, 'active')
  on conflict (pincode_id, courier_id) do update set
    status = excluded.status,
    updated_at = now();


  -- ============================================================
  -- 6. SHIPPING RATES (Dynamic Consolidated Package Weight Tiers)
  -- ============================================================
  -- Clean existing seed rates for the test pincodes and couriers to avoid duplicates
  delete from public.shipping_rates
  where pincode_id in (v_pin_mumbai_id, v_pin_bengaluru_id, v_pin_delhi_id)
    and courier_id in (v_courier_bluedart_id, v_courier_delhivery_id);

  -- Tier 1: 1g to 1000g (e.g. Single Petite 450g or Single Noir 650g)
  -- Tier 2: 1001g to 2500g (e.g. Single Grand Velvet 1200g, or 650g + 450g = 1100g, or 2 × 650g = 1300g)
  -- Tier 3: 2501g to 5000g (e.g. Multi-item cart: 2 × 1200g + 650g = 3050g)

  insert into public.shipping_rates (
    pincode_id,
    courier_id,
    min_weight_grams,
    max_weight_grams,
    shipping_amount,
    status
  ) values
    -- Mumbai (400001) Rates
    (v_pin_mumbai_id, v_courier_bluedart_id, 1, 1000, 140.00, 'active'),
    (v_pin_mumbai_id, v_courier_bluedart_id, 1001, 2500, 240.00, 'active'),
    (v_pin_mumbai_id, v_courier_bluedart_id, 2501, 5000, 390.00, 'active'),
    (v_pin_mumbai_id, v_courier_delhivery_id, 1, 1000, 110.00, 'active'),
    (v_pin_mumbai_id, v_courier_delhivery_id, 1001, 2500, 190.00, 'active'),
    (v_pin_mumbai_id, v_courier_delhivery_id, 2501, 5000, 320.00, 'active'),

    -- Bengaluru (560001) Rates
    (v_pin_bengaluru_id, v_courier_bluedart_id, 1, 1000, 160.00, 'active'),
    (v_pin_bengaluru_id, v_courier_bluedart_id, 1001, 2500, 260.00, 'active'),
    (v_pin_bengaluru_id, v_courier_bluedart_id, 2501, 5000, 420.00, 'active'),
    (v_pin_bengaluru_id, v_courier_delhivery_id, 1, 1000, 130.00, 'active'),
    (v_pin_bengaluru_id, v_courier_delhivery_id, 1001, 2500, 210.00, 'active'),
    (v_pin_bengaluru_id, v_courier_delhivery_id, 2501, 5000, 350.00, 'active'),

    -- New Delhi (110001) Rates
    (v_pin_delhi_id, v_courier_bluedart_id, 1, 1000, 150.00, 'active'),
    (v_pin_delhi_id, v_courier_bluedart_id, 1001, 2500, 250.00, 'active'),
    (v_pin_delhi_id, v_courier_bluedart_id, 2501, 5000, 400.00, 'active'),
    (v_pin_delhi_id, v_courier_delhivery_id, 1, 1000, 120.00, 'active'),
    (v_pin_delhi_id, v_courier_delhivery_id, 1001, 2500, 200.00, 'active'),
    (v_pin_delhi_id, v_courier_delhivery_id, 2501, 5000, 340.00, 'active');

end $$;

-- Verify inserted data summary
select 'categories' as entity, count(*) as active_count from public.categories where status = 'active'
union all
select 'products' as entity, count(*) as active_count from public.products where status = 'active'
union all
select 'pincodes' as entity, count(*) as active_count from public.pincodes where status = 'active'
union all
select 'couriers' as entity, count(*) as active_count from public.couriers where status = 'active'
union all
select 'shipping_rates' as entity, count(*) as active_count from public.shipping_rates where status = 'active';
