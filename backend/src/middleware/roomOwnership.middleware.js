import * as RoomModule from "../model/Room.js";
const Room = RoomModule.default || RoomModule;

/**
 * Middleware to verify room ownership
 * Ensures only the room owner can update/delete their rooms
 */
export const verifyRoomOwnership = async (req, res, next) => {
  try {
    const { roomId, id } = req.params;
    const actualRoomId = roomId || id;

    if (!actualRoomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required",
      });
    }

    const room = await Room.findById(actualRoomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Verify ownership
    if (room.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    // Attach room to request for use in controller
    req.room = room;
    req.roomId = room._id;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying room ownership",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if room is in draft status
 * Useful for edit operations
 */
export const isDraftRoom = async (req, res, next) => {
  try {
    const room = req.room || (await Room.findById(req.params.roomId || req.params.id));

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "This room has already been published. You cannot edit it anymore.",
        currentStatus: room.status,
      });
    }

    req.room = room;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking draft status",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if room is published
 * Useful for view operations
 */
export const isPublishedRoom = async (req, res, next) => {
  try {
    const room = req.room || (await Room.findById(req.params.roomId || req.params.id));

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This room is not published",
        currentStatus: room.status,
      });
    }

    req.room = room;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking published status",
      error: error.message,
    });
  }
};

/**
 * Middleware to check if room is NOT deleted
 */
export const isNotDeleted = async (req, res, next) => {
  try {
    const room = req.room || (await Room.findById(req.params.roomId || req.params.id));

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.status === "deleted") {
      return res.status(410).json({
        success: false,
        message: "This room has been deleted",
      });
    }

    req.room = room;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking deletion status",
      error: error.message,
    });
  }
};

/**
 * Combined middleware: Check ownership AND draft status
 * Use for: Update/Edit operations
 */
export const verifyOwnershipAndDraft = async (req, res, next) => {
  try {
    const { roomId, id } = req.params;
    const actualRoomId = roomId || id;

    const room = await Room.findById(actualRoomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    if (room.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "This room has already been published and cannot be edited",
        currentStatus: room.status,
      });
    }

    req.room = room;
    req.roomId = room._id;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying permissions",
      error: error.message,
    });
  }
};

/**
 * Combined middleware: Check ownership AND published status
 * Use for: View operations by owner
 */
export const verifyOwnershipAndPublished = async (req, res, next) => {
  try {
    const { roomId, id } = req.params;
    const actualRoomId = roomId || id;

    const room = await Room.findById(actualRoomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view this room",
      });
    }

    if (room.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This room is not published",
        currentStatus: room.status,
      });
    }

    req.room = room;
    req.roomId = room._id;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying permissions",
      error: error.message,
    });
  }
};

export default verifyRoomOwnership;
