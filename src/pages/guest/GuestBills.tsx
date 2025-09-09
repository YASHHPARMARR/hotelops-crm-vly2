import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function GuestBills() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bills</h1>
          <p className="text-muted-foreground">View and download your folio.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Current Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Folio Charges"
              storageKey="guest_bills"
              description="View, add charges, and track status."
              columns={[
                { key: "charge", label: "Charge", input: "text", required: true },
                { key: "amount", label: "Amount ($)", input: "number", required: true },
                { key: "date", label: "Date", input: "date", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Pending", value: "Pending" },
                  { label: "Paid", value: "Paid" },
                  { label: "Refunded", value: "Refunded" },
                ], required: true },
              ]}
              seed={[
                { id: "gb1", charge: "Room Night", amount: 142.6, date: "2025-09-09", status: "Pending" },
                { id: "gb2", charge: "Dining", amount: 28.5, date: "2025-09-09", status: "Paid" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}