import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function InventorySuppliers() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">Vendor directory and performance.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Suppliers List</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Suppliers"
              table="inventory_suppliers"
              description="Vendor directory and contacts."
              columns={[
                { key: "name", label: "Name", input: "text", required: true },
                { key: "contact", label: "Contact", input: "text" },
                { key: "phone", label: "Phone", input: "text" },
                { key: "email", label: "Email", input: "text" },
              ]}
              seed={[
                { id: "is1", name: "Acme Supplies", contact: "Jane Doe", phone: "+1 555-2001", email: "jane@acme.com" },
                { id: "is2", name: "Global Linens", contact: "Mark Lee", phone: "+1 555-2002", email: "mark@linens.com" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}