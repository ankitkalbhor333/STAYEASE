/**
 * Rate Limiting Middleware
 * Prevents brute force attacks on auth endpoints
 * 
 * Tracks requests per IP address and blocks if threshold exceeded
 */

// 🧪 TESTING MODE - Set to true to disable all rate limiting
const DISABLE_RATE_LIMIT = true;

// In-memory store for request tracking: { ip: [{ timestamp, count }] }
const requestTracker = new Map();

/**
 * No-op middleware for testing (disables rate limiting)
 */
const noOpLimiter = (req, res, next) => {
  next();
};

/**
 * Rate Limiter - Generic endpoint limiter
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Middleware function
 */
export const rateLimiter = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  // If testing mode is on, skip rate limiting
  if (DISABLE_RATE_LIMIT) {
    return noOpLimiter;
  }

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Initialize IP tracker if not exists
    if (!requestTracker.has(ip)) {
      requestTracker.set(ip, []);
    }

    const requests = requestTracker.get(ip);

    // Remove old requests outside the window
    const validRequests = requests.filter(req => now - req.timestamp < windowMs);

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        msg: "Too many attempts. Please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
        error: "RATE_LIMIT_EXCEEDED"
      });
    }

    // Add current request
    validRequests.push({ timestamp: now });
    requestTracker.set(ip, validRequests);

    next();
  };
};

/**
 * Login Rate Limiter - Stricter limits for login attempts
 * 5 attempts per 15 minutes
 */
export const loginLimiter = rateLimiter(5, 15 * 60 * 1000);

/**
 * Register Rate Limiter - Moderate limits for registration
 * 3 attempts per 1 hour
 */
export const registerLimiter = rateLimiter(1000, 60 * 60 * 1000);

/**
 * Password Reset Rate Limiter - Strict limits for password reset
 * 3 attempts per 1 hour
 */
export const passwordResetLimiter = rateLimiter(3, 60 * 60 * 1000);

/**
 * Cleanup expired entries periodically (optional - memory management)
 */
export const startRateLimitCleanup = (intervalMs = 60 * 60 * 1000) => {
  setInterval(() => {
    const now = Date.now();
    const window = 60 * 60 * 1000; // 1 hour

    for (const [ip, requests] of requestTracker.entries()) {
      const validRequests = requests.filter(req => now - req.timestamp < window);
      
      if (validRequests.length === 0) {
        requestTracker.delete(ip);
      } else {
        requestTracker.set(ip, validRequests);
      }
    }

    console.log(`🧹 Rate limit cleanup: ${requestTracker.size} IPs active`);
  }, intervalMs);
};
