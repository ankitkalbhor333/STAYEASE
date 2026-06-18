import * as RoomModule from "../model/Room.js";
const Room = RoomModule.default || RoomModule;

/**
 * Create a new draft room for a user
 */
export const createDraftRoom = async (ownerId) => {
  return await Room.create({
    ownerId,
    status: "draft",
    currentStep: "basic",
    completedSteps: [],
    lastSavedAt: new Date(),
  });
};

/**
 * Get room by ID with owner details
 */
export const getRoomById = async (id) => {
  return await Room.findById(id).populate("ownerId", "name email phone _id");
};

/**
 * Get all draft rooms for a user
 */
export const getDraftRoomsByUser = async (userId) => {
  return await Room.find({
    ownerId: userId,
    status: "draft",
  }).sort({ createdAt: -1 });
};

/**
 * Update specific step in a room
 */
export const updateRoomStep = async (roomId, step, stepData) => {
  const updateData = {
    ...stepData,
    currentStep: step,
    lastSavedAt: new Date(),
  };

  // Add step to completedSteps if not already there
  const room = await Room.findById(roomId);
  if (room && !room.completedSteps.includes(step)) {
    updateData.completedSteps = [...room.completedSteps, step];
  }

  return await Room.findByIdAndUpdate(roomId, updateData, {
    new: true,
    runValidators: false, // Don't validate required fields during partial update
  });
};

/**
 * Get progress percentage for a room
 */
export const getRoomProgress = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) return null;

  const steps = ["basic", "location", "pricing", "capacity", "amenities", "images", "availability"];
  const completedCount = room.completedSteps.length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  return {
    completedSteps: room.completedSteps,
    totalSteps: steps.length,
    progressPercentage,
    currentStep: room.currentStep,
    nextStep: steps[completedCount] || "availability",
  };
};

/**
 * Publish a room (convert draft to active)
 */
export const publishRoom = async (roomId, publishData = {}) => {
  const room = await Room.findById(roomId);
  if (!room) return null;

  return await Room.findByIdAndUpdate(
    roomId,
    {
      status: "active",
      publishedAt: new Date(),
      ...publishData,
    },
    { new: true }
  );
};

/**
 * Soft delete a room
 */
export const deleteRoom = async (roomId) => {
  return await Room.findByIdAndUpdate(
    roomId,
    {
      status: "deleted",
      updatedAt: new Date(),
    },
    { new: true }
  );
};

/**
 * Restore a deleted room
 */
export const restoreRoom = async (roomId) => {
  return await Room.findByIdAndUpdate(
    roomId,
    {
      status: "draft",
      updatedAt: new Date(),
    },
    { new: true }
  );
};

/**
 * Get all active rooms with filters
 */
export const getActiveRooms = async (query = {}) => {
  const filter = {
    status: "active",
  };

  if (query.city) {
    filter.city = { $regex: query.city, $options: "i" };
  }

  if (query.state) {
    filter.state = { $regex: query.state, $options: "i" };
  }

  if (query.propertyType) {
    filter.propertyType = query.propertyType;
  }

  if (query.roomType) {
    filter.roomType = query.roomType;
  }

  if (query.minPrice || query.maxPrice) {
    filter.pricePerDay = {};
    if (query.minPrice) filter.pricePerDay.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.pricePerDay.$lte = Number(query.maxPrice);
  }

  if (query.guests) {
    filter.maxGuests = { $gte: Number(query.guests) };
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Room.countDocuments(filter);
  const rooms = await Room.find(filter)
    .populate("ownerId", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: rooms,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Check if user is room owner
 */
export const isRoomOwner = async (roomId, userId) => {
  const room = await Room.findById(roomId);
  return room && room.ownerId.toString() === userId;
};

/**
 * Upload images to a room (replaces or adds)
 */
export const updateRoomImages = async (roomId, images, replaceAll = true) => {
  const updateData = {
    lastSavedAt: new Date(),
  };

  if (replaceAll) {
    updateData.images = images;
  } else {
    // Add to existing images
    const room = await Room.findById(roomId);
    updateData.images = [...(room.images || []), ...images];
  }

  // Ensure max 10 images
  if (updateData.images.length > 10) {
    updateData.images = updateData.images.slice(0, 10);
  }

  return await Room.findByIdAndUpdate(roomId, updateData, {
    new: true,
  });
};

/**
 * Remove specific image from room
 */
export const removeRoomImage = async (roomId, publicId) => {
  return await Room.findByIdAndUpdate(
    roomId,
    {
      $pull: { images: { publicId } },
      lastSavedAt: new Date(),
    },
    { new: true }
  );
};

/**
 * Get user's room listings
 */
export const getUserRooms = async (userId, status = null) => {
  const filter = { ownerId: userId };
  if (status) filter.status = status;

  return await Room.find(filter)
    .sort({ createdAt: -1 })
    .populate("ownerId", "name email");
};

/**
 * Validate room completion for publishing
 */
export const validateRoomCompletion = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) return { valid: false, message: "Room not found" };

  const issues = [];

  // Check basic info
  if (!room.title || !room.description || !room.propertyType || !room.roomType) {
    issues.push("Basic information incomplete");
  }

  // Check location
  if (!room.state || !room.city || !room.fullAddress || !room.pincode) {
    issues.push("Location information incomplete");
  }

  // Check pricing
  if (!room.pricePerDay) {
    issues.push("Pricing information incomplete");
  }

  // Check capacity
  if (!room.maxGuests || !room.bedrooms || !room.beds || !room.bathrooms) {
    issues.push("Capacity information incomplete");
  }

  // Check images
  if (!room.images || room.images.length === 0) {
    issues.push("At least one image is required");
  }

  // Check availability
  if (!room.availableFrom || !room.availableTo) {
    issues.push("Availability information incomplete");
  }

  if (issues.length > 0) {
    return {
      valid: false,
      message: "Room is not ready for publishing",
      issues,
    };
  }

  return { valid: true, message: "Room is ready for publishing" };
};

/**
 * Resume a draft room (get current draft)
 */
export const getLatestDraftRoom = async (userId) => {
  return await Room.findOne({
    ownerId: userId,
    status: "draft",
  })
    .sort({ updatedAt: -1 })
    .populate("ownerId", "name email");
};

/**
 * Get room stats for user dashboard
 */
export const getUserRoomStats = async (userId) => {
  const draftCount = await Room.countDocuments({
    ownerId: userId,
    status: "draft",
  });

  const activeCount = await Room.countDocuments({
    ownerId: userId,
    status: "active",
  });

  const inactiveCount = await Room.countDocuments({
    ownerId: userId,
    status: "inactive",
  });

  return {
    draft: draftCount,
    active: activeCount,
    inactive: inactiveCount,
    total: draftCount + activeCount + inactiveCount,
  };
};
