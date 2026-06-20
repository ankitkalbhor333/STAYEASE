import mongoose from "mongoose";
import Review from "../model/Review.js";
import * as RoomModule from "../model/Room.js";

const Room = RoomModule.default || RoomModule;

export const createReview = async (reviewData) => {
  return await Review.create(reviewData);
};

export const getReviewById = async (reviewId) => {
  return await Review.findById(reviewId);
};

export const getReviewByRoomAndUser = async (roomId, userId) => {
  return await Review.findOne({ roomId, userId });
};

export const getRoomReviewStats = async (roomId) => {
  const stats = await Review.aggregate([
    { $match: { roomId: mongoose.Types.ObjectId(roomId) } },
    {
      $group: {
        _id: "$roomId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!stats.length) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: parseFloat(stats[0].averageRating.toFixed(2)),
    totalReviews: stats[0].totalReviews,
  };
};

export const updateReviewById = async (reviewId, updateData) => {
  return await Review.findByIdAndUpdate(reviewId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteReviewById = async (reviewId) => {
  return await Review.findByIdAndDelete(reviewId);
};

export const updateRoomReviewStats = async (roomId, stats) => {
  return await Room.findByIdAndUpdate(
    roomId,
    {
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
      updatedAt: new Date(),
    },
    { new: true }
  );
};
