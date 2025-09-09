import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <div className="text-muted-foreground text-sm">
              Build roles, permissions, and schedules here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
