import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HousekeepingRooms() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Status</h1>
          <p className="text-muted-foreground">Housekeeping view of room cleanliness.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Cleanliness Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build list of rooms with statuses and actions here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
