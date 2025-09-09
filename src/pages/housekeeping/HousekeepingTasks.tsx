import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function HousekeepingTasks() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">Assigned and open housekeeping tasks.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Tasks"
              storageKey="hk_tasks"
              description="Assign and track housekeeping tasks."
              columns={[
                { key: "task", label: "Task", input: "text", required: true },
                { key: "room", label: "Room", input: "text", required: true },
                { key: "priority", label: "Priority", input: "select", options: [
                  { label: "Low", value: "Low" },
                  { label: "Medium", value: "Medium" },
                  { label: "High", value: "High" },
                ], required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Open", value: "Open" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Completed", value: "Completed" },
                ], required: true },
                { key: "assignedTo", label: "Assigned To", input: "text" },
              ]}
              seed={[
                { id: "hk1", task: "Make bed", room: "205", priority: "Low", status: "Open", assignedTo: "Ana" },
                { id: "hk2", task: "Deep clean bath", room: "118", priority: "High", status: "In Progress", assignedTo: "Maya" },
              ]}
              backend="supabase"
              table="hk_tasks"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}