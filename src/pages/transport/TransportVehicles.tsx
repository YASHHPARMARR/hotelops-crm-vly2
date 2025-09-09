import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransportVehicles() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground">Fleet and maintenance status.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Fleet Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build vehicle list, utilization, and service records here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
