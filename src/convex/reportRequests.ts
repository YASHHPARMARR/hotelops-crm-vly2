import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Admin sends a report request to a specific role
export const sendRequest = mutation({
  args: {
    fromUserId: v.string(),
    fromUserName: v.optional(v.string()),
    targetRole: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reportRequests", {
      ...args,
      status: "Sent",
      createdAt: Date.now(),
    });
  },
});

// List all report requests (admin view)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reportRequests")
      .order("desc")
      .take(100);
  },
});

// List requests for a specific role
export const listByRole = query({
  args: { targetRole: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reportRequests")
      .withIndex("by_target_role", (q) => q.eq("targetRole", args.targetRole))
      .order("desc")
      .take(50);
  },
});

// Update status of a report request
export const updateStatus = mutation({
  args: {
    requestId: v.id("reportRequests"),
    status: v.string(), // Acknowledged | Completed
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, { status: args.status });
  },
});
