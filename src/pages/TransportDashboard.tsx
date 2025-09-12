import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Download, Filter, Clock, CheckCircle, Users } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";

const tripsTrend = [
  { time: "08:00", scheduled: 8, completed: 6 },
  { time: "10:00", scheduled: 10, completed: 9 },
  { time: "12:00", scheduled: 12, completed: 11 },
  { time: "14:00", scheduled: 9, completed: 9 },
  { time: "16:00", scheduled: 11, completed: 10 },
  { time: "18:00", scheduled: 6, completed: 5 },
];

export default function TransportDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transport</h1>
            <p className="text-muted-foreground">Trips, fleet utilization, and punctuality.</p>
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
          <KPICard title="Scheduled Trips" value="56" change={{ value: 5.4, period: "yesterday" }} trend="up" icon={<Car className="h-4 w-4" />} />
          <KPICard title="Completed" value="51" change={{ value: 7.1, period: "yesterday" }} trend="up" icon={<CheckCircle className="h-4 w-4" />} />
          <KPICard title="On-Time Rate" value="94%" change={{ value: 2.8, period: "last week" }} trend="up" icon={<Clock className="h-4 w-4" />} />
          <KPICard title="Passengers Moved" value="162" change={{ value: 9.6, period: "yesterday" }} trend="up" icon={<Users className="h-4 w-4" />} />
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Trips Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tripsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="scheduled" stroke="#0088ff" strokeWidth={3} dot={{ fill: "#0088ff", strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="completed" stroke="#00ff88" strokeWidth={3} dot={{ fill: "#00ff88", strokeWidth: 2, r: 4 }} />
              </LineChart>
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