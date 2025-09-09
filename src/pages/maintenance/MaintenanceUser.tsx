import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaintenanceUser() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User</h1>
          <p className="text-muted-foreground">Personal profile and preferences for maintenance user.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build profile details, notifications, and availability here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
