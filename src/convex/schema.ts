import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// Hotel management roles
export const ROLES = {
  ADMIN: "admin",
  FRONT_DESK: "front_desk",
  HOUSEKEEPING: "housekeeping",
  RESTAURANT: "restaurant",
  SECURITY: "security",
  MAINTENANCE: "maintenance",
  TRANSPORT: "transport",
  INVENTORY: "inventory",
  GUEST: "guest",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.FRONT_DESK),
  v.literal(ROLES.HOUSEKEEPING),
  v.literal(ROLES.RESTAURANT),
  v.literal(ROLES.SECURITY),
  v.literal(ROLES.MAINTENANCE),
  v.literal(ROLES.TRANSPORT),
  v.literal(ROLES.INVENTORY),
  v.literal(ROLES.GUEST),
);
export type Role = Infer<typeof roleValidator>;

// Room status enum
export const ROOM_STATUS = {
  VACANT_CLEAN: "vacant_clean",
  VACANT_DIRTY: "vacant_dirty",
  OCCUPIED_CLEAN: "occupied_clean",
  OCCUPIED_DIRTY: "occupied_dirty",
  OUT_OF_ORDER: "out_of_order",
  INSPECTED: "inspected",
} as const;

export const roomStatusValidator = v.union(
  v.literal(ROOM_STATUS.VACANT_CLEAN),
  v.literal(ROOM_STATUS.VACANT_DIRTY),
  v.literal(ROOM_STATUS.OCCUPIED_CLEAN),
  v.literal(ROOM_STATUS.OCCUPIED_DIRTY),
  v.literal(ROOM_STATUS.OUT_OF_ORDER),
  v.literal(ROOM_STATUS.INSPECTED),
);

// Reservation status enum
export const RESERVATION_STATUS = {
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export const reservationStatusValidator = v.union(
  v.literal(RESERVATION_STATUS.CONFIRMED),
  v.literal(RESERVATION_STATUS.CHECKED_IN),
  v.literal(RESERVATION_STATUS.CHECKED_OUT),
  v.literal(RESERVATION_STATUS.CANCELLED),
  v.literal(RESERVATION_STATUS.NO_SHOW),
);

const schema = defineSchema(
  {
    // Auth tables
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      department: v.optional(v.string()),
      employeeId: v.optional(v.string()),
      phone: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }).index("email", ["email"]),

    // Guest management
    guests: defineTable({
      firstName: v.string(),
      lastName: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      city: v.optional(v.string()),
      country: v.optional(v.string()),
      idType: v.optional(v.string()),
      idNumber: v.optional(v.string()),
      dateOfBirth: v.optional(v.string()),
      preferences: v.optional(v.string()),
      vipStatus: v.optional(v.boolean()),
      blacklisted: v.optional(v.boolean()),
    }).index("by_email", ["email"]),

    // Room management
    roomTypes: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      baseRate: v.number(),
      maxOccupancy: v.number(),
      amenities: v.array(v.string()),
      images: v.optional(v.array(v.string())),
    }),

    rooms: defineTable({
      number: v.string(),
      floor: v.number(),
      roomTypeId: v.id("roomTypes"),
      status: roomStatusValidator,
      lastCleaned: v.optional(v.number()),
      notes: v.optional(v.string()),
      isActive: v.boolean(),
    }).index("by_status", ["status"])
      .index("by_floor", ["floor"])
      .index("by_room_type", ["roomTypeId"]),

    // Reservations
    reservations: defineTable({
      guestId: v.id("guests"),
      roomId: v.optional(v.id("rooms")),
      roomTypeId: v.id("roomTypes"),
      checkInDate: v.string(),
      checkOutDate: v.string(),
      adults: v.number(),
      children: v.number(),
      status: reservationStatusValidator,
      totalAmount: v.number(),
      paidAmount: v.optional(v.number()),
      source: v.optional(v.string()),
      specialRequests: v.optional(v.string()),
      confirmationNumber: v.string(),
    }).index("by_guest", ["guestId"])
      .index("by_room", ["roomId"])
      .index("by_status", ["status"])
      .index("by_check_in", ["checkInDate"]),

    // Housekeeping
    housekeepingTasks: defineTable({
      roomId: v.id("rooms"),
      assignedTo: v.optional(v.id("users")),
      taskType: v.string(),
      priority: v.string(),
      status: v.string(),
      estimatedDuration: v.optional(v.number()),
      actualDuration: v.optional(v.number()),
      notes: v.optional(v.string()),
      photos: v.optional(v.array(v.string())),
      completedAt: v.optional(v.number()),
    }).index("by_room", ["roomId"])
      .index("by_assigned", ["assignedTo"])
      .index("by_status", ["status"]),

    // Maintenance
    maintenanceTickets: defineTable({
      title: v.string(),
      description: v.string(),
      roomId: v.optional(v.id("rooms")),
      assetId: v.optional(v.id("assets")),
      reportedBy: v.id("users"),
      assignedTo: v.optional(v.id("users")),
      priority: v.string(),
      status: v.string(),
      category: v.string(),
      estimatedCost: v.optional(v.number()),
      actualCost: v.optional(v.number()),
      slaDeadline: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      photos: v.optional(v.array(v.string())),
    }).index("by_room", ["roomId"])
      .index("by_assigned", ["assignedTo"])
      .index("by_status", ["status"]),

    assets: defineTable({
      name: v.string(),
      category: v.string(),
      location: v.string(),
      serialNumber: v.optional(v.string()),
      purchaseDate: v.optional(v.string()),
      warrantyExpiry: v.optional(v.string()),
      lastMaintenance: v.optional(v.number()),
      nextMaintenance: v.optional(v.number()),
      status: v.string(),
    }).index("by_category", ["category"])
      .index("by_location", ["location"]),

    // Restaurant
    menuItems: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      category: v.string(),
      price: v.number(),
      isAvailable: v.boolean(),
      preparationTime: v.optional(v.number()),
      ingredients: v.optional(v.array(v.string())),
      allergens: v.optional(v.array(v.string())),
      image: v.optional(v.string()),
    }).index("by_category", ["category"]),

    tables: defineTable({
      number: v.string(),
      capacity: v.number(),
      location: v.string(),
      status: v.string(),
      currentOrder: v.optional(v.id("orders")),
    }).index("by_status", ["status"]),

    orders: defineTable({
      orderNumber: v.string(),
      tableId: v.optional(v.id("tables")),
      roomId: v.optional(v.id("rooms")),
      guestId: v.optional(v.id("guests")),
      items: v.array(v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        specialInstructions: v.optional(v.string()),
        price: v.number(),
      })),
      totalAmount: v.number(),
      status: v.string(),
      orderType: v.string(),
      takenBy: v.id("users"),
      completedAt: v.optional(v.number()),
    }).index("by_table", ["tableId"])
      .index("by_room", ["roomId"])
      .index("by_status", ["status"]),

    // Security
    securityIncidents: defineTable({
      title: v.string(),
      description: v.string(),
      severity: v.string(),
      location: v.string(),
      reportedBy: v.id("users"),
      guestId: v.optional(v.id("guests")),
      status: v.string(),
      actionTaken: v.optional(v.string()),
      resolvedAt: v.optional(v.number()),
      photos: v.optional(v.array(v.string())),
    }).index("by_severity", ["severity"])
      .index("by_status", ["status"]),

    visitorBadges: defineTable({
      visitorName: v.string(),
      company: v.optional(v.string()),
      purpose: v.string(),
      hostName: v.string(),
      validFrom: v.number(),
      validUntil: v.number(),
      badgeNumber: v.string(),
      isActive: v.boolean(),
      issuedBy: v.id("users"),
    }).index("by_badge_number", ["badgeNumber"]),

    // Transport
    vehicles: defineTable({
      plateNumber: v.string(),
      model: v.string(),
      capacity: v.number(),
      type: v.string(),
      status: v.string(),
      lastService: v.optional(v.string()),
      nextService: v.optional(v.string()),
      currentDriver: v.optional(v.id("users")),
    }).index("by_status", ["status"]),

    transportTrips: defineTable({
      guestId: v.optional(v.id("guests")),
      vehicleId: v.id("vehicles"),
      driverId: v.id("users"),
      tripType: v.string(),
      pickupLocation: v.string(),
      dropoffLocation: v.string(),
      scheduledTime: v.number(),
      actualPickupTime: v.optional(v.number()),
      actualDropoffTime: v.optional(v.number()),
      status: v.string(),
      flightNumber: v.optional(v.string()),
      passengerCount: v.number(),
      fare: v.optional(v.number()),
      notes: v.optional(v.string()),
    }).index("by_vehicle", ["vehicleId"])
      .index("by_driver", ["driverId"])
      .index("by_status", ["status"]),

    // Inventory
    inventoryItems: defineTable({
      name: v.string(),
      category: v.string(),
      unit: v.string(),
      currentStock: v.number(),
      minStock: v.number(),
      maxStock: v.number(),
      unitCost: v.number(),
      supplierId: v.optional(v.id("suppliers")),
      location: v.string(),
      isActive: v.boolean(),
    }).index("by_category", ["category"]),

    suppliers: defineTable({
      name: v.string(),
      contactPerson: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      paymentTerms: v.optional(v.string()),
      isActive: v.boolean(),
    }),

    purchaseOrders: defineTable({
      poNumber: v.string(),
      supplierId: v.id("suppliers"),
      items: v.array(v.object({
        itemId: v.id("inventoryItems"),
        quantity: v.number(),
        unitPrice: v.number(),
        totalPrice: v.number(),
      })),
      totalAmount: v.number(),
      status: v.string(),
      orderDate: v.string(),
      expectedDelivery: v.optional(v.string()),
      actualDelivery: v.optional(v.string()),
      createdBy: v.id("users"),
    }).index("by_supplier", ["supplierId"])
      .index("by_status", ["status"]),

    // Billing
    folios: defineTable({
      reservationId: v.id("reservations"),
      guestId: v.id("guests"),
      charges: v.array(v.object({
        description: v.string(),
        amount: v.number(),
        category: v.string(),
        date: v.string(),
        reference: v.optional(v.string()),
      })),
      payments: v.array(v.object({
        amount: v.number(),
        method: v.string(),
        reference: v.string(),
        date: v.string(),
      })),
      totalCharges: v.number(),
      totalPayments: v.number(),
      balance: v.number(),
      status: v.string(),
    }).index("by_reservation", ["reservationId"])
      .index("by_guest", ["guestId"]),

    // Analytics & Reports
    kpiMetrics: defineTable({
      date: v.string(),
      occupancyRate: v.number(),
      adr: v.number(),
      revpar: v.number(),
      totalRevenue: v.number(),
      totalRooms: v.number(),
      occupiedRooms: v.number(),
      cancellationRate: v.number(),
      noShowRate: v.number(),
    }).index("by_date", ["date"]),

    // Audit logs
    auditLogs: defineTable({
      userId: v.id("users"),
      action: v.string(),
      resource: v.string(),
      resourceId: v.optional(v.string()),
      details: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }).index("by_user", ["userId"])
      .index("by_action", ["action"]),

    // Add: Guest self-service bookings (frontend simplified flow)
    guestBookings: defineTable({
      userId: v.id("users"),
      checkInDate: v.string(),
      checkOutDate: v.string(),
      roomType: v.string(),
      guests: v.number(),
      nights: v.number(),
      amount: v.number(),
      status: v.string(), // Pending | Confirmed | Cancelled
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    // Add: Guest self-service requests
    guestServiceRequests: defineTable({
      userId: v.id("users"),
      label: v.string(),
      description: v.string(),
      eta: v.string(),
      status: v.string(), // Requested | In Progress | Completed | Cancelled
      requestedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;