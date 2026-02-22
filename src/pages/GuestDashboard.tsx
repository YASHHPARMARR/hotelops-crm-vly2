import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Download, Filter, UtensilsCrossed, Calendar, Wallet, LogOut, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSupabase, getSupabaseUserEmail } from "@/lib/supabaseClient";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { BookingRequestForm } from "./guest/BookingRequestForm";

export default function GuestDashboard() {
  const [availableRooms, setAvailableRooms] = useState<number>(0);
  const [bookingSummary, setBookingSummary] = useState<{ roomType?: string; checkout?: string; balance?: number; status?: string } | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    getSupabaseUserEmail().then(email => setUserId(email || "guest"));
  }, []);

  // Real-time booking requests from Convex
  const bookingRequests = useQuery(
    api.bookingRequests.listByGuest,
    userId ? { guestUserId: userId } : "skip"
  );

  const latestApproved = bookingRequests?.find(r => r.status === "Approved");
  const pendingCount = bookingRequests?.filter(r => r.status === "Pending").length || 0;

  useEffect(() => {
    let cancelled = false;
    let channel: any | null = null;
    const s = getSupabase();

    async function loadAvailability() {
      try {
        if (!s) return;
        const { count, error } = await s
          .from("rooms")
          .select("id", { count: "exact", head: true })
          .in("status", ["Available", "Vacant"]);
        if (error) throw error;
        if (!cancelled) setAvailableRooms(count ?? 0);
      } catch {
        if (!cancelled) setAvailableRooms(0);
      }
    }

    async function loadBooking() {
      try {
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
                  status: b.status ?? undefined,
                }
              : null,
          );
        }
      } catch {
        if (!cancelled) setBookingSummary(null);
      }
    }

    (async () => {
      await loadAvailability();
      await loadBooking();

      if (!s) return;
      const email = await getSupabaseUserEmail();

      channel = s
        .channel("guest_dashboard_realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, () => loadAvailability())
        .on("postgres_changes", { event: "*", schema: "public", table: "guest_bookings", filter: email ? `user_email=eq.${email}` : undefined }, () => loadBooking());

      channel.subscribe();
    })();

    return () => {
      cancelled = true;
      try { if (channel && s) s.removeChannel(channel); } catch {}
    };
  }, []);

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const email = await getSupabaseUserEmail();
      const s = getSupabase();
      if (!s || !email) { toast.error("Not connected"); return; }
      const { error } = await s
        .from("guest_bookings")
        .update({ status: "CheckedOut" })
        .eq("user_email", email)
        .eq("status", "Confirmed");
      if (error) throw error;
      toast.success("Checkout request submitted! Front desk will process your checkout.");
      setBookingSummary(prev => prev ? { ...prev, status: "CheckedOut" } : null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit checkout");
    } finally {
      setCheckingOut(false);
    }
  }

  const nights = (checkIn: string, checkOut: string) =>
    Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Stay</h1>
            <p className="text-muted-foreground">Personalized view of services and bookings.</p>
          </div>
          <div className="flex items-center gap-3">
            <BookingRequestForm />
            {bookingSummary?.status === "Confirmed" && (
              <Button variant="outline" size="sm" onClick={handleCheckout} disabled={checkingOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {checkingOut ? "Processing..." : "Check Out"}
              </Button>
            )}
          </div>
        </div>

        {/* Booking confirmation banner */}
        {latestApproved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-green-400/30 bg-green-400/10 p-4 flex items-start gap-3"
          >
            <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-green-400">Booking Confirmed!</div>
              <div className="text-sm text-muted-foreground">
                Your booking from {latestApproved.checkInDate} to {latestApproved.checkOutDate}
                {latestApproved.assignedRoom ? ` — Room ${latestApproved.assignedRoom}` : ""}
                {" "}has been confirmed by the Front Desk.
              </div>
            </div>
          </motion.div>
        )}

        {/* Pending requests banner */}
        {pendingCount > 0 && !latestApproved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-4 flex items-start gap-3"
          >
            <Clock className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-400">Booking Request Pending</div>
              <div className="text-sm text-muted-foreground">
                You have {pendingCount} pending booking request{pendingCount > 1 ? "s" : ""}. Front Desk will review shortly.
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Room"
            value={bookingSummary?.roomType ? `• ${bookingSummary.roomType}` : latestApproved?.roomPreference ? `• ${latestApproved.roomPreference}` : "—"}
            trend="neutral"
            icon={<Home className="h-4 w-4" />}
          />
          <KPICard
            title="Check-out"
            value={bookingSummary?.checkout ? new Date(bookingSummary.checkout).toLocaleDateString() : latestApproved?.checkOutDate ? new Date(latestApproved.checkOutDate).toLocaleDateString() : "—"}
            trend="neutral"
            icon={<Calendar className="h-4 w-4" />}
          />
          <KPICard title="Available Rooms" value={String(availableRooms)} trend="neutral" icon={<UtensilsCrossed className="h-4 w-4" />} />
          <KPICard title="Pending Requests" value={String(pendingCount)} trend="neutral" icon={<Wallet className="h-4 w-4" />} />
        </div>

        {/* Recent booking requests */}
        {bookingRequests && bookingRequests.length > 0 && (
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>My Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bookingRequests.slice(0, 5).map(req => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-md bg-background/50 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {req.checkInDate} → {req.checkOutDate}
                        {req.roomPreference ? ` (${req.roomPreference})` : ""}
                      </div>
                      {req.assignedRoom && (
                        <div className="text-xs text-green-400">Room: {req.assignedRoom}</div>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${req.status === "Approved" ? "text-green-400 border-green-400/30" : req.status === "Rejected" ? "text-red-400 border-red-400/30" : "text-yellow-400 border-yellow-400/30"}`}
                    >
                      {req.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}