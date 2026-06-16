import express from "express";
import { 
  register, 
  verifyEmail, 
  login, 
  forgotPassword, 
  resetPasswordPage,
  resetPassword,
  logout,
  testEmail
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter
} from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

/**
 * Authentication Routes
 */

// POST /api/auth/register - Create new user account
router.post("/register", registerLimiter, register);

// GET /api/auth/verify/:token - Verify email address
router.get("/verify/:token", verifyEmail);

// POST /api/auth/login - Authenticate user
router.post("/login", loginLimiter, login);

// POST /api/auth/logout - Logout user (requires valid token)
router.post("/logout", verifyToken, logout);

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", passwordResetLimiter, forgotPassword);

// GET /api/auth/reset-password/:token - Show password reset form
router.get("/reset-password/:token", resetPasswordPage);

// POST /api/auth/reset-password/:token - Reset password
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);

// GET /api/auth/test-email - Test email sending (development only)
router.get("/test-email", testEmail);

export default router;