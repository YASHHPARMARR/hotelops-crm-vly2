import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function MaintenanceTickets() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground">Create, assign, and track repair tickets.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Tickets"
              table="maintenance_tickets"
              description="Create, assign, and track repairs."
              columns={[
                { key: "title", label: "Title", input: "text", required: true },
                { key: "category", label: "Category", input: "select", options: [
                  { label: "Plumbing", value: "Plumbing" },
                  { label: "Electrical", value: "Electrical" },
                  { label: "HVAC", value: "HVAC" },
                  { label: "Furniture", value: "Furniture" },
                  { label: "Other", value: "Other" },
                ], required: true },
                { key: "priority", label: "Priority", input: "select", options: [
                  { label: "Low", value: "Low" },
                  { label: "Medium", value: "Medium" },
                  { label: "High", value: "High" },
                  { label: "Urgent", value: "Urgent" },
                ], required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Open", value: "Open" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Completed", value: "Completed" },
                ], required: true },
                { key: "assignedTo", label: "Assigned To", input: "text" },
              ]}
              seed={[
                { id: "t1", title: "Leaking pipe - 214", category: "Plumbing", priority: "High", status: "Open", assignedTo: "Peter J." },
                { id: "t2", title: "AC not cooling - 507", category: "HVAC", priority: "Urgent", status: "In Progress", assignedTo: "Luis F." },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}