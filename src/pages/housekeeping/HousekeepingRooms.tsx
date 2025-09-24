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
                {
                  key: "room_number",
                  label: "Room #",
                  input: "select",
                  required: true,
                  // Use dynamic options from Supabase: only available rooms (handle case variants)
                  dynamicOptions: {
                    table: "rooms",
                    valueField: "room_number",
                    labelField: "room_number",
                    filters: [{ column: "status", op: "in", value: ["available", "Available"] }],
                    orderBy: { column: "room_number", ascending: true },
                  },
                },
                {
                  key: "status",
                  label: "Status",
                  input: "select",
                  options: [
                    { label: "Vacant Clean", value: "Vacant Clean" },
                    { label: "Vacant Dirty", value: "Vacant Dirty" },
                    { label: "Occupied", value: "Occupied" },
                    { label: "OOO", value: "OOO" },
                  ],
                  required: true,
                },
                { key: "lastCleaned", label: "Last Cleaned", input: "date" },
              ]}
              seed={[
                { id: "rm1", room_number: "205", status: "Occupied", lastCleaned: "2025-09-09" },
                { id: "rm2", room_number: "214", status: "Vacant Clean", lastCleaned: "2025-09-09" },
                { id: "rm3", room_number: "118", status: "Occupied", lastCleaned: "2025-09-08" },
              ]}
              backend="supabase"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}