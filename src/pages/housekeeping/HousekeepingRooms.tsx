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
              storageKey="rooms"
              description="Housekeeping status per room in sync with Front Desk and Admin."
              columns={[
                { key: "room", label: "Room", input: "text", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Vacant Clean", value: "Vacant Clean" },
                  { label: "Vacant Dirty", value: "Vacant Dirty" },
                  { label: "Occupied Clean", value: "Occupied Clean" },
                  { label: "Occupied Dirty", value: "Occupied Dirty" },
                  { label: "OOO", value: "OOO" },
                ], required: true },
                { key: "lastCleaned", label: "Last Cleaned", input: "date" },
              ]}
              seed={[
                { id: "rm1", number: "205", type: "Deluxe King", status: "Occupied", guest: "Ana Garcia", rate: 220, lastCleaned: "2025-09-09" },
                { id: "rm2", number: "214", type: "Standard Queen", status: "Vacant Clean", guest: "", rate: 150, lastCleaned: "2025-09-09" },
                { id: "rm3", number: "118", type: "Standard Twin", status: "Occupied", guest: "Ivy Chen", rate: 160, lastCleaned: "2025-09-08" },
              ]}
              backend="supabase"
              table="rooms"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}