import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilteredRooms } from "@/components/FilteredRooms";

export default function FrontDeskRooms() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground">Live filtering from Supabase by type and availability.</p>
        </div>
        <FilteredRooms />
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Manage Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Rooms"
              description="Manage room inventory and status."
              table="rooms"
              columns={[
                { key: "number", label: "Room Number", type: "text", required: true },
                { key: "type", label: "Room Type", type: "select", options: ["Standard", "Deluxe", "Suite", "Presidential"], required: true },
                { key: "status", label: "Status", type: "select", options: ["Available", "Occupied", "Maintenance", "Cleaning"], required: true },
                { key: "guest", label: "Current Guest", type: "text" },
                { key: "rate", label: "Nightly Rate", type: "number", required: true },
                { key: "lastCleaned", label: "Last Cleaned", type: "date" }
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}