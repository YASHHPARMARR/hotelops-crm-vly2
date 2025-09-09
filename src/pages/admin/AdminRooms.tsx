import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminRooms() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground">Configuration and status of all rooms.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Rooms Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build room list, types, amenities, and status here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
