import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Incidents"
              storageKey="sec_incidents"
              description="Create and track security incidents."
              columns={[
                { key: "title", label: "Title", input: "text", required: true },
                { key: "severity", label: "Severity", input: "select", options: [
                  { label: "Low", value: "Low" },
                  { label: "Medium", value: "Medium" },
                  { label: "High", value: "High" },
                ], required: true },
                { key: "time", label: "Time", input: "text", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Open", value: "Open" },
                  { label: "Investigating", value: "Investigating" },
                  { label: "Closed", value: "Closed" },
                ], required: true },
              ]}
              seed={[
                { id: "si1", title: "Noise complaint - 512", severity: "Low", time: "10m ago", status: "Open" },
                { id: "si2", title: "Unauthorized access - Side gate", severity: "Medium", time: "30m ago", status: "Investigating" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}