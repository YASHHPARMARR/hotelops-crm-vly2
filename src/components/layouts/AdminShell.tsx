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
  X
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

import type { ReactNode } from "react";
import { Role, ROLES } from "@/convex/schema";

import { useEffect } from "react";
import { applyThemeToDocument, getTheme } from "@/lib/theme";
import { getSupabase, getSupabaseUserEmail } from "@/lib/supabaseClient";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffRole, setStaffRole] = useState<Role | undefined>(undefined);

  // Add: fallback to demoRole if user.role is undefined
  const demoRoleString = typeof window !== "undefined" ? localStorage.getItem("demoRole") : null;

  // Add: load staffRole from Supabase by email
  useEffect(() => {
    (async () => {
      try {
        const email = await getSupabaseUserEmail();
        const s = getSupabase();
        if (!s || !email) {
          setStaffRole(undefined);
          return;
        }
        const { data, error } = await s.from("staff").select("role").eq("email", email).limit(1).maybeSingle();
        if (error) {
          setStaffRole(undefined);
          return;
        }
        const role = (data?.role as Role | undefined) || undefined;
        setStaffRole(role);
      } catch {
        setStaffRole(undefined);
      }
    })();
  }, [user?.email]);

  // Compute effectiveRole priority: Supabase staff role > user.role > demoRole
  const effectiveRole: Role | undefined =
    (staffRole as Role | undefined) ||
    (user?.role as Role | undefined) ||
    (demoRoleString as Role | undefined);

  const navigationItems = effectiveRole ? ROLE_NAVIGATION[effectiveRole] || [] : [];

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
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 z-40 h-full bg-card border-r border-border"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">H</span>
              </div>
              {sidebarOpen && (
                <span className="font-bold text-lg text-foreground">HotelOps</span>
              )}
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground neon-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <div className="w-5 h-5" />
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-auto p-3",
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{user?.name || "User"}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {(effectiveRole || "").replace("_", " ")}
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>

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