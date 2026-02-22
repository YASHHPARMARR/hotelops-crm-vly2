import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Loader2, X } from "lucide-react";
import { getSupabaseUserEmail } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

function statusColor(status: string) {
  if (status === "Approved") return "text-green-400 border-green-400/30";
  if (status === "Rejected") return "text-red-400 border-red-400/30";
  return "text-yellow-400 border-yellow-400/30";
}

export function MyBookingRequests() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    getSupabaseUserEmail().then(email => setUserId(email || "guest"));
  }, []);

  const requests = useQuery(
    api.bookingRequests.listByGuest,
    userId ? { guestUserId: userId } : "skip"
  );

  const nights = (checkIn: string, checkOut: string) =>
    Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));

  if (!userId) return null;

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          My Booking Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!requests ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <p className="text-muted-foreground text-sm">No booking requests yet. Use the button above to request a booking.</p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req._id} className="rounded-lg border border-border bg-background/50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {req.checkInDate} → {req.checkOutDate}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({nights(req.checkInDate, req.checkOutDate)} nights)
                      </span>
                    </div>
                    {req.roomPreference && (
                      <div className="text-sm text-muted-foreground">Room: {req.roomPreference}</div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {req.adults} adult{req.adults !== 1 ? "s" : ""}
                      {req.children ? `, ${req.children} child${req.children !== 1 ? "ren" : ""}` : ""}
                    </div>
                    {req.assignedRoom && (
                      <div className="text-sm text-green-400 font-medium">Assigned Room: {req.assignedRoom}</div>
                    )}
                    {req.specialRequests && (
                      <div className="text-xs text-muted-foreground italic">"{req.specialRequests}"</div>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs shrink-0 ${statusColor(req.status)}`}>
                    {req.status}
                  </Badge>
                </div>
                {req.status === "Approved" && (
                  <div className="mt-2 text-xs text-green-400 bg-green-400/10 rounded px-2 py-1">
                    ✓ Your booking has been confirmed by the Front Desk!
                  </div>
                )}
                {req.status === "Rejected" && (
                  <div className="mt-2 text-xs text-red-400 bg-red-400/10 rounded px-2 py-1">
                    ✗ This request was not available. Please try different dates.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
