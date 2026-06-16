/**
 * EXAMPLE: How to Use Auth Middleware in Your Routes
 * 
 * This file demonstrates how to protect routes with JWT authentication
 * Add this to your existing routes
 */

import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ PUBLIC ROUTES (No authentication required)
router.post("/register", registerController);
router.post("/login", loginController);
router.get("/verify/:token", verifyEmailController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:token", resetPasswordController);

// 🔐 PROTECTED ROUTES (Requires valid JWT token)
router.get("/profile", verifyToken, getUserProfileController);
router.put("/profile", verifyToken, updateProfileController);
router.post("/logout", verifyToken, logoutController);

// 👮 ADMIN ONLY ROUTES (Requires admin role)
router.get("/users", verifyToken, verifyAdmin, getAllUsersController);
router.delete("/users/:id", verifyToken, verifyAdmin, deleteUserController);

export default router;

/**
 * HOW TO USE IN YOUR API CLIENT:
 * 
 * 1. After login, store the token:
 *    localStorage.setItem("token", loginResponse.token);
 * 
 * 2. Send token with protected routes:
 *    fetch("/api/profile", {
 *      method: "GET",
 *      headers: {
 *        "Authorization": "Bearer " + localStorage.getItem("token"),
 *        "Content-Type": "application/json"
 *      }
 *    })
 * 
 * 3. Handle token expiry:
 *    if (response.status === 401) {
 *      localStorage.removeItem("token");
 *      // Redirect to login
 *    }
 */
