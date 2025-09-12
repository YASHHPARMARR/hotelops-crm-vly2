import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { getSupabaseUserEmail } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { getSupabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router";

export default function FrontDeskReservations() {
  const { user } = useAuth();
  const [sbEmail, setSbEmail] = useState<string | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const [sbLoggedIn, setSbLoggedIn] = useState(false);
  const [demoOverride, setDemoOverride] = useState<boolean>(() => {
    try {
      return localStorage.getItem("demoMode") === "1";
    } catch {
      return false;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const email = await getSupabaseUserEmail();
      setSbEmail(email);
      const s = getSupabase();
      setConnected(!!s);
      try {
        const res = await s?.auth.getSession();
        setSbLoggedIn(!!res?.data?.session);
      } catch {
        setSbLoggedIn(false);
      }
    })();
  }, []);

  // Prefer Supabase auth email; in Demo or not logged in, force demo owner
  const ownerEmail =
    (demoOverride || !sbLoggedIn)
      ? "demo@example.com"
      : (sbEmail || user?.email || undefined);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Front Desk reservation management.</p>
        </div>

        {/* Show banner only if not connected OR (not logged in and no demo override) */}
        {(!connected || (!sbLoggedIn && !demoOverride)) && (
          <Card className="border-amber-400/40">
            <CardHeader>
              <CardTitle className="text-amber-400">Supabase not fully ready</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              {!connected && <div>- Supabase client not initialized. Go to Admin → Settings to set URL and Anon Key, then reload.</div>}
              {connected && !sbLoggedIn && <div>- Please log in with Supabase Email/Password on the Auth page so RLS allows your data.</div>}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/settings")}>Open Settings</Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Open Auth</Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    try {
                      localStorage.setItem("demoMode", "1");
                    } catch { /* ignore */ }
                    setDemoOverride(true);
                  }}
                >
                  Continue in Demo Mode
                </Button>
              </div>
              <div className="text-xs opacity-70">
                Demo Mode hides this banner only. For database writes to succeed, complete the Supabase setup and login.
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Today's Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Reservations"
              storageKey="reservations"
              description="Front Desk reservations with room assignment and status transitions."
              columns={[
                { key: "guestName", label: "Guest", input: "text", required: true },
                { key: "confirmation", label: "Confirmation", input: "text", required: true },
                { key: "roomType", label: "Room Type", input: "text" },
                { key: "roomNumber", label: "Room #", input: "text" },
                { key: "arrival", label: "Arrival", input: "date" },
                { key: "departure", label: "Departure", input: "date" },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Booked", value: "Booked" },
                  { label: "CheckedIn", value: "CheckedIn" },
                  { label: "CheckedOut", value: "CheckedOut" },
                  { label: "Cancelled", value: "Cancelled" },
                ], required: true },
                { key: "balance", label: "Balance ($)", input: "number" },
                { key: "source", label: "Source", input: "select", options: [
                  { label: "Direct", value: "Direct" },
                  { label: "OTA", value: "OTA" },
                  { label: "Corporate", value: "Corporate" },
                ]},
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                { id: "r1", guestName: "Ana Garcia", confirmation: "CNF-1001", roomType: "Deluxe King", roomNumber: "205", arrival: "2025-09-09", departure: "2025-09-11", status: "Booked", balance: 220, source: "Direct", notes: "High floor" },
                { id: "r2", guestName: "Luis Fernandez", confirmation: "CNF-1002", roomType: "Standard Queen", roomNumber: "214", arrival: "2025-09-08", departure: "2025-09-10", status: "CheckedIn", balance: 0, source: "OTA", notes: "" },
                { id: "r3", guestName: "Maya Lee", confirmation: "CNF-1003", roomType: "Suite", roomNumber: "", arrival: "2025-09-12", departure: "2025-09-15", status: "Booked", balance: 650, source: "Corporate", notes: "Late arrival" },
              ]}
              backend="supabase"
              table="reservations"
              ownerField="owner"
              ownerValue={ownerEmail}
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}