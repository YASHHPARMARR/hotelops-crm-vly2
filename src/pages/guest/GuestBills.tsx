import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function GuestBills() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bills</h1>
            <p className="text-muted-foreground">Review current charges and payment history.</p>
          </div>
          <Badge variant="outline">Realtime</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="gradient-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <ChargesManager />
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentsManager />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function ChargesManager() {
  const charges = useQuery((api as any).guest.listGuestCharges) ?? [];
  const addCharge = useMutation((api as any).guest.addGuestCharge);
  const delCharge = useMutation((api as any).guest.deleteGuestCharge);
  // Seed demo financials if empty for this user (idempotent)
  const seedFinancials = useMutation((api as any).guest.seedGuestFinancialsDemo);

  useEffect(() => {
    if ((charges?.length ?? 0) === 0) {
      seedFinancials({}).catch(() => {});
    }
  }, [charges?.length, seedFinancials]);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    item: "",
    room: "",
    category: "Room Night",
    amount: 0,
  });

  async function add() {
    try {
      if (!form.date || !form.item || !form.category) {
        toast.error("Please fill all required fields");
        return;
      }
      if (Number(form.amount) <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }
      await addCharge({
        date: form.date,
        item: form.item,
        room: form.room || undefined,
        category: form.category,
        amount: Number(form.amount),
      });
      toast.success("Charge added");
      setForm((f) => ({ ...f, item: "", amount: 0 }));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add charge");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-5 gap-3">
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Date</div>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div className="grid gap-1 md:col-span-2">
          <div className="text-xs text-muted-foreground">Description</div>
          <Input
            value={form.item}
            onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
            placeholder="Room Night 1"
          />
        </div>
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Room #</div>
          <Input
            value={form.room}
            onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
            placeholder="1208"
          />
        </div>
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Amount ($)</div>
          <Input
            type="number"
            min={0}
            value={String(form.amount)}
            onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value || 0) }))}
            placeholder="245.00"
          />
        </div>
        <div className="grid gap-1 md:col-span-2">
          <div className="text-xs text-muted-foreground">Category</div>
          <Select
            value={form.category}
            onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Room Night">Room Night</SelectItem>
              <SelectItem value="Dining">Dining</SelectItem>
              <SelectItem value="Minibar">Minibar</SelectItem>
              <SelectItem value="Spa">Spa</SelectItem>
              <SelectItem value="Taxes & Fees">Taxes & Fees</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 flex items-end">
          <Button className="neon-glow" onClick={add}>Add Charge</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60">
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Room</th>
              <th className="p-3">Category</th>
              <th className="p-3">Amount</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((c: any) => (
              <tr key={c._id} className="border-t border-border/60">
                <td className="p-3">{c.date}</td>
                <td className="p-3">{c.item}</td>
                <td className="p-3">{c.room ?? "-"}</td>
                <td className="p-3">{c.category}</td>
                <td className="p-3">${c.amount}</td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await delCharge({ chargeId: c._id });
                        toast.success("Deleted");
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to delete");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {charges.length === 0 && (
              <tr>
                <td className="p-5 text-center text-muted-foreground" colSpan={6}>
                  No charges yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsManager() {
  const payments = useQuery((api as any).guest.listGuestPayments) ?? [];
  const addPayment = useMutation((api as any).guest.addGuestPayment);
  const delPayment = useMutation((api as any).guest.deleteGuestPayment);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    method: "Visa",
    ref: "",
    amount: 0,
  });

  async function add() {
    try {
      if (!form.date || !form.method) {
        toast.error("Please fill all required fields");
        return;
      }
      if (Number(form.amount) <= 0) {
        toast.error("Amount must be greater than 0");
        return;
      }
      await addPayment({
        date: form.date,
        method: form.method,
        ref: form.ref || undefined,
        amount: Number(form.amount),
      });
      toast.success("Payment added");
      setForm((f) => ({ ...f, ref: "", amount: 0 }));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to add payment");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-5 gap-3">
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Date</div>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </div>
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Method</div>
          <Select
            value={form.method}
            onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Visa">Visa</SelectItem>
              <SelectItem value="Mastercard">Mastercard</SelectItem>
              <SelectItem value="Amex">Amex</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1 md:col-span-2">
          <div className="text-xs text-muted-foreground">Ref / Last4</div>
          <Input
            value={form.ref}
            onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))}
            placeholder="•••• 4242"
          />
        </div>
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Amount ($)</div>
          <Input
            type="number"
            min={0}
            value={String(form.amount)}
            onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value || 0) }))}
            placeholder="100.00"
          />
        </div>
        <div className="md:col-span-5">
          <Button className="neon-glow" onClick={add}>Add Payment</Button>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60">
            <tr className="text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Method</th>
              <th className="p-3">Ref</th>
              <th className="p-3">Amount</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p._id} className="border-t border-border/60">
                <td className="p-3">{p.date}</td>
                <td className="p-3">{p.method}</td>
                <td className="p-3">{p.ref ?? "-"}</td>
                <td className="p-3">${p.amount}</td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      try {
                        await delPayment({ paymentId: p._id });
                        toast.success("Deleted");
                      } catch (e: any) {
                        toast.error(e?.message ?? "Failed to delete");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td className="p-5 text-center text-muted-foreground" colSpan={5}>
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}