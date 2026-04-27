import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function ConvexReservationForm() {
  const vacantRooms = useQuery(api.rooms.getVacantRooms);

  const [form, setForm] = useState({
    guestName: "",
    idProofType: "",
    idProofNumber: "",
    roomType: "",
    roomNumber: "",
    arrival: new Date().toISOString().slice(0, 10),
    departure: new Date().toISOString().slice(0, 10),
    status: "Booked",
    balance: 0,
    source: "",
    notes: "",
  });

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.guestName || !form.idProofType || !form.idProofNumber || !form.roomType || !form.roomNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    // Here you would call a Convex mutation to create the reservation
    toast.success("Reservation created successfully!");

    // Reset form
    setForm({
      guestName: "",
      idProofType: "",
      idProofNumber: "",
      roomType: "",
      roomNumber: "",
      arrival: new Date().toISOString().slice(0, 10),
      departure: new Date().toISOString().slice(0, 10),
      status: "Booked",
      balance: 0,
      source: "",
      notes: "",
    });
  };

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle>Add New Reservation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">
              Guest Name<span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="guestName"
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              placeholder="Enter guest name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idProofType">
              ID Proof Type<span className="text-destructive ml-1">*</span>
            </Label>
            <Select value={form.idProofType} onValueChange={(v) => setForm({ ...form, idProofType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Passport">Passport</SelectItem>
                <SelectItem value="Driver License">Driver License</SelectItem>
                <SelectItem value="Aadhar">Aadhar</SelectItem>
                <SelectItem value="National ID">National ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idProofNumber">
              ID Proof Number<span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="idProofNumber"
              value={form.idProofNumber}
              onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
              placeholder="Enter ID number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType">
              Room Type<span className="text-destructive ml-1">*</span>
            </Label>
            <Select value={form.roomType} onValueChange={(v) => setForm({ ...form, roomType: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Deluxe">Deluxe</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
                <SelectItem value="Presidential">Presidential</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomNumber">
              Room Number<span className="text-destructive ml-1">*</span>
            </Label>
            <Select value={form.roomNumber} onValueChange={(v) => setForm({ ...form, roomNumber: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select room number" />
              </SelectTrigger>
              <SelectContent>
                {!vacantRooms ? (
                  <SelectItem value="loading" disabled>
                    Loading rooms...
                  </SelectItem>
                ) : vacantRooms.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No vacant rooms available
                  </SelectItem>
                ) : (
                  vacantRooms.map((room) => (
                    <SelectItem key={room.id} value={room.number}>
                      Room {room.number} - Floor {room.floor}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrival">
              Arrival<span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="arrival"
              type="date"
              value={form.arrival}
              onChange={(e) => setForm({ ...form, arrival: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departure">
              Departure<span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="departure"
              type="date"
              value={form.departure}
              onChange={(e) => setForm({ ...form, departure: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Status<span className="text-destructive ml-1">*</span>
            </Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="CheckedIn">CheckedIn</SelectItem>
                <SelectItem value="CheckedOut">CheckedOut</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Balance</Label>
            <Input
              id="balance"
              type="number"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Direct">Direct</SelectItem>
                <SelectItem value="OTA">OTA</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2 lg:col-span-3">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Special requests or notes"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} className="neon-glow">
          Add Reservation
        </Button>
      </CardContent>
    </Card>
  );
}
