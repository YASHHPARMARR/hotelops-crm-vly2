import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminGuests() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guests</h1>
          <p className="text-muted-foreground">View and manage guest profiles and stays.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Guests Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build guest search, profiles, and history here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
