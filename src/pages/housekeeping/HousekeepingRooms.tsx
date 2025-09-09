import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Rooms"
              storageKey="hk_rooms"
              description="Housekeeping status per room."
              columns={[
                { key: "room", label: "Room", input: "text", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Vacant Clean", value: "Vacant Clean" },
                  { label: "Vacant Dirty", value: "Vacant Dirty" },
                  { label: "Occupied Clean", value: "Occupied Clean" },
                  { label: "Occupied Dirty", value: "Occupied Dirty" },
                ], required: true },
                { key: "lastCleaned", label: "Last Cleaned", input: "date" },
              ]}
              seed={[
                { id: "hr1", room: "205", status: "Occupied Clean", lastCleaned: "2025-09-09" },
                { id: "hr2", room: "118", status: "Occupied Dirty", lastCleaned: "2025-09-08" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}