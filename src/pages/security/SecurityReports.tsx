import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityReports() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Reports</h1>
          <p className="text-muted-foreground">
            Overview and export of incidents and security analytics.
          </p>
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Reporting tools coming soon.
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
