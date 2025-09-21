import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function RestaurantTables() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tables</h1>
          <p className="text-muted-foreground">Table occupancy and assignments.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Floor Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Tables"
              table="restaurant_tables"
              description="Manage tables and occupancy."
              columns={[
                { key: "tableNo", label: "Table #", input: "text", required: true },
                { key: "seats", label: "Seats", input: "number", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Vacant", value: "Vacant" },
                  { label: "Occupied", value: "Occupied" },
                  { label: "Reserved", value: "Reserved" },
                ], required: true },
              ]}
              seed={[
                { id: "rt1", tableNo: "T-1", seats: 4, status: "Vacant" },
                { id: "rt2", tableNo: "T-5", seats: 2, status: "Occupied" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}