import * as RoomModule from "../model/Room.js";
import * as BookingModule from "../model/Booking.js";

const Room = RoomModule.default || RoomModule;
const Booking = BookingModule.default || BookingModule;

export const updateRoomAvailabilityStatuses = async () => {
  try {
    const now = new Date();
    const currentUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

    // We only update rooms that are active or inactive. Drafts/Deleted remain untouched.
    const rooms = await Room.find({
      status: { $in: ["active", "inactive"] }
    });

    let activatedCount = 0;
    let deactivatedCount = 0;

    for (const room of rooms) {
      if (!room.availableFrom || !room.availableTo) continue;

      const fromDate = new Date(room.availableFrom);
      const toDate = new Date(room.availableTo);

      const fromUTC = Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate());
      const toUTC = Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate());

      let newStatus = room.status;
      if (currentUTC >= fromUTC && currentUTC <= toUTC) {
        newStatus = "active";
      } else {
        newStatus = "inactive";
      }

      if (newStatus !== room.status) {
        room.status = newStatus;
        await room.save();
        if (newStatus === "active") activatedCount++;
        else deactivatedCount++;
      }
    }

    if (activatedCount > 0 || deactivatedCount > 0) {
      console.log(`[Room Availability Job] Activated: ${activatedCount}, Deactivated: ${deactivatedCount} rooms.`);
    }
  } catch (error) {
    console.error("[Room Availability Job Error]:", error);
  }
};

export const cleanupExpiredBookings = async () => {
  try {
    const now = new Date();
    const result = await Booking.updateMany(
      {
        bookingStatus: "PENDING",
        paymentExpiresAt: { $lte: now }
      },
      {
        $set: {
          bookingStatus: "CANCELLED",
          paymentStatus: "PENDING"
        }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Stale Booking Cleanup] Expired ${result.modifiedCount} pending bookings due to payment hold expiration.`);
    }
  } catch (error) {
    console.error("[Stale Booking Cleanup Error]:", error);
  }
};

export const startRoomAvailabilityJob = (intervalMs = 60 * 60 * 1000) => {
  // Execute immediately on startup
  updateRoomAvailabilityStatuses();
  cleanupExpiredBookings();

  // Schedule periodically
  setInterval(() => {
    updateRoomAvailabilityStatuses();
    cleanupExpiredBookings();
  }, intervalMs);

  console.log(`[Room Availability Job] Scheduled room status & booking holds checker every ${intervalMs / 1000 / 60} minutes.`);
};
