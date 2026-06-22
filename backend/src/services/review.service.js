import Booking from "../model/Booking.js";
import * as reviewRepo from "../repositories/review.repository.js";
import * as roomRepo from "../repositories/room.repository.js";
import { AppError } from "../utils/AppError.js";
import { assertValidObjectId } from "../utils/objectId.util.js";
import { getRoomOwnerId } from "../utils/room.util.js";

const parseRating = (rating) => {
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new AppError("Rating must be an integer between 1 and 5", 400);
  }
  return value;
};

const normalizeComment = (comment) => {
  if (comment == null || comment === "") return undefined;
  const trimmed = String(comment).trim();
  if (trimmed.length > 500) {
    throw new AppError("Comment cannot exceed 500 characters", 400);
  }
  return trimmed;
};

const getReviewAuthorId = (review) =>
  review.userId._id?.toString() || review.userId.toString();

const assertReviewOwner = (review, userId) => {
  if (getReviewAuthorId(review) !== userId) {
    throw new AppError("You are not authorized to modify this review", 403);
  }
};

const assertCanReviewRoom = async (userId, roomId, room) => {
  if (getRoomOwnerId(room) === userId) {
    throw new AppError("Room owners cannot review their own listing", 403);
  }

  const hasStayed = await Booking.exists({
    userId,
    roomId,
    bookingStatus: { $in: ["CONFIRMED", "COMPLETED"] },
    checkOut: { $lte: new Date() },
  });

  if (!hasStayed) {
    throw new AppError("You can only review a room after completing a stay", 403);
  }
};

const getActiveRoom = async (roomId) => {
  const room = await roomRepo.getRoomById(roomId);
  if (!room) throw new AppError("Room not found", 404);
  if (room.status !== "active") {
    throw new AppError("Only active rooms can be reviewed", 400);
  }
  return room;
};

const refreshRoomStats = async (roomId) => {
  const stats = await reviewRepo.aggregateRoomStats(roomId);
  await reviewRepo.syncRoomStats(roomId, stats);
  return stats;
};

export const createReview = async (userId, { roomId, rating, comment }) => {
  assertValidObjectId(roomId, "roomId");

  const room = await getActiveRoom(roomId);
  await assertCanReviewRoom(userId, roomId, room);

  const duplicate = await reviewRepo.findByRoomAndUser(roomId, userId);
  if (duplicate) {
    throw new AppError("You have already reviewed this room", 400);
  }

  try {
    const review = await reviewRepo.create({
      roomId,
      userId,
      rating: parseRating(rating),
      comment: normalizeComment(comment),
    });

    await refreshRoomStats(roomId);
    return review;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("You have already reviewed this room", 400);
    }
    throw error;
  }
};

export const getRoomReviews = async (roomId, pagination) => {
  assertValidObjectId(roomId, "roomId");

  const room = await roomRepo.getRoomById(roomId);
  if (!room) throw new AppError("Room not found", 404);

  const [reviews, total] = await reviewRepo.findByRoom(roomId, pagination);

  return {
    reviews,
    pagination: {
      ...pagination,
      total,
      totalPages: Math.ceil(total / pagination.limit) || 0,
    },
  };
};

export const getReviewById = async (reviewId) => {
  assertValidObjectId(reviewId, "reviewId");

  const review = await reviewRepo.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);

  return review;
};

export const updateReview = async (reviewId, userId, { rating, comment }) => {
  assertValidObjectId(reviewId, "reviewId");

  const review = await reviewRepo.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);

  assertReviewOwner(review, userId);

  const updateData = {};
  if (rating != null) updateData.rating = parseRating(rating);
  if (comment != null) updateData.comment = normalizeComment(comment);

  if (!Object.keys(updateData).length) {
    throw new AppError("No valid fields provided to update", 400);
  }

  const updated = await reviewRepo.updateById(reviewId, updateData);
  await refreshRoomStats(review.roomId);

  return updated;
};

export const deleteReview = async (reviewId, userId) => {
  assertValidObjectId(reviewId, "reviewId");

  const review = await reviewRepo.findById(reviewId);
  if (!review) throw new AppError("Review not found", 404);

  assertReviewOwner(review, userId);

  await reviewRepo.deleteById(reviewId);
  await refreshRoomStats(review.roomId);
};
