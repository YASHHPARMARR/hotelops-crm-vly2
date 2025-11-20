import { getSupabase, normalizeSupabaseError } from "./supabaseClient";
import { toast } from "sonner";

export interface ReservationData {
  id?: string;
  guestName: string;
  idProofType: string;
  idProofNumber: string;
  roomType: string;
  roomNumber: string;
  arrival: string;
  departure: string;
  status: string;
  balance?: number;
  source?: string;
  notes?: string;
}

export async function createReservation(data: ReservationData): Promise<any> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not initialized");

  try {
    // 1. Create/update guest record
    const guestData = {
      full_name: data.guestName,
      id_number: data.idProofNumber,
      email: `${data.idProofNumber}@guest.temp`, // Temporary email
      phone: "", // Can be added later
      country: "", // Can be added later
      membership: "None",
    };

    const { data: existingGuest } = await supabase
      .from("guests")
      .select("*")
      .eq("id_number", data.idProofNumber)
      .single();

    let guestId: string;
    if (existingGuest) {
      guestId = existingGuest.id;
    } else {
      const { data: newGuest, error: guestError } = await supabase
        .from("guests")
        .insert([{ ...guestData, guest_id: `GST${Date.now()}` }])
        .select()
        .single();

      if (guestError) throw guestError;
      guestId = newGuest.id;
    }

    // 2. Create reservation
    const reservationData = {
      guestName: data.guestName,
      idProofType: data.idProofType,
      idProofNumber: data.idProofNumber,
      roomType: data.roomType,
      roomNumber: data.roomNumber,
      arrival: data.arrival,
      departure: data.departure,
      status: data.status,
      balance: data.balance || 0,
      source: data.source || "Direct",
      notes: data.notes || "",
    };

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert([reservationData])
      .select()
      .single();

    if (reservationError) throw reservationError;

    // 3. Update room status
    const newRoomStatus = data.status === "CheckedIn" ? "Occupied" : "Reserved";
    const { error: roomError } = await supabase
      .from("rooms")
      .update({ status: newRoomStatus })
      .eq("number", data.roomNumber);

    if (roomError) throw roomError;

    toast.success("Reservation created successfully with all related updates");
    return reservation;
  } catch (error: any) {
    console.error("Reservation creation error:", error);
    throw new Error(normalizeSupabaseError(error));
  }
}

export async function updateReservation(id: string, data: Partial<ReservationData>): Promise<any> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not initialized");

  try {
    // Get existing reservation to compare changes
    const { data: existingReservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 1. Update reservation
    const { data: updatedReservation, error: updateError } = await supabase
      .from("reservations")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Update room status if room number or status changed
    if (data.roomNumber && data.roomNumber !== existingReservation.roomNumber) {
      // Free up old room
      await supabase
        .from("rooms")
        .update({ status: "Vacant" })
        .eq("number", existingReservation.roomNumber);

      // Reserve new room
      const newRoomStatus = data.status === "CheckedIn" ? "Occupied" : "Reserved";
      await supabase
        .from("rooms")
        .update({ status: newRoomStatus })
        .eq("number", data.roomNumber);
    } else if (data.status && data.status !== existingReservation.status) {
      // Update room status based on reservation status
      let roomStatus = "Vacant";
      if (data.status === "CheckedIn") roomStatus = "Occupied";
      else if (data.status === "Booked") roomStatus = "Reserved";

      await supabase
        .from("rooms")
        .update({ status: roomStatus })
        .eq("number", existingReservation.roomNumber);
    }

    // 3. If status is CheckedOut or Cancelled, free up the room
    if (data.status === "CheckedOut" || data.status === "Cancelled") {
      await supabase
        .from("rooms")
        .update({ status: "Vacant" })
        .eq("number", existingReservation.roomNumber);
    }

    toast.success("Reservation updated successfully with all related updates");
    return updatedReservation;
  } catch (error: any) {
    console.error("Reservation update error:", error);
    throw new Error(normalizeSupabaseError(error));
  }
}

export async function deleteReservation(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not initialized");

  try {
    // Get reservation to free up the room
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 1. Free up the room
    await supabase
      .from("rooms")
      .update({ status: "Vacant" })
      .eq("number", reservation.roomNumber);

    // 2. Delete reservation
    const { error: deleteError } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    toast.success("Reservation deleted and room freed successfully");
  } catch (error: any) {
    console.error("Reservation deletion error:", error);
    throw new Error(normalizeSupabaseError(error));
  }
}
