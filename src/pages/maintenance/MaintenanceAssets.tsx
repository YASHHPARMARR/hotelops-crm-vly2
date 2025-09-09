import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaintenanceAssets() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground">Manage hotel assets and preventive maintenance.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Asset Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build assets list and maintenance schedules here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
