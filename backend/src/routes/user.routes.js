import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import authorize from "../middleware/role.middleware.js";
import validate from "../middleware/validate.middleware.js";
import upload from "../config/multer.js";
import {
  getProfile,
  updateProfile,
  getUserById,
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/user.controller.js";
import { updateProfileSchema } from "../validations/user.validation.js";

const router = express.Router();

// GET /api/users/profile - any authenticated user
router.get("/profile", verifyToken, getProfile);

// PUT /api/users/profile - any authenticated user
router.put(
  "/profile",
  verifyToken,
  validate(updateProfileSchema),
  updateProfile
);

// POST /api/users/profile-image - upload profile image
router.post(
  "/profile-image",
  verifyToken,
  upload.single("image"),
  uploadProfileImage
);

// DELETE /api/users/profile-image - delete profile image
router.delete(
  "/profile-image",
  verifyToken,
  deleteProfileImage
);

// GET /api/users/:id - admin only
router.get("/:id", verifyToken, authorize("ADMIN"), getUserById);

export default router;
