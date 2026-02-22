import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { CalendarDays, BedDouble, Users, Loader2 } from "lucide-react";
import { getSupabaseUserEmail } from "@/lib/supabaseClient";

const ROOM_TYPES = [
  { value: "Standard", label: "Standard Room", price: "$120/night" },
  { value: "Deluxe", label: "Deluxe Room", price: "$180/night" },
  { value: "Suite", label: "Suite", price: "$280/night" },
  { value: "Presidential", label: "Presidential Suite", price: "$500/night" },
];

interface Props {
  onSuccess?: () => void;
}

export function BookingRequestForm({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    roomPreference: "",
    adults: "1",
    children: "0",
    specialRequests: "",
  });

  const createRequest = useMutation(api.bookingRequests.createRequest);

  const nights = form.checkInDate && form.checkOutDate
    ? Math.max(0, Math.ceil((new Date(form.checkOutDate).getTime() - new Date(form.checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const selectedRoom = ROOM_TYPES.find(r => r.value === form.roomPreference);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.checkInDate || !form.checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (new Date(form.checkOutDate) <= new Date(form.checkInDate)) {
      toast.error("Check-out must be after check-in");
      return;
    }
    setLoading(true);
    try {
      const email = await getSupabaseUserEmail();
      await createRequest({
        guestUserId: email || "guest",
        guestEmail: email || undefined,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        roomPreference: form.roomPreference || undefined,
        adults: parseInt(form.adults),
        children: parseInt(form.children) || undefined,
        specialRequests: form.specialRequests || undefined,
      });
      toast.success("Booking request sent to Front Desk! You'll be notified once confirmed.");
      setOpen(false);
      setForm({ checkInDate: "", checkOutDate: "", roomPreference: "", adults: "1", children: "0", specialRequests: "" });
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send booking request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="neon-glow" size="lg">
          <BedDouble className="h-5 w-5 mr-2" />
          Request Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            New Booking Request
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Check-in Date *</Label>
              <Input
                type="date"
                value={form.checkInDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setForm(f => ({ ...f, checkInDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Check-out Date *</Label>
              <Input
                type="date"
                value={form.checkOutDate}
                min={form.checkInDate || new Date().toISOString().split("T")[0]}
                onChange={e => setForm(f => ({ ...f, checkOutDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {nights > 0 && (
            <div className="text-sm text-muted-foreground bg-primary/5 rounded-md px-3 py-2">
              Duration: <span className="font-semibold text-primary">{nights} night{nights !== 1 ? "s" : ""}</span>
            </div>
          )}

          <div className="space-y-1">
            <Label>Room Preference</Label>
            <Select value={form.roomPreference} onValueChange={v => setForm(f => ({ ...f, roomPreference: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select room type (optional)" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map(rt => (
                  <SelectItem key={rt.value} value={rt.value}>
                    {rt.label} — {rt.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Adults *</Label>
              <Select value={form.adults} onValueChange={v => setForm(f => ({ ...f, adults: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} Adult{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Children</Label>
              <Select value={form.children} onValueChange={v => setForm(f => ({ ...f, children: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0,1,2,3].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "Child" : "Children"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Special Requests</Label>
            <Textarea
              placeholder="Any special requirements, preferences, or notes..."
              value={form.specialRequests}
              onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
              rows={3}
            />
          </div>

          {selectedRoom && nights > 0 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm space-y-1">
              <div className="font-semibold text-foreground">Estimated Cost</div>
              <div className="text-muted-foreground">{selectedRoom.label} × {nights} nights</div>
              <div className="text-primary font-bold text-base">
                ${(parseInt(selectedRoom.price.replace(/\D/g, "")) * nights).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Final price confirmed by Front Desk</div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 neon-glow" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
