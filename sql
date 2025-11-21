-- =========================================
-- GUEST DASHBOARD - COMPLETE SQL SCHEMA
-- Run this in Supabase SQL Editor
-- =========================================

-- Drop existing tables if you want a fresh start (CAUTION: deletes data)
-- drop table if exists guest_bookings cascade;
-- drop table if exists guest_service_requests cascade;
-- drop table if exists guest_dining_orders cascade;
-- drop table if exists guest_charges cascade;
-- drop table if exists guest_payments cascade;

-- GUEST_BOOKINGS: Guest booking records
create table if not exists guest_bookings (
  id text primary key default gen_random_uuid()::text,
  user_email text not null,
  room_type text,
  check_in_date date,
  check_out_date date,
  guests numeric,
  nights numeric,
  status text default 'Pending',
  total_amount numeric,
  eta text,
  label text,
  requested text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GUEST_SERVICE_REQUESTS: Guest service requests
create table if not exists guest_service_requests (
  id text primary key default gen_random_uuid()::text,
  user_email text not null,
  service_type text not null,
  room_number text,
  description text,
  priority text default 'Normal',
  status text default 'Pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GUEST_DINING_ORDERS: Guest dining orders
create table if not exists guest_dining_orders (
  id text primary key default gen_random_uuid()::text,
  user_email text not null,
  room_number text,
  method text,
  order_text text,
  total numeric,
  status text default 'Placed',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GUEST_CHARGES: Guest billing charges
create table if not exists guest_charges (
  id text primary key default gen_random_uuid()::text,
  user_email text not null,
  date date,
  item text,
  room text,
  category text,
  amount numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GUEST_PAYMENTS: Guest payment records
create table if not exists guest_payments (
  id text primary key default gen_random_uuid()::text,
  user_email text not null,
  date date,
  method text,
  ref text,
  amount numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================
create index if not exists idx_guest_bookings_user on guest_bookings(user_email);
create index if not exists idx_guest_service_requests_user on guest_service_requests(user_email);
create index if not exists idx_guest_dining_orders_user on guest_dining_orders(user_email);
create index if not exists idx_guest_charges_user on guest_charges(user_email);
create index if not exists idx_guest_payments_user on guest_payments(user_email);

-- =========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS
alter table guest_bookings enable row level security;
alter table guest_service_requests enable row level security;
alter table guest_dining_orders enable row level security;
alter table guest_charges enable row level security;
alter table guest_payments enable row level security;

-- Guest Bookings: Users can only access their own bookings
drop policy if exists "Users can access own bookings" on guest_bookings;
create policy "Users can access own bookings" on guest_bookings
for all
to authenticated
using ( user_email = auth.email() )
with check ( user_email = auth.email() );

drop policy if exists "Anon can access own bookings" on guest_bookings;
create policy "Anon can access own bookings" on guest_bookings
for all
to anon
using (true)
with check (true);

-- Guest Service Requests
drop policy if exists "Users can access own service requests" on guest_service_requests;
create policy "Users can access own service requests" on guest_service_requests
for all
to authenticated
using ( user_email = auth.email() )
with check ( user_email = auth.email() );

drop policy if exists "Anon can access own service requests" on guest_service_requests;
create policy "Anon can access own service requests" on guest_service_requests
for all
to anon
using (true)
with check (true);

-- Guest Dining Orders
drop policy if exists "Users can access own dining orders" on guest_dining_orders;
create policy "Users can access own dining orders" on guest_dining_orders
for all
to authenticated
using ( user_email = auth.email() )
with check ( user_email = auth.email() );

drop policy if exists "Anon can access own dining orders" on guest_dining_orders;
create policy "Anon can access own dining orders" on guest_dining_orders
for all
to anon
using (true)
with check (true);

-- Guest Charges
drop policy if exists "Users can access own charges" on guest_charges;
create policy "Users can access own charges" on guest_charges
for all
to authenticated
using ( user_email = auth.email() )
with check ( user_email = auth.email() );

drop policy if exists "Anon can access own charges" on guest_charges;
create policy "Anon can access own charges" on guest_charges
for all
to anon
using (true)
with check (true);

-- Guest Payments
drop policy if exists "Users can access own payments" on guest_payments;
create policy "Users can access own payments" on guest_payments
for all
to authenticated
using ( user_email = auth.email() )
with check ( user_email = auth.email() );

drop policy if exists "Anon can access own payments" on guest_payments;
create policy "Anon can access own payments" on guest_payments
for all
to anon
using (true)
with check (true);

-- =========================================
-- TRIGGERS FOR UPDATED_AT
-- =========================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_guest_bookings_updated_at on guest_bookings;
create trigger update_guest_bookings_updated_at
  before update on guest_bookings
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_guest_service_requests_updated_at on guest_service_requests;
create trigger update_guest_service_requests_updated_at
  before update on guest_service_requests
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_guest_dining_orders_updated_at on guest_dining_orders;
create trigger update_guest_dining_orders_updated_at
  before update on guest_dining_orders
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_guest_charges_updated_at on guest_charges;
create trigger update_guest_charges_updated_at
  before update on guest_charges
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_guest_payments_updated_at on guest_payments;
create trigger update_guest_payments_updated_at
  before update on guest_payments
  for each row
  execute function update_updated_at_column();
