import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { applyThemeToDocument, cycleTheme, getTheme, setTheme, type AppTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSupabaseKeys, getSupabase } from "@/lib/supabaseClient";

type PalettePreview = {
  key: AppTheme;
  name: string;
  description: string;
  swatches: string[];
};

const palettes: Array<PalettePreview> = [
  {
    key: "neon",
    name: "Neon Pulse",
    description: "Bold neon greens, pink accents, high contrast",
    swatches: ["#0f0", "#ff0080", "#111", "#1a1a1a", "#6ee7b7"],
  },
  {
    key: "ocean",
    name: "Ocean Blue",
    description: "Calm blues and teals, cool and minimal",
    swatches: ["#0ea5e9", "#22d3ee", "#0b1220", "#0f172a", "#7dd3fc"],
  },
  {
    key: "sunset",
    name: "Sunset Glow",
    description: "Warm ambers and corals with soft backgrounds",
    swatches: ["#f59e0b", "#fb7185", "#1a1410", "#2b1f1a", "#fbbf24"],
  },
];

export default function AdminSettings() {
  const [theme, setLocalTheme] = useState<AppTheme>("neon");
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseAnon, setSupabaseAnon] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const t = getTheme();
    setLocalTheme(t);
    applyThemeToDocument(t);

    // Initialize form with env or saved keys
    try {
      const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      const lsUrl = localStorage.getItem("VITE_SUPABASE_URL") || "";
      const lsAnon = localStorage.getItem("VITE_SUPABASE_ANON_KEY") || "";
      setSupabaseUrl(envUrl ?? lsUrl);
      setSupabaseAnon(envAnon ?? lsAnon);
    } catch {
      // ignore
    }

    // connection check
    setConnected(!!getSupabase());
  }, []);

  const applyTheme = (t: AppTheme) => {
    setTheme(t);
    setLocalTheme(t);
    applyThemeToDocument(t);
    toast.success(`Theme applied: ${t}`);
  };

  const handleCycle = () => {
    const next = cycleTheme(theme);
    applyTheme(next);
  };

  const setupSql = `
-- Reservations
create table if not exists reservations (
  id text primary key,
  guestName text,
  confirmation text,
  roomType text,
  roomNumber text,
  arrival date,
  departure date,
  status text,
  balance numeric,
  source text,
  notes text,
  owner text, -- Added: per-user ownership via email
  created_at timestamptz default now()
);

-- Guests
create table if not exists guests (
  id text primary key,
  name text,
  email text,
  phone text,
  address text,
  loyalty text,
  vip text,
  notes text,
  created_at timestamptz default now()
);

-- Rooms
create table if not exists rooms (
  id text primary key,
  number text,
  type text,
  status text,
  guest text,
  rate numeric,
  lastCleaned date,
  created_at timestamptz default now()
);

-- Housekeeping tasks
create table if not exists hk_tasks (
  id text primary key,
  task text,
  room text,
  priority text,
  status text,
  assignedTo text,
  created_at timestamptz default now()
);

-- Housekeeping inventory
create table if not exists hk_inventory (
  id text primary key,
  item text,
  stock numeric,
  min numeric,
  created_at timestamptz default now()
);

-- Restaurant menu
create table if not exists restaurant_menu (
  id text primary key,
  name text,
  category text,
  price numeric,
  available text,
  created_at timestamptz default now()
);

-- Restaurant orders
create table if not exists restaurant_orders (
  id text primary key,
  table text,
  items text,
  total numeric,
  status text,
  created_at timestamptz default now()
);

-- Guest dining orders
create table if not exists dining_orders (
  id text primary key,
  "order" text,
  total numeric,
  status text,
  created_at timestamptz default now()
);

-- Guest charges
create table if not exists charges (
  id text primary key,
  date date,
  item text,
  room text,
  category text,
  amount numeric,
  created_at timestamptz default now()
);

-- Guest payments
create table if not exists payments (
  id text primary key,
  date date,
  method text,
  ref text,
  amount numeric,
  created_at timestamptz default now()
);

-- Transport trips
create table if not exists transport_trips (
  id text primary key,
  tripNo text,
  guest text,
  pickupTime text,
  status text,
  created_at timestamptz default now()
);

-- Transport vehicles
create table if not exists transport_vehicles (
  id text primary key,
  plate text,
  model text,
  capacity numeric,
  status text,
  created_at timestamptz default now()
);

-- Staff directory (drive roles by email)
create table if not exists staff (
  id text primary key,
  email text unique,
  role text, -- matches app roles, e.g. 'admin', 'front_desk', 'guest', etc.
  created_at timestamptz default now()
);
`.trim();

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(setupSql);
      toast.success("SQL copied to clipboard");
    } catch {
      toast.error("Failed to copy SQL");
    }
  };

  const seedAll = async () => {
    const s = getSupabase();
    if (!s) {
      toast.error("Supabase not initialized. Ensure env vars are set and page reloaded.");
      return;
    }
    toast("Seeding started…");

    try {
      const seeds: Record<string, Array<Record<string, any>>> = {
        reservations: [
          { id: crypto.randomUUID(), guestName: "Ana Garcia", confirmation: "CNF-1001", roomType: "Deluxe King", roomNumber: "205", arrival: "2025-09-09", departure: "2025-09-11", status: "Booked", balance: 220, source: "Direct", notes: "High floor", owner: "demo@example.com" },
          { id: crypto.randomUUID(), guestName: "Luis Fernandez", confirmation: "CNF-1002", roomType: "Standard Queen", roomNumber: "214", arrival: "2025-09-08", departure: "2025-09-10", status: "CheckedIn", balance: 0, source: "OTA", notes: "", owner: "demo@example.com" },
        ],
        guests: [
          { id: crypto.randomUUID(), name: "Ana Garcia", email: "ana@example.com", phone: "+1 555-0100", address: "100 Ocean Ave, Miami, FL", loyalty: "Gold", vip: "Yes", notes: "High floor" },
          { id: crypto.randomUUID(), name: "Luis Fernandez", email: "luis@example.com", phone: "+1 555-0101", address: "55 Palm St, Miami, FL", loyalty: "Silver", vip: "No", notes: "" },
        ],
        rooms: [
          { id: crypto.randomUUID(), number: "205", type: "Deluxe King", status: "Occupied", guest: "Ana Garcia", rate: 220, lastCleaned: "2025-09-09" },
          { id: crypto.randomUUID(), number: "214", type: "Standard Queen", status: "Vacant Clean", guest: "", rate: 150, lastCleaned: "2025-09-09" },
        ],
        hk_tasks: [
          { id: crypto.randomUUID(), task: "Make bed", room: "205", priority: "Low", status: "Open", assignedTo: "Ana" },
          { id: crypto.randomUUID(), task: "Deep clean bath", room: "118", priority: "High", status: "In Progress", assignedTo: "Maya" },
        ],
        hk_inventory: [
          { id: crypto.randomUUID(), item: "Towels", stock: 120, min: 150 },
          { id: crypto.randomUUID(), item: "Soap", stock: 240, min: 300 },
        ],
        restaurant_menu: [
          { id: crypto.randomUUID(), name: "Cheeseburger", category: "Mains", price: 12.5, available: "Yes" },
          { id: crypto.randomUUID(), name: "Caesar Salad", category: "Starters", price: 9.0, available: "Yes" },
        ],
        restaurant_orders: [
          { id: crypto.randomUUID(), table: "T-5", items: "Burger x2, Fries", total: 28.5, status: "Preparing" },
        ],
        dining_orders: [
          { id: crypto.randomUUID(), order: "Club Sandwich, Juice", total: 18.5, status: "Preparing" },
        ],
        charges: [
          { id: crypto.randomUUID(), date: "2025-08-28", item: "Room Night 1", room: "1208", category: "Room Night", amount: 245.0 },
          { id: crypto.randomUUID(), date: "2025-08-28", item: "Room Service - Club Sandwich", room: "1208", category: "Dining", amount: 16.0 },
        ],
        payments: [
          { id: crypto.randomUUID(), date: "2025-08-28", method: "Visa", ref: "•••• 4242", amount: 100.0 },
        ],
        transport_trips: [
          { id: crypto.randomUUID(), tripNo: "TR-001", guest: "Ana Garcia", pickupTime: "09:00", status: "Scheduled" },
        ],
        transport_vehicles: [
          { id: crypto.randomUUID(), plate: "XYZ-101", model: "Sprinter", capacity: 10, status: "Available" },
        ],
        staff: [
          { id: crypto.randomUUID(), email: "demo@example.com", role: "admin" },
        ],
      };

      // For each table: if empty, insert seed
      for (const [table, data] of Object.entries(seeds)) {
        const { data: existing, error: qErr } = await s.from(table).select("id").limit(1);
        if (qErr) {
          console.error(`Query failed for ${table}:`, qErr);
          toast.error(`Failed checking ${table}`);
          continue;
        }
        if (Array.isArray(existing) && existing.length > 0) {
          // already has data
          continue;
        }
        const { error: insErr } = await s.from(table).insert(data);
        if (insErr) {
          console.error(`Insert failed for ${table}:`, insErr);
          toast.error(`Seeding failed: ${table}`);
        } else {
          toast.success(`Seeded: ${table}`);
        }
      }

      toast.success("Seeding completed");
    } catch (e) {
      console.error(e);
      toast.error("Seeding encountered an error");
    }
  };

  const rlsSql = `
-- Enable RLS for all tables
alter table if exists reservations enable row level security;
alter table if exists guests enable row level security;
alter table if exists rooms enable row level security;
alter table if exists hk_tasks enable row level security;
alter table if exists hk_inventory enable row level security;
alter table if exists restaurant_menu enable row level security;
alter table if exists restaurant_orders enable row level security;
alter table if exists dining_orders enable row level security;
alter table if exists charges enable row level security;
alter table if exists payments enable row level security;
alter table if exists transport_trips enable row level security;
alter table if exists transport_vehicles enable row level security;
alter table if exists staff enable row level security;

-- Reservations: Only owner (by email) can CRUD
drop policy if exists "Reservations owner can access" on reservations;
create policy "Reservations owner can access" on reservations
for all
using ( owner = (current_setting('request.jwt.claims', true)::jsonb ->> 'email') )
with check ( owner = (current_setting('request.jwt.claims', true)::jsonb ->> 'email') );

-- Rooms: Allow read to all authenticated; writes restricted to authenticated for demo
drop policy if exists "Rooms read for auth" on rooms;
create policy "Rooms read for auth" on rooms
for select
to authenticated
using (true);

drop policy if exists "Rooms write for auth" on rooms;
create policy "Rooms write for auth" on rooms
for insert with check (true)
to authenticated;

create policy "Rooms update for auth" on rooms
for update using (true)
to authenticated;

-- Staff: only authenticated can read; allow upserts by authenticated for demo (lock down later)
drop policy if exists "Staff select for auth" on staff;
create policy "Staff select for auth" on staff
for select
to authenticated
using (true);

drop policy if exists "Staff write for auth" on staff;
create policy "Staff write for auth" on staff
for all
to authenticated
using (true)
with check (true);

-- Repeat similar policies per your needs for other tables (owner-col or auth-only)
`.trim();

  const copyRlsSql = async () => {
    try {
      await navigator.clipboard.writeText(rlsSql);
      toast.success("RLS SQL copied");
    } catch {
      toast.error("Failed to copy RLS SQL");
    }
  };

  const saveSupabase = () => {
    if (!supabaseUrl || !supabaseAnon) {
      toast.error("Provide both Supabase URL and Anon Key");
      return;
    }
    setSupabaseKeys(supabaseUrl.trim(), supabaseAnon.trim());
    // Recheck connection
    const s = getSupabase();
    if (s) {
      setConnected(true);
      toast.success("Supabase connected");
    } else {
      setConnected(false);
      toast.error("Failed to initialize Supabase client");
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">System preferences and appearance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Current theme: {theme}
            </Badge>
            <Button size="sm" className="neon-glow" onClick={handleCycle}>
              One-click Theme Toggle
            </Button>
          </div>
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label>Supabase URL</Label>
                <Input
                  placeholder="https://xxxxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label>Supabase Anon Key</Label>
                <Input
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnon}
                  onChange={(e) => setSupabaseAnon(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveSupabase} className="neon-glow" size="sm">
                Save & Connect
              </Button>
              <Badge variant={connected ? "default" : "outline"}>
                {connected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: These settings are stored locally and used if .env is unavailable.
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {palettes.map((p) => (
                <div
                  key={p.key}
                  className={`rounded-lg border border-border p-4 bg-card/50 ${theme === p.key ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    </div>
                    {theme === p.key ? (
                      <Badge className="bg-primary text-primary-foreground">Active</Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 mb-4">
                    {p.swatches.map((c, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-md border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === p.key ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => applyTheme(p.key)}
                      className={theme === p.key ? "neon-glow" : ""}
                    >
                      {theme === p.key ? "Using" : "Apply"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Live preview without saving
                        applyThemeToDocument(p.key);
                        toast("Previewing theme", { description: p.name });
                      }}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: Use the One-click Theme Toggle to quickly switch between palettes anywhere.
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Supabase Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Use these tools to initialize your database and sample data for all dashboards.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copySql} className="neon-glow" size="sm">
                Copy SQL (create tables)
              </Button>
              <Button onClick={copyRlsSql} variant="outline" size="sm">
                Copy RLS Policies SQL
              </Button>
              <Button onClick={seedAll} variant="outline" size="sm">
                Seed Sample Data (if empty)
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              1) In Supabase → SQL editor, paste and run the copied SQL. 2) Turn on Realtime for all tables. 3) Click Seed Sample Data.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}