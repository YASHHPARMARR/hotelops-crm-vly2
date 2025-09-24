import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function FrontDeskReservations() {
  return (
    <AdminShell>
      <CrudPage
        title="Reservations"
        description="Manage hotel reservations and bookings."
        table="reservations"
        columns={[
          {
            key: "guest_name",
            label: "Guest Name",
            type: "select",
            required: true,
            // Dynamically load guest names from Supabase guests table
            dynamicOptions: {
              table: "guests",
              valueField: "name",
              labelField: "name",
              orderBy: { column: "name", ascending: true },
            },
          },
          { key: "confirmation", label: "Confirmation", type: "text", required: true },
          { key: "room_type", label: "Room Type", type: "select", options: ["Standard", "Deluxe", "Suite", "Presidential"], required: true },
          {
            key: "room_number",
            label: "Room Number",
            type: "select",
            required: true,
            dynamicOptions: {
              table: "rooms",
              valueField: "room_number",
              labelField: "room_number",
              // Robust filter: accept both lowercase and capitalized values
              filters: [{ column: "status", op: "in", value: ["available", "Available"] }],
              orderBy: { column: "room_number", ascending: true },
            },
          },
          { key: "arrival", label: "Arrival", type: "date", required: true },
          { key: "departure", label: "Departure", type: "date", required: true },
          { key: "status", label: "Status", type: "select", options: ["Booked", "CheckedIn", "CheckedOut", "Cancelled"], required: true },
          { key: "balance", label: "Balance", type: "number" },
          { key: "source", label: "Source", type: "select", options: ["Direct", "OTA", "Phone", "Walk-in"] },
          { key: "notes", label: "Notes", type: "text" }
        ]}
      />
    </AdminShell>
  );
}