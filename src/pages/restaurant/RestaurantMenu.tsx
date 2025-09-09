import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function RestaurantMenu() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu</h1>
          <p className="text-muted-foreground">Manage menu items and categories.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Menu Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Menu Items"
              storageKey="rest_menu"
              description="Manage menu items and availability."
              columns={[
                { key: "name", label: "Item", input: "text", required: true },
                { key: "category", label: "Category", input: "text", required: true },
                { key: "price", label: "Price ($)", input: "number", required: true },
                { key: "available", label: "Available", input: "select", options: [
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ], required: true },
              ]}
              seed={[
                { id: "rm1", name: "Cheeseburger", category: "Mains", price: 12.5, available: "Yes" },
                { id: "rm2", name: "Caesar Salad", category: "Starters", price: 9.0, available: "Yes" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}