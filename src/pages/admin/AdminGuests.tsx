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
              storageKey="guests"
              description="Search and manage guest profiles, loyalty, and preferences."
              columns={[
                { key: "name", label: "Name", input: "text", required: true },
                { key: "email", label: "Email", input: "text", required: true },
                { key: "phone", label: "Phone", input: "text" },
                { key: "address", label: "Address", input: "textarea" },
                { key: "loyalty", label: "Loyalty Level", input: "select", options: [
                  { label: "None", value: "None" },
                  { label: "Silver", value: "Silver" },
                  { label: "Gold", value: "Gold" },
                  { label: "Platinum", value: "Platinum" },
                ]},
                { key: "vip", label: "VIP", input: "select", options: [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ]},
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                { id: "g1", name: "Ana Garcia", email: "ana@example.com", phone: "+1 555-0100", address: "100 Ocean Ave, Miami, FL", loyalty: "Gold", vip: "Yes", notes: "High floor" },
                { id: "g2", name: "Luis Fernandez", email: "luis@example.com", phone: "+1 555-0101", address: "55 Palm St, Miami, FL", loyalty: "Silver", vip: "No", notes: "" },
                { id: "g3", name: "Maya Lee", email: "maya@example.com", phone: "+1 555-0104", address: "88 Beach Rd, Miami, FL", loyalty: "Platinum", vip: "Yes", notes: "Allergies: peanuts" },
              ]}
              backend="supabase"
              table="guests"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}