import { useEffect, useMemo, useState } from "react";
import { getSupabase, normalizeSupabaseError } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Room = {
  id: string;
  room_number: string | null;
  room_type: "Deluxe" | "Suite" | "Standard" | string | null;
  status: "available" | "booked" | "maintenance" | string | null;
  price: number | null;
  created_at?: string | null;
};

export function FilteredRooms() {
  const supabase = getSupabase();
  const [type, setType] = useState<string>("Deluxe");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Array<Room>>([]);

  const priceRange = useMemo(() => {
    const min = minPrice.trim() === "" ? undefined : Number(minPrice);
    const max = maxPrice.trim() === "" ? undefined : Number(maxPrice);
    return { min, max };
  }, [minPrice, maxPrice]);

  const fetchRooms = async () => {
    if (!supabase) {
      toast.error("Supabase not configured", {
        description: "Go to Admin → Settings and add your Supabase URL and Anon key.",
      });
      return;
    }
    setLoading(true);
    try {
      let query = supabase.from("rooms").select("*").eq("room_type", type).eq("status", "available");

      if (priceRange.min !== undefined) {
        query = query.gte("price", priceRange.min);
      }
      if (priceRange.max !== undefined) {
        query = query.lte("price", priceRange.max);
      }

      // Order by created_at when available, fallback to room_number
      const { data, error } = await query.order("created_at", { ascending: false }).order("room_number", { ascending: true });
      if (error) {
        throw error;
      }
      setRooms(Array.isArray(data) ? (data as Array<Room>) : []);
    } catch (e: any) {
      toast.error("Failed to load rooms", { description: normalizeSupabaseError(e) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, priceRange.min, priceRange.max]);

  // Add a background refresh every 30 seconds, independent of filter changes
  useEffect(() => {
    const id = setInterval(() => {
      fetchRooms();
    }, 30000); // 30 seconds
    return () => clearInterval(id);
  }, [type, priceRange.min, priceRange.max]); // refresh for current filters

  return (
    <Card className="gradient-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Available Rooms (Filtered)</CardTitle>
          {supabase ? (
            <Badge variant="outline" className="text-xs">Supabase</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Not Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Room Type</div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Deluxe">Deluxe</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Min Price</div>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 100"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Max Price</div>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="e.g. 400"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full neon-glow"
              onClick={fetchRooms}
              disabled={loading}
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No rooms match the filters.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Room #</th>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id} className="border-b border-border/50">
                    <td className="p-3">{r.room_number ?? "-"}</td>
                    <td className="p-3">{r.room_type ?? "-"}</td>
                    <td className="p-3">{r.status ?? "-"}</td>
                    <td className="p-3">{r.price ?? "-"}</td>
                    <td className="p-3">{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}