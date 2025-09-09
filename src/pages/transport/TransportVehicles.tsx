import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function TransportVehicles() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground">Fleet and maintenance status.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Fleet Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Vehicles"
              storageKey="tp_vehicles"
              description="Manage fleet and status."
              columns={[
                { key: "plate", label: "Plate", input: "text", required: true },
                { key: "model", label: "Model", input: "text", required: true },
                { key: "capacity", label: "Capacity", input: "number", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Available", value: "Available" },
                  { label: "In Service", value: "In Service" },
                  { label: "Maintenance", value: "Maintenance" },
                ], required: true },
              ]}
              seed={[
                { id: "tv1", plate: "XYZ-101", model: "Sprinter", capacity: 10, status: "Available" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}