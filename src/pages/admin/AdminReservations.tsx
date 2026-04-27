import { AdminShell } from "@/components/layouts/AdminShell";
import { ConvexReservationForm } from "@/components/ConvexReservationForm";

export default function AdminReservations() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Manage and review all reservations.</p>
        </div>
        <ConvexReservationForm />
      </div>
    </AdminShell>
  );
}