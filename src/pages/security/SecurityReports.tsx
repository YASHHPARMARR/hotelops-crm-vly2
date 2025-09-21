import { AdminShell } from "@/components/layouts/AdminShell";

export default function SecurityReports() {
  return (
    <AdminShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Security Reports</h1>
        <p className="text-muted-foreground">
          Overview of security-related reports and analytics will appear here.
        </p>
      </div>
    </AdminShell>
  );
}
