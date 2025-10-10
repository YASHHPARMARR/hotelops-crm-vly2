import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  Code,
  Database,
  Shield,
  Zap,
  Server,
  Globe,
  Lock,
  FileCode,
  Layers,
  GitBranch,
  Package,
  ExternalLink,
} from "lucide-react";

export default function AdminTech() {
  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Code className="h-8 w-8 text-primary" />
              Technical Documentation
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive technical overview of the HotelOps CRM system
            </p>
          </div>
        </div>

        {/* Tech Stack Overview */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Tech Stack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Frontend */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-400" />
                Frontend
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "React 18", desc: "UI Library" },
                  { name: "TypeScript", desc: "Type Safety" },
                  { name: "Vite", desc: "Build Tool" },
                  { name: "React Router", desc: "Routing" },
                  { name: "Tailwind CSS", desc: "Styling" },
                  { name: "Shadcn/ui", desc: "UI Components" },
                  { name: "Framer Motion", desc: "Animations" },
                  { name: "Recharts", desc: "Data Visualization" },
                  { name: "Sonner", desc: "Toast Notifications" },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="p-3 rounded-lg bg-background/50 border border-border"
                  >
                    <div className="font-medium text-sm">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Backend */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Server className="h-5 w-5 text-green-400" />
                Backend & Database
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "Convex", desc: "Authentication (OTP)" },
                  { name: "Supabase", desc: "Database & Storage" },
                  { name: "PostgreSQL 15.x", desc: "Database Engine" },
                  { name: "Row Level Security", desc: "Data Protection" },
                  { name: "Real-time Subscriptions", desc: "Live Updates" },
                  { name: "REST API", desc: "Data Operations" },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="p-3 rounded-lg bg-background/50 border border-border"
                  >
                    <div className="font-medium text-sm">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Integrations */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-400" />
                Integrations
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "Resend", desc: "Email Service" },
                  { name: "Convex Auth", desc: "OTP Authentication" },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="p-3 rounded-lg bg-background/50 border border-border"
                  >
                    <div className="font-medium text-sm">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              System Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Design Patterns</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Pattern</Badge>
                  <span><strong>Component-Based Architecture:</strong> Modular React components for reusability and maintainability</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Pattern</Badge>
                  <span><strong>Role-Based Access Control (RBAC):</strong> Fine-grained permissions per user role</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Pattern</Badge>
                  <span><strong>Real-time Data Synchronization:</strong> 30-second polling for live updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Pattern</Badge>
                  <span><strong>Progressive Web App (PWA) Ready:</strong> Offline capabilities and installable</span>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Data Flow</h3>
              <div className="p-4 rounded-lg bg-background/50 border border-border font-mono text-xs">
                <div className="space-y-1">
                  <div>Client → React Components</div>
                  <div className="ml-4">↓</div>
                  <div>React Hooks (useAuth, useQuery)</div>
                  <div className="ml-4">↓</div>
                  <div>Convex Auth (OTP) / Supabase Client</div>
                  <div className="ml-4">↓</div>
                  <div>Supabase PostgreSQL Database</div>
                  <div className="ml-4">↓</div>
                  <div>30-second Polling / Real-time Updates</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Schema */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Database Schema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { table: "accounts", desc: "User authentication & roles", cols: 5 },
                { table: "users", desc: "User profile information", cols: 6 },
                { table: "guests", desc: "Guest profiles & loyalty", cols: 10 },
                { table: "reservations", desc: "Booking records", cols: 12 },
                { table: "rooms", desc: "Room inventory & status", cols: 14 },
                { table: "hk_tasks", desc: "Housekeeping assignments", cols: 8 },
                { table: "hk_inventory", desc: "Housekeeping supplies", cols: 6 },
                { table: "restaurant_menu", desc: "Menu items & pricing", cols: 8 },
                { table: "restaurant_orders", desc: "Dining orders", cols: 9 },
                { table: "restaurant_tables", desc: "Table management", cols: 6 },
                { table: "dining_orders", desc: "Guest dining requests", cols: 7 },
                { table: "charges", desc: "Guest billing charges", cols: 7 },
                { table: "payments", desc: "Payment transactions", cols: 7 },
                { table: "transport_trips", desc: "Transport bookings", cols: 9 },
                { table: "transport_vehicles", desc: "Vehicle fleet", cols: 7 },
                { table: "staff", desc: "Staff directory", cols: 7 },
                { table: "admin_staff", desc: "Admin staff records", cols: 7 },
                { table: "admin_reports", desc: "System reports", cols: 6 },
              ].map((schema) => (
                <div
                  key={schema.table}
                  className="p-3 rounded-lg bg-background/50 border border-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm font-semibold">{schema.table}</span>
                    <Badge variant="secondary" className="text-xs">{schema.cols} cols</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{schema.desc}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Database Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engine:</span>
                  <span className="font-medium">PostgreSQL 15.x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">Supabase</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refresh Rate:</span>
                  <span className="font-medium">30 seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RLS:</span>
                  <span className="font-medium">Enabled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-yellow-400" />
                Authentication
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Convex OTP:</strong> Email-based one-time password authentication</li>
                <li>• <strong>Session Tokens:</strong> Secure JWT-based session management</li>
                <li>• <strong>Role-Based Access:</strong> 9 distinct user roles with granular permissions</li>
                <li>• <strong>Demo Mode:</strong> Unauthenticated exploration with localStorage fallback</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                Database Security
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Row Level Security (RLS):</strong> Table-level access control policies</li>
                <li>• <strong>Owner-Scoped Access:</strong> Users can only access their own data</li>
                <li>• <strong>Encrypted Connections:</strong> SSL/TLS for all database communications</li>
                <li>• <strong>Prepared Statements:</strong> SQL injection prevention</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-400" />
                Frontend Security
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>XSS Protection:</strong> React's built-in sanitization</li>
                <li>• <strong>CSRF Tokens:</strong> Cross-site request forgery prevention</li>
                <li>• <strong>Secure Environment Variables:</strong> API keys stored securely</li>
                <li>• <strong>Content Security Policy:</strong> CSP headers for resource loading</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Core Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Multi-role dashboards (9 roles)",
                  "Real-time data synchronization",
                  "Dynamic room availability tracking",
                  "Automated check-in/check-out",
                  "Guest profile management",
                  "Quick access code system",
                  "Loyalty points tracking",
                  "ID proof verification",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">✓</Badge>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Operational Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Reservation management",
                  "Housekeeping task assignment",
                  "Restaurant order processing",
                  "Maintenance ticket system",
                  "Security incident tracking",
                  "Transport trip scheduling",
                  "Inventory management",
                  "Staff directory",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">✓</Badge>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Reporting & Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Revenue tracking & forecasting",
                  "Occupancy rate analytics",
                  "Department performance metrics",
                  "Financial reports (P&L)",
                  "Staff activity logs",
                  "Guest satisfaction tracking",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">✓</Badge>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              API Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Convex API</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge className="mb-1">POST</Badge>
                  <span className="ml-2">/api/auth/signin</span>
                  <p className="text-muted-foreground ml-14">Email OTP sign-in</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge className="mb-1">POST</Badge>
                  <span className="ml-2">/api/auth/verify</span>
                  <p className="text-muted-foreground ml-14">Verify OTP code</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge className="mb-1">POST</Badge>
                  <span className="ml-2">/api/auth/signout</span>
                  <p className="text-muted-foreground ml-14">Sign out user</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">Supabase REST API</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge variant="secondary" className="mb-1">GET</Badge>
                  <span className="ml-2">/rest/v1/reservations</span>
                  <p className="text-muted-foreground ml-14">Fetch reservations</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge variant="secondary" className="mb-1">POST</Badge>
                  <span className="ml-2">/rest/v1/reservations</span>
                  <p className="text-muted-foreground ml-14">Create reservation</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge variant="secondary" className="mb-1">PATCH</Badge>
                  <span className="ml-2">/rest/v1/reservations?id=eq.{'{id}'}</span>
                  <p className="text-muted-foreground ml-14">Update reservation</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge variant="secondary" className="mb-1">DELETE</Badge>
                  <span className="ml-2">/rest/v1/reservations?id=eq.{'{id}'}</span>
                  <p className="text-muted-foreground ml-14">Delete reservation</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge variant="secondary" className="mb-1">GET</Badge>
                  <span className="ml-2">/rest/v1/rooms?status=eq.available</span>
                  <p className="text-muted-foreground ml-14">Fetch available rooms</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border">
                  <Badge variant="secondary" className="mb-1">GET</Badge>
                  <span className="ml-2">/rest/v1/guests?email=eq.{'{email}'}</span>
                  <p className="text-muted-foreground ml-14">Fetch guest by email</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-xs">
              {[
                { key: "VITE_CONVEX_URL", desc: "Convex deployment URL" },
                { key: "VITE_SUPABASE_URL", desc: "Supabase project URL" },
                { key: "VITE_SUPABASE_ANON_KEY", desc: "Supabase anonymous key" },
                { key: "RESEND_API_KEY", desc: "Resend email service API key" },
              ].map((env) => (
                <div key={env.key} className="p-3 rounded-lg bg-background/50 border border-border">
                  <div className="font-semibold text-primary">{env.key}</div>
                  <div className="text-muted-foreground mt-1">{env.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-primary" />
              Documentation Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Convex Docs", url: "https://docs.convex.dev" },
                { name: "Supabase Docs", url: "https://supabase.com/docs" },
                { name: "React Docs", url: "https://react.dev" },
                { name: "Tailwind CSS", url: "https://tailwindcss.com/docs" },
                { name: "Shadcn/ui", url: "https://ui.shadcn.com" },
                { name: "Framer Motion", url: "https://www.framer.com/motion" },
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors"
                >
                  <span className="font-medium">{link.name}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
