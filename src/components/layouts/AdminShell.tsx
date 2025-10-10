import { useAuth } from "@/hooks/use-auth";
import { ROLE_NAVIGATION } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Menu, 
  Search, 
  Settings, 
  User,
  X,
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Bed,
  FileText,
  Code
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";

import type { ReactNode } from "react";
// Define Role locally to avoid importing Convex server-side schema into client bundle
type Role =
  | "admin"
  | "front_desk"
  | "housekeeping"
  | "restaurant"
  | "security"
  | "maintenance"
  | "transport"
  | "inventory"
  | "guest";

import { useEffect } from "react";
import { applyThemeToDocument, getTheme } from "@/lib/theme";
import { getSupabase, getSupabaseUserEmail } from "@/lib/supabaseClient";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffRole, setStaffRole] = useState<Role | undefined>(undefined);
  // Add: track when we've loaded the staff role at least once to avoid premature redirects
  const [staffRoleLoaded, setStaffRoleLoaded] = useState(false);

  // Add: fallback to demoRole if user.role is undefined
  const demoRoleString = typeof window !== "undefined" ? localStorage.getItem("demoRole") : null;

  // Add: load staffRole from Supabase by email
  useEffect(() => {
    (async () => {
      try {
        // Only resolve staff role when authenticated; skip in demo mode
        const authEmail = user?.email;
        if (!authEmail) {
          setStaffRole(undefined);
          setStaffRoleLoaded(true); // mark as loaded for unauthenticated cases
          return;
        }
        const s = getSupabase();
        if (!s) {
          setStaffRole(undefined);
          setStaffRoleLoaded(true);
          return;
        }
        const { data, error } = await s
          .from("accounts")
          .select("role")
          .eq("email", authEmail)
          .limit(1)
          .maybeSingle();
        if (error) {
          setStaffRole(undefined);
          setStaffRoleLoaded(true);
          return;
        }
        const role = (data?.role as Role | undefined) || undefined;
        setStaffRole(role);
        setStaffRoleLoaded(true);
      } catch {
        setStaffRole(undefined);
        setStaffRoleLoaded(true);
      }
    })();
  }, [user?.email]);

  // Add: realtime listener to reflect role changes from Supabase immediately
  useEffect(() => {
    let channel: any | null = null;
    const s = getSupabase();

    (async () => {
      // Only listen for role changes when authenticated; ignore demo mode
      const authEmail = user?.email;
      if (!s || !authEmail) return;

      const refreshRole = async () => {
        try {
          const { data } = await s
            .from("accounts")
            .select("role")
            .eq("email", authEmail)
            .limit(1)
            .maybeSingle();
          const role = (data?.role as Role | undefined) || undefined;
          setStaffRole(role);
          // staffRoleLoaded should already be true after initial fetch
        } catch {
          // ignore
        }
      };

      channel = s
        .channel("accounts_role_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "accounts",
            filter: `email=eq.${authEmail}`,
          },
          () => {
            refreshRole();
          }
        );

      try {
        channel.subscribe();
      } catch {
        // ignore
      }
    })();

    return () => {
      try {
        if (channel && s) {
          s.removeChannel(channel);
        }
      } catch {
        // ignore
      }
    };
  }, [user?.email]);

  // Compute effectiveRole priority:
  // - If authenticated: use staffRole only (once loaded). Do NOT use demoRole to avoid flips.
  // - If not authenticated and demoRole is set: use demoRole for demo navigation.
  const isDemo = !user && !!demoRoleString;
  const effectiveRole: Role | undefined = user
    ? (staffRole as Role | undefined)
    : (isDemo ? (demoRoleString as Role | undefined) : undefined);

  const navigationItems = effectiveRole ? ROLE_NAVIGATION[effectiveRole] || [] : [];

  // Redirect only after role is resolved:
  // - If authenticated: wait for staffRoleLoaded before redirect checks.
  // - If demo: allow immediately.
  useEffect(() => {
    const ready = (user ? staffRoleLoaded : isDemo);
    if (!ready) return;

    const isAllowed =
      navigationItems.some(
        (i) =>
          i.path === location.pathname ||
          location.pathname.startsWith(i.path + "/")
      );

    if (!isAllowed && navigationItems.length > 0) {
      navigate(navigationItems[0].path, { replace: true });
    }
  }, [user, staffRoleLoaded, isDemo, navigationItems, location.pathname, navigate]);

  // Redirect to role-specific landing when at generic admin/dashboard (only when ready)
  useEffect(() => {
    const ready = (user ? staffRoleLoaded : isDemo);
    if (!ready) return;

    const genericHomes = new Set<string>(["/admin", "/dashboard"]);
    if (genericHomes.has(location.pathname) && navigationItems.length > 0) {
      navigate(navigationItems[0].path, { replace: true });
    }
  }, [user, staffRoleLoaded, isDemo, location.pathname, navigationItems, navigate]);

  // Initialize and react to theme changes
  useEffect(() => {
    const initial = getTheme();
    applyThemeToDocument(initial);

    const onTheme = (e: Event) => {
      const detail = (e as CustomEvent).detail as { theme?: string } | undefined;
      const t = (detail?.theme as any) ?? getTheme();
      applyThemeToDocument(t);
    };
    window.addEventListener("app:theme-changed", onTheme);
    return () => window.removeEventListener("app:theme-changed", onTheme);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)] p-4">
        <nav className="space-y-2">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/reservations"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin/reservations"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Reservations</span>
          </Link>
          <Link
            to="/admin/guests"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin/guests"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Guests</span>
          </Link>
          <Link
            to="/admin/staff"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin/staff"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <UserCog className="h-4 w-4" />
            <span>Staff</span>
          </Link>
          <Link
            to="/admin/rooms"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin/rooms"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Bed className="h-4 w-4" />
            <span>Rooms</span>
          </Link>
          <Link
            to="/admin/reports"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin/reports"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </Link>
          <Link
            to="/admin/tech"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin/tech"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Code className="h-4 w-4" />
            <span>Tech Info</span>
          </Link>
          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/admin/settings"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          sidebarOpen ? "ml-[280px]" : "ml-[80px]"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-neon-pink text-xs">
                3
              </Badge>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}