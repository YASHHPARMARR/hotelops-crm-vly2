import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Trips"
              storageKey="tp_trips"
              description="Schedule and monitor trips."
              columns={[
                { key: "tripNo", label: "Trip #", input: "text", required: true },
                { key: "guest", label: "Guest", input: "text" },
                { key: "pickupTime", label: "Pickup Time", input: "text", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Scheduled", value: "Scheduled" },
                  { label: "En Route", value: "En Route" },
                  { label: "Completed", value: "Completed" },
                ], required: true },
              ]}
              seed={[
                { id: "tt1", tripNo: "TR-001", guest: "Ana Garcia", pickupTime: "09:00", status: "Scheduled" },
              ]}
              backend="supabase"
              table="transport_trips"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}