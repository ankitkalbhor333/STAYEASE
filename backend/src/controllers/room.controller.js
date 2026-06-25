import * as roomService from "../services/room.service.js";
import mongoose from "mongoose";
import { getRoomOwnerId, isRoomEditable } from "../utils/room.util.js";
/**
 * CREATE DRAFT ROOM
 * POST /api/v1/rooms
 * Create an empty draft room and return roomId for multi-step creation
 */
export const createDraftRoom = async (req, res, next) => {
  try {
    const room = await roomService.createDraftRoom(req.user.id);

    res.status(201).json({
      success: true,
      message: "Draft room created. Start filling details step by step.",
      data: {
        roomId: room._id,
        status: room.status,
        currentStep: room.currentStep,
        completedSteps: room.completedSteps,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ROOM STEP
 * PATCH /api/v1/rooms/:roomId?step=<stepName>
 * Update a specific step in the room creation process
 * Supported steps: basic, location, pricing, capacity, amenities, images, availability
 */
export const updateRoomStep = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { step } = req.query;

    // Validate roomId format
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    // Validate step parameter
    const validSteps = [
      "basic",
      "location",
      "pricing",
      "capacity",
      "amenities",
      "images",
      "availability",
    ];
    if (!step || !validSteps.includes(step)) {
      return res.status(400).json({
        success: false,
        message: `Invalid step. Valid steps are: ${validSteps.join(", ")}`,
      });
    }

    // Check ownership
    const room = await roomService.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const ownerId = getRoomOwnerId(room);
    if (ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this room",
      });
    }

    const status = room.status || "draft";
    if (!isRoomEditable(status)) {
      return res.status(400).json({
        success: false,
        message:
          status === "deleted"
            ? "Deleted rooms cannot be updated"
            : "This room cannot be updated",
        currentStatus: status,
      });
    }

    // Update the step
    const updatedRoom = await roomService.updateRoomStep(
      roomId,
      step,
      req.body,
      req.files
    );

    // Get progress
    const progress = await roomService.getRoomProgress(roomId);

    res.status(200).json({
      success: true,
      message: `${step} step updated successfully`,
      data: {
        roomId: updatedRoom._id,
        status: updatedRoom.status,
        step,
        currentStep: updatedRoom.currentStep,
        completedSteps: updatedRoom.completedSteps,
        progress: progress.progressPercentage,
        nextStep: progress.nextStep,
        ...(step === "location" && {
          location: updatedRoom.location,
          city: updatedRoom.city,
          state: updatedRoom.state,
          country: updatedRoom.country,
          fullAddress: updatedRoom.fullAddress,
          area: updatedRoom.area,
          pincode: updatedRoom.pincode,
        }),
      },
    });
  } catch (error) {
    const statusCode = error.message?.includes("latitude") ||
      error.message?.includes("longitude") ||
      error.message?.includes("Geocoding")
      ? 400
      : 500;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update room step",
    });
  }
};

/**
 * GET ROOM
 * GET /api/v1/rooms/:roomId
 * Get room details (both draft and published)
 */
export const getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    const room = await roomService.getRoomById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ROOM PROGRESS
 * GET /api/v1/rooms/:roomId/progress
 * Get the progress of a draft room
 */
export const getRoomProgress = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    const progress = await roomService.getRoomProgress(roomId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET PUBLISHING READINESS
 * GET /api/v1/rooms/:roomId/publish-readiness
 * Get validation status before publishing
 */
export const getPublishReadiness = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    const readiness = await roomService.getPublishingReadinessSummary(roomId);

    res.status(200).json({
      success: true,
      data: readiness,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUBLISH ROOM
 * PATCH /api/v1/rooms/:roomId/publish
 * Publish a draft room (convert to active)
 * Validates all steps before publishing
 */
export const publishRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    // Check ownership
    const room = await roomService.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.ownerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to publish this room",
      });
    }

    // Attempt to publish
    try {
      const publishedRoom = await roomService.publishRoom(roomId);

      res.status(200).json({
        success: true,
        message: "Room published successfully",
        data: {
          roomId: publishedRoom._id,
          status: publishedRoom.status,
          publishedAt: publishedRoom.publishedAt,
          title: publishedRoom.title,
          city: publishedRoom.city,
        },
      });
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).json({
          success: false,
          message: error.message,
          validation: error.validation,
        });
      }
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE ROOM
 * DELETE /api/v1/rooms/:roomId
 * Soft delete a room (draft or published)
 */
export const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    // Check ownership
    const room = await roomService.getRoomById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (room.ownerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this room",
      });
    }

    await roomService.deleteRoom(roomId);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET DRAFT ROOMS
 * GET /api/v1/rooms/my-draft-rooms
 * Get all draft rooms for the current user
 */
export const getDraftRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getDraftRoomsByUser(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        count: rooms.length,
        rooms,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET LATEST DRAFT ROOM
 * GET /api/v1/rooms/resume-draft
 * Resume the latest draft room
 */
export const getLatestDraftRoom = async (req, res, next) => {
  try {
    const room = await roomService.getLatestDraftRoom(req.user.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "No draft room found",
      });
    }

    const progress = await roomService.getRoomProgress(room._id);

    res.status(200).json({
      success: true,
      message: "Draft room found. You can resume from where you left off.",
      data: {
        roomId: room._id,
        progress,
        currentStep: room.currentStep,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL ROOMS (PUBLIC)
 * GET /api/v1/rooms
 * Get all published rooms with filters
 */
export const getAllRooms = async (req, res, next) => {
  try {
    const result = await roomService.getAllRooms(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET MY ROOMS
 * GET /api/v1/rooms/my-rooms
 * Get all rooms (draft/published/inactive) for the current user
 */
export const getMyRooms = async (req, res, next) => {
  try {
    const { status } = req.query;
    const rooms = await roomService.getUserRooms(req.user.id, status || null);

    res.status(200).json({
      success: true,
      data: rooms,
      count: rooms.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ROOM STATS
 * GET /api/v1/rooms/stats
 * Get room statistics for the current user
 */
export const getRoomStats = async (req, res, next) => {
  try {
    const stats = await roomService.getUserRoomStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};






export const searchRooms = async (
  req,
  res,
  next
) => {
  try {
    const rooms =
      await roomService.searchRooms(req.query);

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};
