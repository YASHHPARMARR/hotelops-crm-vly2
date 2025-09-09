import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function FrontDeskGuests() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Guests</h1>
          <p className="text-muted-foreground">Find and update guest details.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Guest Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Guests"
              storageKey="guests"
              description="Find and maintain guest information used across Front Desk and Admin."
              columns={[
                { key: "name", label: "Name", input: "text", required: true },
                { key: "email", label: "Email", input: "text" },
                { key: "phone", label: "Phone", input: "text" },
                { key: "vip", label: "VIP", input: "select", options: [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ]},
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                { id: "g1", name: "Ana Garcia", email: "ana@example.com", phone: "+1 555-0100", vip: "Yes", notes: "High floor" },
                { id: "g2", name: "Luis Fernandez", email: "luis@example.com", phone: "+1 555-0101", vip: "No", notes: "" },
                { id: "g3", name: "Maya Lee", email: "maya@example.com", phone: "+1 555-0104", vip: "Yes", notes: "Allergies: peanuts" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}