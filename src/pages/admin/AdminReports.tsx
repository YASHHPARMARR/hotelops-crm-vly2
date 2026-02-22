import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, FileText, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getSupabaseUserEmail } from "@/lib/supabaseClient";

const TARGET_ROLES = [
  { value: "front_desk", label: "Front Desk" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "restaurant", label: "Restaurant" },
  { value: "security", label: "Security" },
  { value: "transport", label: "Transport" },
  { value: "inventory", label: "Inventory" },
];

function statusColor(s: string) {
  if (s === "Completed") return "text-green-400 border-green-400/30";
  if (s === "Acknowledged") return "text-blue-400 border-blue-400/30";
  return "text-yellow-400 border-yellow-400/30";
}

export default function AdminReports() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ targetRole: "", subject: "", message: "" });

  const reportRequests = useQuery(api.reportRequests.listAll);
  const sendRequest = useMutation(api.reportRequests.sendRequest);
  const updateStatus = useMutation(api.reportRequests.updateStatus);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.targetRole || !form.subject || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const email = await getSupabaseUserEmail();
      await sendRequest({
        fromUserId: email || "admin",
        fromUserName: email || "Admin",
        targetRole: form.targetRole,
        subject: form.subject,
        message: form.message,
      });
      toast.success("Report request sent successfully!");
      setOpen(false);
      setForm({ targetRole: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateStatus(requestId: any, status: string) {
    try {
      await updateStatus({ requestId, status });
      toast.success(`Status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Operational, financial, and audit reports.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow">
                <Send className="h-4 w-4 mr-2" />
                Send Report Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Report Request to Role
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSend} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label>Target Role *</Label>
                  <Select value={form.targetRole} onValueChange={v => setForm(f => ({ ...f, targetRole: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select department..." /></SelectTrigger>
                    <SelectContent>
                      {TARGET_ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Subject *</Label>
                  <Input
                    placeholder="e.g., Weekly occupancy report"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Message *</Label>
                  <Textarea
                    placeholder="Describe what report/data you need..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 neon-glow" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Send Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Report Requests ({reportRequests?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!reportRequests ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : reportRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No report requests yet. Use the button above to send one to a department.</p>
            ) : (
              <div className="space-y-3">
                {reportRequests.map(req => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-border bg-background/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">{req.subject}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            → {TARGET_ROLES.find(r => r.value === req.targetRole)?.label || req.targetRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">{req.message}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${statusColor(req.status)}`}>
                          {req.status}
                        </Badge>
                        {req.status === "Sent" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateStatus(req._id, "Acknowledged")}>
                            Acknowledge
                          </Button>
                        )}
                        {req.status === "Acknowledged" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateStatus(req._id, "Completed")}>
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