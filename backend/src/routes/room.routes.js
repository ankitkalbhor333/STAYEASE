import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";
import {
  basicStepValidator,
  locationStepValidator,
  pricingStepValidator,
  capacityStepValidator,
  amenitiesStepValidator,
  imagesStepValidator,
  availabilityStepValidator,
  handleValidationErrors,
} from "../validations/room.validation.js";

const router = express.Router();

/**
 * ============================================
 * DRAFT ROOM CREATION WORKFLOW
 * ============================================
 */

/**
 * POST /api/v1/rooms
 * Create a draft room (Entry point for multi-step wizard)
 * Auth: Required
 */
router.post("/", verifyToken, roomController.createDraftRoom);

/**
 * GET /api/v1/rooms/resume-draft
 * Get the latest draft room to resume where user left off
 * Auth: Required
 */
router.get("/resume-draft", verifyToken, roomController.getLatestDraftRoom);

/**
 * GET /api/v1/rooms/my-draft-rooms
 * Get all draft rooms for current user
 * Auth: Required
 */
router.get("/my-draft-rooms", verifyToken, roomController.getDraftRooms);

/**
 * GET /api/v1/rooms/stats
 * Get room statistics (draft, active, inactive count)
 * Auth: Required
 */
router.get("/stats", verifyToken, roomController.getRoomStats);

/**
 * GET /api/v1/rooms/my-rooms
 * Get all user's rooms (with optional status filter)
 * Auth: Required
 * Query: ?status=draft|active|inactive
 */
router.get("/my-rooms", verifyToken, roomController.getMyRooms);

/**
 * ============================================
 * STEP-BASED UPDATES (AUTOSAVE SUPPORT)
 * ============================================
 */

/**
 * PATCH /api/v1/rooms/:roomId?step=basic
 * Update Step 1: Basic Information
 * Fields: title, description, propertyType, roomType
 * Auth: Required (Owner Only)
 */
router.patch(
  "/:roomId",
  verifyToken,
  (req, res, next) => {
    const step = req.query.step;

    // Select validator based on step
    const validators = {
      basic: basicStepValidator,
      location: locationStepValidator,
      pricing: pricingStepValidator,
      capacity: capacityStepValidator,
      amenities: amenitiesStepValidator,
      images: imagesStepValidator,
      availability: availabilityStepValidator,
    };

    const stepValidators = validators[step] || [];

    // For images step, use multer
    if (step === "images") {
      return upload.array("images", 10)(req, res, () => {
        // Run validators and continue
        const allValidators = [...stepValidators, handleValidationErrors];
        const next_middleware = allValidators[0];
        if (next_middleware) {
          next_middleware(req, res, () => {
            if (allValidators.length > 1) {
              allValidators.slice(1).reduce(
                (acc, middleware) => () => middleware(req, res, acc),
                next
              )();
            } else {
              next();
            }
          });
        } else {
          next();
        }
      });
    }

    // For other steps, run validators
    if (stepValidators.length > 0) {
      stepValidators.forEach((validator) => {
        if (Array.isArray(validator)) {
          validator.forEach((v) => v(req, res, () => {}));
        } else {
          validator(req, res, () => {});
        }
      });

      // Check for validation errors
      const errors = require("express-validator").validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array().map((error) => ({
            field: error.param,
            message: error.msg,
          })),
        });
      }
    }

    next();
  },
  roomController.updateRoomStep
);

/**
 * ============================================
 * PUBLISHING
 * ============================================
 */

/**
 * GET /api/v1/rooms/:roomId/progress
 * Get room completion progress
 * Auth: Optional (Better UX if provided)
 */
router.get("/:roomId/progress", roomController.getRoomProgress);

/**
 * GET /api/v1/rooms/:roomId/publish-readiness
 * Get validation status before publishing
 * Returns detailed report of missing fields
 * Auth: Required
 */
router.get("/:roomId/publish-readiness", verifyToken, roomController.getPublishReadiness);

/**
 * PATCH /api/v1/rooms/:roomId/publish
 * Publish a draft room (convert to active)
 * Validates all steps before publishing
 * Auth: Required (Owner Only)
 */
router.patch(
  "/:roomId/publish",
  verifyToken,
  roomController.publishRoom
);

/**
 * ============================================
 * CRUD OPERATIONS
 * ============================================
 */

/**
 * GET /api/v1/rooms/:roomId
 * Get room details (both draft and published)
 * Auth: Optional
 */
router.get("/:roomId", roomController.getRoomById);

/**
 * DELETE /api/v1/rooms/:roomId
 * Delete a room (soft delete)
 * Auth: Required (Owner Only)
 */
router.delete("/:roomId", verifyToken, roomController.deleteRoom);

/**
 * GET /api/v1/rooms
 * Get all published rooms with filters
 * Auth: Not Required
 * Query: ?city=&state=&propertyType=&minPrice=&maxPrice=&guests=&page=&limit=
 */
router.get("/", roomController.getAllRooms);

export default router;
