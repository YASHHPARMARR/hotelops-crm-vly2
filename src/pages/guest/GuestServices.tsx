import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BedDouble, Wrench, UtensilsCrossed, CalendarDays } from "lucide-react";
import { BookingRequestForm } from "./BookingRequestForm";
import { RoomAvailability } from "./RoomAvailability";
import { MyBookingRequests } from "./MyBookingRequests";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SERVICE_ITEMS = [
  { label: "Extra Towels", eta: "15-20 min", icon: "🛁" },
  { label: "Room Cleaning", eta: "30-45 min", icon: "🧹" },
  { label: "Laundry Pickup", eta: "Scheduled 6pm", icon: "👕" },
  { label: "Airport Shuttle", eta: "Tomorrow 9:00am", icon: "🚗" },
  { label: "Wake-up Call", eta: "Scheduled", icon: "⏰" },
  { label: "Minibar Restock", eta: "20-30 min", icon: "🍾" },
];

export default function GuestServices() {
  const [serviceForm, setServiceForm] = useState({ label: "", description: "" });
  const [submittingService, setSubmittingService] = useState(false);

  const serviceRequests = useQuery(api.guest.listRequests);
  const createServiceRequest = useMutation(api.guest.createRequest);

  async function handleServiceRequest(label: string, eta: string) {
    try {
      await createServiceRequest({ label, description: label, eta });
      toast.success(`${label} requested! ETA: ${eta}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit request");
    }
  }

  async function handleCustomService(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceForm.label) { toast.error("Please enter a service type"); return; }
    setSubmittingService(true);
    try {
      await createServiceRequest({
        label: serviceForm.label,
        description: serviceForm.description || serviceForm.label,
        eta: "TBD",
      });
      toast.success("Service request submitted!");
      setServiceForm({ label: "", description: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit");
    } finally {
      setSubmittingService(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Guest Services</h1>
            <p className="text-muted-foreground">Manage your stay, bookings, and service requests.</p>
          </div>
          <BookingRequestForm />
        </div>

        <Tabs defaultValue="booking">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="booking">
              <BedDouble className="h-4 w-4 mr-2" />
              Booking
            </TabsTrigger>
            <TabsTrigger value="services">
              <Wrench className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="availability">
              <CalendarDays className="h-4 w-4 mr-2" />
              Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="booking" className="space-y-4 mt-4">
            <MyBookingRequests />
          </TabsContent>

          <TabsContent value="services" className="space-y-4 mt-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Quick Service Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SERVICE_ITEMS.map(item => (
                    <button
                      key={item.label}
                      onClick={() => handleServiceRequest(item.label, item.eta)}
                      className="rounded-lg border border-border bg-background/50 p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">ETA: {item.eta}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Custom Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCustomService} className="space-y-3">
                  <div className="space-y-1">
                    <Label>Service Type</Label>
                    <Input
                      placeholder="e.g., Extra pillows, Iron & board..."
                      value={serviceForm.label}
                      onChange={e => setServiceForm(f => ({ ...f, label: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Additional Details</Label>
                    <Textarea
                      placeholder="Any specific instructions..."
                      value={serviceForm.description}
                      onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="neon-glow" disabled={submittingService}>
                    Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>

            {serviceRequests && serviceRequests.length > 0 && (
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>My Service Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {serviceRequests.slice(0, 10).map((req: { _id: string; label: string; eta: string; status: string }) => (
                      <div key={req._id} className="flex items-center justify-between rounded-md bg-background/50 px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-foreground">{req.label}</div>
                          <div className="text-xs text-muted-foreground">ETA: {req.eta}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="availability" className="mt-4">
            <RoomAvailability />
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}