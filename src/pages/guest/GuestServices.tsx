import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function GuestServices() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground">Request in-room and hotel services.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Available Services</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Service Requests"
              storageKey="guest_services"
              description="Request and track services."
              columns={[
                { key: "request", label: "Request", input: "text", required: true },
                { key: "eta", label: "ETA", input: "text" },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Requested", value: "Requested" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Completed", value: "Completed" },
                ], required: true },
              ]}
              seed={[
                { id: "gs1", request: "Laundry Pickup", eta: "6pm", status: "Requested" },
                { id: "gs2", request: "Extra Pillows", eta: "15 min", status: "In Progress" },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}