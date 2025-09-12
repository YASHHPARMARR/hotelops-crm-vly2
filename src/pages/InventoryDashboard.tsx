import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Download, Filter, AlertTriangle, DollarSign, Truck, MessageSquare } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatPanel } from "@/components/ChatPanel";

const reorder = [
  { item: "Towels", stock: 120, min: 150 },
  { item: "Soap", stock: 240, min: 300 },
  { item: "Bottled Water", stock: 80, min: 120 },
  { item: "Sheets", stock: 90, min: 120 },
];

export default function InventoryDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Stock levels, purchase orders, and suppliers.</p>
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
          <KPICard title="Active Items" value="1,246" change={{ value: 3.0, period: "last month" }} trend="up" icon={<Package className="h-4 w-4" />} />
          <KPICard title="Reorder Alerts" value="14" change={{ value: -2.1, period: "yesterday" }} trend="up" icon={<AlertTriangle className="h-4 w-4" />} />
          <KPICard title="Open POs" value="9" change={{ value: 1.2, period: "yesterday" }} trend="down" icon={<Truck className="h-4 w-4" />} />
          <KPICard title="Spend (Mtd)" value="$12,480" change={{ value: 7.5, period: "last month" }} trend="up" icon={<DollarSign className="h-4 w-4" />} />
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Reorder Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reorder}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="item" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                <Bar dataKey="min" fill="#ff0080" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stock" fill="#00ff88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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