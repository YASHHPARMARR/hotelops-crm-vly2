import { v } from "convex/values";
import { query } from "./_generated/server";
import { ROOM_STATUS } from "./schema";

// Get all vacant rooms for reservation dropdown
export const getVacantRooms = query({
  args: {},
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("rooms")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), ROOM_STATUS.VACANT_CLEAN),
          q.eq(q.field("status"), ROOM_STATUS.VACANT_DIRTY)
        )
      )
      .collect();

    return rooms.map((room) => ({
      id: room._id,
      number: room.number,
      floor: room.floor,
      status: room.status,
    }));
  },
});

// Get all rooms
export const getAllRooms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rooms").collect();
  },
});

// Get room by number
export const getRoomByNumber = query({
  args: { number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .filter((q) => q.eq(q.field("number"), args.number))
      .first();
  },
});
