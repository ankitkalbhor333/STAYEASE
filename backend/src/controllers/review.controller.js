import * as reviewService from "../services/review.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { parsePagination } from "../validations/review.validation.js";

const sendSuccess = (res, { status = 200, message, data, pagination }) =>
  res.status(status).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  });

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body);
  sendSuccess(res, {
    status: 201,
    message: "Review created successfully",
    data: review,
  });
});

export const getRoomReviews = asyncHandler(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { reviews, pagination: meta } = await reviewService.getRoomReviews(
    req.params.roomId,
    pagination
  );

  sendSuccess(res, {
    message: "Reviews fetched successfully",
    data: reviews,
    pagination: meta,
  });
});

export const getReviewById = asyncHandler(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.id);
  sendSuccess(res, {
    message: "Review fetched successfully",
    data: review,
  });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(
    req.params.id,
    req.user.id,
    req.body
  );

  sendSuccess(res, {
    message: "Review updated successfully",
    data: review,
  });
});

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user.id);
  sendSuccess(res, { message: "Review deleted successfully" });
});
