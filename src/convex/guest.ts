import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Add a safe UID helper to ensure demo mode works even if auth is unavailable
async function uidOrDemo(ctx: any): Promise<string> {
  try {
    const userId = await getAuthUserId(ctx);
    return (userId as unknown as string | null) ?? "demo";
  } catch {
    return "demo";
  }
}

// Bookings
export const listBookings = query({
  args: {},
  handler: async (ctx) => {
    const uid = await uidOrDemo(ctx);
    const results = await ctx.db
      .query("guestBookings")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .order("desc")
      .collect();
    return results;
  },
});

export const createBooking = mutation({
  args: {
    checkInDate: v.string(),
    checkOutDate: v.string(),
    roomType: v.string(),
    guests: v.number(),
    nights: v.number(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // Replace direct getAuthUserId call with the safe helper to avoid server errors
    const uid = await uidOrDemo(ctx);

    return await ctx.db.insert("guestBookings", {
      userId: uid,
      checkInDate: args.checkInDate,
      checkOutDate: args.checkOutDate,
      roomType: args.roomType,
      guests: args.guests,
      nights: args.nights,
      amount: args.amount,
      status: "Confirmed",
      createdAt: Date.now(),
    });
  },
});

export const cancelBooking = mutation({
  args: { bookingId: v.id("guestBookings") },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const row = await ctx.db.get(args.bookingId);
    if (!row) throw new Error("Booking not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.patch(args.bookingId, { status: "Cancelled" });
  },
});

// Service Requests
export const listRequests = query({
  args: {},
  handler: async (ctx) => {
    const uid = await uidOrDemo(ctx);
    const results = await ctx.db
      .query("guestServiceRequests")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .order("desc")
      .collect();
    return results;
  },
});

export const createRequest = mutation({
  args: {
    label: v.string(),
    description: v.optional(v.string()),
    eta: v.string(),
    presetId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const status = args.presetId === "svc_wifi" ? "In Progress" : "Requested";
    return await ctx.db.insert("guestServiceRequests", {
      userId: uid,
      label: args.label,
      description: args.description ?? "",
      eta: args.eta,
      status,
      requestedAt: Date.now(),
    });
  },
});

export const completeRequest = mutation({
  args: { requestId: v.id("guestServiceRequests") },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const row = await ctx.db.get(args.requestId);
    if (!row) throw new Error("Request not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.patch(args.requestId, { status: "Completed" });
  },
});

export const cancelRequest = mutation({
  args: { requestId: v.id("guestServiceRequests") },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const row = await ctx.db.get(args.requestId);
    if (!row) throw new Error("Request not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.patch(args.requestId, { status: "Cancelled" });
  },
});

// Seeder for current user
export const seedGuestDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const uid = await uidOrDemo(ctx);
    // Only seed if empty for this user
    const existing = await ctx.db
      .query("guestBookings")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .take(1);
    if (existing.length > 0) return "Already seeded";

    const now = Date.now();
    await ctx.db.insert("guestBookings", {
      userId: uid,
      checkInDate: new Date(now + 24 * 3600 * 1000).toISOString().slice(0, 10),
      checkOutDate: new Date(now + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      roomType: "Deluxe",
      guests: 2,
      nights: 2,
      amount: 320,
      status: "Confirmed",
      createdAt: now - 60 * 60 * 1000,
    });
    await ctx.db.insert("guestBookings", {
      userId: uid,
      checkInDate: new Date(now + 6 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      checkOutDate: new Date(now + 9 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      roomType: "Suite",
      guests: 3,
      nights: 3,
      amount: 720,
      status: "Pending",
      createdAt: now - 2 * 60 * 60 * 1000,
    });

    await ctx.db.insert("guestServiceRequests", {
      userId: uid,
      label: "Laundry Pickup",
      description: "2 shirts, 1 trouser",
      eta: "6 pm",
      status: "Requested",
      requestedAt: now - 90 * 60 * 1000,
    });
    await ctx.db.insert("guestServiceRequests", {
      userId: uid,
      label: "Extra Pillows",
      description: "",
      eta: "15 min",
      status: "In Progress",
      requestedAt: now - 30 * 60 * 1000,
    });

    return "Seeded";
  },
});

// Seed demo data for Dining + Bills (idempotent per user)
export const seedGuestFinancialsDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const uid = await uidOrDemo(ctx);

    // Seed a couple of dining orders if none exist
    const existingOrders = await ctx.db
      .query("guestDiningOrders")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .take(1);
    if (existingOrders.length === 0) {
      const now = Date.now();
      await ctx.db.insert("guestDiningOrders", {
        userId: uid,
        roomNumber: "1208",
        method: "Room Delivery",
        order: "Club Sandwich, Orange Juice",
        total: 18.5,
        status: "Delivered",
        createdAt: now - 45 * 60 * 1000,
      });
      await ctx.db.insert("guestDiningOrders", {
        userId: uid,
        roomNumber: "1208",
        method: "Pickup",
        order: "Cappuccino",
        total: 4.5,
        status: "Placed",
        createdAt: now - 10 * 60 * 1000,
      });
    }

    // Seed charges if none exist
    const existingCharges = await ctx.db
      .query("guestCharges")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .take(1);
    if (existingCharges.length === 0) {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      await ctx.db.insert("guestCharges", {
        userId: uid,
        date: yesterday,
        item: "Room Night 1",
        room: "1208",
        category: "Room Night",
        amount: 160,
        createdAt: Date.now() - 36 * 60 * 60 * 1000,
      });
      await ctx.db.insert("guestCharges", {
        userId: uid,
        date: today,
        item: "Minibar Snacks",
        room: "1208",
        category: "Minibar",
        amount: 12.0,
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
      });
      await ctx.db.insert("guestCharges", {
        userId: uid,
        date: today,
        item: "Room Service - Breakfast",
        room: "1208",
        category: "Dining",
        amount: 22.5,
        createdAt: Date.now() - 90 * 60 * 1000,
      });
    }

    // Seed payments if none exist
    const existingPayments = await ctx.db
      .query("guestPayments")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .take(1);
    if (existingPayments.length === 0) {
      const today = new Date().toISOString().slice(0, 10);
      await ctx.db.insert("guestPayments", {
        userId: uid,
        date: today,
        method: "Visa",
        ref: "•••• 4242",
        amount: 100,
        createdAt: Date.now() - 60 * 60 * 1000,
      });
    }

    return "Seeded guest dining/charges/payments for user: " + uid;
  },
});

// In-Room Dining: list
export const listDiningOrders = query({
  args: {},
  handler: async (ctx) => {
    const uid = await uidOrDemo(ctx);
    const rows = await ctx.db
      .query("guestDiningOrders")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .order("desc")
      .collect();
    return rows;
  },
});

// In-Room Dining: create
export const createDiningOrder = mutation({
  args: {
    roomNumber: v.string(),
    method: v.string(), // Dine-in | Pickup | Room Delivery
    order: v.string(),
    total: v.number(),
    status: v.optional(v.string()), // default Placed
  },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    return await ctx.db.insert("guestDiningOrders", {
      userId: uid,
      roomNumber: args.roomNumber,
      method: args.method,
      order: args.order,
      total: args.total,
      status: args.status ?? "Placed",
      createdAt: Date.now(),
    });
  },
});

// In-Room Dining: update status
export const updateDiningOrderStatus = mutation({
  args: {
    orderId: v.id("guestDiningOrders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const row = await ctx.db.get(args.orderId);
    if (!row) throw new Error("Order not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});

// In-Room Dining: delete
export const deleteDiningOrder = mutation({
  args: { orderId: v.id("guestDiningOrders") },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const row = await ctx.db.get(args.orderId);
    if (!row) throw new Error("Order not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.delete(args.orderId);
  },
});

// Bills: charges list
export const listGuestCharges = query({
  args: {},
  handler: async (ctx) => {
    const uid = await uidOrDemo(ctx);
    const rows = await ctx.db
      .query("guestCharges")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .order("desc")
      .collect();
    return rows;
  },
});

// Bills: add charge
export const addGuestCharge = mutation({
  args: {
    date: v.string(), // yyyy-mm-dd
    item: v.string(),
    room: v.optional(v.string()),
    category: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    return await ctx.db.insert("guestCharges", {
      userId: uid,
      date: args.date,
      item: args.item,
      room: args.room,
      category: args.category,
      amount: args.amount,
      createdAt: Date.now(),
    });
  },
});

// Bills: delete charge
export const deleteGuestCharge = mutation({
  args: { chargeId: v.id("guestCharges") },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const row = await ctx.db.get(args.chargeId);
    if (!row) throw new Error("Charge not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.delete(args.chargeId);
  },
});

// Bills: payments list
export const listGuestPayments = query({
  args: {},
  handler: async (ctx) => {
    const uid = await uidOrDemo(ctx);
    const rows = await ctx.db
      .query("guestPayments")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .order("desc")
      .collect();
    return rows;
  },
});

// Bills: add payment
export const addGuestPayment = mutation({
  args: {
    date: v.string(), // yyyy-mm-dd
    method: v.string(),
    ref: v.optional(v.string()),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    return await ctx.db.insert("guestPayments", {
      userId: uid,
      date: args.date,
      method: args.method,
      ref: args.ref,
      amount: args.amount,
      createdAt: Date.now(),
    });
  },
});

// Bills: delete payment
export const deleteGuestPayment = mutation({
  args: { paymentId: v.id("guestPayments") },
  handler: async (ctx, args) => {
    const uid = await uidOrDemo(ctx);
    const row = await ctx.db.get(args.paymentId);
    if (!row) throw new Error("Payment not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.delete(args.paymentId);
  },
});