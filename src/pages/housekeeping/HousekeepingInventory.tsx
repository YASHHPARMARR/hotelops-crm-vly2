import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function HousekeepingInventory() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Supplies for housekeeping operations.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Supply Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Supplies"
              storageKey="hk_inventory"
              description="Track supply stock and reorder minimums."
              columns={[
                { key: "item", label: "Item", input: "text", required: true },
                { key: "stock", label: "Stock", input: "number", required: true },
                { key: "min", label: "Min", input: "number", required: true },
              ]}
              seed={[
                { id: "hi1", item: "Towels", stock: 120, min: 150 },
                { id: "hi2", item: "Soap", stock: 240, min: 300 },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}