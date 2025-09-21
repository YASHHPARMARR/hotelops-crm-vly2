import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { getSupabase, getSupabaseUserEmail } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function GuestDining() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dining</h1>
          <p className="text-muted-foreground">Order food and view menus.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Dining Options</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Convex-backed Dining form + list */}
            <DiningManager />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function DiningManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [form, setForm] = useState({
    roomNumber: "",
    method: "Room Delivery",
    order: "",
    total: 0,
    status: "Placed",
  });

  async function loadOrders() {
    try {
      setLoading(true);
      const s = getSupabase();
      const email = await getSupabaseUserEmail();
      if (!s || !email) {
        setOrders([]);
        return;
      }
      const { data, error } = await s
        .from("guest_dining_orders")
        .select("*")
        .eq("user_email", email)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Map to UI shape
      const mapped = (data || []).map((r: any) => ({
        _id: r.id,
        user_email: r.user_email,
        roomNumber: r.room_number,
        method: r.method,
        order: r.order_text,
        total: r.total,
        status: r.status,
        createdAt: r.created_at,
      }));
      setOrders(mapped);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load dining orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function createOrder(args: {
    roomNumber: string;
    method: string;
    order: string;
    total: number;
    status?: string;
  }) {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const { error } = await s.from("guest_dining_orders").insert({
      user_email: email,
      room_number: args.roomNumber,
      method: args.method,
      order_text: args.order,
      total: args.total,
      status: args.status ?? "Placed",
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    await loadOrders();
  }

  async function updateStatus(args: { orderId: string; status: string }) {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const { error } = await s
      .from("guest_dining_orders")
      .update({ status: args.status })
      .eq("id", args.orderId)
      .eq("user_email", email);
    if (error) throw error;
    await loadOrders();
  }

  async function deleteOrder(args: { orderId: string }) {
    const s = getSupabase();
    const email = await getSupabaseUserEmail();
    if (!s || !email) throw new Error("Supabase not connected or no user");
    const { error } = await s
      .from("guest_dining_orders")
      .delete()
      .eq("id", args.orderId)
      .eq("user_email", email);
    if (error) throw error;
    await loadOrders();
  }

  async function add() {
    try {
      if (!form.roomNumber || !form.order || !form.method) {
        toast.error("Please fill all required fields");
        return;
      }
      if (Number(form.total) <= 0) {
        toast.error("Total must be greater than 0");
        return;
      }
      await createOrder({
        roomNumber: form.roomNumber,
        method: form.method,
        order: form.order,
        total: Number(form.total),
        status: form.status,
      });
      toast.success("Order placed");
      setForm((f) => ({ ...f, order: "", total: 0 }));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to place order");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">Room #</div>
          <Input
            value={form.roomNumber}
            onChange={(e) => setForm((f) => ({ ...f, roomNumber: e.target.value }))}
            placeholder="1208"
          />
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">Method</div>
          <Select
            value={form.method}
            onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dine-in">Dine-in</SelectItem>
              <SelectItem value="Pickup">Pickup</SelectItem>
              <SelectItem value="Room Delivery">Room Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 grid gap-2">
          <div className="text-sm text-muted-foreground">Order</div>
          <Textarea
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            placeholder="Club Sandwich, Orange Juice"
            rows={3}
          />
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">Total ($)</div>
          <Input
            type="number"
            min={0}
            value={String(form.total)}
            onChange={(e) => setForm((f) => ({ ...f, total: Number(e.target.value || 0) }))}
            placeholder="18.50"
          />
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-muted-foreground">Status</div>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Placed">Placed</SelectItem>
              <SelectItem value="Preparing">Preparing</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <Button className="neon-glow" onClick={add}>Place Order</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60">
            <tr className="text-left">
              <th className="p-3">Room</th>
              <th className="p-3">Method</th>
              <th className="p-3">Order</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o._id} className="border-t border-border/60">
                <td className="p-3">{o.roomNumber}</td>
                <td className="p-3">{o.method}</td>
                <td className="p-3">{o.order}</td>
                <td className="p-3">${o.total}</td>
                <td className="p-3">
                  <Select
                    value={o.status}
                    onValueChange={async (v) => {
                      try {
                        await updateStatus({ orderId: o._id, status: v });
                        toast.success("Status updated");
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to update");
                      }
                    }}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Placed">Placed</SelectItem>
                      <SelectItem value="Preparing">Preparing</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await deleteOrder({ orderId: o._id });
                        toast.success("Deleted");
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to delete");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className="p-5 text-center text-muted-foreground" colSpan={6}>
                  No dining orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}