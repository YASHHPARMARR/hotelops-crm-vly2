import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { applyThemeToDocument, cycleTheme, getTheme, setTheme, type AppTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSupabaseKeys, getSupabase, clearSupabaseKeys, normalizeSupabaseError } from "@/lib/supabaseClient";
import { Textarea } from "@/components/ui/textarea";

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
  {
    key: "forest",
    name: "Forest Grove",
    description: "Deep greens with earthy contrast",
    swatches: ["#14532d", "#22c55e", "#0b0f0c", "#122015", "#86efac"],
  },
  {
    key: "pastel",
    name: "Pastel Breeze",
    description: "Soft, light, playful pastels",
    swatches: ["#fde68a", "#fbcfe8", "#dbeafe", "#dcfce7", "#fef9c3"],
  },
  {
    key: "midnight",
    name: "Midnight Noir",
    description: "Dark, high-contrast with electric accents",
    swatches: ["#0a0a0a", "#111827", "#22d3ee", "#a78bfa", "#e11d48"],
  },
  {
    key: "sand",
    name: "Desert Sand",
    description: "Warm sands and muted browns",
    swatches: ["#fef3c7", "#f59e0b", "#78350f", "#fde68a", "#d97706"],
  },
  {
    key: "rose",
    name: "Rose Blush",
    description: "Rosy accents over subtle backgrounds",
    swatches: ["#0f0f12", "#fb7185", "#fda4af", "#0b0b0e", "#fecdd3"],
  },
];

export default function AdminSettings() {
  const [theme, setLocalTheme] = useState<AppTheme>("neon");
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseAnon, setSupabaseAnon] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [staff, setStaff] = useState<Array<{ id: string; email: string; role: string }>>([]);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("front_desk");
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  // Add: track supabase auth session status
  const [sbAuth, setSbAuth] = useState<boolean>(false);
  const [orgName, setOrgName] = useState<string>("");
  const [orgLogo, setOrgLogo] = useState<string>("");
  const [orgAddress, setOrgAddress] = useState<string>("");
  const [orgGstin, setOrgGstin] = useState<string>("");
  const [orgCurrency, setOrgCurrency] = useState<string>("INR");
  const [orgTimezone, setOrgTimezone] = useState<string>("Asia/Kolkata");

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

    // Load org settings
    setOrgName(localStorage.getItem("org:name") || "");
    setOrgLogo(localStorage.getItem("org:logo") || "");
    setOrgAddress(localStorage.getItem("org:address") || "");
    setOrgGstin(localStorage.getItem("org:gstin") || "");
    setOrgCurrency(localStorage.getItem("org:currency") || "INR");
    setOrgTimezone(localStorage.getItem("org:timezone") || "Asia/Kolkata");

    // connection check
    setConnected(!!getSupabase());

    // Add: check and subscribe to Supabase auth session
    const s = getSupabase();
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const res = await s?.auth.getSession();
        setSbAuth(!!res?.data?.session);
      } catch {
        setSbAuth(false);
      }
      try {
        const { data: sub } = s?.auth.onAuthStateChange((_: any, session: any) => {
          setSbAuth(!!session);
        }) || { data: { subscription: { unsubscribe() {} } } };
        unsub = () => sub.subscription.unsubscribe();
      } catch {
        // ignore
      }
    })();

    return () => {
      try {
        unsub?.();
      } catch {
        // ignore
      }
    };
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
        staff: [
          { id: crypto.randomUUID(), email: "demo@example.com", role: "admin" },
        ],
      };

      for (const [table, data] of Object.entries(seeds)) {
        const { data: existing, error: qErr } = await s.from(table).select("id").limit(1);
        if (qErr) {
          const msg = normalizeSupabaseError(qErr);
          console.error(`Query failed for ${table}:`, qErr);
          toast.error(`Failed checking ${table}: ${msg}`);
          continue;
        }
        if (Array.isArray(existing) && existing.length > 0) continue;

        const { error: insErr } = await s.from(table).insert(data);
        if (insErr) {
          const msg = normalizeSupabaseError(insErr);
          console.error(`Insert failed for ${table}:`, insErr);
          toast.error(`Seeding failed for ${table}: ${msg}`);
        } else {
          toast.success(`Seeded: ${table}`);
        }
      }

      toast.success("Seeding completed");
    } catch (e: any) {
      console.error(e);
      toast.error(`Seeding encountered an error: ${normalizeSupabaseError(e)}`);
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

-- Ensure required columns exist before policies
alter table if exists reservations add column if not exists owner text;

-- Reservations: Owner-scoped for authenticated
drop policy if exists "Reservations owner can access" on reservations;
create policy "Reservations owner can access" on reservations
for all
to authenticated
using ( owner = auth.email() )
with check ( owner = auth.email() );

-- Reservations: Demo access without Supabase login (anon) for demo@example.com owner
drop policy if exists "Reservations demo access" on reservations;
create policy "Reservations demo access" on reservations
for all
to anon
using ( owner = 'demo@example.com' )
with check ( owner = 'demo@example.com' );

-- OPTION B: Full demo mode — allow anon full CRUD on app tables (except staff)
-- Rooms
drop policy if exists "Rooms anon full" on rooms;
create policy "Rooms anon full" on rooms
for all
to anon
using (true)
with check (true);

-- Housekeeping tasks
drop policy if exists "HK tasks anon full" on hk_tasks;
create policy "HK tasks anon full" on hk_tasks
for all
to anon
using (true)
with check (true);

-- Housekeeping inventory
drop policy if exists "HK inventory anon full" on hk_inventory;
create policy "HK inventory anon full" on hk_inventory
for all
to anon
using (true)
with check (true);

-- Restaurant menu
drop policy if exists "Restaurant menu anon full" on restaurant_menu;
create policy "Restaurant menu anon full" on restaurant_menu
for all
to anon
using (true)
with check (true);

-- Restaurant orders
drop policy if exists "Restaurant orders anon full" on restaurant_orders;
create policy "Restaurant orders anon full" on restaurant_orders
for all
to anon
using (true)
with check (true);

-- Guest dining orders
drop policy if exists "Dining orders anon full" on dining_orders;
create policy "Dining orders anon full" on dining_orders
for all
to anon
using (true)
with check (true);

-- Guest charges
drop policy if exists "Charges anon full" on charges;
create policy "Charges anon full" on charges
for all
to anon
using (true)
with check (true);

-- Guest payments
drop policy if exists "Payments anon full" on payments;
create policy "Payments anon full" on payments
for all
to anon
using (true)
with check (true);

-- Transport trips
drop policy if exists "Transport trips anon full" on transport_trips;
create policy "Transport trips anon full" on transport_trips
for all
to anon
using (true)
with check (true);

-- Transport vehicles
drop policy if exists "Transport vehicles anon full" on transport_vehicles;
create policy "Transport vehicles anon full" on transport_vehicles
for all
to anon
using (true)
with check (true);

-- Staff: keep auth-only (safer)
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
    try {
      setSupabaseKeys(supabaseUrl.trim(), supabaseAnon.trim());
      const s = getSupabase();
      if (s) {
        setConnected(true);
        toast.success("Supabase connected");
      } else {
        setConnected(false);
        toast.error("Failed to initialize Supabase client. Verify URL and Anon Key.");
      }
    } catch (e: any) {
      console.error("Supabase init error:", e);
      setConnected(false);
      toast.error(`Failed to initialize Supabase client: ${normalizeSupabaseError(e)}`);
    }
  };

  const saveOrgSettings = () => {
    try {
      localStorage.setItem("org:name", orgName.trim());
      localStorage.setItem("org:logo", orgLogo.trim());
      localStorage.setItem("org:address", orgAddress.trim());
      localStorage.setItem("org:gstin", orgGstin.trim());
      localStorage.setItem("org:currency", orgCurrency.trim());
      localStorage.setItem("org:timezone", orgTimezone.trim());
      toast.success("Organization settings saved");
    } catch (e: any) {
      toast.error(`Failed to save: ${normalizeSupabaseError(e)}`);
    }
  };

  const loadStaff = async () => {
    const s = getSupabase();
    if (!s) return;
    // Add: require auth for staff operations
    if (!sbAuth) {
      return;
    }
    setLoadingStaff(true);
    try {
      const { data, error } = await s.from("staff").select("*").order("email");
      if (error) {
        const msg = normalizeSupabaseError(error);
        toast.error(`Failed loading staff: ${msg}`);
        return;
      }
      if (Array.isArray(data)) {
        setStaff(data as any);
      }
    } catch (e: any) {
      toast.error(`Failed loading staff: ${normalizeSupabaseError(e)}`);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (connected) {
      loadStaff();
    }
  }, [connected]);

  const clearKeys = () => {
    clearSupabaseKeys();
    setSupabaseUrl("");
    setSupabaseAnon("");
    setConnected(false);
    toast.success("Cleared local Supabase keys. Enter new keys and Save & Connect.");
  };

  const wipeAndReseed = async () => {
    const s = getSupabase();
    if (!s) {
      toast.error("Supabase not initialized.");
      return;
    }
    setLoadingReset(true);
    toast("Starting wipe & reseed…");
    try {
      // Determine current email for owner-scoped deletes
      let currentEmail: string | undefined;
      try {
        const u = await s.auth.getUser();
        currentEmail = u?.data?.user?.email ?? undefined;
      } catch {
        currentEmail = undefined;
      }

      // Known tables
      const tables: Array<{ name: string; deleteWhere?: { column: string; value?: string } }> = [
        // reservations is owner-scoped: delete only current owner's
        { name: "reservations", deleteWhere: currentEmail ? { column: "owner", value: currentEmail } : undefined },
        { name: "guests" },
        { name: "rooms" },
        { name: "hk_tasks" },
        { name: "hk_inventory" },
        { name: "restaurant_menu" },
        { name: "restaurant_orders" },
        { name: "dining_orders" },
        { name: "charges" },
        { name: "payments" },
        { name: "transport_trips" },
        { name: "transport_vehicles" },
        // staff: keep, we'll upsert demo admin below
      ];

      // Delete data
      for (const t of tables) {
        try {
          let q = s.from(t.name).delete();
          if (t.deleteWhere) {
            q = q.eq(t.deleteWhere.column, t.deleteWhere.value ?? null);
          }
          const { error } = await q;
          if (error) {
            console.warn(`Delete failed for ${t.name}:`, error);
            toast.error(`Delete failed for ${t.name}: ${normalizeSupabaseError(error)}`);
          } else {
            toast.success(`Cleared ${t.name}`);
          }
        } catch (e: any) {
          console.warn(`Delete exception for ${t.name}:`, e);
          toast.error(`Delete exception for ${t.name}: ${normalizeSupabaseError(e)}`);
        }
      }

      await seedAll();

      // Add: only upsert staff if authenticated
      if (!sbAuth) {
        toast.info("Skipped staff reseed (login required to write to staff table).");
      } else {
        try {
          const { error } = await s.from("staff").upsert(
            [{ id: crypto.randomUUID(), email: "demo@example.com", role: "admin" }],
            { onConflict: "email", ignoreDuplicates: false }
          );
          if (error) {
            console.warn("Upsert staff failed:", error);
            toast.error(`Staff upsert failed: ${normalizeSupabaseError(error)}`);
          }
        } catch (e: any) {
          console.warn("Upsert staff exception:", e);
          toast.error(`Staff upsert exception: ${normalizeSupabaseError(e)}`);
        }
      }

      await loadStaff();
      toast.success("Wipe & reseed completed");
    } catch (e) {
      console.error(e);
      toast.error(`Wipe & reseed encountered an error: ${normalizeSupabaseError(e)}`);
    } finally {
      setLoadingReset(false);
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
              {/* Add: auth status badge */}
              <Badge variant={sbAuth ? "default" : "outline"}>
                {sbAuth ? "Authed" : "Anon"}
              </Badge>
              <Button onClick={clearKeys} variant="destructive" size="sm">
                Clear Supabase Keys
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: These settings are stored locally and used if .env is unavailable.
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Company Name</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Your Hotel Pvt Ltd" />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={orgLogo} onChange={(e) => setOrgLogo(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>GSTIN / Tax ID</Label>
                <Input value={orgGstin} onChange={(e) => setOrgGstin(e.target.value)} placeholder="27ABCDE1234F1Z5" />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Textarea value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} placeholder="Street, City, Country" />
              </div>
              <div>
                <Label>Currency</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={orgCurrency}
                  onChange={(e) => setOrgCurrency(e.target.value)}
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
              <div>
                <Label>Timezone</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={orgTimezone}
                  onChange={(e) => setOrgTimezone(e.target.value)}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="neon-glow" onClick={saveOrgSettings}>Save</Button>
              <div className="text-xs text-muted-foreground">Stored locally for demo mode.</div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {orgLogo ? <img src={orgLogo} alt="logo" className="h-10 w-10 rounded-md border" /> : null}
              <div className="text-sm">
                <div className="font-medium">{orgName || "Unnamed Organization"}</div>
                <div className="text-xs text-muted-foreground">{orgCurrency} • {orgTimezone}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Database Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Use these tools to reset demo data safely (within RLS) and reseed all tables.
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={wipeAndReseed} variant="destructive" size="sm" disabled={loadingReset || !connected}>
                {loadingReset ? "Resetting..." : "Wipe & Reseed (Demo)"}
              </Button>
              <Button onClick={seedAll} variant="outline" size="sm" disabled={!connected}>
                Seed Sample Data (if empty)
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Note: Creating/dropping tables requires running the SQL in Supabase SQL editor (use the Copy SQL buttons below).
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
            <CardTitle>Staff Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <Label>Email</Label>
                <Input
                  placeholder="user@company.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                >
                  <option value="admin">admin</option>
                  <option value="front_desk">front_desk</option>
                  <option value="housekeeping">housekeeping</option>
                  <option value="restaurant">restaurant</option>
                  <option value="security">security</option>
                  <option value="maintenance">maintenance</option>
                  <option value="transport">transport</option>
                  <option value="inventory">inventory</option>
                  <option value="guest">guest</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="neon-glow"
                onClick={async () => {
                  const s = getSupabase();
                  if (!s) return toast.error("Supabase not initialized");
                  if (!newStaffEmail) return toast.error("Email is required");
                  // Add: require auth for staff writes
                  if (!sbAuth) {
                    toast.error("Please sign in (Auth page) to manage staff.");
                    return;
                  }
                  try {
                    const { error } = await s
                      .from("staff")
                      .upsert([{ id: crypto.randomUUID(), email: newStaffEmail.trim(), role: newStaffRole }], {
                        onConflict: "email",
                        ignoreDuplicates: false,
                      });
                    if (error) throw error;
                    toast.success("Staff saved");
                    setNewStaffEmail("");
                    await loadStaff();
                  } catch (e: any) {
                    toast.error(e?.message || "Failed to save staff");
                  }
                }}
                disabled={loadingStaff || !connected || !sbAuth}
              >
                Save Staff
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={loadStaff}
                disabled={loadingStaff || !connected || !sbAuth}
              >
                Refresh
              </Button>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-3 text-sm font-medium bg-muted/50 px-3 py-2">
                <div>Email</div>
                <div>Role</div>
                <div className="text-right">Actions</div>
              </div>
              {staff.length === 0 ? (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">No staff yet.</div>
              ) : (
                staff.map((u) => (
                  <div key={u.id} className="grid grid-cols-3 items-center px-3 py-2 border-t border-border">
                    <div className="truncate">{u.email}</div>
                    <div className="capitalize">{u.role?.replace("_", " ") || "-"}</div>
                    <div className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          const s = getSupabase();
                          if (!s) return;
                          // Add: require auth for staff edits
                          if (!sbAuth) {
                            toast.error("Please sign in (Auth page) to edit staff.");
                            return;
                          }
                          const role = prompt("New role:", u.role);
                          if (!role) return;
                          try {
                            const { error } = await s.from("staff").update({ role }).eq("email", u.email);
                            if (error) throw error;
                            toast.success("Role updated");
                            await loadStaff();
                          } catch (e: any) {
                            toast.error(e?.message || "Failed to update role");
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          const s = getSupabase();
                          if (!s) return;
                          // Add: require auth for staff deletes
                          if (!sbAuth) {
                            toast.error("Please sign in (Auth page) to remove staff.");
                            return;
                          }
                          try {
                            const { error } = await s.from("staff").delete().eq("email", u.email);
                            if (error) throw error;
                            toast.success("Removed");
                            await loadStaff();
                          } catch (e: any) {
                            toast.error(e?.message || "Failed to remove");
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Admin can assign roles by email. Navigation and access respect these roles immediately.
              <br />
              Note: Staff table is auth-only by RLS. Please sign in on the Auth page to view or edit staff.
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