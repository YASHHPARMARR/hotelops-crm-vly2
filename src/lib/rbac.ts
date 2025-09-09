import { Role, ROLES } from "@/convex/schema";

// RBAC Policy Configuration
export const RBAC_POLICY = {
  roles: {
    [ROLES.ADMIN]: {
      "*": ["create", "read", "update", "delete", "export", "manage"]
    },
    [ROLES.FRONT_DESK]: {
      reservations: ["create", "read", "update", "checkin", "checkout"],
      guests: ["create", "read", "update"],
      folios: ["read", "charge", "refund"],
      rooms: ["read", "update"],
      kpiMetrics: ["read"]
    },
    [ROLES.HOUSEKEEPING]: {
      housekeepingTasks: ["read", "update", "complete"],
      rooms: ["read", "update"],
      inventoryItems: ["read"],
      maintenanceTickets: ["create", "read"]
    },
    [ROLES.RESTAURANT]: {
      orders: ["create", "read", "update", "close"],
      menuItems: ["create", "read", "update"],
      tables: ["read", "update"],
      inventoryItems: ["read"]
    },
    [ROLES.SECURITY]: {
      securityIncidents: ["create", "read", "update", "export"],
      visitorBadges: ["create", "read", "update"],
      auditLogs: ["read", "export"]
    },
    [ROLES.MAINTENANCE]: {
      maintenanceTickets: ["create", "read", "update", "complete"],
      assets: ["read", "update"],
      inventoryItems: ["read"]
    },
    [ROLES.TRANSPORT]: {
      transportTrips: ["create", "read", "update", "assign"],
      vehicles: ["read", "update"],
      guests: ["read"]
    },
    [ROLES.INVENTORY]: {
      inventoryItems: ["create", "read", "update"],
      suppliers: ["create", "read", "update"],
      purchaseOrders: ["create", "read", "update"],
      auditLogs: ["read"]
    },
    [ROLES.GUEST]: {
      reservations: ["read"],
      folios: ["read", "download"],
      orders: ["create", "read"],
      transportTrips: ["create", "read"]
    }
  }
} as const;

// Permission checker
export function can(role: Role | undefined, action: string, resource: string): boolean {
  if (!role) return false;

  const raw = RBAC_POLICY.roles[role];
  if (!raw) return false;

  // Admin has all permissions
  if (role === ROLES.ADMIN) return true;

  // Normalize to a permissive map for safer indexing (including wildcard support)
  const rolePermissions = raw as Record<string, readonly string[]>;

  // Check wildcard permissions
  if (rolePermissions["*"]?.includes(action)) return true;

  // Check specific resource permissions
  const resourcePermissions = rolePermissions[resource];
  if (resourcePermissions?.includes(action)) return true;

  return false;
}

// Role hierarchy for UI organization
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 9,
  [ROLES.FRONT_DESK]: 8,
  [ROLES.RESTAURANT]: 7,
  [ROLES.HOUSEKEEPING]: 6,
  [ROLES.MAINTENANCE]: 5,
  [ROLES.SECURITY]: 4,
  [ROLES.TRANSPORT]: 3,
  [ROLES.INVENTORY]: 2,
  [ROLES.GUEST]: 1,
} as const;

// Navigation items per role
export const ROLE_NAVIGATION = {
  [ROLES.ADMIN]: [
    { name: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
    { name: "Reservations", path: "/admin/reservations", icon: "Calendar" },
    { name: "Guests", path: "/admin/guests", icon: "Users" },
    { name: "Rooms", path: "/admin/rooms", icon: "Bed" },
    { name: "Staff", path: "/admin/staff", icon: "UserCheck" },
    { name: "Reports", path: "/admin/reports", icon: "BarChart3" },
    { name: "Settings", path: "/admin/settings", icon: "Settings" },
  ],
  [ROLES.FRONT_DESK]: [
    { name: "Dashboard", path: "/front-desk", icon: "LayoutDashboard" },
    { name: "Reservations", path: "/front-desk/reservations", icon: "Calendar" },
    { name: "Check In/Out", path: "/front-desk/checkin", icon: "LogIn" },
    { name: "Guests", path: "/front-desk/guests", icon: "Users" },
    { name: "Room Status", path: "/front-desk/rooms", icon: "Bed" },
  ],
  [ROLES.HOUSEKEEPING]: [
    { name: "Dashboard", path: "/housekeeping", icon: "LayoutDashboard" },
    { name: "Tasks", path: "/housekeeping/tasks", icon: "CheckSquare" },
    { name: "Room Status", path: "/housekeeping/rooms", icon: "Bed" },
    { name: "Inventory", path: "/housekeeping/inventory", icon: "Package" },
  ],
  [ROLES.RESTAURANT]: [
    { name: "Dashboard", path: "/restaurant", icon: "LayoutDashboard" },
    { name: "Orders", path: "/restaurant/orders", icon: "ShoppingCart" },
    { name: "Menu", path: "/restaurant/menu", icon: "Menu" },
    { name: "Tables", path: "/restaurant/tables", icon: "Grid3x3" },
  ],
  [ROLES.SECURITY]: [
    { name: "Dashboard", path: "/security", icon: "LayoutDashboard" },
    { name: "Incidents", path: "/security/incidents", icon: "AlertTriangle" },
    { name: "Visitor Badges", path: "/security/badges", icon: "Badge" },
    { name: "Reports", path: "/security/reports", icon: "FileText" },
  ],
  [ROLES.MAINTENANCE]: [
    { name: "Dashboard", path: "/maintenance", icon: "LayoutDashboard" },
    { name: "Tickets", path: "/maintenance/tickets", icon: "Wrench" },
    { name: "Assets", path: "/maintenance/assets", icon: "HardDrive" },
    { name: "Schedule", path: "/maintenance/schedule", icon: "Calendar" },
  ],
  [ROLES.TRANSPORT]: [
    { name: "Dashboard", path: "/transport", icon: "LayoutDashboard" },
    { name: "Trips", path: "/transport/trips", icon: "Car" },
    { name: "Vehicles", path: "/transport/vehicles", icon: "Truck" },
    { name: "Schedule", path: "/transport/schedule", icon: "Calendar" },
  ],
  [ROLES.INVENTORY]: [
    { name: "Dashboard", path: "/inventory", icon: "LayoutDashboard" },
    { name: "Items", path: "/inventory/items", icon: "Package" },
    { name: "Suppliers", path: "/inventory/suppliers", icon: "Building" },
    { name: "Purchase Orders", path: "/inventory/orders", icon: "ShoppingCart" },
  ],
  [ROLES.GUEST]: [
    { name: "My Stay", path: "/guest", icon: "Home" },
    { name: "Services", path: "/guest/services", icon: "Concierge" },
    { name: "Dining", path: "/guest/dining", icon: "UtensilsCrossed" },
    { name: "Bills", path: "/guest/bills", icon: "Receipt" },
  ],
} as const;
