import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function InventoryOrders() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">Create and track purchase orders.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>PO Center</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Purchase Orders"
              storageKey="inv_orders"
              description="Create and track purchase orders."
              columns={[
                { key: "poNumber", label: "PO #", input: "text", required: true },
                { key: "supplier", label: "Supplier", input: "text", required: true },
                { key: "date", label: "Date", input: "date", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Open", value: "Open" },
                  { label: "Sent", value: "Sent" },
                  { label: "Received", value: "Received" },
                  { label: "Closed", value: "Closed" },
                ], required: true },
                { key: "total", label: "Total ($)", input: "number", required: true },
              ]}
              seed={[
                { id: "io1", poNumber: "PO-1001", supplier: "Acme Supplies", date: "2025-09-08", status: "Sent", total: 1248 },
                { id: "io2", poNumber: "PO-1002", supplier: "Global Linens", date: "2025-09-09", status: "Open", total: 860 },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}