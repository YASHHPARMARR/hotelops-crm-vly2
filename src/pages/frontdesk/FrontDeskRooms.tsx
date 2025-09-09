import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function FrontDeskRooms() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Room Status</h1>
          <p className="text-muted-foreground">Status and assignment for rooms.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Live Room Map</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Rooms"
              storageKey="fd_rooms"
              description="Track room statuses and assignments."
              columns={[
                { key: "number", label: "Room #", input: "text", required: true },
                { key: "type", label: "Type", input: "text" },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Vacant Clean", value: "Vacant Clean" },
                  { label: "Vacant Dirty", value: "Vacant Dirty" },
                  { label: "Occupied", value: "Occupied" },
                  { label: "OOO", value: "OOO" },
                ], required: true },
                { key: "guest", label: "Guest", input: "text" },
              ]}
              seed={[
                { id: "frm1", number: "312", type: "Deluxe King", status: "Vacant Clean", guest: "" },
                { id: "frm2", number: "118", type: "Standard Twin", status: "Occupied", guest: "Ivy Chen" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}