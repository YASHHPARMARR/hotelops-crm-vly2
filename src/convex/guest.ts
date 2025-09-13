import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Bookings
export const listBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    // Support demo mode: use a shared "demo" user when unauthenticated
    const uid = userId ?? "demo";
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
    const userId = await getAuthUserId(ctx);
    // Support demo mode by using "demo" user id when not logged in
    const uid = userId ?? "demo";
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
    const userId = await getAuthUserId(ctx);
    const uid = userId ?? "demo";
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
    const userId = await getAuthUserId(ctx);
    const uid = userId ?? "demo";
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
    const userId = await getAuthUserId(ctx);
    const uid = userId ?? "demo";
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
    const userId = await getAuthUserId(ctx);
    const uid = userId ?? "demo";
    const row = await ctx.db.get(args.requestId);
    if (!row) throw new Error("Request not found");
    if (row.userId !== uid) throw new Error("Forbidden");
    await ctx.db.patch(args.requestId, { status: "Completed" });
  },
});

export const cancelRequest = mutation({
  args: { requestId: v.id("guestServiceRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const uid = userId ?? "demo";
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
    const userId = await getAuthUserId(ctx);
    const uid = userId ?? "demo";
    // Only seed if empty for this user
    const existing = await ctx.db
      .query("guestBookings")
      .withIndex("by_user", (q) => q.eq("userId", uid))
      .take(1);
    if (existing.length > 0) return "Already seeded";

    // Seed two bookings
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

    // Seed two requests
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