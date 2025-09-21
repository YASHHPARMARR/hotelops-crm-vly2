import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function TransportVehicles() {
  return (
    <AdminShell>
      <CrudPage
        title="Transport Vehicles"
        description="Manage fleet vehicles and availability."
        table="transport_vehicles"
        columns={[
          { key: "plate", label: "License Plate", type: "text", required: true },
          { key: "model", label: "Vehicle Model", type: "text", required: true },
          { key: "capacity", label: "Passenger Capacity", type: "number", required: true },
          { key: "status", label: "Status", type: "select", options: ["Available", "In Use", "Maintenance", "Out of Service"], required: true }
        ]}
      />
    </AdminShell>
  );
}