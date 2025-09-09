import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Download, Filter, LogIn, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";

const arrivalsDepartures = [
  { hour: "08:00", arrivals: 8, departures: 3 },
  { hour: "10:00", arrivals: 12, departures: 6 },
  { hour: "12:00", arrivals: 18, departures: 11 },
  { hour: "14:00", arrivals: 14, departures: 15 },
  { hour: "16:00", arrivals: 10, departures: 8 },
  { hour: "18:00", arrivals: 6, departures: 5 },
];

const queueData = [
  { counter: "FD-1", avgWait: 4 },
  { counter: "FD-2", avgWait: 6 },
  { counter: "FD-3", avgWait: 5 },
  { counter: "VIP", avgWait: 2 },
];

export default function FrontDeskDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Front Desk</h1>
            <p className="text-muted-foreground">Monitor arrivals, departures, and lobby performance.</p>
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
          <KPICard title="Today's Arrivals" value="82" change={{ value: 6.4, period: "yesterday" }} trend="up" icon={<LogIn className="h-4 w-4" />} />
          <KPICard title="Today's Departures" value="76" change={{ value: -3.1, period: "yesterday" }} trend="down" icon={<Calendar className="h-4 w-4" />} />
          <KPICard title="Avg Check-in Time" value="4m 30s" change={{ value: -8.3, period: "last week" }} trend="up" icon={<Clock className="h-4 w-4" />} />
          <KPICard title="VIP Arrivals" value="7" change={{ value: 2.5, period: "yesterday" }} trend="up" icon={<Users className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Arrivals vs Departures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={arrivalsDepartures}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="arrivals" stroke="#00ff88" strokeWidth={3} dot={{ fill: "#00ff88", strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="departures" stroke="#0088ff" strokeWidth={3} dot={{ fill: "#0088ff", strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Counters Avg Wait Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={queueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="counter" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }} />
                  <Bar dataKey="avgWait" fill="#ff0080" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
