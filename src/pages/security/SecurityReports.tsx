import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function SecurityReports() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Security analytics and exports.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Reports Center</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Security Reports"
              storageKey="sec_reports"
              description="Generate and track security reports."
              columns={[
                { key: "name", label: "Name", input: "text", required: true },
                { key: "range", label: "Range", input: "text", required: true },
                { key: "generatedAt", label: "Generated", input: "date", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Ready", value: "Ready" },
                  { label: "Queued", value: "Queued" },
                  { label: "Failed", value: "Failed" },
                ], required: true },
              ]}
              seed={[
                { id: "sr1", name: "Incident Summary", range: "WTD", generatedAt: "2025-09-09", status: "Ready" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}