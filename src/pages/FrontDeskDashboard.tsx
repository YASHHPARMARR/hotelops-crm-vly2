import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Download, Filter, LogIn, Users, BedDouble, Check, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";

const arrivalsDepartures = [
  { hour: "08:00", arrivals: 8, departures: 3 },
  { hour: "10:00", arrivals: 12, departures: 6 },
  { hour: "12:00", arrivals: 18, departures: 11 },
  { hour: "14:00", arrivals: 14, departures: 15 },
  { hour: "16:00", arrivals: 10, departures: 8 },
  { hour: "18:00", arrivals: 6, departures: 5 },
];

const queueData = [
  { counter: "FD-1", avgWait: 4 },
  { counter: "FD-2", avgWait: 6 },
  { counter: "FD-3", avgWait: 5 },
  { counter: "VIP", avgWait: 2 },
];

export default function FrontDeskDashboard() {
  const [availableRooms, setAvailableRooms] = useState<number>(0);
  const [totalRooms, setTotalRooms] = useState<number>(0);
  const [activeBookings, setActiveBookings] = useState<number>(0);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [assignRoom, setAssignRoom] = useState<string>("");

  const bookingRequests = useQuery(api.bookingRequests.listAll);
  const reviewRequest = useMutation(api.bookingRequests.reviewRequest);

  const pendingRequests = bookingRequests?.filter(r => r.status === "Pending") || [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const s = getSupabase();
        if (!s) return;
        const [availRes, totalRes, bookRes] = await Promise.all([
          s.from("rooms").select("id", { count: "exact", head: true }).in("status", ["Available", "Vacant"]),
          s.from("rooms").select("id", { count: "exact", head: true }),
          s.from("reservations").select("id", { count: "exact", head: true }).eq("status", "CheckedIn"),
        ]);
        if (!cancelled) {
          setAvailableRooms(availRes.count ?? 0);
          setTotalRooms(totalRes.count ?? 0);
          setActiveBookings(bookRes.count ?? 0);
        }
      } catch {
        if (!cancelled) { setAvailableRooms(0); setTotalRooms(0); setActiveBookings(0); }
      }
    }
    load();
    const t = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;

  async function handleReview(requestId: Id<"bookingRequests">, status: "Approved" | "Rejected") {
    try {
      await reviewRequest({
        requestId,
        status,
        reviewedBy: "Front Desk",
        assignedRoom: status === "Approved" ? assignRoom || undefined : undefined,
      });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      setReviewingId(null);
      setAssignRoom("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update request");
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Front Desk</h1>
            <p className="text-muted-foreground">Monitor arrivals, departures, and lobby performance.</p>
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
          <KPICard title="Available Rooms" value={String(availableRooms)} trend="neutral" icon={<BedDouble className="h-4 w-4" />} />
          <KPICard title="Occupancy Rate" value={`${occupancyRate}%`} trend={occupancyRate > 70 ? "up" : "neutral"} icon={<Users className="h-4 w-4" />} />
          <KPICard title="Active Bookings" value={String(activeBookings)} trend="neutral" icon={<LogIn className="h-4 w-4" />} />
          <KPICard title="Pending Requests" value={String(pendingRequests.length)} trend={pendingRequests.length > 0 ? "up" : "neutral"} icon={<Calendar className="h-4 w-4" />} />
        </div>

        {/* Booking Requests Panel */}
        {pendingRequests.length > 0 && (
          <Card className="gradient-card border-yellow-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-yellow-400" />
                Guest Booking Requests
                <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 ml-2">
                  {pendingRequests.length} Pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-background/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">
                          {req.guestEmail || req.guestUserId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {req.checkInDate} → {req.checkOutDate}
                          {req.roomPreference ? ` · ${req.roomPreference}` : ""}
                          {" "}· {req.adults} adult{req.adults !== 1 ? "s" : ""}
                          {req.children ? `, ${req.children} child${req.children !== 1 ? "ren" : ""}` : ""}
                        </div>
                        {req.specialRequests && (
                          <div className="text-xs text-muted-foreground italic">"{req.specialRequests}"</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {reviewingId === req._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Assign room #"
                              value={assignRoom}
                              onChange={e => setAssignRoom(e.target.value)}
                              className="w-28 h-8 text-sm"
                            />
                            <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700" onClick={() => handleReview(req._id, "Approved")}>
                              <Check className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => handleReview(req._id, "Rejected")}>
                              <X className="h-3 w-3 mr-1" /> Reject
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setReviewingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setReviewingId(req._id)}>
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Arrivals vs Departures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={arrivalsDepartures}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="arrivals" stroke="#00ff88" strokeWidth={3} dot={{ fill: "#00ff88", strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="departures" stroke="#0088ff" strokeWidth={3} dot={{ fill: "#0088ff", strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Counters Avg Wait Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="counter" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Bar dataKey="avgWait" fill="#ff0080" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

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