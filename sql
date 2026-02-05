-- Complete Supabase Schema for HotelOps CRM
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Tables
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number TEXT NOT NULL UNIQUE,
  roomType TEXT NOT NULL,
  bedType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  pricePerNight NUMERIC NOT NULL,
  maxOccupancy INTEGER NOT NULL,
  viewBalcony TEXT,
  floorWing TEXT,
  amenities TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guestName TEXT NOT NULL,
  idProofType TEXT NOT NULL,
  idProofNumber TEXT NOT NULL,
  roomType TEXT NOT NULL,
  roomNumber TEXT NOT NULL,
  arrival DATE NOT NULL,
  departure DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Booked',
  balance NUMERIC DEFAULT 0,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest Self-Service Tables
CREATE TABLE IF NOT EXISTS guest_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  room_type TEXT NOT NULL,
  guests INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  eta TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Requested',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_dining_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  order_text TEXT NOT NULL,
  room_number TEXT,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  item TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guest_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  ref TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_dining_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (public read, authenticated write)
DROP POLICY IF EXISTS "Allow all for rooms" ON rooms;
CREATE POLICY "Public can view rooms" ON rooms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage rooms" ON rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for reservations (public read, authenticated write)
DROP POLICY IF EXISTS "Allow all for reservations" ON reservations;
CREATE POLICY "Public can view reservations" ON reservations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage reservations" ON reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for guest_bookings (users can only see their own)
CREATE POLICY "Users can view own bookings" ON guest_bookings FOR SELECT TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Users can insert own bookings" ON guest_bookings FOR INSERT TO authenticated, anon WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Users can update own bookings" ON guest_bookings FOR UPDATE TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for guest_service_requests
CREATE POLICY "Users can view own requests" ON guest_service_requests FOR SELECT TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Users can insert own requests" ON guest_service_requests FOR INSERT TO authenticated, anon WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Users can update own requests" ON guest_service_requests FOR UPDATE TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for guest_dining_orders
CREATE POLICY "Users can view own orders" ON guest_dining_orders FOR SELECT TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Users can insert own orders" ON guest_dining_orders FOR INSERT TO authenticated, anon WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Users can update own orders" ON guest_dining_orders FOR UPDATE TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for guest_charges
CREATE POLICY "Users can view own charges" ON guest_charges FOR SELECT TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Authenticated can manage charges" ON guest_charges FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for guest_payments
CREATE POLICY "Users can view own payments" ON guest_payments FOR SELECT TO authenticated, anon USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
CREATE POLICY "Authenticated can manage payments" ON guest_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(number);
CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(roomNumber);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(arrival, departure);
CREATE INDEX IF NOT EXISTS idx_guest_bookings_email ON guest_bookings(user_email);
CREATE INDEX IF NOT EXISTS idx_guest_requests_email ON guest_service_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_guest_orders_email ON guest_dining_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_guest_charges_email ON guest_charges(user_email);
CREATE INDEX IF NOT EXISTS idx_guest_payments_email ON guest_payments(user_email);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guest_bookings_updated_at ON guest_bookings;
CREATE TRIGGER update_guest_bookings_updated_at BEFORE UPDATE ON guest_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guest_requests_updated_at ON guest_service_requests;
CREATE TRIGGER update_guest_requests_updated_at BEFORE UPDATE ON guest_service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guest_orders_updated_at ON guest_dining_orders;
CREATE TRIGGER update_guest_orders_updated_at BEFORE UPDATE ON guest_dining_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();