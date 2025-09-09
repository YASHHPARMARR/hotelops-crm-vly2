import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="text-muted-foreground text-sm">
              Build order list, statuses, and actions here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
