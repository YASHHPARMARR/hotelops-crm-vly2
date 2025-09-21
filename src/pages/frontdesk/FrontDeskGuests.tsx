import { AdminShell } from "@/components/layouts/AdminShell";
import { CrudPage } from "@/components/CrudPage";
import { ChatPanel } from "@/components/ChatPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function FrontDeskGuests() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guests</h1>
            <p className="text-muted-foreground">Manage guest information and profiles.</p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="neon-glow">
                <MessageSquare className="h-4 w-4 mr-2" />
                Team Chat
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
              <ChatPanel />
            </SheetContent>
          </Sheet>
        </div>

        <CrudPage
          title="Guest Directory"
          table="guests"
          columns={[
            { key: "name", label: "Full Name", type: "text", required: true },
            { key: "email", label: "Email", type: "email", required: true },
            { key: "phone", label: "Phone", type: "tel", required: true },
            { key: "address", label: "Address", type: "text" },
            { key: "loyalty", label: "Loyalty Status", type: "select", options: ["None", "Silver", "Gold", "Platinum"] },
            { key: "vip", label: "VIP Status", type: "select", options: ["No", "Yes"] },
            { key: "notes", label: "Notes", type: "text" }
          ]}
        />
      </div>
    </AdminShell>
  );
}