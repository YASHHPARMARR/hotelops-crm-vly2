import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="text-muted-foreground text-sm">
              Build visual tables map and reservations link here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
