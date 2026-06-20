import * as RoomModule from "../model/Room.js";
import * as roomRepository from "../repositories/room.repository.js";
import * as publishValidation from "./publishValidation.service.js";
import {
  uploadImagesToCloudinary,
  deleteImagesFromCloudinary,
  validateImageFiles,
} from "../utils/imageUpload.js";
import { getAddressFromCoordinates } from "../utils/geocode.js";

const Room = RoomModule.default || RoomModule;

/**
 * Create a draft room (Step 1 Entry Point)
 */
export const createDraftRoom = async (ownerId) => {
  return await roomRepository.createDraftRoom(ownerId);
};

/**
 * Get room by ID
 */
export const getRoomById = async (id) => {
  return await roomRepository.getRoomById(id);
};

/**
 * Get draft rooms for a user
 */
export const getDraftRoomsByUser = async (userId) => {
  return await roomRepository.getDraftRoomsByUser(userId);
};

/**
 * Update room step with validation
 * Supports: basic, location, pricing, capacity, amenities, images, availability
 */
export const updateRoomStep = async (roomId, step, stepData, files = null) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  const updateData = { ...stepData };

  // Location step: reverse geocode when coordinates are provided
  if (step === "location") {
    const latitude = stepData.latitude ?? stepData.lat;
    const longitude = stepData.longitude ?? stepData.lng;

    if (latitude != null && longitude != null) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new Error("Invalid latitude or longitude");
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error("Latitude or longitude is out of range");
      }

      const address = await getAddressFromCoordinates(lat, lng);

      updateData.location = {
        type: "Point",
        coordinates: [lng, lat],
      };

      updateData.city = stepData.city || address.city;
      updateData.state = stepData.state || address.state;
      updateData.country = stepData.country || address.country;
      updateData.fullAddress = stepData.fullAddress || address.fullAddress;
      updateData.pincode = stepData.pincode || address.pincode;
      updateData.area = stepData.area || address.area;

      delete updateData.latitude;
      delete updateData.longitude;
      delete updateData.lat;
      delete updateData.lng;
    }
  }

  // Handle image upload for images step
  if (step === "images" && files) {
    try {
      validateImageFiles(files);
      const cloudinaryImages = await uploadImagesToCloudinary(files, "stayease/rooms");

      // Replace or add images based on replaceAll flag
      const replaceAll = stepData.replaceAll !== false;
      if (replaceAll) {
        updateData.images = cloudinaryImages;
      } else {
        updateData.images = [
          ...(room.images || []),
          ...cloudinaryImages,
        ].slice(0, 10);
      }

      delete updateData.replaceAll;
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // Update the room with step data
  const updatedRoom = await roomRepository.updateRoomStep(
    roomId,
    step,
    updateData
  );

  return updatedRoom;
};

/**
 * Get room progress
 */
export const getRoomProgress = async (roomId) => {
  return await roomRepository.getRoomProgress(roomId);
};

/**
 * Publish room (convert draft to active)
 * Validates all steps before publishing
 */
export const publishRoom = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  // Validate room completion
  const validation = publishValidation.validateRoomForPublishing(room);
  if (!validation.isValid) {
    const error = new Error("Room is not ready for publishing");
    error.statusCode = 400;
    error.validation = validation;
    throw error;
  }

  // Publish the room
  const publishedRoom = await roomRepository.publishRoom(roomId, {
    status: "active",
  });

  return publishedRoom;
};

/**
 * Delete room (soft delete)
 */
export const deleteRoom = async (roomId) => {
  return await roomRepository.deleteRoom(roomId);
};

/**
 * Restore a deleted room
 */
export const restoreRoom = async (roomId) => {
  return await roomRepository.restoreRoom(roomId);
};

/**
 * Get all active rooms with filters
 */
export const getAllRooms = async (query) => {
  return await roomRepository.getActiveRooms(query);
};

/**
 * Get user's room listings
 */
export const getUserRooms = async (userId, status = null) => {
  return await roomRepository.getUserRooms(userId, status);
};

/**
 * Check if user owns the room
 */
export const isRoomOwner = async (roomId, userId) => {
  return await roomRepository.isRoomOwner(roomId, userId);
};

/**
 * Upload images to room
 */
export const uploadRoomImages = async (roomId, files, replaceAll = true) => {
  try {
    validateImageFiles(files);
    const cloudinaryImages = await uploadImagesToCloudinary(
      files,
      "stayease/rooms"
    );
    return await roomRepository.updateRoomImages(
      roomId,
      cloudinaryImages,
      replaceAll
    );
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Remove image from room
 */
export const removeRoomImage = async (roomId, publicId) => {
  try {
    await deleteImagesFromCloudinary([publicId]);
    return await roomRepository.removeRoomImage(roomId, publicId);
  } catch (error) {
    throw new Error(`Image removal failed: ${error.message}`);
  }
};

/**
 * Get latest draft room for user
 */
export const getLatestDraftRoom = async (userId) => {
  return await roomRepository.getLatestDraftRoom(userId);
};

/**
 * Get user room stats
 */
export const getUserRoomStats = async (userId) => {
  return await roomRepository.getUserRoomStats(userId);
};

/**
 * Validate room for publishing
 */
export const validateRoomForPublishing = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  return publishValidation.validateRoomForPublishing(room);
};

/**
 * Get publishing readiness summary
 */
export const getPublishingReadinessSummary = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  return publishValidation.getPublishingReadinessSummary(room);
};

/**
 * Legacy support: Create full room (all data at once)
 * Deprecated: Use multi-step approach instead
 */
export const createRoom = async (payload) => {
  const room = new Room({
    ...payload,
    status: "active",
    publishedAt: new Date(),
  });

  return await room.save();
};

/**
 * Legacy support: Update room
 * Deprecated: Use updateRoomStep instead
 */
export const updateRoom = async (id, data) => {
  return await Room.findByIdAndUpdate(id, data, {
    new: true,
  });
};




export const searchRooms = async (
  query
) => {
  const filter = {
    status: "active",
  };

  // City

  if (query.city) {
    filter.city = {
      $regex: query.city,
      $options: "i",
    };
  }

  // Price

  if (query.minPrice || query.maxPrice) {
    filter.pricePerDay = {};

    if (query.minPrice) {
      filter.pricePerDay.$gte =
        Number(query.minPrice);
    }

    if (query.maxPrice) {
      filter.pricePerDay.$lte =
        Number(query.maxPrice);
    }
  }

  // Guests

  if (query.guests) {
    filter.maxGuests = {
      $gte: Number(query.guests),
    };
  }

  // Amenities

  if (query.wifi === "true") {
    filter["amenities.wifi"] = true;
  }

  if (query.parking === "true") {
    filter["amenities.parking"] = true;
  }

  if (
    query.airConditioner === "true"
  ) {
    filter[
      "amenities.airConditioner"
    ] = true;
  }

  // Search By Title

  if (query.keyword) {
    filter.title = {
      $regex: query.keyword,
      $options: "i",
    };
  }

  // Sorting

  let sortOption = {
    createdAt: -1,
  };

  switch (query.sort) {
    case "priceAsc":
      sortOption = {
        pricePerDay: 1,
      };
      break;

    case "priceDesc":
      sortOption = {
        pricePerDay: -1,
      };
      break;

    case "newest":
      sortOption = {
        createdAt: -1,
      };
      break;
  }

  // Pagination

  const page =
    Number(query.page) || 1;

  const limit =
    Number(query.limit) || 10;

  const skip =
    (page - 1) * limit;

  const rooms = await Room.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  return rooms;
};