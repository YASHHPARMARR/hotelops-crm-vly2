import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Download, Filter, DollarSign, Timer, ShoppingCart } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";

const ordersTrend = [
  { time: "10:00", orders: 22, revenue: 180 },
  { time: "12:00", orders: 54, revenue: 520 },
  { time: "14:00", orders: 48, revenue: 430 },
  { time: "16:00", orders: 30, revenue: 270 },
  { time: "18:00", orders: 64, revenue: 680 },
  { time: "20:00", orders: 58, revenue: 620 },
];

const menuPerformance = [
  { item: "Pasta", qty: 86 },
  { item: "Burger", qty: 110 },
  { item: "Salad", qty: 67 },
  { item: "Steak", qty: 52 },
  { item: "Soup", qty: 44 },
];

export default function RestaurantDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Restaurant</h1>
            <p className="text-muted-foreground">Orders, revenue, and menu performance.</p>
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
          <KPICard title="Orders (Today)" value="276" change={{ value: 12.4, period: "yesterday" }} trend="up" icon={<ShoppingCart className="h-4 w-4" />} />
          <KPICard title="Revenue (Today)" value="$2,700" change={{ value: 8.6, period: "yesterday" }} trend="up" icon={<DollarSign className="h-4 w-4" />} />
          <KPICard title="Avg Prep Time" value="14m" change={{ value: -6.0, period: "last week" }} trend="up" icon={<Timer className="h-4 w-4" />} />
          <KPICard title="Tables Occupied" value="36/48" change={{ value: 4.3, period: "last hour" }} trend="up" icon={<UtensilsCrossed className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Orders & Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="orders" stroke="#00ff88" strokeWidth={3} dot={{ fill: "#00ff88", strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#ff0080" strokeWidth={3} dot={{ fill: "#ff0080", strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Top Menu Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={menuPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="item" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Bar dataKey="qty" fill="#0088ff" radius={[4, 4, 0, 0]} />
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