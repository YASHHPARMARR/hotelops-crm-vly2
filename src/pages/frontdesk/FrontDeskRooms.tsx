import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function FrontDeskRooms() {
  return (
    <AdminShell>
      <CrudPage
        title="Rooms"
        description="Manage room inventory and status."
        table="rooms"
        columns={[
          { key: "number", label: "Room Number", type: "text", required: true },
          { key: "type", label: "Room Type", type: "select", options: ["Standard", "Deluxe", "Suite", "Presidential"], required: true },
          { key: "status", label: "Status", type: "select", options: ["Available", "Occupied", "Maintenance", "Cleaning"], required: true },
          { key: "guest", label: "Current Guest", type: "text" },
          { key: "rate", label: "Nightly Rate", type: "number", required: true },
          { key: "lastCleaned", label: "Last Cleaned", type: "date" }
        ]}
      />
    </AdminShell>
  );
}