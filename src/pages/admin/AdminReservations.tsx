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
              storageKey="reservations"
              description="Manage all reservations, dates, room assignment, balances, and statuses."
              columns={[
                { key: "guestName", label: "Guest", input: "text", required: true },
                { key: "confirmation", label: "Confirmation", input: "text", required: true },
                { key: "roomType", label: "Room Type", input: "text", required: true },
                { key: "roomNumber", label: "Room #", input: "text" },
                { key: "arrival", label: "Arrival", input: "date", required: true },
                { key: "departure", label: "Departure", input: "date", required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Booked", value: "Booked" },
                  { label: "CheckedIn", value: "CheckedIn" },
                  { label: "CheckedOut", value: "CheckedOut" },
                  { label: "Cancelled", value: "Cancelled" },
                ], required: true },
                { key: "balance", label: "Balance ($)", input: "number" },
                { key: "source", label: "Source", input: "select", options: [
                  { label: "Direct", value: "Direct" },
                  { label: "OTA", value: "OTA" },
                  { label: "Corporate", value: "Corporate" },
                ]},
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                { id: "r1", guestName: "Ana Garcia", confirmation: "CNF-1001", roomType: "Deluxe King", roomNumber: "205", arrival: "2025-09-09", departure: "2025-09-11", status: "Booked", balance: 220, source: "Direct", notes: "High floor" },
                { id: "r2", guestName: "Luis Fernandez", confirmation: "CNF-1002", roomType: "Standard Queen", roomNumber: "214", arrival: "2025-09-08", departure: "2025-09-10", status: "CheckedIn", balance: 0, source: "OTA", notes: "" },
                { id: "r3", guestName: "Maya Lee", confirmation: "CNF-1003", roomType: "Suite", roomNumber: "", arrival: "2025-09-12", departure: "2025-09-15", status: "Booked", balance: 650, source: "Corporate", notes: "Late arrival" },
              ]}
              backend="local"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}