import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminStaff() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground">Manage staff accounts, roles, and shifts.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Staff"
              storageKey="admin_staff"
              table="admin_staff"
              backend="convex"
              description="Manage staff, roles, segments, and contact details."
              columns={[
                { key: "name", label: "Name", input: "text", required: true },
                {
                  key: "role",
                  label: "Role",
                  input: "select",
                  options: [
                    { label: "Front Desk", value: "Front Desk" },
                    { label: "Housekeeping", value: "Housekeeping" },
                    { label: "Maintenance", value: "Maintenance" },
                    { label: "Security", value: "Security" },
                    { label: "Restaurant", value: "Restaurant" },
                    { label: "Inventory", value: "Inventory" },
                    { label: "Admin", value: "Admin" },
                  ],
                  required: true,
                },
                {
                  key: "segment",
                  label: "Segment",
                  input: "select",
                  options: [
                    { label: "Front Desk", value: "Front Desk" },
                    { label: "Housekeeping", value: "Housekeeping" },
                    { label: "Waiter", value: "Waiter" },
                    { label: "Chef", value: "Chef" },
                    { label: "Bartender", value: "Bartender" },
                    { label: "Security", value: "Security" },
                    { label: "Maintenance", value: "Maintenance" },
                    { label: "Transport", value: "Transport" },
                    { label: "Inventory", value: "Inventory" },
                    { label: "Restaurant", value: "Restaurant" },
                  ],
                },
                {
                  key: "isManager",
                  label: "Manager",
                  input: "select",
                  options: [
                    { label: "No", value: "No" },
                    { label: "Yes", value: "Yes" },
                  ],
                },
                { key: "email", label: "Email", input: "text", required: true },
                { key: "phone", label: "Phone", input: "text" },
                {
                  key: "shift",
                  label: "Shift",
                  input: "select",
                  options: [
                    { label: "Morning", value: "Morning" },
                    { label: "Evening", value: "Evening" },
                    { label: "Night", value: "Night" },
                  ],
                },
              ]}
              seed={[
                { id: "s1", name: "Ivy Chen", role: "Front Desk", segment: "Front Desk", isManager: "No", email: "ivy@example.com", phone: "+1 555-0102", shift: "Morning" },
                { id: "s2", name: "Peter Johnson", role: "Maintenance", segment: "Maintenance", isManager: "Yes", email: "peter@example.com", phone: "+1 555-0103", shift: "Evening" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}