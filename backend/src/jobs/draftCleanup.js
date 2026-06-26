import * as RoomModule from "../model/Room.js";
import { deleteImagesFromCloudinary } from "../utils/imageUpload.js";

const Room = RoomModule.default || RoomModule;

/**
 * Delete draft rooms that have not been published (status: 'draft') and not updated/created in the last 2 days.
 */
export const cleanupExpiredDrafts = async () => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    // Find all expired draft rooms
    const expiredDrafts = await Room.find({
      status: "draft",
      updatedAt: { $lt: twoDaysAgo }
    });

    if (expiredDrafts.length === 0) {
      return;
    }

    console.log(`[Draft Cleanup] Found ${expiredDrafts.length} expired draft rooms.`);

    for (const room of expiredDrafts) {
      // Clean up Cloudinary images if any exist
      if (room.images && room.images.length > 0) {
        const publicIds = room.images.map(img => img.publicId).filter(Boolean);
        if (publicIds.length > 0) {
          try {
            await deleteImagesFromCloudinary(publicIds);
            console.log(`[Draft Cleanup] Deleted ${publicIds.length} images from Cloudinary for room ${room._id}`);
          } catch (imgError) {
            console.error(`[Draft Cleanup] Failed to delete images for room ${room._id} from Cloudinary:`, imgError.message);
          }
        }
      }
      
      // Delete the room document
      await Room.findByIdAndDelete(room._id);
      console.log(`[Draft Cleanup] Deleted draft room: ${room._id} (last updated: ${room.updatedAt})`);
    }

    console.log(`[Draft Cleanup] Expired draft rooms cleanup complete.`);
  } catch (error) {
    console.error("[Draft Cleanup Error]:", error);
  }
};

/**
 * Start the interval job for draft cleanup.
 * Runs once immediately, and then every 1 hour.
 */
export const startDraftCleanupJob = (intervalMs = 60 * 60 * 1000) => {
  // Run once immediately on startup
  cleanupExpiredDrafts();
  
  // Schedule periodic cleanup
  setInterval(cleanupExpiredDrafts, intervalMs);
  console.log(`[Draft Cleanup] Scheduled draft cleanup job every ${intervalMs / 1000 / 60} minutes.`);
};
