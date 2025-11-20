import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List all team chat messages (real-time)
export const listMessages = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("teamChatMessages")
      .order("desc")
      .take(100); // Last 100 messages
    return messages.reverse(); // Show oldest first
  },
});

// Send a new team chat message
export const sendMessage = mutation({
  args: {
    role: v.string(),
    text: v.string(),
    userId: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("teamChatMessages", {
      role: args.role,
      text: args.text,
      userId: args.userId,
      userName: args.userName,
    });
  },
});

// Clear all messages (admin only)
export const clearMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("teamChatMessages").collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    return { cleared: messages.length };
  },
});
