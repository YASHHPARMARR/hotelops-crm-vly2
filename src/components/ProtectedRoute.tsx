import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { can } from "@/lib/rbac";
import { Role } from "@/convex/schema";
import { Navigate, useLocation } from "react-router";
import { Loader2 } from "lucide-react";

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
  requiredRole, 
  requiredPermission,
  fallbackPath = "/auth" 
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  // NEW: read demo role from localStorage for unauthenticated demo access
  const demoRole = typeof window !== "undefined" ? (localStorage.getItem("demoRole") as Role | null) : null;
  const effectiveRole: Role | undefined = (user?.role as Role | undefined) ?? (demoRole as Role | undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, allow demo access if a demoRole is present
  if (!isAuthenticated && !demoRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role requirement using effectiveRole (user role or demo role)
  if (requiredRole && effectiveRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement using effectiveRole
  if (requiredPermission && !can(effectiveRole, requiredPermission.action, requiredPermission.resource)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}