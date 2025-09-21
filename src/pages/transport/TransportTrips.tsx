import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function TransportTrips() {
  return (
    <AdminShell>
      <CrudPage
        title="Transport Trips"
        description="Manage guest transportation requests."
        table="transport_trips"
        columns={[
          { key: "tripNo", label: "Trip Number", type: "text", required: true },
          { key: "guest", label: "Guest Name", type: "text", required: true },
          { key: "pickupTime", label: "Pickup Time", type: "text", required: true },
          { key: "status", label: "Status", type: "select", options: ["Scheduled", "In Progress", "Completed", "Cancelled"], required: true }
        ]}
      />
    </AdminShell>
  );
}