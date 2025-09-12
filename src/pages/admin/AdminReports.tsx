import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminReports() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Operational, financial, and audit reports.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Reports Center</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Reports"
              storageKey="admin_reports"
              table="admin_reports"
              backend="convex"
              description="Track generated reports and exports."
              columns={[
                { key: "name", label: "Report", input: "text", required: true },
                { key: "period", label: "Period", input: "text", required: true },
                { key: "generatedAt", label: "Generated At", input: "date", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Ready", value: "Ready" },
                  { label: "Queued", value: "Queued" },
                  { label: "Failed", value: "Failed" },
                ], required: true },
              ]}
              seed={[
                { id: "rep1", name: "Daily Arrivals", period: "2025-09-09", generatedAt: "2025-09-09", status: "Ready" },
                { id: "rep2", name: "Revenue MTD", period: "Sept 2025", generatedAt: "2025-09-08", status: "Queued" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}