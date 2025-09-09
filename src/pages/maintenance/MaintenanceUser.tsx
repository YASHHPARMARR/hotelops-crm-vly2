import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function MaintenanceUser() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User</h1>
          <p className="text-muted-foreground">Personal profile and preferences for maintenance user.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 max-w-xl">
              <div className="grid gap-1">
                <Label>Name</Label>
                <Input
                  defaultValue={localStorage.getItem("mt_user_name") ?? "Maintenance User"}
                  onBlur={(e) => {
                    localStorage.setItem("mt_user_name", e.target.value);
                    toast("Saved name");
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label>Email</Label>
                <Input
                  defaultValue={localStorage.getItem("mt_user_email") ?? "user@example.com"}
                  type="email"
                  onBlur={(e) => {
                    localStorage.setItem("mt_user_email", e.target.value);
                    toast("Saved email");
                  }}
                />
              </div>
              <div className="grid gap-1">
                <Label>Preferred Shift</Label>
                <Input
                  defaultValue={localStorage.getItem("mt_user_shift") ?? "Morning"}
                  onBlur={(e) => {
                    localStorage.setItem("mt_user_shift", e.target.value);
                    toast("Saved preferred shift");
                  }}
                />
              </div>
              <Button
                className="w-fit neon-glow"
                onClick={() => toast.success("Profile saved")}
              >
                Save
              </Button>
            </div>

            <div className="mt-6">
              <CrudPage
                title="Preferences"
                storageKey="mt_user_prefs"
                description="Quick personal preferences."
                columns={[
                  { key: "key", label: "Key", input: "text", required: true },
                  { key: "value", label: "Value", input: "text", required: true },
                ]}
                seed={[
                  { id: "pref1", key: "notifications", value: "enabled" },
                  { id: "pref2", key: "autoAssign", value: "false" },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}