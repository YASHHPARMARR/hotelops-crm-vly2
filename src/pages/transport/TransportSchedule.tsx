import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Transport Schedule"
              table="transport_schedule"
              description="Daily transport schedule."
              columns={[
                { key: "route", label: "Route", input: "text", required: true },
                { key: "time", label: "Time", input: "text", required: true },
                { key: "vehicle", label: "Vehicle", input: "text" },
                { key: "driver", label: "Driver", input: "text" },
              ]}
              seed={[
                { id: "ts1", route: "Airport -> Hotel", time: "09:00", vehicle: "Sprinter", driver: "Sam" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}