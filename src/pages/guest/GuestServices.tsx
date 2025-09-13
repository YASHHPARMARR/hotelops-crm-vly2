import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brush,
  Bath,
  UtensilsCrossed,
  Coffee,
  Wifi,
  Shirt,
  ConciergeBell,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";

type ServiceItem = {
  id: string;
  label: string;
  description: string;
  eta: string;
  icon: ComponentType<any>;
};

type RequestRow = {
  id: string;
  request: string;
  eta: string;
  status: "Requested" | "In Progress" | "Completed" | "Cancelled";
  requestedAt: number;
};

const CATALOG: Array<ServiceItem> = [
  {
    id: "svc_housekeeping",
    label: "Housekeeping",
    description: "Room refresh, turn-down, trash removal",
    eta: "30 min",
    icon: Brush,
  },
  {
    id: "svc_laundry",
    label: "Laundry Pickup",
    description: "Pickup and return of clothing items",
    eta: "2–4 hrs",
    icon: Shirt,
  },
  {
    id: "svc_dining",
    label: "In‑Room Dining",
    description: "Order food and beverages to your room",
    eta: "25–45 min",
    icon: UtensilsCrossed,
  },
  {
    id: "svc_spa",
    label: "Spa & Wellness",
    description: "Massage, aromatherapy, and wellness",
    eta: "Book slot",
    icon: Bath,
  },
  {
    id: "svc_coffee",
    label: "Coffee / Tea",
    description: "Freshly brewed coffee or tea service",
    eta: "10–15 min",
    icon: Coffee,
  },
  {
    id: "svc_wifi",
    label: "Wi‑Fi Assistance",
    description: "Connectivity help and device pairing",
    eta: "Instant",
    icon: Wifi,
  },
  {
    id: "svc_wakeup",
    label: "Wake‑up Call",
    description: "Set a call/alarm for your schedule",
    eta: "Scheduled",
    icon: Clock,
  },
  {
    id: "svc_concierge",
    label: "Concierge",
    description: "Reservations, transport, local tips",
    eta: "As requested",
    icon: ConciergeBell,
  },
  {
    id: "svc_towels",
    label: "Extra Towels",
    description: "Plush towels delivered to your room",
    eta: "10–20 min",
    icon: Bath,
  },
];

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}
function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const STORAGE_KEY = "guest_services";

export default function GuestServices() {
  const [requests, setRequests] = useState<RequestRow[]>(() => {
    const existing = loadLocal<RequestRow[]>(STORAGE_KEY, []);
    if (existing.length > 0) return existing;
    const seed: RequestRow[] = [
      { id: "gs1", request: "Laundry Pickup", eta: "6 pm", status: "Requested", requestedAt: Date.now() - 1000 * 60 * 60 },
      { id: "gs2", request: "Extra Pillows", eta: "15 min", status: "In Progress", requestedAt: Date.now() - 1000 * 60 * 30 },
    ];
    saveLocal(STORAGE_KEY, seed);
    return seed;
  });
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    saveLocal(STORAGE_KEY, requests);
  }, [requests]);

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "completed") return requests.filter((r) => r.status === "Completed");
    return requests.filter((r) => r.status === "Requested" || r.status === "In Progress");
  }, [requests, filter]);

  function addRequest(svc: ServiceItem) {
    const row: RequestRow = {
      id: crypto.randomUUID(),
      request: svc.label,
      eta: svc.eta,
      status: svc.id === "svc_wifi" ? "In Progress" : "Requested",
      requestedAt: Date.now(),
    };
    setRequests((prev) => [row, ...prev]);
    toast.success(`${svc.label} requested`);
  }

  function markComplete(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Completed" } : r)));
    toast.success("Marked as completed");
  }

  function cancel(id: string) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r)));
    toast("Cancelled");
  }

  function statusBadgeClass(s: RequestRow["status"]) {
    switch (s) {
      case "Requested":
        return "bg-blue-500/15 text-blue-300";
      case "In Progress":
        return "bg-amber-500/15 text-amber-300";
      case "Completed":
        return "bg-emerald-500/15 text-emerald-300";
      case "Cancelled":
        return "bg-rose-500/15 text-rose-300";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl gradient-card border border-border/60"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 blur-3xl rounded-full" />
          </div>
          <div className="relative p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Premium Guest Services
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                How can we make your stay more comfortable?
              </h1>
              <p className="text-muted-foreground">
                Request housekeeping, dining, laundry, and more — all from your suite.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary">24/7 Concierge</Badge>
                <Badge variant="secondary">Fast Service</Badge>
                <Badge variant="secondary">Contactless</Badge>
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1400&auto=format&fit=crop"
              alt="Hotel Service"
              className="w-full max-w-[420px] rounded-xl object-cover shadow-lg"
            />
          </div>
        </motion.div>

        {/* Service Catalog */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Service Catalog</h2>
            <div className="text-sm text-muted-foreground">Tap to request instantly</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {CATALOG.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileHover={{ y: -4, rotateX: 1.5, rotateY: -1 }}
                className="perspective-1000"
              >
                <Card className="gradient-card border-border/60 preserve-3d h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <svc.icon className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-semibold text-foreground">{svc.label}</div>
                        <div className="text-sm text-muted-foreground">{svc.description}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        ETA: {svc.eta}
                      </Badge>
                      <Button size="sm" className="neon-glow" onClick={() => addRequest(svc)}>
                        Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">My Requests</h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === "active" ? "default" : "outline"}
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button
                size="sm"
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
              >
                Completed
              </Button>
            </div>
          </div>

          <Card className="gradient-card border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">No requests yet.</div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((r, idx) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-foreground">{r.request}</div>
                          <Badge className={statusBadgeClass(r.status)}>{r.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ETA: {r.eta} • {new Date(r.requestedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status !== "Completed" && r.status !== "Cancelled" && (
                          <Button size="sm" variant="outline" onClick={() => markComplete(r.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                        )}
                        {r.status !== "Cancelled" && r.status !== "Completed" && (
                          <Button size="sm" variant="destructive" onClick={() => cancel(r.id)}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
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