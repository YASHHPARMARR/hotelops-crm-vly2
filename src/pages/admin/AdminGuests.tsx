import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminGuests() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guests</h1>
          <p className="text-muted-foreground">View and manage guest profiles and stays.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Guests Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Guests"
              storageKey="admin_guests"
              description="Search and manage guest profiles."
              columns={[
                { key: "name", label: "Name", input: "text", required: true },
                { key: "email", label: "Email", input: "text", required: true },
                { key: "phone", label: "Phone", input: "text" },
                { key: "loyalty", label: "Loyalty Level", input: "select", options: [
                  { label: "None", value: "None" },
                  { label: "Silver", value: "Silver" },
                  { label: "Gold", value: "Gold" },
                  { label: "Platinum", value: "Platinum" },
                ]},
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                { id: "g1", name: "Ana Garcia", email: "ana@example.com", phone: "+1 555-0100", loyalty: "Gold" },
                { id: "g2", name: "Luis Fernandez", email: "luis@example.com", phone: "+1 555-0101", loyalty: "Silver" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}