import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";

export default function HousekeepingTasks() {
  return (
    <AdminShell>
      <CrudPage
        title="Housekeeping Tasks"
        description="Manage cleaning and maintenance tasks."
        table="hk_tasks"
        columns={[
          { key: "task", label: "Task Description", type: "text", required: true },
          { key: "room", label: "Room Number", type: "text", required: true },
          { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"], required: true },
          { key: "status", label: "Status", type: "select", options: ["Pending", "In Progress", "Completed"], required: true },
          { key: "assignedTo", label: "Assigned To", type: "text" }
        ]}
      />
    </AdminShell>
  );
}