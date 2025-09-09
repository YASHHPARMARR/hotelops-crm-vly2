import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Rooms"
              storageKey="admin_rooms"
              description="Configure rooms, types, status, and rates."
              columns={[
                { key: "number", label: "Room #", input: "text", required: true },
                { key: "type", label: "Type", input: "text", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Vacant Clean", value: "Vacant Clean" },
                  { label: "Vacant Dirty", value: "Vacant Dirty" },
                  { label: "Occupied", value: "Occupied" },
                  { label: "OOO", value: "OOO" },
                ], required: true },
                { key: "rate", label: "Rate", input: "number", required: true },
              ]}
              seed={[
                { id: "r101", number: "205", type: "Deluxe King", status: "Occupied", rate: 220 },
                { id: "r102", number: "214", type: "Standard Queen", status: "Vacant Clean", rate: 150 },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}