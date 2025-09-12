import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generic table for all app data with efficient indexing
export const list = query({
  args: { collection: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("app_rows")
      .withIndex("by_collection", (q) => q.eq("collection", args.collection))
      .collect();
    
    return docs.map(doc => ({
      id: doc.idStr,
      ...doc.data
    }));
  },
});

export const add = mutation({
  args: { 
    collection: v.string(),
    row: v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))
  },
  handler: async (ctx, args) => {
    const idStr = args.row.id as string || crypto.randomUUID();
    const data = { ...args.row, id: idStr };
    
    await ctx.db.insert("app_rows", {
      collection: args.collection,
      idStr,
      data
    });
    
    return data;
  },
});

export const update = mutation({
  args: { 
    collection: v.string(),
    idStr: v.string(),
    row: v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("app_rows")
      .withIndex("by_collection_and_idStr", (q) => 
        q.eq("collection", args.collection).eq("idStr", args.idStr)
      )
      .unique();
    
    if (!existing) {
      throw new Error("Row not found");
    }
    
    const updatedData = { ...existing.data, ...args.row, id: args.idStr };
    
    await ctx.db.patch(existing._id, {
      data: updatedData
    });
    
    return updatedData;
  },
});

export const remove = mutation({
  args: { 
    collection: v.string(),
    idStr: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("app_rows")
      .withIndex("by_collection_and_idStr", (q) => 
        q.eq("collection", args.collection).eq("idStr", args.idStr)
      )
      .unique();
    
    if (!existing) {
      throw new Error("Row not found");
    }
    
    await ctx.db.delete(existing._id);
    return { success: true };
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const seedData = {
      reservations: [
        { id: "r1", guestName: "Ana Garcia", confirmation: "CNF-1001", roomType: "Deluxe King", roomNumber: "205", arrival: "2025-09-09", departure: "2025-09-11", adults: 2, children: 0, package: "Business", paymentStatus: "Pending", status: "Booked", balance: 220, source: "Direct", notes: "High floor" },
        { id: "r2", guestName: "Luis Fernandez", confirmation: "CNF-1002", roomType: "Standard Queen", roomNumber: "214", arrival: "2025-09-08", departure: "2025-09-10", adults: 1, children: 0, package: "Standard", paymentStatus: "Paid", status: "CheckedIn", balance: 0, source: "OTA", notes: "" },
        { id: "r3", guestName: "Maya Lee", confirmation: "CNF-1003", roomType: "Suite", roomNumber: "", arrival: "2025-09-12", departure: "2025-09-15", adults: 2, children: 1, package: "Honeymoon", paymentStatus: "Pending", status: "Booked", balance: 650, source: "Corporate", notes: "Late arrival" },
      ],
      rooms: [
        { id: "rm1", number: "205", type: "Deluxe King", status: "Occupied", guest: "Ana Garcia", rate: 220, lastCleaned: "2025-09-09" },
        { id: "rm2", number: "214", type: "Standard Queen", status: "Vacant Clean", guest: "", rate: 150, lastCleaned: "2025-09-09" },
        { id: "rm3", number: "118", type: "Standard Twin", status: "Occupied", guest: "Ivy Chen", rate: 160, lastCleaned: "2025-09-08" },
      ],
      admin_staff: [
        { id: "s1", name: "Ivy Chen", role: "Front Desk", segment: "Front Desk", isManager: "No", email: "ivy@example.com", phone: "+1 555-0102", shift: "Morning" },
        { id: "s2", name: "Peter Johnson", role: "Maintenance", segment: "Maintenance", isManager: "Yes", email: "peter@example.com", phone: "+1 555-0103", shift: "Evening" },
      ],
      rest_menu: [
        { id: "rm1", name: "Cheeseburger", category: "Mains", price: 12.5, available: "Yes" },
        { id: "rm2", name: "Caesar Salad", category: "Starters", price: 9.0, available: "Yes" },
      ],
      rest_tables: [
        { id: "t1", tableNumber: "T1", capacity: 2, status: "Available", server: "Ivy" },
        { id: "t2", tableNumber: "T2", capacity: 4, status: "Occupied", server: "Peter" },
      ],
      rest_raw_materials: [
        { id: "rmat1", item: "Beef Patty", category: "Meat", quantity: 40, unit: "pcs", reorderLevel: 20, status: "In Stock", supplier: "FreshMeats Co" },
        { id: "rmat2", item: "Lettuce", category: "Veg", quantity: 8, unit: "kg", reorderLevel: 5, status: "Low", supplier: "GreenFarm" },
      ],
      guest_dining: [
        { id: "gd1", roomNumber: "205", method: "Room Delivery", order: "Club Sandwich, Juice", total: 18.5, status: "Preparing" },
      ],
      admin_reports: [
        { id: "rep1", name: "Daily Arrivals", period: "2025-09-09", generatedAt: "2025-09-09", status: "Ready" },
        { id: "rep2", name: "Revenue MTD", period: "Sept 2025", generatedAt: "2025-09-08", status: "Queued" },
      ],
    };

    let seededCount = 0;
    
    for (const [collection, rows] of Object.entries(seedData)) {
      // Check if collection is empty
      const existing = await ctx.db
        .query("app_rows")
        .withIndex("by_collection", (q) => q.eq("collection", collection))
        .first();
      
      if (!existing) {
        // Seed the collection
        for (const row of rows) {
          await ctx.db.insert("app_rows", {
            collection,
            idStr: row.id,
            data: row
          });
        }
        seededCount++;
      }
    }
    
    return { seededCollections: seededCount };
  },
});
