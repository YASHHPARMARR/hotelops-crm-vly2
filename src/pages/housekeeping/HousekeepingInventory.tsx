import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function HousekeepingInventory() {
  return (
    <AdminShell>
      <CrudPage
        title="Housekeeping Inventory"
        description="Track cleaning supplies and amenities."
        table="hk_inventory"
        columns={[
          { key: "item", label: "Item Name", type: "text", required: true },
          { key: "stock", label: "Current Stock", type: "number", required: true },
          { key: "min", label: "Minimum Level", type: "number", required: true }
        ]}
      />
    </AdminShell>
  );
}