import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminRooms() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rooms</h1>
          <p className="text-muted-foreground">Configuration and status of all rooms.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Rooms Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Rooms"
              storageKey="rooms"
              description="Configure rooms with full setup and live status."
              columns={[
                { key: "number", label: "Room #", input: "text", required: true },
                { key: "roomType", label: "Room Type", input: "select", options: [
                  { label: "Single", value: "Single" },
                  { label: "Double", value: "Double" },
                  { label: "Suite", value: "Suite" },
                  { label: "Deluxe", value: "Deluxe" },
                ], required: true },
                { key: "bedType", label: "Bed Type", input: "select", options: [
                  { label: "King", value: "King" },
                  { label: "Queen", value: "Queen" },
                  { label: "Twin", value: "Twin" },
                ], required: true },
                { key: "status", label: "Status", input: "select", options: [
                  { label: "Vacant", value: "Vacant" },
                  { label: "Occupied", value: "Occupied" },
                  { label: "Under Maintenance", value: "Under Maintenance" },
                  { label: "Reserved", value: "Reserved" },
                ], required: true },
                { key: "pricePerNight", label: "Price per night", input: "number", required: true },
                { key: "maxOccupancy", label: "Max Occupancy", input: "number", required: true },
                { key: "viewBalcony", label: "View / Balcony", input: "select", options: [
                  { label: "Sea", value: "Sea" },
                  { label: "Garden", value: "Garden" },
                  { label: "City", value: "City" },
                  { label: "None", value: "None" },
                ]},
                { key: "floorWing", label: "Floor / Wing", input: "text" },
                { key: "amenities", label: "Amenities (comma-separated)", input: "text" },
                { key: "notes", label: "Notes", input: "textarea" },
              ]}
              seed={[
                {
                  id: "rm1",
                  number: "101",
                  roomType: "Deluxe",
                  bedType: "King",
                  status: "Vacant",
                  pricePerNight: 4000.0,
                  maxOccupancy: 3,
                  viewBalcony: "Sea",
                  floorWing: "Floor 1, Wing A",
                  amenities: "AC,Wi-Fi,Minibar",
                  notes: "Recently renovated",
                },
                {
                  id: "rm2",
                  number: "205",
                  roomType: "Suite",
                  bedType: "King",
                  status: "Occupied",
                  pricePerNight: 6500.0,
                  maxOccupancy: 4,
                  viewBalcony: "City",
                  floorWing: "Floor 2, Wing B",
                  amenities: "AC,TV,Wi-Fi,Kitchenette",
                  notes: "",
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