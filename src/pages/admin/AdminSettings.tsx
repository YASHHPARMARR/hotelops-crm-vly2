import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminSettings() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">System, billing, and preferences.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Settings"
              storageKey="admin_settings"
              description="Application key-value configuration."
              columns={[
                { key: "key", label: "Key", input: "text", required: true },
                { key: "value", label: "Value", input: "text", required: true },
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                { id: "set1", key: "brandName", value: "Nova Hotel", notes: "" },
                { id: "set2", key: "timezone", value: "UTC", notes: "Default timezone" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}