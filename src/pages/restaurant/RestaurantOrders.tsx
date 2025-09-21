import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function RestaurantOrders() {
  return (
    <AdminShell>
      <CrudPage
        title="Restaurant Orders"
        description="Manage dining orders and service."
        table="restaurant_orders"
        columns={[
          { key: "table", label: "Table Number", type: "text", required: true },
          { key: "items", label: "Order Items", type: "text", required: true },
          { key: "total", label: "Total Amount", type: "number", required: true },
          { key: "status", label: "Status", type: "select", options: ["Placed", "Preparing", "Ready", "Served", "Paid"], required: true }
        ]}
      />
    </AdminShell>
  );
}