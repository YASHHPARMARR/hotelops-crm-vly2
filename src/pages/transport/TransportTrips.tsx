import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransportTrips() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trips</h1>
          <p className="text-muted-foreground">Scheduled and active transport trips.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Trip Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build trip scheduling, assignment, and status updates here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
