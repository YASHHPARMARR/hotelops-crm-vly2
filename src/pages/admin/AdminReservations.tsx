import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminReservations() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Manage and review all reservations.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Reservations Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build reservation table, filters, and actions here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
