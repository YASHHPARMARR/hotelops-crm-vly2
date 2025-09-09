import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Brush, Clock, Download, Filter, CheckCheck } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

const roomStatusData = [
  { name: "Vacant Clean", value: 38, color: "#0088ff" },
  { name: "Vacant Dirty", value: 12, color: "#ff0080" },
  { name: "Occupied Clean", value: 46, color: "#00ff88" },
  { name: "Occupied Dirty", value: 6, color: "#ff4444" },
];

const tasksData = [
  { staff: "Ana", completed: 14 },
  { staff: "Luis", completed: 12 },
  { staff: "Maya", completed: 16 },
  { staff: "Ivy", completed: 10 },
];

export default function HousekeepingDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Housekeeping</h1>
            <p className="text-muted-foreground">Room cleanliness and task operations overview.</p>
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
          <KPICard title="Open Tasks" value="28" change={{ value: -7.1, period: "yesterday" }} trend="up" icon={<Brush className="h-4 w-4" />} />
          <KPICard title="Avg Turnaround" value="21m" change={{ value: -5.6, period: "last week" }} trend="up" icon={<Clock className="h-4 w-4" />} />
          <KPICard title="Rooms Ready" value="84" change={{ value: 3.4, period: "yesterday" }} trend="up" icon={<Bed className="h-4 w-4" />} />
          <KPICard title="Inspections Passed" value="96%" change={{ value: 1.8, period: "last week" }} trend="up" icon={<CheckCheck className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Room Status Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={roomStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {roomStatusData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brush className="h-5 w-5 text-primary" />
                Tasks per Staff (Today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="staff" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Bar dataKey="completed" fill="#00ff88" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}