"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { createClient } from "@supabase/supabase-js";

export const syncBookingToSupabase = internalAction({
  args: {
    guestName: v.string(),
    roomType: v.string(),
    checkInDate: v.string(),
    checkOutDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables missing");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("reservations").insert([
      {
        guest_name: args.guestName,
        room_type: args.roomType,
        arrival: args.checkInDate,
        departure: args.checkOutDate,
        status: "Booked",
        notes: args.notes || "",
        balance: 0,
      },
    ]);

    if (error) {
      console.error("Error syncing to Supabase:", error);
      throw new Error("Failed to sync reservation to Supabase");
    }
  },
});
