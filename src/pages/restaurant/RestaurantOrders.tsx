import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function RestaurantOrders() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Live and completed restaurant orders.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Order Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Orders"
              storageKey="rest_orders"
              description="Live and completed restaurant orders."
              columns={[
                { key: "table", label: "Table", input: "text", required: true },
                { key: "items", label: "Items", input: "textarea", required: true },
                { key: "total", label: "Total ($)", input: "number", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Open", value: "Open" },
                  { label: "Preparing", value: "Preparing" },
                  { label: "Ready", value: "Ready" },
                  { label: "Closed", value: "Closed" },
                ], required: true },
              ]}
              seed={[
                { id: "ro1", table: "T-5", items: "Burger x2, Fries", total: 28.5, status: "Preparing" },
                { id: "ro2", table: "T-2", items: "Pasta, Salad", total: 24.0, status: "Open" },
              ]}
              backend="local"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}