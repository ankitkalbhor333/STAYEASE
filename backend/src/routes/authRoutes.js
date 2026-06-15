import express from "express";
import { 
  register, 
  verifyEmail, 
  login, 
  forgotPassword, 
  resetPassword,
  testEmail
} from "../controllers/authController.js";

const router = express.Router();

/**
 * Authentication Routes
 */

// POST /api/auth/register - Create new user account
router.post("/register", register);

// GET /api/auth/verify/:token - Verify email address
router.get("/verify/:token", verifyEmail);

// POST /api/auth/login - Authenticate user
router.post("/login", login);

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password/:token - Reset password
router.post("/reset-password/:token", resetPassword);

// GET /api/auth/test-email - Test email sending (development only)
router.get("/test-email", testEmail);

export default router;