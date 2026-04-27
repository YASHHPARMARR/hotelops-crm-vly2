import { mutation } from "./_generated/server";
import { ROOM_STATUS } from "./schema";

// Run this mutation to seed some test rooms
export const seedTestRooms = mutation({
  args: {},
  handler: async (ctx) => {
    // First, check if we have any room types
    const roomTypes = await ctx.db.query("roomTypes").collect();

    if (roomTypes.length === 0) {
      throw new Error("Please create room types first before seeding rooms");
    }

    const standardType = roomTypes[0]._id;

    // Create 10 test rooms
    const rooms = [
      { number: "101", floor: 1, status: ROOM_STATUS.VACANT_CLEAN },
      { number: "102", floor: 1, status: ROOM_STATUS.VACANT_CLEAN },
      { number: "103", floor: 1, status: ROOM_STATUS.VACANT_DIRTY },
      { number: "104", floor: 1, status: ROOM_STATUS.VACANT_CLEAN },
      { number: "201", floor: 2, status: ROOM_STATUS.VACANT_CLEAN },
      { number: "202", floor: 2, status: ROOM_STATUS.OCCUPIED_CLEAN },
      { number: "203", floor: 2, status: ROOM_STATUS.VACANT_DIRTY },
      { number: "204", floor: 2, status: ROOM_STATUS.VACANT_CLEAN },
      { number: "301", floor: 3, status: ROOM_STATUS.VACANT_CLEAN },
      { number: "302", floor: 3, status: ROOM_STATUS.VACANT_CLEAN },
    ];

    const createdRooms = [];
    for (const room of rooms) {
      const id = await ctx.db.insert("rooms", {
        number: room.number,
        floor: room.floor,
        roomTypeId: standardType,
        status: room.status,
        isActive: true,
      });
      createdRooms.push(id);
    }

    return {
      message: `Created ${createdRooms.length} test rooms`,
      roomIds: createdRooms,
    };
  },
});

// Seed room types
export const seedRoomTypes = mutation({
  args: {},
  handler: async (ctx) => {
    const types = [
      {
        name: "Standard",
        description: "Standard room with basic amenities",
        baseRate: 100,
        maxOccupancy: 2,
        amenities: ["WiFi", "TV", "AC"],
      },
      {
        name: "Deluxe",
        description: "Deluxe room with premium amenities",
        baseRate: 150,
        maxOccupancy: 3,
        amenities: ["WiFi", "TV", "AC", "Mini Bar"],
      },
      {
        name: "Suite",
        description: "Spacious suite with living area",
        baseRate: 250,
        maxOccupancy: 4,
        amenities: ["WiFi", "TV", "AC", "Mini Bar", "Kitchen"],
      },
    ];

    const createdTypes = [];
    for (const type of types) {
      const id = await ctx.db.insert("roomTypes", type);
      createdTypes.push(id);
    }

    return {
      message: `Created ${createdTypes.length} room types`,
      typeIds: createdTypes,
    };
  },
});
