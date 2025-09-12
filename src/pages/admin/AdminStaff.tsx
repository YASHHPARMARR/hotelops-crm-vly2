import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminStaff() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff</h1>
          <p className="text-muted-foreground">Manage staff accounts, roles, and shifts.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Staff"
              storageKey="admin_staff"
              description="Manage staff, HR details, access, schedules, and contact info."
              columns={[
                { key: "staffId", label: "Staff ID", input: "text", required: true },
                { key: "name", label: "Full Name", input: "text", required: true },
                { key: "gender", label: "Gender", input: "select", options: [
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]},
                { key: "dob", label: "Date of Birth", input: "date", required: true },
                { key: "address", label: "Address", input: "textarea" },
                { key: "emergencyContact", label: "Emergency Contact", input: "text", required: true },

                { key: "email", label: "Email", input: "text", required: true },
                { key: "phone", label: "Phone", input: "text", required: true },
                { key: "altPhone", label: "Alternate Phone", input: "text" },

                { key: "role", label: "Role / Designation", input: "select", options: [
                  { label: "Front Desk", value: "Front Desk" },
                  { label: "Housekeeping", value: "Housekeeping" },
                  { label: "Maintenance", value: "Maintenance" },
                  { label: "Chef", value: "Chef" },
                  { label: "Security", value: "Security" },
                  { label: "Restaurant", value: "Restaurant" },
                  { label: "Inventory", value: "Inventory" },
                  { label: "Admin", value: "Admin" },
                  { label: "Manager", value: "Manager" },
                ], required: true },

                { key: "department", label: "Department", input: "select", options: [
                  { label: "Front Desk", value: "Front Desk" },
                  { label: "Housekeeping", value: "Housekeeping" },
                  { label: "Maintenance", value: "Maintenance" },
                  { label: "Security", value: "Security" },
                  { label: "Restaurant", value: "Restaurant" },
                  { label: "Inventory", value: "Inventory" },
                  { label: "Transport", value: "Transport" },
                  { label: "Administration", value: "Administration" },
                ], required: true },

                { key: "shiftTimings", label: "Shift Timings", input: "select", options: [
                  { label: "Morning", value: "Morning" },
                  { label: "Evening", value: "Evening" },
                  { label: "Night", value: "Night" },
                ]},
                { key: "supervisor", label: "Supervisor / Manager", input: "text" },

                { key: "salary", label: "Salary / Pay Grade", input: "number", required: true },
                { key: "joiningDate", label: "Joining Date", input: "date", required: true },
                { key: "contractType", label: "Contract Type", input: "select", options: [
                  { label: "Full-time", value: "Full-time" },
                  { label: "Part-time", value: "Part-time" },
                  { label: "Temporary", value: "Temporary" },
                ], required: true },

                { key: "username", label: "Username", input: "text", required: true },
                { key: "password", label: "Password", input: "text", required: true },
                { key: "roleAccess", label: "Role-based Access", input: "select", options: [
                  { label: "Admin", value: "Admin" },
                  { label: "Manager", value: "Manager" },
                  { label: "Staff", value: "Staff" },
                ], required: true },

                { key: "skills", label: "Skills / Certifications", input: "textarea" },
                { key: "documents", label: "Documents (names/links)", input: "textarea" },
                { key: "assignedRoomsDepts", label: "Assigned Rooms/Departments", input: "text" },

                { key: "status", label: "Status", input: "select", options: [
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                  { label: "On Leave", value: "On Leave" },
                ], required: true },
                { key: "lastLogin", label: "Last Login (YYYY-MM-DD HH:mm)", input: "text" },
              ]}
              seed={[
                {
                  id: "s1",
                  staffId: "STF20250913001",
                  name: "John Smith",
                  gender: "Male",
                  dob: "1990-05-15",
                  address: "45 Elm Street, City",
                  emergencyContact: "+919876543211",
                  email: "john@mail.com",
                  phone: "+919876543210",
                  altPhone: "+919812345678",
                  role: "Front Desk",
                  department: "Front Desk",
                  shiftTimings: "Morning",
                  supervisor: "Mary Jane",
                  salary: 35000.0,
                  joiningDate: "2023-03-01",
                  contractType: "Full-time",
                  username: "johnsmith",
                  password: "********",
                  roleAccess: "Staff",
                  skills: "CPR certified",
                  documents: "ID Proof.pdf",
                  assignedRoomsDepts: "Rooms: 101,102",
                  status: "Active",
                  lastLogin: "2025-09-12 10:30",
                },
                {
                  id: "s2",
                  staffId: "STF20250913002",
                  name: "Mary Jane",
                  gender: "Female",
                  dob: "1988-07-20",
                  address: "12 Lake Road, City",
                  emergencyContact: "+919876543299",
                  email: "mary@example.com",
                  phone: "+919800000001",
                  altPhone: "",
                  role: "Manager",
                  department: "Housekeeping",
                  shiftTimings: "Evening",
                  supervisor: "",
                  salary: 52000,
                  joiningDate: "2021-11-01",
                  contractType: "Full-time",
                  username: "maryj",
                  password: "********",
                  roleAccess: "Manager",
                  skills: "Leadership, Training",
                  documents: "Contract.pdf",
                  assignedRoomsDepts: "Dept: Housekeeping",
                  status: "Active",
                  lastLogin: "2025-09-12 09:10",
                }
              ]}
              backend="local"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}