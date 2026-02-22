import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Plus, Trash2, UtensilsCrossed, Loader2, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: string;
}

interface TableRow {
  id: string;
  number: string;
  status: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  table: string;
  items: string;
  total: number;
  status: string;
  created_at?: string;
}

function statusColor(status: string) {
  if (status === "Served" || status === "Paid") return "text-green-400 border-green-400/30";
  if (status === "Ready") return "text-blue-400 border-blue-400/30";
  if (status === "Preparing") return "text-yellow-400 border-yellow-400/30";
  return "text-muted-foreground border-border";
}

export default function RestaurantOrders() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableRow[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New order form state
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState<string>("1");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const s = getSupabase();
    if (!s) { setLoading(false); return; }
    try {
      const [menuRes, tableRes, orderRes] = await Promise.all([
        s.from("restaurant_menu").select("*").eq("available", "Yes").order("category"),
        s.from("restaurant_tables").select("*").in("status", ["Vacant", "Available"]).order("tableNo"),
        s.from("restaurant_orders").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setMenuItems(menuRes.data || []);
      setTables(tableRes.data || []);
      setOrders(orderRes.data || []);
    } catch (err: any) {
      toast.error("Failed to load data: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  function addItem() {
    if (!selectedMenuItem) { toast.error("Select a menu item"); return; }
    const item = menuItems.find(m => m.id === selectedMenuItem);
    if (!item) return;
    const qty = parseInt(selectedQty) || 1;
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: qty }];
    });
    setSelectedMenuItem("");
    setSelectedQty("1");
  }

  function removeItem(menuItemId: string) {
    setOrderItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
  }

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function submitOrder() {
    if (!selectedTable) { toast.error("Select a table"); return; }
    if (orderItems.length === 0) { toast.error("Add at least one item"); return; }
    setSubmitting(true);
    const s = getSupabase();
    if (!s) { toast.error("Not connected"); setSubmitting(false); return; }
    try {
      const itemsSummary = orderItems.map(i => `${i.name} x${i.quantity}`).join(", ");
      const { error } = await s.from("restaurant_orders").insert({
        table: selectedTable,
        items: itemsSummary,
        total,
        status: "Placed",
      });
      if (error) throw error;
      toast.success("Order placed successfully!");
      setSelectedTable("");
      setOrderItems([]);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const s = getSupabase();
    if (!s) return;
    try {
      const { error } = await s.from("restaurant_orders").update({ status }).eq("id", orderId);
      if (error) throw error;
      toast.success(`Order marked as ${status}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    }
  }

  const categories = [...new Set(menuItems.map(m => m.category))];

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Restaurant Orders</h1>
          <p className="text-muted-foreground">Create and manage dining orders.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Order Form */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                New Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <Label>Select Table (Vacant)</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a vacant table..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tables.length === 0 ? (
                          <SelectItem value="none" disabled>No vacant tables</SelectItem>
                        ) : (
                          tables.map(t => (
                            <SelectItem key={t.id} value={t.number || t.id}>
                              Table {t.number} ({t.status})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Add Menu Items</Label>
                    <div className="flex gap-2">
                      <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <div key={cat}>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{cat}</div>
                              {menuItems.filter(m => m.category === cat).map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} — ${Number(item.price).toFixed(2)}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedQty} onValueChange={setSelectedQty}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(n => (
                            <SelectItem key={n} value={String(n)}>×{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" size="icon" onClick={addItem} className="shrink-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {orderItems.length > 0 && (
                    <div className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
                      {orderItems.map(item => (
                        <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.name} ×{item.quantity}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            <button onClick={() => removeItem(item.menuItemId)} className="text-muted-foreground hover:text-red-400">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-border pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full neon-glow"
                    onClick={submitOrder}
                    disabled={submitting || !selectedTable || orderItems.length === 0}
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UtensilsCrossed className="h-4 w-4 mr-2" />}
                    Place Order
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Active Orders */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No orders yet.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {orders.map(order => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-border bg-background/50 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground text-sm">Table {order.table}</div>
                          <div className="text-xs text-muted-foreground">{order.items}</div>
                          <div className="text-sm font-medium text-primary">${Number(order.total).toFixed(2)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className={`text-xs ${statusColor(order.status)}`}>
                            {order.status}
                          </Badge>
                          {order.status === "Placed" && (
                            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => updateOrderStatus(order.id, "Preparing")}>
                              Start
                            </Button>
                          )}
                          {order.status === "Preparing" && (
                            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => updateOrderStatus(order.id, "Ready")}>
                              Ready
                            </Button>
                          )}
                          {order.status === "Ready" && (
                            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => updateOrderStatus(order.id, "Served")}>
                              Served
                            </Button>
                          )}
                        </div>
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