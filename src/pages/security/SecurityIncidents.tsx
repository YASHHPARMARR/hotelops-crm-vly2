import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityIncidents() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Incidents</h1>
          <p className="text-muted-foreground">Incident reports and response actions.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Incident Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build incident creation, prioritization, and tracking here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
