import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all team chat messages (real-time) - optionally filtered by target role
export const listMessages = query({
  args: {
    targetRole: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.targetRole && args.targetRole !== "all") {
      // Get messages targeted to this role OR broadcast messages
      const targeted = await ctx.db
        .query("teamChatMessages")
        .withIndex("by_target_role", (q) => q.eq("targetRole", args.targetRole!))
        .order("desc")
        .take(100);
      const broadcast = await ctx.db
        .query("teamChatMessages")
        .withIndex("by_target_role", (q) => q.eq("targetRole", "all"))
        .order("desc")
        .take(100);
      // Merge and sort by creation time
      const all = [...targeted, ...broadcast].sort((a, b) => a._creationTime - b._creationTime);
      return all.slice(-100);
    }
    const messages = await ctx.db
      .query("teamChatMessages")
      .order("desc")
      .take(100);
    return messages.reverse();
  },
});

// Send a new team chat message
export const sendMessage = mutation({
  args: {
    role: v.string(),
    text: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
    targetRole: v.optional(v.string()), // "all" | specific role
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("teamChatMessages", {
      role: args.role,
      text: args.text,
      userId: args.userId,
      userName: args.userName,
      targetRole: args.targetRole || "all",
    });
  },
});

// Clear all messages (admin only)
export const clearMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("teamChatMessages").take(500);
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    return { cleared: messages.length };
  },
});