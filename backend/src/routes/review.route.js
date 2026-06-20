import express from "express";
import * as reviewController from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, reviewController.createReview);
router.put("/:id", verifyToken, reviewController.updateReview);
router.delete("/:id", verifyToken, reviewController.deleteReview);

export default router;