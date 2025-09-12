import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Bed,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
} from "lucide-react";

// Mock data
const revenueData = [
  { month: "Jan", revenue: 45000, occupancy: 75 },
  { month: "Feb", revenue: 52000, occupancy: 82 },
  { month: "Mar", revenue: 48000, occupancy: 78 },
  { month: "Apr", revenue: 61000, occupancy: 85 },
  { month: "May", revenue: 55000, occupancy: 80 },
  { month: "Jun", revenue: 67000, occupancy: 88 },
];

const roomStatusData = [
  { name: "Occupied", value: 45, color: "#00ff88" },
  { name: "Vacant Clean", value: 15, color: "#0088ff" },
  { name: "Vacant Dirty", value: 8, color: "#ff0080" },
  { name: "Out of Order", value: 2, color: "#ff4444" },
];

const departmentPerformance = [
  { department: "Front Desk", score: 92, tasks: 45 },
  { department: "Housekeeping", score: 88, tasks: 67 },
  { department: "Restaurant", score: 94, tasks: 23 },
  { department: "Maintenance", score: 85, tasks: 12 },
  { department: "Security", score: 96, tasks: 8 },
];

// Add helper to pull local storage data and compute metrics
const getLocal = <T,>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const reservationsLocal = getLocal<Array<Record<string, any>>>("reservations", []);
const bookingsLocal = getLocal<Array<Record<string, any>>>("bookings", []);
const reservations = [...reservationsLocal, ...bookingsLocal];
const rooms = getLocal<Array<Record<string, any>>>("rooms", []);
const staff = getLocal<Array<Record<string, any>>>("admin_staff", []);
const totalBookings = reservations.length;
const emptyRooms = rooms.filter((r) => String(r.status || "") === "Vacant Clean" || String(r.status || "") === "Vacant").length;
const currentGuests = reservations.filter((r) => {
  const s = String(r.status || r.bookingStatus || "");
  return s === "CheckedIn" || s === "Checked-in";
}).length;
const currentRevenue = reservations
  .filter((r) => {
    const pay = String(r.paymentStatus || "");
    return pay === "Paid" || pay === "Partially Paid";
  })
  .reduce((sum, r) => {
    const paid = Number(r.amountPaid ?? 0);
    const curr = Number(r.balance ?? 0);
    // Count paid; balance optionally adds to lifetime on export elsewhere
    return sum + (isNaN(paid) ? 0 : paid);
  }, 0);
const lifetimeRevenue = getLocal<number>("lifetime_revenue", 328500) + currentRevenue;
const totalExpenses = getLocal<number>("total_expenses", 125000);
const totalProfit = lifetimeRevenue - totalExpenses;
const totalTax = Math.round(lifetimeRevenue * 0.08);
const staffCount = staff.length;

export default function AdminDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening at your hotel today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" className="neon-glow">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Occupancy Rate"
            value="85.2%"
            change={{ value: 12.5, period: "last month" }}
            trend="up"
            icon={<Bed className="h-4 w-4" />}
          />
          <KPICard
            title="Revenue (YTD)"
            value="$328,500"
            change={{ value: 8.2, period: "last year" }}
            trend="up"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <KPICard
            title="ADR"
            value="$185"
            change={{ value: -2.1, period: "last month" }}
            trend="down"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <KPICard
            title="RevPAR"
            value="$157"
            change={{ value: 15.3, period: "last month" }}
            trend="up"
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#00ff88"
                    strokeWidth={3}
                    dot={{ fill: "#00ff88", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Room Status */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Room Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {roomStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operational Metrics (live from local storage) */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Operational Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard title="Total Bookings" value={String(totalBookings)} change={{ value: 0, period: "" }} trend="up" icon={<Calendar className="h-4 w-4" />} />
              <KPICard title="Empty Rooms" value={String(emptyRooms)} change={{ value: 0, period: "" }} trend="up" icon={<Bed className="h-4 w-4" />} />
              <KPICard title="Current Guests" value={String(currentGuests)} change={{ value: 0, period: "" }} trend="up" icon={<Users className="h-4 w-4" />} />
              <KPICard title="Revenue (Current)" value={`$${currentRevenue.toLocaleString()}`} change={{ value: 0, period: "" }} trend="up" icon={<DollarSign className="h-4 w-4" />} />
              <KPICard title="Revenue (Lifetime)" value={`$${lifetimeRevenue.toLocaleString()}`} change={{ value: 0, period: "" }} trend="up" icon={<DollarSign className="h-4 w-4" />} />
              <KPICard title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} change={{ value: 0, period: "" }} trend="down" icon={<DollarSign className="h-4 w-4" />} />
              <KPICard title="Total Profit" value={`$${totalProfit.toLocaleString()}`} change={{ value: 0, period: "" }} trend={totalProfit >= 0 ? "up" : "down"} icon={<TrendingUp className="h-4 w-4" />} />
              <KPICard title="Tax Paid (Est.)" value={`$${totalTax.toLocaleString()}`} change={{ value: 0, period: "" }} trend="down" icon={<DollarSign className="h-4 w-4" />} />
              <KPICard title="Staff Members" value={String(staffCount)} change={{ value: 0, period: "" }} trend="up" icon={<Users className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>

        {/* Department Performance & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Performance */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Department Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="department" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="score" fill="#0088ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    icon: <CheckCircle className="h-4 w-4 text-green-400" />,
                    title: "Room 205 checked out",
                    time: "2 minutes ago",
                    user: "Sarah Johnson",
                  },
                  {
                    icon: <Calendar className="h-4 w-4 text-blue-400" />,
                    title: "New reservation created",
                    time: "15 minutes ago",
                    user: "Mike Chen",
                  },
                  {
                    icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
                    title: "Maintenance request - Room 312",
                    time: "1 hour ago",
                    user: "Lisa Park",
                  },
                  {
                    icon: <Users className="h-4 w-4 text-purple-400" />,
                    title: "VIP guest arrival",
                    time: "2 hours ago",
                    user: "David Wilson",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                  >
                    {activity.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "New Reservation", icon: Calendar, color: "text-blue-400" },
                { name: "Check In Guest", icon: Users, color: "text-green-400" },
                { name: "Room Status", icon: Bed, color: "text-purple-400" },
                { name: "Generate Report", icon: Download, color: "text-orange-400" },
              ].map((action, index) => (
                <motion.div
                  key={action.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2 border-border/50 hover:border-primary/50"
                  >
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <span className="text-sm">{action.name}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}