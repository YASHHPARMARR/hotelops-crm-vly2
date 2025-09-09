import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransportSchedule() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Daily and weekly transport schedule.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Planner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build schedule view and capacity management here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
