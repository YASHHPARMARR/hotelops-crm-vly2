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
              storageKey="fd_guests"
              description="Find and maintain guest information."
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
                { id: "fg1", name: "Ana Garcia", email: "ana@example.com", phone: "+1 555-0100", vip: "Yes", notes: "High floor" },
                { id: "fg2", name: "Peter Johnson", email: "peter@example.com", phone: "+1 555-0103", vip: "No", notes: "" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}