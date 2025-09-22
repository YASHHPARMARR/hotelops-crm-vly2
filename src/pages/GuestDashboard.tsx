import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Download, Filter, UtensilsCrossed, Calendar, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { useEffect, useState } from "react";
import { getSupabase, getSupabaseUserEmail } from "@/lib/supabaseClient";

const services = [
  { name: "Room Service", eta: "25-35 min" },
  { name: "Laundry Pickup", eta: "Scheduled 6pm" },
  { name: "Airport Shuttle", eta: "Tomorrow 9:00am" },
];

export default function GuestDashboard() {
  const [availableRooms, setAvailableRooms] = useState<number>(0);
  const [bookingSummary, setBookingSummary] = useState<{ roomType?: string; checkout?: string; balance?: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadAvailability() {
      try {
        const s = getSupabase();
        if (!s) return;
        const { count, error } = await s
          .from("rooms")
          .select("id", { count: "exact", head: true })
          .eq("status", "Available");
        if (error) throw error;
        if (!cancelled) setAvailableRooms(count ?? 0);
      } catch {
        if (!cancelled) setAvailableRooms(0);
      }
    }
    async function loadBooking() {
      try {
        const s = getSupabase();
        const email = await getSupabaseUserEmail();
        if (!s || !email) return;
        const { data, error } = await s
          .from("guest_bookings")
          .select("*")
          .eq("user_email", email)
          .order("created_at", { ascending: false })
          .limit(1);
        if (error) throw error;
        const b = (data && data[0]) || null;
        if (!cancelled) {
          setBookingSummary(
            b
              ? {
                  roomType: b.room_type ?? undefined,
                  checkout: b.check_out_date ?? undefined,
                  balance: undefined,
                }
              : null,
          );
        }
      } catch {
        if (!cancelled) setBookingSummary(null);
      }
    }
    loadAvailability();
    loadBooking();
    const t = setInterval(() => {
      loadAvailability();
      loadBooking();
    }, 7000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Stay</h1>
            <p className="text-muted-foreground">Personalized view of services and bookings.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="neon-glow">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Room"
            value={
              bookingSummary?.roomType
                ? `• ${bookingSummary.roomType}`
                : "—"
            }
            trend="neutral"
            icon={<Home className="h-4 w-4" />}
          />
          <KPICard
            title="Check-out"
            value={bookingSummary?.checkout ? new Date(bookingSummary.checkout).toLocaleDateString() : "—"}
            trend="neutral"
            icon={<Calendar className="h-4 w-4" />}
          />
          <KPICard title="Available Rooms" value={String(availableRooms)} trend="neutral" icon={<UtensilsCrossed className="h-4 w-4" />} />
          <KPICard title="Balance" value="—" trend="neutral" icon={<Wallet className="h-4 w-4" />} />
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Upcoming & Active Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {services.map((s, idx) => (
                <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="p-4 rounded-lg bg-background/50">
                  <div className="text-sm text-muted-foreground">Service</div>
                  <div className="text-foreground font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">ETA: {s.eta}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="fixed bottom-6 right-6 z-50 neon-glow" size="icon" aria-label="Open Chat">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <ChatPanel />
          </SheetContent>
        </Sheet>
      </div>
    </AdminShell>
  );
}