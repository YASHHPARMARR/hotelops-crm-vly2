import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuestDining() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dining</h1>
          <p className="text-muted-foreground">Order food and view menus.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Dining Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm">
              Build dining menu and ordering UI here.
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
