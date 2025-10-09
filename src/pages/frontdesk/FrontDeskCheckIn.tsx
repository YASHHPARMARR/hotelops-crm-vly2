import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useMemo, useState, useEffect } from "react";
import {
  Search,
  LogIn,
  LogOut,
  BedDouble,
  DoorOpen,
  CalendarClock,
} from "lucide-react";
import { getSupabase } from "@/lib/supabaseClient";

type ReservationStatus = "Booked" | "CheckedIn" | "CheckedOut";

type Reservation = {
  id: string;
  guestName: string;
  roomType: string;
  roomNumber?: string;
  status: ReservationStatus;
  checkInDate: string;
  checkOutDate: string;
  balance: number;
  notes?: string;
};

type Room = {
  id: string;
  number: string;
  roomType: string;
  status: string;
};

export default function FrontDeskCheckIn() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch reservations and rooms from Supabase
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30-second refresh
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        setLoading(false);
        return;
      }

      // Fetch today's reservations
      const today = new Date().toISOString().split('T')[0];
      const { data: resData, error: resError } = await supabase
        .from("reservations")
        .select("*")
        .gte("arrival", today)
        .order("arrival", { ascending: true });

      if (!resError && resData) {
        setReservations(resData.map((r: any) => ({
          id: r.id,
          guestName: r.guestName || "",
          roomType: r.roomType || "",
          roomNumber: r.roomNumber || undefined,
          status: r.status || "Booked",
          checkInDate: r.arrival || "",
          checkOutDate: r.departure || "",
          balance: Number(r.balance) || 0,
          notes: r.notes || "",
        })));
      }

      // Fetch available rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from("rooms")
        .select("*")
        .eq("status", "available");

      if (!roomsError && roomsData) {
        setAvailableRooms(roomsData.map((r: any) => ({
          id: r.id,
          number: r.number || "",
          roomType: r.roomType || r.type || "",
          status: r.status || "",
        })));
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reservations;
    return reservations.filter(
      (r) =>
        r.guestName.toLowerCase().includes(q) ||
        r.roomNumber?.toLowerCase().includes(q) ||
        r.roomType.toLowerCase().includes(q),
    );
  }, [reservations, query]);

  const stats = useMemo(() => {
    const booked = reservations.filter((r) => r.status === "Booked").length;
    const inHouse = reservations.filter((r) => r.status === "CheckedIn").length;
    const dueOut = reservations.filter(
      (r) =>
        r.status === "CheckedIn" &&
        new Date(r.checkOutDate).toDateString() === new Date().toDateString(),
    ).length;
    return { booked, inHouse, dueOut };
  }, [reservations]);

  function openAssignRoom(res: Reservation) {
    setSelected(res);
    const roomsForType = availableRooms.filter(r => r.roomType === res.roomType);
    if (roomsForType.length === 0) {
      toast.error(`No available rooms for type: ${res.roomType}`);
      return;
    }
    setSelectedRoom("");
    setAssignOpen(true);
  }

  async function confirmAssignRoom() {
    if (!selected || !selectedRoom) {
      toast.error("Please choose a room to assign");
      return;
    }

    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error("Database not configured");
        return;
      }

      // Update reservation
      const { error: resError } = await supabase
        .from("reservations")
        .update({ roomNumber: selectedRoom, status: "CheckedIn" })
        .eq("id", selected.id);

      if (resError) throw resError;

      // Update room status
      const { error: roomError } = await supabase
        .from("rooms")
        .update({ status: "occupied" })
        .eq("number", selectedRoom);

      if (roomError) throw roomError;

      toast.success(`Checked in ${selected.guestName} to room ${selectedRoom}`);
      setAssignOpen(false);
      setSelected(null);
      setSelectedRoom("");
      fetchData();
    } catch (err) {
      console.error("Error assigning room:", err);
      toast.error("Failed to assign room");
    }
  }

  async function handleCheckIn(res: Reservation) {
    if (res.status === "CheckedOut") {
      toast.error("Reservation already checked out");
      return;
    }
    if (res.status === "CheckedIn") {
      toast("Guest already checked in", { description: res.guestName });
      return;
    }
    if (!res.roomNumber) {
      openAssignRoom(res);
      return;
    }

    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error("Database not configured");
        return;
      }

      const { error } = await supabase
        .from("reservations")
        .update({ status: "CheckedIn" })
        .eq("id", res.id);

      if (error) throw error;

      toast.success(`Checked in ${res.guestName}`);
      fetchData();
    } catch (err) {
      console.error("Error checking in:", err);
      toast.error("Failed to check in");
    }
  }

  function openCheckout(res: Reservation) {
    if (res.status !== "CheckedIn") {
      toast.error("Only in-house guests can be checked out");
      return;
    }
    setSelected(res);
    setCheckoutOpen(true);
  }

  async function confirmCheckout() {
    if (!selected) return;

    try {
      const supabase = getSupabase();
      if (!supabase) {
        toast.error("Database not configured");
        return;
      }

      // Update reservation
      const { error: resError } = await supabase
        .from("reservations")
        .update({ status: "CheckedOut" })
        .eq("id", selected.id);

      if (resError) throw resError;

      // Update room status back to available
      if (selected.roomNumber) {
        const { error: roomError } = await supabase
          .from("rooms")
          .update({ status: "available" })
          .eq("number", selected.roomNumber);

        if (roomError) throw roomError;
      }

      toast.success(`Checked out ${selected.guestName}`);
      setCheckoutOpen(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      console.error("Error checking out:", err);
      toast.error("Failed to check out");
    }
  }

  function statusBadge(status: ReservationStatus) {
    const map: Record<ReservationStatus, string> = {
      Booked: "bg-blue-500/15 text-blue-300",
      CheckedIn: "bg-green-500/15 text-green-300",
      CheckedOut: "bg-zinc-500/20 text-zinc-300",
    };
    return <Badge className={map[status]}>{status}</Badge>;
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Check In / Out</h1>
            <p className="text-muted-foreground">
              Process guest arrivals, room assignments, and departures.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:min-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, room, or type..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Booked (Today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.booked}</div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary" />
                In-House
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.inHouse}</div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DoorOpen className="h-4 w-4 text-primary" />
                Due Out (Today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.dueOut}</div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations table */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Today's Bookings & In-House</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Room #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{r.guestName}</div>
                        {r.notes && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {r.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{r.roomType}</TableCell>
                      <TableCell>{r.roomNumber ?? "-"}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                      <TableCell className="text-right">
                        {r.balance > 0 ? (
                          <span className="text-rose-400">${r.balance.toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">$0.00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCheckIn(r)}
                          disabled={r.status !== "Booked"}
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Check In
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openCheckout(r)}
                          disabled={r.status !== "CheckedIn"}
                          className="neon-glow"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Check Out
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                        No reservations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Assign Room / Check-In Dialog */}
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Room & Check In</DialogTitle>
              <DialogDescription>
                Choose a room to complete the check-in.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Guest</Label>
                <div className="text-sm text-foreground">
                  {selected?.guestName}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Room Type</Label>
                <div className="text-sm text-muted-foreground">{selected?.roomType}</div>
              </div>
              <div className="grid gap-2">
                <Label>Available Rooms</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room number" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms
                      .filter(r => r.roomType === selected?.roomType)
                      .map((room) => (
                        <SelectItem key={room.id} value={room.number}>
                          {room.number}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button className="neon-glow" onClick={confirmAssignRoom}>
                Confirm Check In
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Checkout Confirm Dialog */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Check Out</DialogTitle>
              <DialogDescription>
                Verify guest is leaving and settle any remaining balances.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Guest: </span>
                <span className="text-foreground font-medium">
                  {selected?.guestName}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Room: </span>
                <span className="text-foreground font-medium">
                  {selected?.roomNumber ?? "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Balance: </span>
                <span
                  className={
                    (selected?.balance ?? 0) > 0 ? "text-rose-400 font-medium" : "text-foreground"
                  }
                >
                  ${selected?.balance.toFixed(2)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button
                className="neon-glow"
                onClick={confirmCheckout}
                disabled={(selected?.balance ?? 0) > 0}
                title={
                  (selected?.balance ?? 0) > 0
                    ? "Balance must be settled before checkout"
                    : undefined
                }
              >
                Confirm Check Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}