import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Plus, Wrench, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Ticket {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: string;
  description?: string;
  created_at?: string;
}

const CATEGORIES = ["Plumbing", "Electrical", "HVAC", "Furniture", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Pending", "In Progress", "Completed"];

function priorityColor(p: string) {
  if (p === "Urgent") return "text-red-400 border-red-400/30";
  if (p === "High") return "text-orange-400 border-orange-400/30";
  if (p === "Medium") return "text-yellow-400 border-yellow-400/30";
  return "text-muted-foreground border-border";
}

function statusColor(s: string) {
  if (s === "Completed") return "text-green-400 border-green-400/30";
  if (s === "In Progress") return "text-blue-400 border-blue-400/30";
  return "text-yellow-400 border-yellow-400/30";
}

export default function MaintenanceTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "",
    status: "Pending",
    assigned_to: "",
    description: "",
  });

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    setLoading(true);
    const s = getSupabase();
    if (!s) { setLoading(false); return; }
    try {
      const { data, error } = await s
        .from("maintenance_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      toast.error("Failed to load tickets: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.category || !form.priority) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const s = getSupabase();
    if (!s) { toast.error("Not connected to database"); setSubmitting(false); return; }
    try {
      const { error } = await s.from("maintenance_tickets").insert({
        title: form.title,
        category: form.category,
        priority: form.priority,
        status: form.status,
        assigned_to: form.assigned_to || null,
        description: form.description || null,
      });
      if (error) throw error;
      toast.success("Ticket created successfully!");
      setOpen(false);
      setForm({ title: "", category: "", priority: "", status: "Pending", assigned_to: "", description: "" });
      loadTickets();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    const s = getSupabase();
    if (!s) return;
    try {
      const { error } = await s.from("maintenance_tickets").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success(`Ticket marked as ${status}`);
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    }
  }

  const filtered = filterStatus === "all" ? tickets : tickets.filter(t => t.status === filterStatus);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Maintenance Tickets</h1>
            <p className="text-muted-foreground">Create, assign, and track repair tickets.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadTickets}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Create Maintenance Ticket
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 mt-2">
                  <div className="space-y-1">
                    <Label>Title *</Label>
                    <Input
                      placeholder="e.g., Leaking pipe in Room 214"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Category *</Label>
                      <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Priority *</Label>
                      <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Assign To</Label>
                      <Input
                        placeholder="Staff name..."
                        value={form.assigned_to}
                        onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the issue..."
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 neon-glow" disabled={submitting}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Ticket
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUSES].map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? "default" : "outline"}
              onClick={() => setFilterStatus(s)}
              className="capitalize"
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Tickets ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm">No tickets found. Create one using the button above.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map(ticket => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-background/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">{ticket.title}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                          <Badge variant="outline" className={`text-xs ${priorityColor(ticket.priority)}`}>{ticket.priority}</Badge>
                          {ticket.assigned_to && (
                            <span className="text-xs text-muted-foreground">→ {ticket.assigned_to}</span>
                          )}
                        </div>
                        {ticket.description && (
                          <div className="text-xs text-muted-foreground">{ticket.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${statusColor(ticket.status)}`}>
                          {ticket.status}
                        </Badge>
                        {ticket.status === "Pending" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(ticket.id, "In Progress")}>
                            Start
                          </Button>
                        )}
                        {ticket.status === "In Progress" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(ticket.id, "Completed")}>
                            Complete
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
    </AdminShell>
  );
}