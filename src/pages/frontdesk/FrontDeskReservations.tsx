import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function FrontDeskReservations() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Front Desk reservation management.</p>
        </div>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Reservations"
              storageKey="reservations"
              description="Front Desk reservations with room assignment and status transitions."
              columns={[
                { key: "guestName", label: "Guest", input: "text", required: true },
                { key: "confirmation", label: "Confirmation", input: "text", required: true },
                { key: "roomType", label: "Room Type", input: "text" },
                { key: "roomNumber", label: "Room #", input: "text" },
                { key: "arrival", label: "Arrival", input: "date" },
                { key: "departure", label: "Departure", input: "date" },
                { key: "adults", label: "Adults", input: "number", required: true },
                { key: "children", label: "Children", input: "number" },
                {
                  key: "package",
                  label: "Package",
                  input: "select",
                  options: [
                    { label: "Standard", value: "Standard" },
                    { label: "Business", value: "Business" },
                    { label: "Romantic Getaway", value: "Romantic Getaway" },
                    { label: "Family Stay", value: "Family Stay" },
                    { label: "Spa & Relax", value: "Spa & Relax" },
                    { label: "Adventure", value: "Adventure" },
                    { label: "City Explorer", value: "City Explorer" },
                    { label: "Long Stay", value: "Long Stay" },
                    { label: "Suite Premium", value: "Suite Premium" },
                    { label: "Conference", value: "Conference" },
                    { label: "Gourmet Dining", value: "Gourmet Dining" },
                    { label: "Early Bird", value: "Early Bird" },
                    { label: "Last Minute", value: "Last Minute" },
                    { label: "Honeymoon", value: "Honeymoon" },
                    { label: "Wellness", value: "Wellness" },
                  ],
                },
                {
                  key: "paymentStatus",
                  label: "Payment",
                  input: "select",
                  options: [
                    { label: "Pending", value: "Pending" },
                    { label: "Paid", value: "Paid" },
                    { label: "Refunded", value: "Refunded" },
                  ],
                },
                {
                  key: "status",
                  label: "Status",
                  input: "select",
                  options: [
                    { label: "Booked", value: "Booked" },
                    { label: "CheckedIn", value: "CheckedIn" },
                    { label: "CheckedOut", value: "CheckedOut" },
                    { label: "Cancelled", value: "Cancelled" },
                  ],
                  required: true,
                },
                { key: "balance", label: "Balance ($)", input: "number" },
                {
                  key: "source",
                  label: "Source",
                  input: "select",
                  options: [
                    { label: "Direct", value: "Direct" },
                    { label: "OTA", value: "OTA" },
                    { label: "Corporate", value: "Corporate" },
                  ],
                },
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                { id: "r1", guestName: "Ana Garcia", confirmation: "CNF-1001", roomType: "Deluxe King", roomNumber: "205", arrival: "2025-09-09", departure: "2025-09-11", adults: 2, children: 0, package: "Business", paymentStatus: "Pending", status: "Booked", balance: 220, source: "Direct", notes: "High floor" },
                { id: "r2", guestName: "Luis Fernandez", confirmation: "CNF-1002", roomType: "Standard Queen", roomNumber: "214", arrival: "2025-09-08", departure: "2025-09-10", adults: 1, children: 0, package: "Standard", paymentStatus: "Paid", status: "CheckedIn", balance: 0, source: "OTA", notes: "" },
                { id: "r3", guestName: "Maya Lee", confirmation: "CNF-1003", roomType: "Suite", roomNumber: "", arrival: "2025-09-12", departure: "2025-09-15", adults: 2, children: 1, package: "Honeymoon", paymentStatus: "Pending", status: "Booked", balance: 650, source: "Corporate", notes: "Late arrival" },
              ]}
              backend="local"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}