import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";
import { Badge } from "@/components/ui/badge";

export default function GuestBills() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bills</h1>
            <p className="text-muted-foreground">Review current charges and payment history.</p>
          </div>
          <Badge variant="outline">Realtime</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="gradient-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Charges</CardTitle>
            </CardHeader>
            <CardContent>
              <CrudPage
                title="Charges"
                storageKey="guest_charges"
                description="Line items for your stay. Add, edit, or remove items."
                columns={[
                  { key: "date", label: "Date", input: "date", required: true, widthClass: "w-[140px]" },
                  { key: "item", label: "Description", input: "text", required: true },
                  { key: "room", label: "Room #", input: "text" },
                  { key: "category", label: "Category", input: "select", options: [
                    { label: "Room Night", value: "Room Night" },
                    { label: "Dining", value: "Dining" },
                    { label: "Minibar", value: "Minibar" },
                    { label: "Spa", value: "Spa" },
                    { label: "Taxes & Fees", value: "Taxes & Fees" },
                  ] },
                  { key: "amount", label: "Amount ($)", input: "number", required: true, widthClass: "w-[140px]" },
                ]}
                seed={[
                  { id: "c1", date: "2025-08-28", item: "Room Night 1", room: "1208", category: "Room Night", amount: 245.00 },
                  { id: "c2", date: "2025-08-28", item: "Room Service - Club Sandwich", room: "1208", category: "Dining", amount: 16.00 },
                  { id: "c3", date: "2025-08-28", item: "Minibar", room: "1208", category: "Minibar", amount: 12.00 },
                  { id: "c4", date: "2025-08-28", item: "Taxes & Fees", room: "1208", category: "Taxes & Fees", amount: 38.75 },
                ]}
                backend="supabase"
                table="charges"
              />
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <CrudPage
                title="Payments"
                storageKey="guest_payments"
                description="Your payments applied to this stay."
                columns={[
                  { key: "date", label: "Date", input: "date", required: true, widthClass: "w-[140px]" },
                  { key: "method", label: "Method", input: "select", options: [
                    { label: "Visa", value: "Visa" },
                    { label: "Mastercard", value: "Mastercard" },
                    { label: "Amex", value: "Amex" },
                    { label: "UPI", value: "UPI" },
                    { label: "Cash", value: "Cash" },
                  ], required: true },
                  { key: "ref", label: "Ref / Last4", input: "text" },
                  { key: "amount", label: "Amount ($)", input: "number", required: true, widthClass: "w-[140px]" },
                ]}
                seed={[
                  { id: "p1", date: "2025-08-28", method: "Visa", ref: "•••• 4242", amount: 100.00 },
                ]}
                backend="supabase"
                table="payments"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}