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
            key: "guestName",
            label: "Guest Name",
            type: "text",
            required: true,
          },
          { 
            key: "idProofType", 
            label: "ID Proof Type", 
            type: "select", 
            options: ["Passport", "Driver License", "Aadhar", "National ID"], 
            required: true 
          },
          { 
            key: "idProofNumber", 
            label: "ID Proof Number", 
            type: "text", 
            required: true 
          },
          { key: "roomType", label: "Room Type", type: "select", options: ["Standard", "Deluxe", "Suite", "Presidential"], required: true },
          {
            key: "roomNumber",
            label: "Room Number",
            type: "select",
            required: true,
            dynamicOptions: {
              table: "rooms",
              valueField: "number",
              labelField: "number",
              filters: [{ column: "status", op: "eq", value: "available" }],
              orderBy: { column: "number", ascending: true },
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