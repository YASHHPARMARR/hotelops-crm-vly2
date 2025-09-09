import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Download, Filter, AlertTriangle, CheckCircle, Timer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const backlog = [
  { category: "Plumbing", tickets: 8 },
  { category: "Electrical", tickets: 12 },
  { category: "HVAC", tickets: 4 },
  { category: "Furniture", tickets: 6 },
  { category: "Other", tickets: 5 },
];

export default function MaintenanceDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maintenance</h1>
            <p className="text-muted-foreground">Tickets, categories, and SLA performance.</p>
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
          <KPICard title="Open Tickets" value="35" change={{ value: -4.1, period: "yesterday" }} trend="up" icon={<AlertTriangle className="h-4 w-4" />} />
          <KPICard title="Completed Today" value="22" change={{ value: 12.6, period: "yesterday" }} trend="up" icon={<CheckCircle className="h-4 w-4" />} />
          <KPICard title="SLA Compliance" value="92%" change={{ value: 1.4, period: "last week" }} trend="up" icon={<Wrench className="h-4 w-4" />} />
          <KPICard title="Avg Resolution" value="3h 12m" change={{ value: -6.2, period: "last week" }} trend="up" icon={<Timer className="h-4 w-4" />} />
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Backlog by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={backlog}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="category" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                <Bar dataKey="tickets" fill="#ff0080" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
