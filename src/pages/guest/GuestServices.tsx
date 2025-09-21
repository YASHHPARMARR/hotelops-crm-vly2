import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brush,
  Bath,
  UtensilsCrossed,
  Coffee,
  Wifi,
  Shirt,
  ConciergeBell,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { useMemo, useState, type ComponentType, useEffect } from "react";
import { getSupabase, getSupabaseUserEmail } from "@/lib/supabaseClient";

type ServiceItem = {
  id: string;
  label: string;
  description: string;
  eta: string;
  icon: ComponentType<any>;
};

type RequestRow = {
  id: string;
  request: string;
  eta: string;
  status: "Requested" | "In Progress" | "Completed" | "Cancelled";
  requestedAt: number;
};

type Booking = {
  id: string;
  checkIn: string; // yyyy-mm-dd
  checkOut: string; // yyyy-mm-dd
  nights: number;
  roomType: "Single" | "Double" | "Deluxe" | "Suite";
  guests: number;
  amount: number;
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: number;
};

type BookingForm = {
  checkIn: string;
  checkOut: string;
  roomType: "Single" | "Double" | "Deluxe" | "Suite";
  guests: number;
};

const CATALOG: Array<ServiceItem> = [
  {
    id: "svc_housekeeping",
    label: "Housekeeping",
    description: "Room refresh, turn-down, trash removal",
    eta: "30 min",
    icon: Brush,
  },
  {
    id: "svc_laundry",
    label: "Laundry Pickup",
    description: "Pickup and return of clothing items",
    eta: "2–4 hrs",
    icon: Shirt,
  },
  {
    id: "svc_dining",
    label: "In‑Room Dining",
    description: "Order food and beverages to your room",
    eta: "25–45 min",
    icon: UtensilsCrossed,
  },
  {
    id: "svc_spa",
    label: "Spa & Wellness",
    description: "Massage, aromatherapy, and wellness",
    eta: "Book slot",
    icon: Bath,
  },
  {
    id: "svc_coffee",
    label: "Coffee / Tea",
    description: "Freshly brewed coffee or tea service",
    eta: "10–15 min",
    icon: Coffee,
  },
  {
    id: "svc_wifi",
    label: "Wi‑Fi Assistance",
    description: "Connectivity help and device pairing",
    eta: "Instant",
    icon: Wifi,
  },
  {
    id: "svc_wakeup",
    label: "Wake‑up Call",
    description: "Set a call/alarm for your schedule",
    eta: "Scheduled",
    icon: Clock,
  },
  {
    id: "svc_concierge",
    label: "Concierge",
    description: "Reservations, transport, local tips",
    eta: "As requested",
    icon: ConciergeBell,
  },
  {
    id: "svc_towels",
    label: "Extra Towels",
    description: "Plush towels delivered to your room",
    eta: "10–20 min",
    icon: Bath,
  },
];

function bookingStatusBadgeClass(s: string) {
  switch (s) {
    case "Pending":
      return "bg-amber-500/15 text-amber-300";
    case "Confirmed":
      return "bg-emerald-500/15 text-emerald-300";
    case "Cancelled":
      return "bg-rose-500/15 text-rose-300";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

export default function GuestServices() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const tomorrowIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Replace Convex queries with local state + Supabase loaders
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  async function loadBookings() {
    try {
      const s = getSupabase();
      const email = await getSupabaseUserEmail();
      if (!s || !email) {
        setBookings([]);
        return;
      }
      const { data, error } = await s
        .from("guest_bookings")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        _id: r.id,
        user_email: r.user_email,
        checkInDate: r.check_in_date,
        checkOutDate: r.check_out_date,
        roomType: r.room_type,
        guests: r.guests,
        nights: r.nights,
        amount: r.amount,
        status: r.status,
        createdAt: r.created_at,
      }));
      setBookings(mapped);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load bookings");
      setBookings([]);
    }
  }

  async function loadRequests() {
    try {
      const s = getSupabase();
      const email = await getSupabaseUserEmail();
      if (!s || !email) {
        setRequests([]);
        return;
      }
      const { data, error } = await s
        .from("guest_service_requests")
        .select("*")
        .eq("user_email", email)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        _id: r.id,
        label: r.label,
        description: r.description,
        eta: r.eta,
        status: r.status,
        requestedAt: r.requested_at,
      }));
      setRequests(mapped);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load requests");
      setRequests([]);
    }
  }

  useEffect(() => {
    loadBookings();
    loadRequests();
  }, []);

  // Recreate "mutations" as local functions with same names used below
  const createBooking = async (args: {
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
    guests: number;
    nights: number;
    amount: number;
  }) => {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const { error } = await s.from("guest_bookings").insert({
      user_email: email,
      check_in_date: args.checkInDate,
      check_out_date: args.checkOutDate,
      room_type: args.roomType,
      guests: args.guests,
      nights: args.nights,
      amount: args.amount,
      status: "Confirmed",
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    await loadBookings();
  };

  const cancelBookingMut = async (args: { bookingId: string }) => {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const { error } = await s
      .from("guest_bookings")
      .update({ status: "Cancelled" })
      .eq("id", args.bookingId)
      .eq("user_email", email);
    if (error) throw error;
    await loadBookings();
  };

  const createRequestMut = async (args: {
    label: string;
    description?: string;
    eta: string;
    presetId?: string;
  }) => {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const status = args.presetId === "svc_wifi" ? "In Progress" : "Requested";
    const { error } = await s.from("guest_service_requests").insert({
      user_email: email,
      label: args.label,
      description: args.description ?? "",
      eta: args.eta,
      status,
      requested_at: new Date().toISOString(),
    });
    if (error) throw error;
    await loadRequests();
  };

  const completeRequestMut = async (args: { requestId: string }) => {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const { error } = await s
      .from("guest_service_requests")
      .update({ status: "Completed" })
      .eq("id", args.requestId)
      .eq("user_email", email);
    if (error) throw error;
    await loadRequests();
  };

  const cancelRequestMut = async (args: { requestId: string }) => {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const { error } = await s
      .from("guest_service_requests")
      .update({ status: "Cancelled" })
      .eq("id", args.requestId)
      .eq("user_email", email);
    if (error) throw error;
    await loadRequests();
  };

  // Seed demo if empty (Supabase)
  useEffect(() => {
    async function seedIfEmpty() {
      if ((bookings?.length ?? 0) > 0) return;
      try {
        const s = getSupabase();
        const email = await getSupabaseUserEmail();
        if (!s || !email) return;
        const now = Date.now();
        await s.from("guest_bookings").insert([
          {
            user_email: email,
            check_in_date: new Date(now + 24 * 3600 * 1000).toISOString().slice(0, 10),
            check_out_date: new Date(now + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
            room_type: "Deluxe",
            guests: 2,
            nights: 2,
            amount: 320,
            status: "Confirmed",
            created_at: new Date(now - 60 * 60 * 1000).toISOString(),
          },
          {
            user_email: email,
            check_in_date: new Date(now + 6 * 24 * 3600 * 1000).toISOString().slice(0, 10),
            check_out_date: new Date(now + 9 * 24 * 3600 * 1000).toISOString().slice(0, 10),
            room_type: "Suite",
            guests: 3,
            nights: 3,
            amount: 720,
            status: "Pending",
            created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
          },
        ]);
        await s.from("guest_service_requests").insert([
          {
            user_email: email,
            label: "Laundry Pickup",
            description: "2 shirts, 1 trouser",
            eta: "6 pm",
            status: "Requested",
            requested_at: new Date(now - 90 * 60 * 1000).toISOString(),
          },
          {
            user_email: email,
            label: "Extra Pillows",
            description: "",
            eta: "15 min",
            status: "In Progress",
            requested_at: new Date(now - 30 * 60 * 1000).toISOString(),
          },
        ]);
        await loadBookings();
        await loadRequests();
      } catch {
        // ignore seed errors
      }
    }
    seedIfEmpty();
  }, [bookings?.length]);

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    checkIn: todayIso,
    checkOut: tomorrowIso,
    roomType: "Deluxe",
    guests: 2,
  });

  function diffNights(checkIn: string, checkOut: string) {
    try {
      const a = new Date(checkIn);
      const b = new Date(checkOut);
      const ms = b.getTime() - a.getTime();
      const nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
      return Number.isFinite(nights) ? Math.max(0, nights) : 0;
    } catch {
      return 0;
    }
  }

  const PRICE_PER_NIGHT: Record<Booking["roomType"], number> = {
    Single: 80,
    Double: 110,
    Deluxe: 160,
    Suite: 240,
  };

  const formNights = useMemo(
    () => diffNights(bookingForm.checkIn, bookingForm.checkOut),
    [bookingForm.checkIn, bookingForm.checkOut],
  );
  const formAmount = useMemo(
    () => formNights * PRICE_PER_NIGHT[bookingForm.roomType],
    [formNights, bookingForm.roomType],
  );

  async function addBooking() {
    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      toast.error("Please select dates");
      return;
    }
    if (new Date(bookingForm.checkOut) <= new Date(bookingForm.checkIn)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    if (bookingForm.guests <= 0) {
      toast.error("Guests must be at least 1");
      return;
    }
    const nights = diffNights(bookingForm.checkIn, bookingForm.checkOut);
    const amount = nights * PRICE_PER_NIGHT[bookingForm.roomType];
    try {
      await createBooking({
        checkInDate: bookingForm.checkIn,
        checkOutDate: bookingForm.checkOut,
        roomType: bookingForm.roomType,
        guests: bookingForm.guests,
        nights,
        amount,
      });
      toast.success("Stay booked successfully");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to book");
    }
  }

  async function cancelBooking(id: string) {
    try {
      await cancelBookingMut({ bookingId: id as any });
      toast("Booking cancelled");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to cancel");
    }
  }

  async function addRequest(svc: ServiceItem) {
    try {
      await createRequestMut({
        label: svc.label,
        description: svc.description,
        eta: svc.eta,
        presetId: svc.id,
      });
      toast.success(`${svc.label} requested`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to request");
    }
  }

  async function markComplete(id: string) {
    try {
      await completeRequestMut({ requestId: id as any });
      toast.success("Marked as completed");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to complete");
    }
  }

  async function cancel(id: string) {
    try {
      await cancelRequestMut({ requestId: id as any });
      toast("Cancelled");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to cancel");
    }
  }

  function statusBadgeClass(s: RequestRow["status"]) {
    switch (s) {
      case "Requested":
        return "bg-blue-500/15 text-blue-300";
      case "In Progress":
        return "bg-amber-500/15 text-amber-300";
      case "Completed":
        return "bg-emerald-500/15 text-emerald-300";
      case "Cancelled":
        return "bg-rose-500/15 text-rose-300";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  }

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "completed") return requests.filter((r: any) => r.status === "Completed");
    return requests.filter((r: any) => r.status === "Requested" || r.status === "In Progress");
  }, [requests, filter]);

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl gradient-card border border-border/60"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 blur-3xl rounded-full" />
          </div>
          <div className="relative p-6 md:p-8 grid lg:grid-cols-2 gap-6 items-stretch">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Book Your Stay
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Reserve a beautiful room with ease
              </h1>
              <p className="text-muted-foreground">
                Select your dates, room type, and guests. Your reservation is saved instantly.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <div className="grid gap-1">
                  <div className="text-xs text-muted-foreground">Check-in</div>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bookingForm.checkIn}
                    onChange={(e) =>
                      setBookingForm((f) => ({ ...f, checkIn: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <div className="text-xs text-muted-foreground">Check-out</div>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bookingForm.checkOut}
                    onChange={(e) =>
                      setBookingForm((f) => ({ ...f, checkOut: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <div className="text-xs text-muted-foreground">Room Type</div>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bookingForm.roomType}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        roomType: e.target.value as Booking["roomType"],
                      }))
                    }
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
                <div className="grid gap-1">
                  <div className="text-xs text-muted-foreground">Guests</div>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={bookingForm.guests}
                    onChange={(e) =>
                      setBookingForm((f) => ({
                        ...f,
                        guests: Number(e.target.value || 1),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Badge variant="secondary">Nights: {formNights}</Badge>
                <Badge variant="secondary">
                  Rate: ${PRICE_PER_NIGHT[bookingForm.roomType]}/night
                </Badge>
                <Badge className="bg-primary/15 text-primary">Total: ${formAmount}</Badge>
              </div>

              <div className="pt-2">
                <Button className="neon-glow" onClick={addBooking}>
                  Reserve Now
                </Button>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1400&auto=format&fit=crop"
              alt="Luxury Room"
              className="w-full h-full max-h-[360px] rounded-xl object-cover shadow-lg"
            />
          </div>
        </motion.div>

        {/* My Bookings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">My Bookings</h2>
            <div className="text-sm text-muted-foreground">
              Manage and track your reservations
            </div>
          </div>
          <Card className="gradient-card border-border/60">
            <CardContent className="p-4 space-y-3">
              {bookings.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  No bookings yet. Create your first reservation above.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b: any) => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-foreground">
                            {b.roomType} • {b.guests} {b.guests > 1 ? "guests" : "guest"}
                          </div>
                          <Badge className={bookingStatusBadgeClass(b.status)}>{b.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {b.checkInDate} → {b.checkOutDate} • {b.nights} night{b.nights !== 1 ? "s" : ""} • Booked{" "}
                          {new Date(b.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:justify-end">
                        <Badge variant="secondary">Total: ${b.amount}</Badge>
                        {b.status !== "Cancelled" && (
                          <Button size="sm" variant="destructive" onClick={() => cancelBooking(b._id)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Service Catalog */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Service Catalog</h2>
            <div className="text-sm text-muted-foreground">Tap to request instantly</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {CATALOG.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileHover={{ y: -4, rotateX: 1.5, rotateY: -1 }}
                className="perspective-1000"
              >
                <Card className="gradient-card border-border/60 preserve-3d h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <svc.icon className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-foreground">{svc.label}</div>
                        <div className="text-sm text-muted-foreground">{svc.description}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        ETA: {svc.eta}
                      </Badge>
                      <Button size="sm" className="neon-glow" onClick={() => addRequest(svc)}>
                        Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">My Requests</h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === "active" ? "default" : "outline"}
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button
                size="sm"
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
            </div>
          </div>

          <Card className="gradient-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">No requests yet.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((r: any, idx: number) => (
                    <motion.div
                      key={r._id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-foreground">{r.label}</div>
                          <Badge className={statusBadgeClass(r.status)}>{r.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ETA: {r.eta} • {new Date(r.requestedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status !== "Completed" && r.status !== "Cancelled" && (
                          <Button size="sm" variant="outline" onClick={() => markComplete(r._id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                        )}
                        {r.status !== "Cancelled" && r.status !== "Completed" && (
                          <Button size="sm" variant="destructive" onClick={() => cancel(r._id)}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}