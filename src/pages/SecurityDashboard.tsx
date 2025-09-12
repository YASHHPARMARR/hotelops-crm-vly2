import { AdminShell } from "@/components/layouts/AdminShell";
import { KPICard } from "@/components/ui/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, Download, Filter, BadgeCheck, Camera, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatPanel } from "@/components/ChatPanel";

const incidents = [
  { title: "Noise complaint - Room 512", severity: "Low", time: "10m ago" },
  { title: "Unauthorized access attempt - Side gate", severity: "Medium", time: "30m ago" },
  { title: "Suspicious package reported - Lobby", severity: "High", time: "1h ago" },
];

export default function SecurityDashboard() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Security</h1>
            <p className="text-muted-foreground">Incidents, badges, and surveillance monitoring.</p>
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
          <KPICard title="Open Incidents" value="6" change={{ value: -14.2, period: "last week" }} trend="up" icon={<AlertTriangle className="h-4 w-4" />} />
          <KPICard title="Resolved Today" value="12" change={{ value: 8.1, period: "yesterday" }} trend="up" icon={<Shield className="h-4 w-4" />} />
          <KPICard title="Active Badges" value="42" change={{ value: 2.3, period: "yesterday" }} trend="up" icon={<BadgeCheck className="h-4 w-4" />} />
          <KPICard title="Cameras Online" value="64/64" change={{ value: 0.0, period: "today" }} trend="neutral" icon={<Camera className="h-4 w-4" />} />
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {incidents.map((i, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }} className="p-3 rounded-lg bg-background/50">
                  <div className="flex items-center justify-between">
                    <div className="text-foreground font-medium">{i.title}</div>
                    <div className="text-xs text-muted-foreground">{i.time}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Severity: {i.severity}</div>
                </motion.div>
              ))}
            </div>
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