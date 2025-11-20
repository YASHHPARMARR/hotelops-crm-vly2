-- ============================================
-- COMPLETE HOTELOPS CRM DATABASE SCHEMA
-- ============================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secret-key';

-- ============================================
-- 1. CORE HOTEL OPERATIONS
-- ============================================

-- Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL CHECK (room_type IN ('Single', 'Double', 'Suite', 'Deluxe', 'Standard', 'Presidential')),
  bed_type TEXT CHECK (bed_type IN ('King', 'Queen', 'Twin')),
  status TEXT NOT NULL DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied', 'Reserved', 'Under Maintenance')),
  price_per_night NUMERIC(10,2) NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  view_balcony TEXT CHECK (view_balcony IN ('Sea', 'Garden', 'City', 'None')),
  floor_wing TEXT,
  amenities TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_number ON public.rooms(number);
CREATE INDEX idx_rooms_room_type ON public.rooms(room_type);

-- Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  dob DATE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  country TEXT NOT NULL,
  nationality TEXT,
  id_number TEXT,
  preferred_room_type TEXT CHECK (preferred_room_type IN ('Single', 'Double', 'Suite', 'Deluxe')),
  special_requests TEXT,
  membership TEXT NOT NULL DEFAULT 'None' CHECK (membership IN ('None', 'Silver', 'Gold', 'VIP')),
  loyalty_points INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_email ON public.guests(email);
CREATE INDEX idx_guests_guest_id ON public.guests(guest_id);
CREATE INDEX idx_guests_membership ON public.guests(membership);

-- Reservations Table
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  id_proof_type TEXT NOT NULL CHECK (id_proof_type IN ('Passport', 'Driver License', 'Aadhar', 'National ID')),
  id_proof_number TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('Standard', 'Deluxe', 'Suite', 'Presidential')),
  room_number TEXT NOT NULL,
  arrival DATE NOT NULL,
  departure DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Booked' CHECK (status IN ('Booked', 'CheckedIn', 'CheckedOut', 'Cancelled')),
  balance NUMERIC(10,2),
  source TEXT CHECK (source IN ('Direct', 'OTA', 'Phone', 'Walk-in')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservations_room_number ON public.reservations(room_number);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_arrival ON public.reservations(arrival);
CREATE INDEX idx_reservations_departure ON public.reservations(departure);

-- ============================================
-- 2. GUEST SELF-SERVICE TABLES
-- ============================================

-- Guest Bookings
CREATE TABLE IF NOT EXISTS public.guest_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('Single', 'Double', 'Deluxe', 'Suite')),
  guests INTEGER NOT NULL DEFAULT 1,
  nights INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_bookings_user_email ON public.guest_bookings(user_email);
CREATE INDEX idx_guest_bookings_status ON public.guest_bookings(status);

-- Guest Service Requests
CREATE TABLE IF NOT EXISTS public.guest_service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  eta TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested', 'In Progress', 'Completed', 'Cancelled')),
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_service_requests_user_email ON public.guest_service_requests(user_email);
CREATE INDEX idx_guest_service_requests_status ON public.guest_service_requests(status);

-- Guest Dining Orders
CREATE TABLE IF NOT EXISTS public.guest_dining_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  room_number TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Dine-in', 'Pickup', 'Room Delivery')),
  order_text TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Placed' CHECK (status IN ('Placed', 'Preparing', 'Delivered', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_dining_orders_user_email ON public.guest_dining_orders(user_email);
CREATE INDEX idx_guest_dining_orders_status ON public.guest_dining_orders(status);

-- Guest Charges
CREATE TABLE IF NOT EXISTS public.guest_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  item TEXT NOT NULL,
  room TEXT,
  category TEXT NOT NULL CHECK (category IN ('Room Night', 'Dining', 'Minibar', 'Spa', 'Taxes & Fees')),
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_charges_user_email ON public.guest_charges(user_email);
CREATE INDEX idx_guest_charges_date ON public.guest_charges(date);

-- Guest Payments
CREATE TABLE IF NOT EXISTS public.guest_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Visa', 'Mastercard', 'Amex', 'UPI', 'Cash')),
  ref TEXT,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_payments_user_email ON public.guest_payments(user_email);
CREATE INDEX idx_guest_payments_date ON public.guest_payments(date);

-- ============================================
-- 3. STAFF & ADMINISTRATION
-- ============================================

-- Admin Staff
CREATE TABLE IF NOT EXISTS public.admin_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  dob DATE NOT NULL,
  address TEXT,
  emergency_contact TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Front Desk', 'Housekeeping', 'Maintenance', 'Chef', 'Security', 'Restaurant', 'Inventory', 'Admin', 'Manager')),
  department TEXT NOT NULL CHECK (department IN ('Front Desk', 'Housekeeping', 'Maintenance', 'Security', 'Restaurant', 'Inventory', 'Transport', 'Administration')),
  shift_timings TEXT CHECK (shift_timings IN ('Morning', 'Evening', 'Night')),
  supervisor TEXT,
  salary NUMERIC(10,2) NOT NULL,
  joining_date DATE NOT NULL,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('Full-time', 'Part-time', 'Temporary')),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role_access TEXT NOT NULL CHECK (role_access IN ('Admin', 'Manager', 'Staff')),
  skills TEXT,
  documents TEXT,
  assigned_rooms_depts TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
  last_login TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_staff_staff_id ON public.admin_staff(staff_id);
CREATE INDEX idx_admin_staff_email ON public.admin_staff(email);
CREATE INDEX idx_admin_staff_role ON public.admin_staff(role);
CREATE INDEX idx_admin_staff_department ON public.admin_staff(department);

-- Admin Reports
CREATE TABLE IF NOT EXISTS public.admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  generated_at DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Ready', 'Queued', 'Failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_reports_status ON public.admin_reports(status);

-- ============================================
-- 4. HOUSEKEEPING
-- ============================================

-- Housekeeping Tasks
CREATE TABLE IF NOT EXISTS public.hk_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL,
  room TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hk_tasks_room ON public.hk_tasks(room);
CREATE INDEX idx_hk_tasks_status ON public.hk_tasks(status);
CREATE INDEX idx_hk_tasks_priority ON public.hk_tasks(priority);

-- Housekeeping Inventory
CREATE TABLE IF NOT EXISTS public.hk_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  stock INTEGER NOT NULL,
  min INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hk_inventory_item ON public.hk_inventory(item);

-- ============================================
-- 5. INVENTORY MANAGEMENT
-- ============================================

-- Inventory Items
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  stock INTEGER NOT NULL,
  min INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_sku ON public.inventory_items(sku);
CREATE INDEX idx_inventory_items_category ON public.inventory_items(category);

-- Inventory Orders
CREATE TABLE IF NOT EXISTS public.inventory_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE,
  supplier TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Sent', 'Received', 'Closed')),
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_orders_po_number ON public.inventory_orders(po_number);
CREATE INDEX idx_inventory_orders_status ON public.inventory_orders(status);

-- Inventory Suppliers
CREATE TABLE IF NOT EXISTS public.inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_suppliers_name ON public.inventory_suppliers(name);

-- ============================================
-- 6. MAINTENANCE
-- ============================================

-- Maintenance Tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Other')),
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Completed')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_tickets_status ON public.maintenance_tickets(status);
CREATE INDEX idx_maintenance_tickets_priority ON public.maintenance_tickets(priority);

-- Maintenance Assets
CREATE TABLE IF NOT EXISTS public.maintenance_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  asset_tag TEXT NOT NULL UNIQUE,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Maintenance', 'Retired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_assets_asset_tag ON public.maintenance_assets(asset_tag);
CREATE INDEX idx_maintenance_assets_status ON public.maintenance_assets(status);

-- ============================================
-- 7. RESTAURANT
-- ============================================

-- Restaurant Menu
CREATE TABLE IF NOT EXISTS public.restaurant_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Special')),
  price NUMERIC(10,2) NOT NULL,
  available TEXT NOT NULL CHECK (available IN ('Yes', 'No')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurant_menu_category ON public.restaurant_menu(category);
CREATE INDEX idx_restaurant_menu_available ON public.restaurant_menu(available);

-- Restaurant Orders
CREATE TABLE IF NOT EXISTS public.restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number TEXT NOT NULL,
  items TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Placed', 'Preparing', 'Ready', 'Served', 'Paid')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurant_orders_status ON public.restaurant_orders(status);

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_no TEXT NOT NULL UNIQUE,
  seats INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Vacant', 'Occupied', 'Reserved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurant_tables_status ON public.restaurant_tables(status);

-- ============================================
-- 8. SECURITY
-- ============================================

-- Security Incidents
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
  time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Investigating', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_incidents_status ON public.security_incidents(status);
CREATE INDEX idx_security_incidents_severity ON public.security_incidents(severity);

-- Security Badges
CREATE TABLE IF NOT EXISTS public.security_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name TEXT NOT NULL,
  company TEXT,
  badge_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Expired', 'Revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_badges_badge_id ON public.security_badges(badge_id);
CREATE INDEX idx_security_badges_status ON public.security_badges(status);

-- ============================================
-- 9. TRANSPORT
-- ============================================

-- Transport Vehicles
CREATE TABLE IF NOT EXISTS public.transport_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Available', 'In Use', 'Maintenance', 'Out of Service')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transport_vehicles_status ON public.transport_vehicles(status);

-- Transport Trips
CREATE TABLE IF NOT EXISTS public.transport_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_no TEXT NOT NULL UNIQUE,
  guest TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transport_trips_status ON public.transport_trips(status);

-- Transport Schedule
CREATE TABLE IF NOT EXISTS public.transport_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL,
  time TEXT NOT NULL,
  vehicle TEXT,
  driver TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all guest tables
ALTER TABLE public.guest_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_dining_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_payments ENABLE ROW LEVEL SECURITY;

-- Guest Bookings RLS
CREATE POLICY "Users can view their own bookings" ON public.guest_bookings
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert their own bookings" ON public.guest_bookings
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update their own bookings" ON public.guest_bookings
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can delete their own bookings" ON public.guest_bookings
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Guest Service Requests RLS
CREATE POLICY "Users can view their own service requests" ON public.guest_service_requests
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert their own service requests" ON public.guest_service_requests
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update their own service requests" ON public.guest_service_requests
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can delete their own service requests" ON public.guest_service_requests
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Guest Dining Orders RLS
CREATE POLICY "Users can view their own dining orders" ON public.guest_dining_orders
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert their own dining orders" ON public.guest_dining_orders
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update their own dining orders" ON public.guest_dining_orders
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can delete their own dining orders" ON public.guest_dining_orders
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Guest Charges RLS
CREATE POLICY "Users can view their own charges" ON public.guest_charges
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert their own charges" ON public.guest_charges
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update their own charges" ON public.guest_charges
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can delete their own charges" ON public.guest_charges
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Guest Payments RLS
CREATE POLICY "Users can view their own payments" ON public.guest_payments
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can insert their own payments" ON public.guest_payments
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can update their own payments" ON public.guest_payments
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);
CREATE POLICY "Users can delete their own payments" ON public.guest_payments
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_staff_updated_at BEFORE UPDATE ON public.admin_staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_tasks_updated_at BEFORE UPDATE ON public.hk_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hk_inventory_updated_at BEFORE UPDATE ON public.hk_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_orders_updated_at BEFORE UPDATE ON public.inventory_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_suppliers_updated_at BEFORE UPDATE ON public.inventory_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tickets_updated_at BEFORE UPDATE ON public.maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_assets_updated_at BEFORE UPDATE ON public.maintenance_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_menu_updated_at BEFORE UPDATE ON public.restaurant_menu
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_orders_updated_at BEFORE UPDATE ON public.restaurant_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON public.restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_incidents_updated_at BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_badges_updated_at BEFORE UPDATE ON public.security_badges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_vehicles_updated_at BEFORE UPDATE ON public.transport_vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_trips_updated_at BEFORE UPDATE ON public.transport_trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transport_schedule_updated_at BEFORE UPDATE ON public.transport_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
