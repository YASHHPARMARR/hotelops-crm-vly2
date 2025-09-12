import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";
import { ChatPanel } from "@/components/ChatPanel";

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
                { key: "guest_id", label: "Guest ID", input: "text" },
                { key: "full_name", label: "Full Name", input: "text", required: true },
                { key: "gender", label: "Gender", input: "select", options: [
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ], required: true },
                { key: "dob", label: "Date of Birth", input: "date" },
                { key: "email", label: "Email", input: "text", required: true },
                { key: "phone", label: "Phone", input: "text", required: true },
                { key: "address", label: "Address", input: "textarea" },
                { key: "country", label: "Country", input: "text", required: true },
                { key: "nationality", label: "Nationality", input: "text" },
                { key: "id_number", label: "ID/Passport Number", input: "text" },
                { key: "preferred_room_type", label: "Preferred Room Type", input: "select", options: [
                  { label: "Single", value: "Single" },
                  { label: "Double", value: "Double" },
                  { label: "Suite", value: "Suite" },
                  { label: "Deluxe", value: "Deluxe" },
                ]},
                { key: "special_requests", label: "Special Requests", input: "textarea" },
                { key: "membership", label: "Membership", input: "select", options: [
                  { label: "None", value: "None" },
                  { label: "Silver", value: "Silver" },
                  { label: "Gold", value: "Gold" },
                  { label: "VIP", value: "VIP" },
                ]},
                { key: "loyalty_points", label: "Loyalty Points", input: "number" },
                { key: "notes", label: "Notes", input: "textarea" },
                { key: "created_at", label: "Created At", input: "date" },
              ]}
              seed={[
                {
                  id: "gst1",
                  guest_id: "GST20250913001",
                  full_name: "Alice Johnson",
                  gender: "Female",
                  dob: "1990-05-15",
                  email: "alice@mail.com",
                  phone: "+919876543210",
                  address: "123 Street, City",
                  country: "India",
                  nationality: "Indian",
                  id_number: "A1234567",
                  preferred_room_type: "Deluxe",
                  special_requests: "Allergic to peanuts",
                  membership: "Gold",
                  loyalty_points: 2500,
                  notes: "Prefers sea view",
                  created_at: "2025-09-13",
                },
                {
                  id: "gst2",
                  guest_id: "GST20250913002",
                  full_name: "Luis Fernandez",
                  gender: "Male",
                  dob: "1987-11-02",
                  email: "luis@example.com",
                  phone: "+1 555-0101",
                  address: "55 Palm St, Miami, FL",
                  country: "USA",
                  nationality: "American",
                  id_number: "P987654",
                  preferred_room_type: "Suite",
                  special_requests: "",
                  membership: "Silver",
                  loyalty_points: 1200,
                  notes: "",
                  created_at: "2025-09-12",
                },
              ]}
              backend="local"
            />
          </CardContent>
        </Card>

        {/* Team Chat module */}
        <ChatPanel />
      </div>
    </AdminShell>
  );
}