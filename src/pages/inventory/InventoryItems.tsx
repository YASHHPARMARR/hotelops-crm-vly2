import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Inventory Items"
              table="inventory_items"
              description="Items, stock levels, and thresholds."
              columns={[
                { key: "item", label: "Item", input: "text", required: true },
                { key: "sku", label: "SKU", input: "text", required: true },
                { key: "stock", label: "Stock", input: "number", required: true },
                { key: "min", label: "Min", input: "number", required: true },
                { key: "category", label: "Category", input: "text" },
              ]}
              seed={[
                { id: "ii1", item: "Towels", sku: "TW-001", stock: 120, min: 150, category: "Linen" },
                { id: "ii2", item: "Soap", sku: "SP-010", stock: 240, min: 300, category: "Toiletries" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}