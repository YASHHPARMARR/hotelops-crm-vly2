import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminReservations() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Manage and review all reservations.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Reservations Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Reservations"
              storageKey="admin_reservations"
              description="Manage all reservations, dates, and statuses."
              columns={[
                { key: "guestName", label: "Guest", input: "text", required: true },
                { key: "confirmation", label: "Confirmation", input: "text", required: true },
                { key: "roomType", label: "Room Type", input: "text", required: true },
                { key: "arrival", label: "Arrival", input: "date", required: true },
                { key: "departure", label: "Departure", input: "date", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Booked", value: "Booked" },
                  { label: "CheckedIn", value: "CheckedIn" },
                  { label: "CheckedOut", value: "CheckedOut" },
                  { label: "Cancelled", value: "Cancelled" },
                ], required: true },
              ]}
              seed={[
                { id: "a1", guestName: "Ana Garcia", confirmation: "CNF-1001", roomType: "Deluxe King", arrival: "2025-09-09", departure: "2025-09-11", status: "Booked" },
                { id: "a2", guestName: "Luis Fernandez", confirmation: "CNF-1002", roomType: "Standard Queen", arrival: "2025-09-08", departure: "2025-09-10", status: "CheckedIn" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}