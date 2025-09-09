import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InventoryItems() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Items</h1>
          <p className="text-muted-foreground">Inventory items and stock tracking.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Items Catalog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build items table with stock, thresholds, and categories here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
