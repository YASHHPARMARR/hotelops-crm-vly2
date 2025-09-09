import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="text-muted-foreground text-sm">
              Build PO creation, statuses, and receipts here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
