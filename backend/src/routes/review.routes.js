import express from "express";
import * as reviewController from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.middleware.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "../validations/review.validation.js";

const router = express.Router();

// Public
router.get("/room/:roomId", reviewController.getRoomReviews);
router.get("/:id", reviewController.getReviewById);

// Protected
router.post(
  "/",
  verifyToken,
  validate(createReviewSchema),
  reviewController.createReview
);

router.put(
  "/:id",
  verifyToken,
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete("/:id", verifyToken, reviewController.deleteReview);

export default router;
