import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

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
            <CrudPage
              title="Dining Orders"
              storageKey="guest_dining"
              description="Order food and track status."
              columns={[
                { key: "order", label: "Order", input: "textarea", required: true },
                { key: "total", label: "Total ($)", input: "number", required: true },
                {
                  key: "status",
                  label: "Status",
                  input: "select",
                  options: [
                    { label: "Placed", value: "Placed" },
                    { label: "Preparing", value: "Preparing" },
                    { label: "Delivered", value: "Delivered" },
                  ],
                  required: true,
                },
              ]}
              seed={[
                { id: "gd1", order: "Club Sandwich, Juice", total: 18.5, status: "Preparing" },
              ]}
              backend="local"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}