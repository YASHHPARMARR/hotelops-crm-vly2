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
                {
                  key: "available",
                  label: "Available",
                  input: "select",
                  options: [
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ],
                  required: true,
                },
              ]}
              seed={[
                { id: "rm1", name: "Cheeseburger", category: "Mains", price: 12.5, available: "Yes" },
                { id: "rm2", name: "Caesar Salad", category: "Starters", price: 9.0, available: "Yes" },
              ]}
              backend="local"
            />
            {/* Added: Tables availability */}
            <div className="mt-6">
              <CrudPage
                title="Dining Tables"
                storageKey="rest_tables"
                description="Track table availability at the restaurant."
                columns={[
                  { key: "tableNumber", label: "Table #", input: "text", required: true },
                  { key: "capacity", label: "Capacity", input: "number", required: true },
                  {
                    key: "status",
                    label: "Status",
                    input: "select",
                    options: [
                      { label: "Available", value: "Available" },
                      { label: "Occupied", value: "Occupied" },
                      { label: "Reserved", value: "Reserved" },
                      { label: "Out of Service", value: "Out of Service" },
                    ],
                    required: true,
                  },
                  { key: "server", label: "Assigned Server", input: "text" },
                ]}
                seed={[
                  { id: "t1", tableNumber: "T1", capacity: 2, status: "Available", server: "Ivy" },
                  { id: "t2", tableNumber: "T2", capacity: 4, status: "Occupied", server: "Peter" },
                ]}
                backend="local"
              />
            </div>
            {/* Added: Raw materials stock */}
            <div className="mt-6">
              <CrudPage
                title="Raw Materials"
                storageKey="rest_raw_materials"
                description="Track stock and reorder levels for restaurant supplies."
                columns={[
                  { key: "item", label: "Item", input: "text", required: true },
                  { key: "category", label: "Category", input: "text" },
                  { key: "quantity", label: "Quantity", input: "number", required: true },
                  { key: "unit", label: "Unit", input: "text" },
                  { key: "reorderLevel", label: "Reorder Level", input: "number" },
                  {
                    key: "status",
                    label: "Status",
                    input: "select",
                    options: [
                      { label: "In Stock", value: "In Stock" },
                      { label: "Low", value: "Low" },
                      { label: "Out", value: "Out" },
                    ],
                    required: true,
                  },
                  { key: "supplier", label: "Supplier", input: "text" },
                ]}
                seed={[
                  { id: "rmat1", item: "Beef Patty", category: "Meat", quantity: 40, unit: "pcs", reorderLevel: 20, status: "In Stock", supplier: "FreshMeats Co" },
                  { id: "rmat2", item: "Lettuce", category: "Veg", quantity: 8, unit: "kg", reorderLevel: 5, status: "Low", supplier: "GreenFarm" },
                ]}
                backend="local"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}