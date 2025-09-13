import { AdminShell } from "@/components/layouts/AdminShell";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Star, Flag, Gift, Mail, Phone, Calendar, MapPin, Crown, Users, Sparkles, Filter, Plus, Pencil, Trash2 } from "lucide-react";

type Guest = Record<string, any>;

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const STORAGE_KEY = "guests";

// Seed demo data if none exists
const defaultSeed: Guest[] = [
  {
    id: "gst1",
    guest_id: "GST20250913001",
    full_name: "Alice Johnson",
    gender: "Female",
    dob: "1990-05-15",
    email: "alice@mail.com",
    phone: "+919876543210",
    address: "123 Street, City",
    country: "India",
    nationality: "Indian",
    id_number: "A1234567",
    preferred_room_type: "Deluxe",
    special_requests: "Allergic to peanuts",
    membership: "Gold",
    loyalty_points: 2500,
    notes: "Prefers sea view",
    created_at: "2025-09-13",
  },
  {
    id: "gst2",
    guest_id: "GST20250913002",
    full_name: "Luis Fernandez",
    gender: "Male",
    dob: "1987-11-02",
    email: "luis@example.com",
    phone: "+1 555-0101",
    address: "55 Palm St, Miami, FL",
    country: "USA",
    nationality: "American",
    id_number: "P987654",
    preferred_room_type: "Suite",
    special_requests: "",
    membership: "Silver",
    loyalty_points: 1200,
    notes: "",
    created_at: "2025-09-12",
  },
];

function initials(name: string | undefined) {
  if (!name) return "G";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function membershipColor(m: string | undefined) {
  switch (m) {
    case "VIP":
      return "bg-gradient-to-r from-yellow-400 to-amber-500 text-black";
    case "Gold":
      return "bg-gradient-to-r from-yellow-300 to-yellow-500 text-black";
    case "Silver":
      return "bg-gradient-to-r from-slate-200 to-slate-400 text-black";
    case "None":
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export default function AdminGuests() {
  // Data
  const [guests, setGuests] = useState<Guest[]>(() => {
    const existing = loadLocal<Guest[]>(STORAGE_KEY, []);
    if (existing.length > 0) return existing;
    saveLocal(STORAGE_KEY, defaultSeed);
    return defaultSeed;
  });

  useEffect(() => {
    saveLocal(STORAGE_KEY, guests);
  }, [guests]);

  // UI state
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("__ALL__");
  const [membershipFilter, setMembershipFilter] = useState<string>("__ALL__");

  const [openView, setOpenView] = useState(false);
  const [viewGuest, setViewGuest] = useState<Guest | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState<Guest>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      const matchesSearch =
        !q ||
        [
          g.full_name,
          g.email,
          g.phone,
          g.guest_id,
          g.country,
          g.nationality,
          g.membership,
          g.preferred_room_type,
        ]
          .filter(Boolean)
          .some((v: string) => String(v).toLowerCase().includes(q));
      if (!matchesSearch) return false;
      if (genderFilter !== "__ALL__" && String(g.gender ?? "") !== genderFilter) return false;
      if (membershipFilter !== "__ALL__" && String(g.membership ?? "") !== membershipFilter) return false;
      return true;
    });
  }, [guests, query, genderFilter, membershipFilter]);

  const stats = useMemo(() => {
    const total = guests.length;
    const vips = guests.filter((g) => g.membership === "VIP").length;
    const avgLoyalty =
      total > 0
        ? Math.round(
            guests.reduce((sum, g) => sum + (Number(g.loyalty_points) || 0), 0) / total,
          )
        : 0;
    return { total, vips, avgLoyalty };
  }, [guests]);

  function startAdd() {
    setEditing(null);
    setForm({});
    setOpenEdit(true);
  }

  function startEdit(guest: Guest) {
    setEditing(guest);
    setForm(guest);
    setOpenEdit(true);
  }

  function openDetails(guest: Guest) {
    setViewGuest(guest);
    setOpenView(true);
  }

  function remove(guest: Guest) {
    setGuests((prev) => prev.filter((g) => g.id !== guest.id));
    toast.success("Guest removed");
  }

  function validate(): string | null {
    if (!form.full_name) return "Full Name is required";
    if (!form.email) return "Email is required";
    if (!form.phone) return "Phone is required";
    if (!form.country) return "Country is required";
    return null;
  }

  function save() {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    const payload = { ...form };
    if (!payload.id) payload.id = crypto.randomUUID();
    if (!payload.guest_id) payload.guest_id = `GST${Date.now()}`;

    if (editing) {
      setGuests((prev) => prev.map((g) => (g.id === editing.id ? { ...g, ...payload } : g)));
      toast.success("Guest updated");
    } else {
      setGuests((prev) => [{ ...payload }, ...prev]);
      toast.success("Guest added");
    }
    setOpenEdit(false);
    setEditing(null);
    setForm({});
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">Guests</h1>
          <p className="text-muted-foreground">
            A luxury-styled guest directory with quick insights and rich profiles.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="gradient-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Users className="text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Guests</div>
                <div className="text-2xl font-semibold">{stats.total}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
                <Crown className="text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">VIP Members</div>
                <div className="text-2xl font-semibold">{stats.vips}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Sparkles className="text-accent-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg. Loyalty Points</div>
                <div className="text-2xl font-semibold">{stats.avgLoyalty}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle>Guest Directory</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2 items-center w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Input
                  placeholder="Search name, email, phone, country..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-background w-full md:w-[320px]"
                />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__ALL__">All Memberships</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setGenderFilter("__ALL__"); setMembershipFilter("__ALL__"); setQuery(""); }}>
                Reset
              </Button>
              <Button className="neon-glow" onClick={startAdd}>
                <Plus className="h-4 w-4 mr-1" />
                Add Guest
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((g, idx) => (
            <motion.div
              key={g.id ?? idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              whileHover={{ y: -4, rotateX: 1, rotateY: -1 }}
              className="perspective-1000"
            >
              <Card className="gradient-card border-border/60 preserve-3d">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-1 ring-border">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                          {initials(g.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-lg font-semibold text-foreground">{g.full_name ?? "-"}</div>
                        <div className="text-xs text-muted-foreground">{g.email ?? "-"}</div>
                      </div>
                    </div>
                    <Badge className={membershipColor(g.membership)}>
                      {g.membership ?? "None"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gift className="h-4 w-4 text-primary" />
                      <span>{g.loyalty_points ?? 0} pts</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{g.dob ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Flag className="h-4 w-4 text-primary" />
                      <span>{g.country ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4 text-primary" />
                      <span>{g.preferred_room_type ?? "-"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {g.special_requests ? `Note: ${g.special_requests}` : g.address ?? "-"}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDetails(g)}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => startEdit(g)}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => remove(g)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-16">
              No guests found.
            </div>
          )}
        </div>
      </div>

      {/* View Details Sheet */}
      <Sheet open={openView} onOpenChange={setOpenView}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Guest Profile</SheetTitle>
            <SheetDescription>Detailed information</SheetDescription>
          </SheetHeader>

          {viewGuest && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-1 ring-border">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {initials(viewGuest.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg font-semibold">{viewGuest.full_name}</div>
                  <div className="text-xs text-muted-foreground">{viewGuest.guest_id}</div>
                </div>
                <div className="ml-auto">
                  <Badge className={membershipColor(viewGuest.membership)}>
                    {viewGuest.membership ?? "None"}
                  </Badge>
                </div>
              </div>

              <Card className="gradient-card">
                <CardContent className="p-4 grid gap-2 text-sm">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {viewGuest.email ?? "-"}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {viewGuest.phone ?? "-"}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {viewGuest.address ?? "-"}</div>
                  <div className="flex items-center gap-2"><Flag className="h-4 w-4 text-primary" /> {viewGuest.country ?? "-"} • {viewGuest.nationality ?? "-"}</div>
                  <div className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Preferred: {viewGuest.preferred_room_type ?? "-"}</div>
                  <div className="flex items-center gap-2"><Gift className="h-4 w-4 text-primary" /> Loyalty: {viewGuest.loyalty_points ?? 0} pts</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> DOB: {viewGuest.dob ?? "-"}</div>
                  <div className="text-muted-foreground">ID: {viewGuest.id_number ?? "-"}</div>
                  <div className="text-muted-foreground">Notes: {viewGuest.notes ?? "-"}</div>
                  <div className="text-muted-foreground">Special: {viewGuest.special_requests ?? "-"}</div>
                </CardContent>
              </Card>
              <SheetFooter>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpenView(false)}>Close</Button>
                  <Button onClick={() => { setOpenView(false); startEdit(viewGuest); }}>Edit</Button>
                </div>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add/Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-[95vw] w-screen h-[95vh] md:h-[90vh] p-0 overflow-auto">
          <div className="flex flex-col h-full">
            <div className="px-6 pt-6">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Guest" : "Add Guest"}</DialogTitle>
                <DialogDescription>Fill guest information</DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 pb-2 flex-1 overflow-y-auto">
              <div className="grid gap-3 py-1 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label>Full Name *</Label>
                  <Input value={String(form.full_name ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" />
                </div>
                <div className="grid gap-1">
                  <Label>Gender</Label>
                  <Select value={String(form.gender ?? "")} onValueChange={(v) => setForm((f: Guest) => ({ ...f, gender: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={String(form.dob ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, dob: e.target.value }))} />
                </div>
                <div className="grid gap-1">
                  <Label>Email *</Label>
                  <Input value={String(form.email ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, email: e.target.value }))} placeholder="guest@example.com" />
                </div>
                <div className="grid gap-1">
                  <Label>Phone *</Label>
                  <Input value={String(form.phone ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, phone: e.target.value }))} placeholder="+1 555-0123" />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <Label>Address</Label>
                  <Input value={String(form.address ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, address: e.target.value }))} placeholder="Street, City, Country" />
                </div>
                <div className="grid gap-1">
                  <Label>Country *</Label>
                  <Input value={String(form.country ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, country: e.target.value }))} placeholder="India" />
                </div>
                <div className="grid gap-1">
                  <Label>Nationality</Label>
                  <Input value={String(form.nationality ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, nationality: e.target.value }))} placeholder="Indian" />
                </div>
                <div className="grid gap-1">
                  <Label>ID/Passport Number</Label>
                  <Input value={String(form.id_number ?? "")} onChange={(e) => setForm((f: Guest) => ({ ...f, id_number: e.target.value }))} />
                </div>
                <div className="grid gap-1">
                  <Label>Preferred Room Type</Label>
                  <Select value={String(form.preferred_room_type ?? "")} onValueChange={(v) => setForm((f: Guest) => ({ ...f, preferred_room_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select room type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label>Membership</Label>
                  <Select value={String(form.membership ?? "")} onValueChange={(v) => setForm((f: Guest) => ({ ...f, membership: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select membership" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label>Loyalty Points</Label>
                  <Input type="number" value={String(form.loyalty_points ?? "0")} onChange={(e) => setForm((f: Guest) => ({ ...f, loyalty_points: Number(e.target.value || 0) }))} />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <Label>Special Requests</Label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                    value={String(form.special_requests ?? "")}
                    onChange={(e) => setForm((f: Guest) => ({ ...f, special_requests: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <Label>Notes</Label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                    value={String(form.notes ?? "")}
                    onChange={(e) => setForm((f: Guest) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEdit(false)}>Cancel</Button>
                <Button className="neon-glow" onClick={save}>{editing ? "Update" : "Save"}</Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}