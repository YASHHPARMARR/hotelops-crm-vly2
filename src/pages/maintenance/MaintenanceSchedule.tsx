import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function MaintenanceSchedule() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground">Planned work orders and availability.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Schedule"
              storageKey="mt_schedule"
              description="Planned work orders and assignments."
              columns={[
                { key: "job", label: "Job", input: "text", required: true },
                { key: "date", label: "Date", input: "date", required: true },
                { key: "assignee", label: "Assignee", input: "text" },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Planned", value: "Planned" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Completed", value: "Completed" },
                ], required: true },
              ]}
              seed={[
                { id: "ms1", job: "Boiler inspection", date: "2025-09-10", assignee: "Peter J.", status: "Planned" },
                { id: "ms2", job: "Elevator maintenance", date: "2025-09-11", assignee: "Ivy C.", status: "In Progress" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}