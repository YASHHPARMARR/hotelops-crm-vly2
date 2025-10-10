import { Toaster } from "@/components/ui/sonner";
/* VlyToolbar removed: file not present */
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, useLocation, Navigate } from "react-router";
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
import AdminTech from "@/pages/admin/AdminTech.tsx";

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

import UserProfile from "@/pages/shared/UserProfile.tsx";

import { useAuth } from "./hooks/use-auth.ts";
import { applyThemeToDocument, getTheme } from "@/lib/theme";

const convexUrl =
  (import.meta as any).env?.VITE_CONVEX_URL ||
  "https://deafening-kingfisher-843.convex.cloud";

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
  const role = ((user as any)?.role as string | undefined) ?? (typeof window !== "undefined" ? (localStorage.getItem("demoRole") || undefined) : undefined);
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reservations",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminReservations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/guests",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminGuests />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/staff",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminStaff />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminReports />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/rooms",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminRooms />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/tech",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminTech />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/profile",
    element: (
      <ProtectedRoute requiredRole="admin">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/front-desk",
    element: (
      <ProtectedRoute requiredRole="front_desk">
        <FrontDeskDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/housekeeping",
    element: (
      <ProtectedRoute requiredRole="housekeeping">
        <HousekeepingDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/restaurant",
    element: (
      <ProtectedRoute requiredRole="restaurant">
        <RestaurantDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/security",
    element: (
      <ProtectedRoute requiredRole="security">
        <SecurityDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/maintenance",
    element: (
      <ProtectedRoute requiredRole="maintenance">
        <MaintenanceDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transport",
    element: (
      <ProtectedRoute requiredRole="transport">
        <TransportDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory",
    element: (
      <ProtectedRoute requiredRole="inventory">
        <InventoryDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/guest",
    element: (
      <ProtectedRoute requiredRole="guest">
        <GuestDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/front-desk/reservations",
    element: (
      <ProtectedRoute requiredRole="front_desk">
        <FrontDeskReservations />
      </ProtectedRoute>
    ),
  },
  {
    path: "/front-desk/checkin",
    element: (
      <ProtectedRoute requiredRole="front_desk">
        <FrontDeskCheckIn />
      </ProtectedRoute>
    ),
  },
  {
    path: "/front-desk/guests",
    element: (
      <ProtectedRoute requiredRole="front_desk">
        <FrontDeskGuests />
      </ProtectedRoute>
    ),
  },
  {
    path: "/front-desk/rooms",
    element: (
      <ProtectedRoute requiredRole="front_desk">
        <FrontDeskRooms />
      </ProtectedRoute>
    ),
  },
  {
    path: "/maintenance/tickets",
    element: (
      <ProtectedRoute requiredRole="maintenance">
        <MaintenanceTickets />
      </ProtectedRoute>
    ),
  },
  {
    path: "/maintenance/assets",
    element: (
      <ProtectedRoute requiredRole="maintenance">
        <MaintenanceAssets />
      </ProtectedRoute>
    ),
  },
  {
    path: "/maintenance/schedule",
    element: (
      <ProtectedRoute requiredRole="maintenance">
        <MaintenanceSchedule />
      </ProtectedRoute>
    ),
  },
  {
    path: "/maintenance/user",
    element: (
      <ProtectedRoute requiredRole="maintenance">
        <MaintenanceUser />
      </ProtectedRoute>
    ),
  },
  {
    path: "/housekeeping/tasks",
    element: (
      <ProtectedRoute requiredRole="housekeeping">
        <HousekeepingTasks />
      </ProtectedRoute>
    ),
  },
  {
    path: "/housekeeping/rooms",
    element: (
      <ProtectedRoute requiredRole="housekeeping">
        <HousekeepingRooms />
      </ProtectedRoute>
    ),
  },
  {
    path: "/housekeeping/inventory",
    element: (
      <ProtectedRoute requiredRole="housekeeping">
        <HousekeepingInventory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/restaurant/orders",
    element: (
      <ProtectedRoute requiredRole="restaurant">
        <RestaurantOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/restaurant/menu",
    element: (
      <ProtectedRoute requiredRole="restaurant">
        <RestaurantMenu />
      </ProtectedRoute>
    ),
  },
  {
    path: "/restaurant/tables",
    element: (
      <ProtectedRoute requiredRole="restaurant">
        <RestaurantTables />
      </ProtectedRoute>
    ),
  },
  {
    path: "/security/incidents",
    element: (
      <ProtectedRoute requiredRole="security">
        <SecurityIncidents />
      </ProtectedRoute>
    ),
  },
  {
    path: "/security/badges",
    element: (
      <ProtectedRoute requiredRole="security">
        <SecurityBadges />
      </ProtectedRoute>
    ),
  },
  {
    path: "/security/reports",
    element: (
      <ProtectedRoute requiredRole="security">
        <SecurityReports />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transport/trips",
    element: (
      <ProtectedRoute requiredRole="transport">
        <TransportTrips />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transport/vehicles",
    element: (
      <ProtectedRoute requiredRole="transport">
        <TransportVehicles />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transport/schedule",
    element: (
      <ProtectedRoute requiredRole="transport">
        <TransportSchedule />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory/items",
    element: (
      <ProtectedRoute requiredRole="inventory">
        <InventoryItems />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory/suppliers",
    element: (
      <ProtectedRoute requiredRole="inventory">
        <InventorySuppliers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory/orders",
    element: (
      <ProtectedRoute requiredRole="inventory">
        <InventoryOrders />
      </ProtectedRoute>
    ),
  },
  {
    path: "/guest/services",
    element: (
      <ProtectedRoute requiredRole="guest">
        <GuestServices />
      </ProtectedRoute>
    ),
  },
  {
    path: "/guest/dining",
    element: (
      <ProtectedRoute requiredRole="guest">
        <GuestDining />
      </ProtectedRoute>
    ),
  },
  {
    path: "/guest/bills",
    element: (
      <ProtectedRoute requiredRole="guest">
        <GuestBills />
      </ProtectedRoute>
    ),
  },
  {
    path: "/front-desk/profile",
    element: (
      <ProtectedRoute requiredRole="front_desk">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/housekeeping/profile",
    element: (
      <ProtectedRoute requiredRole="housekeeping">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/restaurant/profile",
    element: (
      <ProtectedRoute requiredRole="restaurant">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/security/profile",
    element: (
      <ProtectedRoute requiredRole="security">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/maintenance/profile",
    element: (
      <ProtectedRoute requiredRole="maintenance">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/transport/profile",
    element: (
      <ProtectedRoute requiredRole="transport">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inventory/profile",
    element: (
      <ProtectedRoute requiredRole="inventory">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/guest/profile",
    element: (
      <ProtectedRoute requiredRole="guest">
        <UserProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* VlyToolbar removed */}
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);