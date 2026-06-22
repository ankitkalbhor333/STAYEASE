import mongoose from "mongoose";
import Review from "../model/Review.js";
import Room from "../model/Room.js";
import { toObjectId } from "../utils/objectId.util.js";

const USER_FIELDS = "name";

export const create = (data) => Review.create(data);

export const findById = (reviewId) =>
  Review.findById(reviewId).populate("userId", USER_FIELDS);

export const findByRoomAndUser = (roomId, userId) =>
  Review.findOne({ roomId, userId });

export const findByRoom = (roomId, { page, limit }) => {
  const skip = (page - 1) * limit;

  return Promise.all([
    Review.find({ roomId })
      .populate("userId", USER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ roomId }),
  ]);
};

export const updateById = (reviewId, data) =>
  Review.findByIdAndUpdate(reviewId, data, {
    new: true,
    runValidators: true,
  }).populate("userId", USER_FIELDS);

export const deleteById = (reviewId) => Review.findByIdAndDelete(reviewId);

export const aggregateRoomStats = async (roomId) => {
  const [result] = await Review.aggregate([
    { $match: { roomId: toObjectId(roomId) } },
    {
      $group: {
        _id: "$roomId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!result) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: parseFloat(result.averageRating.toFixed(2)),
    totalReviews: result.totalReviews,
  };
};

export const syncRoomStats = (roomId, stats) =>
  Room.findByIdAndUpdate(
    roomId,
    {
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
    { new: true }
  );
