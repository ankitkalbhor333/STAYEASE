import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "./tokenBlacklist.js";

/**
 * Auth Middleware - Verify JWT Token
 * Protects routes that require authentication
 * 
 * Usage: router.get("/protected-route", verifyToken, controllerFunction);
 */
export const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        msg: "No token provided. Authorization header required." 
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7)  // Remove "Bearer " prefix
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        msg: "Invalid authorization header format. Use: Bearer <token>" 
      });
    }

    // Check if token is blacklisted (user logged out)
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        msg: "Token has been revoked. Please login again."
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    // Attach token to request (for logout)
    req.token = token;

    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        msg: "Token has expired. Please login again." 
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        msg: "Invalid token. Authentication failed." 
      });
    }

    console.error("Auth middleware error:", err.message);
    res.status(500).json({ 
      msg: "Server error during authentication" 
    });
  }
};

/**
 * Optional: Admin Middleware - Check if user is admin
 * Use this after verifyToken if you have admin roles
 * 
 * Usage: router.delete("/admin-route", verifyToken, verifyAdmin, controllerFunction);
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    // Import User model
    import("../model/User.js").then(async (module) => {
      const User = module.default;
      
      const user = await User.findById(req.user.id);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ 
          msg: "Access denied. Admin privileges required." 
        });
      }

      next();
    }).catch(err => {
      console.error("Admin verification error:", err);
      res.status(500).json({ msg: "Server error" });
    });

  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
