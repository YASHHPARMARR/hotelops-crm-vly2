-- Guest Bookings Table
CREATE TABLE IF NOT EXISTS guest_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  room_type TEXT NOT NULL,
  guests INTEGER NOT NULL,
  nights INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_bookings_user_email ON guest_bookings(user_email);
CREATE INDEX idx_guest_bookings_status ON guest_bookings(status);

-- Guest Service Requests Table
CREATE TABLE IF NOT EXISTS guest_service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  eta TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Requested',
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_service_requests_user_email ON guest_service_requests(user_email);
CREATE INDEX idx_guest_service_requests_status ON guest_service_requests(status);

-- Guest Dining Orders Table
CREATE TABLE IF NOT EXISTS guest_dining_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  room_number TEXT NOT NULL,
  method TEXT NOT NULL,
  order_text TEXT NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Placed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_dining_orders_user_email ON guest_dining_orders(user_email);
CREATE INDEX idx_guest_dining_orders_status ON guest_dining_orders(status);

-- Guest Charges Table
CREATE TABLE IF NOT EXISTS guest_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  item TEXT NOT NULL,
  room TEXT,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_charges_user_email ON guest_charges(user_email);
CREATE INDEX idx_guest_charges_category ON guest_charges(category);

-- Guest Payments Table
CREATE TABLE IF NOT EXISTS guest_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  method TEXT NOT NULL,
  ref TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_payments_user_email ON guest_payments(user_email);
CREATE INDEX idx_guest_payments_method ON guest_payments(method);

-- Enable Row Level Security (RLS)
ALTER TABLE guest_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_dining_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data)
CREATE POLICY guest_bookings_policy ON guest_bookings
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY guest_service_requests_policy ON guest_service_requests
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY guest_dining_orders_policy ON guest_dining_orders
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY guest_charges_policy ON guest_charges
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY guest_payments_policy ON guest_payments
  FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');
