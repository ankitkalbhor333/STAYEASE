import jwt from "jsonwebtoken";
import User from "../model/User.js";
import { isTokenBlacklisted } from "./tokenBlacklist.js";

/**
 * Auth Middleware - Verify JWT Token
 * Protects routes that require authentication.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        msg: "No token provided. Authorization header required.",
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        msg: "Invalid authorization header format. Use: Bearer <token>",
      });
    }

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        msg: "Token has been revoked. Please login again.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        msg: "User not found.",
      });
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role,
    };
    req.token = token;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        msg: "Token has expired. Please login again.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        msg: "Invalid token. Authentication failed.",
      });
    }

    console.error("Auth middleware error:", err.message);
    res.status(500).json({
      msg: "Server error during authentication",
    });
  }
};

/**
 * Optional legacy admin middleware for routes requiring admin access.
 */
export const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "Authentication required" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ msg: "Access denied. Admin privileges required." });
  }

  next();
};
