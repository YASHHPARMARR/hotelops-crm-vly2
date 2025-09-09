import { Toaster } from "@/components/ui/sonner";
/* VlyToolbar removed: file not present */
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
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

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* VlyToolbar removed */}
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/admin" />} />
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

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);