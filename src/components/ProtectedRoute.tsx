import type { ReactNode } from "react";
import { Role } from "@/convex/schema";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";

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
  const { isLoading, isAuthenticated } = useAuth();

  // Check for demo mode
  const demoRole = typeof window !== "undefined" ? localStorage.getItem("demoRole") : null;

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Allow access if authenticated OR in demo mode
  if (!isAuthenticated && !demoRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Allow access
  return <>{children}</>;
}