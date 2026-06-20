import mongoose from "mongoose";
import * as reviewRepository from "../repositories/review.repository.js";
import * as roomRepository from "../repositories/room.repository.js";

const validateObjectId = (id, name) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${name}`);
  }
};

export const createReview = async (userId, { roomId, rating, comment }) => {
  validateObjectId(roomId, "roomId");

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    throw new Error("Rating must be a number between 1 and 5");
  }

  if (comment && comment.length > 500) {
    throw new Error("Comment cannot exceed 500 characters");
  }

  const room = await roomRepository.getRoomById(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  if (room.status !== "active") {
    throw new Error("Only active rooms can be reviewed");
  }

  const existingReview = await reviewRepository.getReviewByRoomAndUser(roomId, userId);
  if (existingReview) {
    throw new Error("You have already submitted a review for this room");
  }

  const review = await reviewRepository.createReview({
    roomId,
    userId,
    rating,
    comment,
  });

  await recalculateRoomReviewStats(roomId);
  return review;
};

export const updateReview = async (reviewId, userId, { rating, comment }) => {
  validateObjectId(reviewId, "reviewId");

  const review = await reviewRepository.getReviewById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId.toString() !== userId) {
    throw new Error("You are not authorized to update this review");
  }

  const updateData = {};
  if (rating != null) {
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw new Error("Rating must be a number between 1 and 5");
    }
    updateData.rating = rating;
  }

  if (comment != null) {
    if (comment.length > 500) {
      throw new Error("Comment cannot exceed 500 characters");
    }
    updateData.comment = comment;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields provided to update");
  }

  const updatedReview = await reviewRepository.updateReviewById(reviewId, updateData);
  await recalculateRoomReviewStats(review.roomId);
  return updatedReview;
};

export const deleteReview = async (reviewId, userId) => {
  validateObjectId(reviewId, "reviewId");

  const review = await reviewRepository.getReviewById(reviewId);
  if (!review) {
    throw new Error("Review not found");
  }

  if (review.userId.toString() !== userId) {
    throw new Error("You are not authorized to delete this review");
  }

  await reviewRepository.deleteReviewById(reviewId);
  await recalculateRoomReviewStats(review.roomId);
  return review;
};

const recalculateRoomReviewStats = async (roomId) => {
  const stats = await reviewRepository.getRoomReviewStats(roomId);
  await roomRepository.updateRoomReviewStats(roomId, stats);
  return stats;
};
