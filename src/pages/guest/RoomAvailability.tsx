import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupabase } from "@/lib/supabaseClient";
import { BedDouble, Loader2 } from "lucide-react";

interface Room {
  id: string;
  number: string;
  type?: string;
  status: string;
  floor?: number;
}

const ROOM_PRICES: Record<string, number> = {
  Standard: 120,
  Deluxe: 180,
  Suite: 280,
  Presidential: 500,
};

export function RoomAvailability() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const s = getSupabase();
      if (!s) { setLoading(false); return; }
      try {
        const { data, error } = await s
          .from("rooms")
          .select("id, number, type, status, floor")
          .in("status", ["Available", "Vacant"])
          .order("number", { ascending: true })
          .limit(20);
        if (!cancelled) {
          setRooms(data || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Card className="gradient-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BedDouble className="h-5 w-5 text-primary" />
          Available Rooms
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <p className="text-muted-foreground text-sm">No rooms currently available. Please check back later or contact the front desk.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {rooms.map(room => (
              <div key={room.id} className="rounded-lg border border-border bg-background/50 p-3 text-center space-y-1">
                <div className="text-lg font-bold text-foreground">{room.number}</div>
                <div className="text-xs text-muted-foreground">{room.type || "Standard"}</div>
                {room.floor && <div className="text-xs text-muted-foreground">Floor {room.floor}</div>}
                <div className="text-xs font-semibold text-primary">
                  ${ROOM_PRICES[room.type || "Standard"] || 120}/night
                </div>
                <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">
                  {room.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
