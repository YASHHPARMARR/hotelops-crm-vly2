import type { ReactNode } from "react";
import { Role } from "@/convex/schema";
import { Navigate, useLocation } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
  requiredPermission?: {
    action: string;
    resource: string;
  };
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  fallbackPath = "/auth" 
}: ProtectedRouteProps) {
  const location = useLocation();

  // Check for demo role in localStorage
  const demoRole = typeof window !== "undefined" ? localStorage.getItem("demoRole") : null;

  // If no demo role is set, redirect to auth page
  if (!demoRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Allow access if demo role exists
  return <>{children}</>;
}