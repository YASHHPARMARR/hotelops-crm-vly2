import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Guest submits a booking request to frontdesk
export const createRequest = mutation({
  args: {
    guestUserId: v.string(),
    guestName: v.optional(v.string()),
    guestEmail: v.optional(v.string()),
    checkInDate: v.string(),
    checkOutDate: v.string(),
    roomPreference: v.optional(v.string()),
    adults: v.number(),
    children: v.optional(v.number()),
    specialRequests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookingRequests", {
      ...args,
      status: "Pending",
      createdAt: Date.now(),
    });
  },
});

// Guest views their own booking requests
export const listByGuest = query({
  args: { guestUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookingRequests")
      .withIndex("by_guest", (q) => q.eq("guestUserId", args.guestUserId))
      .order("desc")
      .take(50);
  },
});

// Frontdesk views all pending/recent requests
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bookingRequests")
      .order("desc")
      .take(100);
  },
});

// Frontdesk approves or rejects a request
export const reviewRequest = mutation({
  args: {
    requestId: v.id("bookingRequests"),
    status: v.string(), // Approved | Rejected
    reviewedBy: v.optional(v.string()),
    assignedRoom: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: args.status,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
      assignedRoom: args.assignedRoom,
    });
  },
});
