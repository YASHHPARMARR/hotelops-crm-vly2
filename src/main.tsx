import { Toaster } from "@/components/ui/sonner";
/* VlyToolbar removed: file not present */
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Unauthorized from "./pages/Unauthorized.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import "./types/global.d.ts";

import FrontDeskDashboard from "@/pages/FrontDeskDashboard.tsx";
import HousekeepingDashboard from "@/pages/HousekeepingDashboard.tsx";
import RestaurantDashboard from "@/pages/RestaurantDashboard.tsx";
import SecurityDashboard from "@/pages/SecurityDashboard.tsx";
import MaintenanceDashboard from "@/pages/MaintenanceDashboard.tsx";
import TransportDashboard from "@/pages/TransportDashboard.tsx";
import InventoryDashboard from "@/pages/InventoryDashboard.tsx";
import GuestDashboard from "@/pages/GuestDashboard.tsx";

import AdminReservations from "@/pages/admin/AdminReservations.tsx";
import AdminGuests from "@/pages/admin/AdminGuests.tsx";
import AdminRooms from "@/pages/admin/AdminRooms.tsx";
import AdminStaff from "@/pages/admin/AdminStaff.tsx";
import AdminReports from "@/pages/admin/AdminReports.tsx";
import AdminSettings from "@/pages/admin/AdminSettings.tsx";

import FrontDeskReservations from "@/pages/frontdesk/FrontDeskReservations.tsx";
import FrontDeskCheckIn from "@/pages/frontdesk/FrontDeskCheckIn.tsx";
import FrontDeskGuests from "@/pages/frontdesk/FrontDeskGuests.tsx";
import FrontDeskRooms from "@/pages/frontdesk/FrontDeskRooms.tsx";

import MaintenanceTickets from "@/pages/maintenance/MaintenanceTickets.tsx";
import MaintenanceAssets from "@/pages/maintenance/MaintenanceAssets.tsx";
import MaintenanceSchedule from "@/pages/maintenance/MaintenanceSchedule.tsx";
import MaintenanceUser from "@/pages/maintenance/MaintenanceUser.tsx";

import HousekeepingTasks from "@/pages/housekeeping/HousekeepingTasks.tsx";
import HousekeepingRooms from "@/pages/housekeeping/HousekeepingRooms.tsx";
import HousekeepingInventory from "@/pages/housekeeping/HousekeepingInventory.tsx";
import RestaurantOrders from "@/pages/restaurant/RestaurantOrders.tsx";
import RestaurantMenu from "@/pages/restaurant/RestaurantMenu.tsx";
import RestaurantTables from "@/pages/restaurant/RestaurantTables.tsx";
import SecurityIncidents from "@/pages/security/SecurityIncidents.tsx";
import SecurityBadges from "@/pages/security/SecurityBadges.tsx";
import SecurityReports from "@/pages/security/SecurityReports.tsx";
import TransportTrips from "@/pages/transport/TransportTrips.tsx";
import TransportVehicles from "@/pages/transport/TransportVehicles.tsx";
import TransportSchedule from "@/pages/transport/TransportSchedule.tsx";
import InventoryItems from "@/pages/inventory/InventoryItems.tsx";
import InventorySuppliers from "@/pages/inventory/InventorySuppliers.tsx";
import InventoryOrders from "@/pages/inventory/InventoryOrders.tsx";
import GuestServices from "@/pages/guest/GuestServices.tsx";
import GuestDining from "@/pages/guest/GuestDining.tsx";
import GuestBills from "@/pages/guest/GuestBills.tsx";

import { useAuth } from "./hooks/use-auth.ts";
import { applyThemeToDocument, getTheme } from "@/lib/theme";

const convexUrl = "https://dynamic-labrador-171.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

applyThemeToDocument(getTheme());

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

function DashboardRedirect() {
  const { isLoading, isAuthenticated, user } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  const role = user?.role;
  // Map roles to landing dashboards
  const pathByRole: Record<string, string> = {
    admin: "/admin",
    front_desk: "/front-desk",
    housekeeping: "/housekeeping",
    restaurant: "/restaurant",
    security: "/security",
    maintenance: "/maintenance",
    transport: "/transport",
    inventory: "/inventory",
    guest: "/guest",
  };
  const target = role ? pathByRole[role] ?? "/admin" : "/admin";
  return <Navigate to={target} replace />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* VlyToolbar removed */}
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin sub-routes */}
            <Route 
              path="/admin/reservations" 
              element={
                <ProtectedRoute>
                  <AdminReservations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/guests" 
              element={
                <ProtectedRoute>
                  <AdminGuests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/rooms" 
              element={
                <ProtectedRoute>
                  <AdminRooms />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/staff" 
              element={
                <ProtectedRoute>
                  <AdminStaff />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />

            {/* Additional role dashboards (reuse AdminDashboard for demo) */}
            <Route 
              path="/front-desk" 
              element={
                <ProtectedRoute>
                  <FrontDeskDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/housekeeping" 
              element={
                <ProtectedRoute>
                  <HousekeepingDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurant" 
              element={
                <ProtectedRoute>
                  <RestaurantDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security" 
              element={
                <ProtectedRoute>
                  <SecurityDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/maintenance" 
              element={
                <ProtectedRoute>
                  <MaintenanceDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport" 
              element={
                <ProtectedRoute>
                  <TransportDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <InventoryDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guest" 
              element={
                <ProtectedRoute>
                  <GuestDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Front Desk sub-routes */}
            <Route 
              path="/front-desk/reservations" 
              element={
                <ProtectedRoute>
                  <FrontDeskReservations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/front-desk/checkin" 
              element={
                <ProtectedRoute>
                  <FrontDeskCheckIn />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/front-desk/guests" 
              element={
                <ProtectedRoute>
                  <FrontDeskGuests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/front-desk/rooms" 
              element={
                <ProtectedRoute>
                  <FrontDeskRooms />
                </ProtectedRoute>
              } 
            />

            {/* Maintenance sub-routes */}
            <Route 
              path="/maintenance/tickets" 
              element={
                <ProtectedRoute>
                  <MaintenanceTickets />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/maintenance/assets" 
              element={
                <ProtectedRoute>
                  <MaintenanceAssets />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/maintenance/schedule" 
              element={
                <ProtectedRoute>
                  <MaintenanceSchedule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/maintenance/user" 
              element={
                <ProtectedRoute>
                  <MaintenanceUser />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/housekeeping/tasks" 
              element={
                <ProtectedRoute>
                  <HousekeepingTasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/housekeeping/rooms" 
              element={
                <ProtectedRoute>
                  <HousekeepingRooms />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/housekeeping/inventory" 
              element={
                <ProtectedRoute>
                  <HousekeepingInventory />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/restaurant/orders" 
              element={
                <ProtectedRoute>
                  <RestaurantOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurant/menu" 
              element={
                <ProtectedRoute>
                  <RestaurantMenu />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurant/tables" 
              element={
                <ProtectedRoute>
                  <RestaurantTables />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/security/incidents" 
              element={
                <ProtectedRoute>
                  <SecurityIncidents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security/badges" 
              element={
                <ProtectedRoute>
                  <SecurityBadges />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security/reports" 
              element={
                <ProtectedRoute>
                  <SecurityReports />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/transport/trips" 
              element={
                <ProtectedRoute>
                  <TransportTrips />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport/vehicles" 
              element={
                <ProtectedRoute>
                  <TransportVehicles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transport/schedule" 
              element={
                <ProtectedRoute>
                  <TransportSchedule />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/inventory/items" 
              element={
                <ProtectedRoute>
                  <InventoryItems />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory/suppliers" 
              element={
                <ProtectedRoute>
                  <InventorySuppliers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory/orders" 
              element={
                <ProtectedRoute>
                  <InventoryOrders />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/guest/services" 
              element={
                <ProtectedRoute>
                  <GuestServices />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guest/dining" 
              element={
                <ProtectedRoute>
                  <GuestDining />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guest/bills" 
              element={
                <ProtectedRoute>
                  <GuestBills />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);