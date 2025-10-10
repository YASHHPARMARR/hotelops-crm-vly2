import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Code,
  Database,
  Server,
  Layers,
  Package,
  Shield,
  Zap,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function AdminTech() {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const techStack = {
    frontend: [
      { name: "React", version: "18.x", purpose: "UI Framework" },
      { name: "TypeScript", version: "5.x", purpose: "Type Safety" },
      { name: "Vite", version: "5.x", purpose: "Build Tool" },
      { name: "React Router", version: "6.x", purpose: "Routing" },
      { name: "Tailwind CSS", version: "3.x", purpose: "Styling" },
      { name: "Shadcn/ui", version: "Latest", purpose: "UI Components" },
      { name: "Framer Motion", version: "11.x", purpose: "Animations" },
      { name: "Recharts", version: "2.x", purpose: "Data Visualization" },
      { name: "Sonner", version: "Latest", purpose: "Toast Notifications" },
    ],
    backend: [
      { name: "Convex", version: "Latest", purpose: "Authentication (OTP)" },
      { name: "Supabase", version: "Latest", purpose: "Database & Storage" },
      { name: "PostgreSQL", version: "15.x", purpose: "Database Engine" },
    ],
    integrations: [
      { name: "Resend", purpose: "Email Service", status: "Configured" },
      { name: "Convex Auth", purpose: "OTP Authentication", status: "Active" },
    ],
  };

  const architecture = {
    patterns: [
      "Component-Based Architecture",
      "Role-Based Access Control (RBAC)",
      "Real-time Data Synchronization",
      "Progressive Web App (PWA) Ready",
    ],
    dataFlow: [
      "Client → React Components",
      "State Management → React Hooks",
      "Authentication → Convex Auth (OTP)",
      "Data Layer → Supabase PostgreSQL",
      "Real-time Updates → 30s Polling",
    ],
  };

  const databaseSchema = {
    tables: [
      { name: "accounts", purpose: "User accounts and roles", columns: 15 },
      { name: "users", purpose: "User profiles", columns: 8 },
      { name: "guests", purpose: "Guest information & loyalty", columns: 12 },
      { name: "reservations", purpose: "Booking records", columns: 14 },
      { name: "rooms", purpose: "Room inventory & status", columns: 15 },
      { name: "hk_tasks", purpose: "Housekeeping tasks", columns: 7 },
      { name: "hk_inventory", purpose: "Housekeeping supplies", columns: 5 },
      { name: "restaurant_menu", purpose: "Menu items", columns: 6 },
      { name: "restaurant_orders", purpose: "Food orders", columns: 6 },
      { name: "restaurant_tables", purpose: "Table management", columns: 5 },
      { name: "dining_orders", purpose: "Guest dining orders", columns: 5 },
      { name: "charges", purpose: "Guest charges", columns: 7 },
      { name: "payments", purpose: "Payment records", columns: 6 },
      { name: "transport_trips", purpose: "Transport bookings", columns: 6 },
      { name: "transport_vehicles", purpose: "Vehicle fleet", columns: 6 },
      { name: "staff", purpose: "Staff roles", columns: 4 },
      { name: "admin_staff", purpose: "Staff details", columns: 25 },
      { name: "admin_reports", purpose: "System reports", columns: 8 },
    ],
  };

  const security = {
    authentication: [
      "Convex OTP-based email authentication",
      "Session management with secure tokens",
      "Role-based access control (RBAC)",
      "Demo mode with localStorage fallback",
    ],
    database: [
      "Row Level Security (RLS) policies",
      "Owner-scoped data access",
      "Encrypted connections (SSL/TLS)",
      "Prepared statements (SQL injection prevention)",
    ],
    frontend: [
      "XSS protection via React",
      "CSRF token validation",
      "Secure environment variable handling",
      "Content Security Policy headers",
    ],
  };

  const features = {
    core: [
      "Multi-role dashboard system (9 roles)",
      "Real-time data synchronization",
      "Dynamic room availability tracking",
      "Automated check-in/check-out",
      "Guest profile management",
      "Quick access code system",
      "Loyalty points tracking",
    ],
    operational: [
      "Reservation management",
      "Housekeeping task scheduling",
      "Restaurant order processing",
      "Maintenance ticket system",
      "Security incident logging",
      "Transport trip management",
      "Inventory tracking",
    ],
    reporting: [
      "Revenue analytics",
      "Occupancy metrics",
      "Department performance",
      "Financial reports (P&L)",
      "Staff activity logs",
    ],
  };

  const apiEndpoints = {
    convex: [
      { method: "POST", path: "/auth/email-otp", purpose: "Send OTP code" },
      { method: "POST", path: "/auth/verify", purpose: "Verify OTP" },
    ],
    supabase: [
      { method: "GET", path: "/rest/v1/reservations", purpose: "Fetch reservations" },
      { method: "POST", path: "/rest/v1/reservations", purpose: "Create reservation" },
      { method: "PATCH", path: "/rest/v1/reservations", purpose: "Update reservation" },
      { method: "DELETE", path: "/rest/v1/reservations", purpose: "Delete reservation" },
      { method: "GET", path: "/rest/v1/rooms", purpose: "Fetch rooms" },
      { method: "GET", path: "/rest/v1/guests", purpose: "Fetch guests" },
    ],
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Technical Information</h1>
            <p className="text-muted-foreground">
              Comprehensive system architecture and technical documentation
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            System Status: Operational
          </Badge>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stack">Tech Stack</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Design Patterns</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {architecture.patterns.map((pattern, i) => (
                      <Badge key={i} variant="outline" className="justify-start">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data Flow</h3>
                  <div className="space-y-2">
                    {architecture.dataFlow.map((flow, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">{flow}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg">Frontend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {techStack.frontend.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Technologies</p>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg">Database Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {databaseSchema.tables.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Tables</p>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-lg">User Roles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">9</div>
                  <p className="text-sm text-muted-foreground">Role Types</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tech Stack Tab */}
          <TabsContent value="stack" className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Frontend Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {techStack.frontend.map((tech, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                    >
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">{tech.purpose}</div>
                      </div>
                      <Badge variant="outline">{tech.version}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Backend & Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {techStack.backend.map((tech, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                    >
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">{tech.purpose}</div>
                      </div>
                      <Badge variant="outline">{tech.version}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {techStack.integrations.map((integration, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                    >
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {integration.purpose}
                        </div>
                      </div>
                      <Badge variant="default">{integration.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {databaseSchema.tables.map((table, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex-1">
                        <div className="font-medium font-mono text-sm">{table.name}</div>
                        <div className="text-xs text-muted-foreground">{table.purpose}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {table.columns} cols
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Engine</div>
                    <div className="font-medium">PostgreSQL 15.x</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Provider</div>
                    <div className="font-medium">Supabase</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Refresh Rate</div>
                    <div className="font-medium">30 seconds</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Security</div>
                    <div className="font-medium">RLS Enabled</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Authentication & Authorization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {security.authentication.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Database Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {security.database.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Frontend Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {security.frontend.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Core Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.core.map((feature, i) => (
                    <Badge key={i} variant="outline" className="justify-start py-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Operational Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.operational.map((feature, i) => (
                    <Badge key={i} variant="outline" className="justify-start py-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Reporting & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {features.reporting.map((feature, i) => (
                    <Badge key={i} variant="outline" className="justify-start py-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Convex API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {apiEndpoints.convex.map((endpoint, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <span className="text-sm text-muted-foreground">{endpoint.purpose}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Supabase REST API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {apiEndpoints.supabase.map((endpoint, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`font-mono ${
                            endpoint.method === "GET"
                              ? "text-blue-500"
                              : endpoint.method === "POST"
                              ? "text-green-500"
                              : endpoint.method === "PATCH"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <span className="text-sm text-muted-foreground">{endpoint.purpose}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {[
                    { key: "VITE_CONVEX_URL", purpose: "Convex backend URL" },
                    { key: "VITE_SUPABASE_URL", purpose: "Supabase project URL" },
                    { key: "VITE_SUPABASE_ANON_KEY", purpose: "Supabase anonymous key" },
                    { key: "RESEND_API_KEY", purpose: "Email service API key" },
                  ].map((env, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                    >
                      <div>
                        <code className="text-sm font-mono">{env.key}</code>
                        <div className="text-xs text-muted-foreground mt-1">{env.purpose}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(env.key, env.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://docs.convex.dev" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Convex Docs
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Supabase Docs
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  React Docs
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Tailwind Docs
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
