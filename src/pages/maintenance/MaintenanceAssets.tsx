import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function MaintenanceAssets() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground">Manage hotel assets and preventive maintenance.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Asset Registry</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Assets"
              storageKey="mt_assets"
              description="Hotel assets and current status."
              columns={[
                { key: "name", label: "Name", input: "text", required: true },
                { key: "assetTag", label: "Asset Tag", input: "text", required: true },
                { key: "location", label: "Location", input: "text" },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Active", value: "Active" },
                  { label: "Maintenance", value: "Maintenance" },
                  { label: "Retired", value: "Retired" },
                ], required: true },
              ]}
              seed={[
                { id: "a100", name: "Boiler A", assetTag: "AST-001", location: "Basement", status: "Active" },
                { id: "a101", name: "Elevator 2", assetTag: "AST-017", location: "Tower B", status: "Maintenance" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}