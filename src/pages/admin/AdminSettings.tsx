import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { applyThemeToDocument, cycleTheme, getTheme, setTheme, type AppTheme } from "@/lib/theme";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSupabaseKeys, getSupabase, clearSupabaseKeys } from "@/lib/supabaseClient";

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
  const [staff, setStaff] = useState<Array<{ id: string; email: string; role: string }>>([]);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("front_desk");
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

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
      // Check auth session to decide whether staff seeding is allowed under RLS
      let isAuthed = false;
      try {
        const { data } = await s.auth.getSession();
        isAuthed = !!data?.session;
      } catch {
        isAuthed = false;
      }

      // Build seeds dynamically; only include staff when authenticated to satisfy RLS
      const seeds: Record<string, Array<Record<string, any>>> = {
        reservations: [
          { id: crypto.randomUUID(), guestName: "Ana Garcia", confirmation: "CNF-1001", roomType: "Deluxe King", roomNumber: "205", arrival: "2025-09-09", departure: "2025-09-11", status: "Booked", balance: 220, source: "Direct", notes: "High floor", owner: "demo@example.com" },
          { id: crypto.randomUUID(), guestName: "Luis Fernandez", confirmation: "CNF-1002", roomType: "Standard Queen", roomNumber: "214", arrival: "2025-09-08", departure: "2025-09-10", status: "CheckedIn", balance: 0, source: "OTA", notes: "", owner: "demo@example.com" },
        ],
      };
      if (isAuthed) {
        seeds.staff = [{ id: crypto.randomUUID(), email: "demo@example.com", role: "admin" }];
      } else {
        toast.info("Skipping staff seeding because you are not logged in (RLS). Use the Auth page to sign in and try again.");
      }

      // For each table: if empty, insert seed
      for (const [table, data] of Object.entries(seeds)) {
        const { data: existing, error: qErr } = await s.from(table).select("id").limit(1);
        if (qErr) {
          console.error(`Query failed for ${table}:`, qErr);
          const msg = qErr?.message || qErr?.code || "error";
          toast.error(`Failed checking ${table}: ${msg}`);
          continue;
        }
        if (Array.isArray(existing) && existing.length > 0) {
          // already has data
          continue;
        }
        const { error: insErr } = await s.from(table).insert(data);
        if (insErr) {
          console.error(`Insert failed for ${table}:`, insErr);
          const code = insErr?.code || insErr?.status;
          const message = insErr?.message || insErr?.hint || insErr?.details || "Unknown error";
          if (String(message).toLowerCase().includes("row level security") || /rls|permission/i.test(String(message))) {
            toast.error(`Seeding failed for ${table}: Permission denied by RLS. Ensure you are logged in and RLS policies are applied.`);
          } else {
            toast.error(`Seeding failed for ${table}: ${message} (${code ?? "no-code"})`);
          }
        } else {
          toast.success(`Seeded: ${table}`);
        }
      }

      toast.success("Seeding completed");
    } catch (e: any) {
      console.error(e);
      toast.error(`Seeding encountered an error: ${e?.message || "unknown"}`);
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

-- Reservations: Only owner (by email) can CRUD when authenticated
drop policy if exists "Reservations owner can access" on reservations;
create policy "Reservations owner can access" on reservations
for all
to authenticated
using ( owner = auth.email() )
with check ( owner = auth.email() );

-- Reservations: Demo access without Supabase login
-- Allows anon role to read/write rows owned by demo@example.com
drop policy if exists "Reservations demo access" on reservations;
create policy "Reservations demo access" on reservations
for all
to anon
using ( owner = 'demo@example.com' )
with check ( owner = 'demo@example.com' );

-- Rooms: Allow read to authenticated; writes restricted to authenticated for demo
drop policy if exists "Rooms read for auth" on rooms;
create policy "Rooms read for auth" on rooms
for select
to authenticated
using (true);

drop policy if exists "Rooms write for auth" on rooms;
create policy "Rooms write for auth" on rooms
for insert
to authenticated
with check (true);

drop policy if exists "Rooms update for auth" on rooms;
create policy "Rooms update for auth" on rooms
for update
to authenticated
using (true);

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

  const loadStaff = async () => {
    const s = getSupabase();
    if (!s) return;
    setLoadingStaff(true);
    try {
      const { data, error } = await s.from("staff").select("*").order("email");
      if (!error && Array.isArray(data)) {
        setStaff(data as any);
      }
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
          } else {
            // NOTE: Without service role, unrestricted deletes rely on permissive RLS.
            // If RLS blocks, this will fail and be skipped.
          }
          const { error } = await q;
          if (error) {
            console.warn(`Delete failed for ${t.name}:`, error);
          } else {
            toast.success(`Cleared ${t.name}`);
          }
        } catch (e) {
          console.warn(`Delete exception for ${t.name}:`, e);
        }
      }

      // Reseed demo data (reuse existing seedAll logic directly here)
      await seedAll();
      // Ensure demo admin exists in staff
      try {
        let isAuthed = false;
        try {
          const { data } = await s.auth.getSession();
          isAuthed = !!data?.session;
        } catch {
          isAuthed = false;
        }
        if (!isAuthed) {
          toast.info("Skipped staff upsert (RLS). Sign in on the Auth page to manage staff.");
        } else {
          const { error } = await s.from("staff").upsert(
            [{ id: crypto.randomUUID(), email: "demo@example.com", role: "admin" }],
            { onConflict: "email", ignoreDuplicates: false }
          );
          if (error) {
            const message = error?.message || error?.hint || error?.details || "Unknown error";
            if (String(message).toLowerCase().includes("row level security") || /rls|permission/i.test(String(message))) {
              toast.error("Staff upsert blocked by RLS. Verify policies in Admin → Settings → Copy RLS Policies SQL.");
            } else {
              toast.error(`Upsert staff failed: ${message}`);
            }
            console.warn("Upsert staff failed:", error);
          }
        }
      } catch (e) {
        console.warn("Upsert staff exception:", e);
      }

      await loadStaff();
      toast.success("Wipe & reseed completed");
    } catch (e) {
      console.error(e);
      toast.error("Wipe & reseed encountered an error");
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
                disabled={loadingStaff || !connected}
              >
                Save Staff
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={loadStaff}
                disabled={loadingStaff || !connected}
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