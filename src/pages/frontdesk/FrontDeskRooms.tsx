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
              storageKey="rooms" // unified with Admin + HK
              description="Track room statuses and assignments reflected across modules."
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
                { key: "rate", label: "Rate ($)", input: "number", required: true, widthClass: "w-[120px]" },
                { key: "lastCleaned", label: "Last Cleaned", input: "date", widthClass: "w-[160px]" },
              ]}
              seed={[
                { id: "rm1", number: "205", type: "Deluxe King", status: "Occupied", guest: "Ana Garcia", rate: 220, lastCleaned: "2025-09-09" },
                { id: "rm2", number: "214", type: "Standard Queen", status: "Vacant Clean", guest: "", rate: 150, lastCleaned: "2025-09-09" },
                { id: "rm3", number: "118", type: "Standard Twin", status: "Occupied", guest: "Ivy Chen", rate: 160, lastCleaned: "2025-09-08" },
              ]}
              backend="local"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}