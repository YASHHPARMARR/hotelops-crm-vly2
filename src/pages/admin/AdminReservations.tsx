import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudPage } from "@/components/CrudPage";

export default function AdminReservations() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground">Manage and review all reservations.</p>
        </div>
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Reservations Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <CrudPage
              title="Bookings"
              storageKey="bookings"
              description="Full booking details, room assignment, payments, and status tracking."
              columns={[
                { key: "bookingId", label: "Booking ID", input: "text", required: true },
                { key: "guestName", label: "Guest Full Name", input: "text", required: true },
                { key: "email", label: "Email", input: "text", required: true },
                { key: "phone", label: "Phone", input: "text", required: true },
                { key: "address", label: "Address", input: "textarea" },
                { key: "country", label: "Country", input: "text", required: true },
                { key: "nationality", label: "Nationality", input: "text" },
                { key: "idNumber", label: "ID/Passport Number", input: "text" },

                { key: "roomType", label: "Room Type", input: "select", options: [
                  { label: "Single", value: "Single" },
                  { label: "Double", value: "Double" },
                  { label: "Suite", value: "Suite" },
                  { label: "Deluxe", value: "Deluxe" },
                ], required: true },
                { key: "roomNumber", label: "Room #", input: "text" },
                { key: "bedPreference", label: "Bed Preference", input: "select", options: [
                  { label: "King", value: "King" },
                  { label: "Queen", value: "Queen" },
                  { label: "Twin", value: "Twin" },
                ]},
                { key: "viewPreference", label: "View Preference", input: "select", options: [
                  { label: "Sea", value: "Sea" },
                  { label: "Garden", value: "Garden" },
                  { label: "City", value: "City" },
                ]},

                { key: "adults", label: "Adults", input: "number", required: true },
                { key: "children", label: "Children", input: "number" },
                { key: "checkInDate", label: "Check-in", input: "date", required: true },
                { key: "checkOutDate", label: "Check-out", input: "date", required: true },
                { key: "nights", label: "Nights", input: "number" },

                { key: "extraServices", label: "Extra Services (comma-separated)", input: "text" },
                { key: "promoCode", label: "Promo Code", input: "text" },

                { key: "paymentMode", label: "Payment Mode", input: "select", options: [
                  { label: "Cash", value: "Cash" },
                  { label: "Card", value: "Card" },
                  { label: "Online", value: "Online" },
                  { label: "Wallet", value: "Wallet" },
                ]},
                { key: "amountPaid", label: "Amount Paid", input: "number" },
                { key: "balance", label: "Balance", input: "number" },

                { key: "assignedStaff", label: "Assigned Staff", input: "text", required: true },

                { key: "bookingSource", label: "Booking Source", input: "select", options: [
                  { label: "Website", value: "Website" },
                  { label: "OTA", value: "OTA" },
                  { label: "Walk-in", value: "Walk-in" },
                  { label: "App", value: "App" },
                ]},
                { key: "bookingStatus", label: "Booking Status", input: "select", options: [
                  { label: "Pending", value: "Pending" },
                  { label: "Confirmed", value: "Confirmed" },
                  { label: "Checked-in", value: "Checked-in" },
                  { label: "Checked-out", value: "Checked-out" },
                  { label: "Canceled", value: "Canceled" },
                  { label: "No-show", value: "No-show" },
                ], required: true },
                { key: "paymentStatus", label: "Payment Status", input: "select", options: [
                  { label: "Pending", value: "Pending" },
                  { label: "Paid", value: "Paid" },
                  { label: "Partially Paid", value: "Partially Paid" },
                  { label: "Refunded", value: "Refunded" },
                ]},

                { key: "createdBy", label: "Created By", input: "text" },
                { key: "notes", label: "Notes / Internal Comments", input: "textarea" },
              ]}
              seed={[
                {
                  id: "bkg1",
                  bookingId: "BKG20250913001",
                  guestName: "Alice Johnson",
                  email: "alice@mail.com",
                  phone: "+919876543210",
                  address: "123 Street, City",
                  country: "India",
                  nationality: "Indian",
                  idNumber: "A1234567",
                  roomType: "Deluxe",
                  roomNumber: "101",
                  bedPreference: "King",
                  viewPreference: "Sea",
                  adults: 2,
                  children: 1,
                  checkInDate: "2025-09-14",
                  checkOutDate: "2025-09-17",
                  nights: 3,
                  extraServices: "Breakfast,Spa",
                  promoCode: "SUMMER25",
                  paymentMode: "Card",
                  amountPaid: 10000.0,
                  balance: 5000.0,
                  assignedStaff: "John Smith",
                  bookingSource: "Website",
                  bookingStatus: "Pending",
                  paymentStatus: "Pending",
                  createdBy: "Yash Parmar",
                  notes: "VIP guest, welcome pack required",
                },
              ]}
              backend="local"
            />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}