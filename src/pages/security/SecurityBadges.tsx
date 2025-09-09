import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Visitor Badges"
              storageKey="sec_badges"
              description="Issue and manage visitor badges."
              columns={[
                { key: "visitorName", label: "Visitor", input: "text", required: true },
                { key: "company", label: "Company", input: "text" },
                { key: "badgeId", label: "Badge ID", input: "text", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Active", value: "Active" },
                  { label: "Expired", value: "Expired" },
                  { label: "Revoked", value: "Revoked" },
                ], required: true },
              ]}
              seed={[
                { id: "sb1", visitorName: "John Smith", company: "Acme Co", badgeId: "B-1001", status: "Active" },
                { id: "sb2", visitorName: "Jane Doe", company: "Globex", badgeId: "B-1002", status: "Expired" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}