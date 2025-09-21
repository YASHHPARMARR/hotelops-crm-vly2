import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function RestaurantMenu() {
  return (
    <AdminShell>
      <CrudPage
        title="Restaurant Menu"
        description="Manage menu items and pricing."
        table="restaurant_menu"
        columns={[
          { key: "name", label: "Item Name", type: "text", required: true },
          { key: "category", label: "Category", type: "select", options: ["Appetizer", "Main Course", "Dessert", "Beverage", "Special"], required: true },
          { key: "price", label: "Price", type: "number", required: true },
          { key: "available", label: "Available", type: "select", options: ["Yes", "No"], required: true }
        ]}
      />
    </AdminShell>
  );
}