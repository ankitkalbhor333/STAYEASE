/**
 * Token Blacklist - Maintains a list of invalidated tokens
 * Prevents using tokens after logout
 */

// In-memory blacklist: { token: expiryTime }
const tokenBlacklist = new Map();

/**
 * Add token to blacklist
 * @param {string} token - JWT token to invalidate
 * @param {number} expiresIn - Token expiry time in seconds
 */
export const blacklistToken = (token, expiresIn = 7 * 24 * 60 * 60) => {
  const expiryTime = Date.now() + expiresIn * 1000;
  tokenBlacklist.set(token, expiryTime);
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {boolean} true if token is blacklisted
 */
export const isTokenBlacklisted = (token) => {
  if (!tokenBlacklist.has(token)) {
    return false;
  }

  const expiryTime = tokenBlacklist.get(token);
  const now = Date.now();

  // Token expired naturally, remove from blacklist
  if (now > expiryTime) {
    tokenBlacklist.delete(token);
    return false;
  }

  return true;
};

/**
 * Cleanup expired tokens from blacklist periodically
 * Run this on server startup to prevent memory leaks
 */
export const startBlacklistCleanup = (intervalMs = 60 * 60 * 1000) => {
  setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [token, expiryTime] of tokenBlacklist.entries()) {
      if (now > expiryTime) {
        tokenBlacklist.delete(token);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Token blacklist cleanup: Removed ${cleanedCount} expired tokens`);
    }
  }, intervalMs);
};

/**
 * Get blacklist size (for monitoring)
 */
export const getBlacklistSize = () => {
  return tokenBlacklist.size;
};

/**
 * Clear entire blacklist (for testing only)
 */
export const clearBlacklist = () => {
  tokenBlacklist.clear();
};
