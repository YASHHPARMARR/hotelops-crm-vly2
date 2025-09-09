import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecurityBadges() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visitor Badges</h1>
          <p className="text-muted-foreground">Manage and issue visitor badges.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Badge Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build badge templates, issuance, and logs here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
