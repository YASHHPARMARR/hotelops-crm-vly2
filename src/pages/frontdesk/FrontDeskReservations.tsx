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
              storageKey="fd_reservations"
              description="Front Desk reservations for quick actions."
              columns={[
                { key: "guestName", label: "Guest", input: "text", required: true },
                { key: "confirmation", label: "Confirmation", input: "text", required: true },
                { key: "roomType", label: "Room Type", input: "text" },
                { key: "arrival", label: "Arrival", input: "date" },
                { key: "departure", label: "Departure", input: "date" },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Booked", value: "Booked" },
                  { label: "CheckedIn", value: "CheckedIn" },
                  { label: "CheckedOut", value: "CheckedOut" },
                ], required: true },
              ]}
              seed={[
                { id: "fr1", guestName: "Maya Lee", confirmation: "CNF-83243", roomType: "Suite", arrival: "2025-09-09", departure: "2025-09-12", status: "Booked" },
                { id: "fr2", guestName: "Ivy Chen", confirmation: "CNF-83244", roomType: "Standard Twin", arrival: "2025-09-09", departure: "2025-09-11", status: "CheckedIn" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}