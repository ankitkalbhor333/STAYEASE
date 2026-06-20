import jwt from "jsonwebtoken";

const DEFAULT_EXPIRES_IN = "7d";
const DEFAULT_EXPIRES_SECONDS = 7 * 24 * 60 * 60;

/**
 * JWT expiry from environment (e.g. "1h", "24h", "7d").
 */
export const getJwtExpiresIn = () =>
  process.env.JWT_EXPIRE || DEFAULT_EXPIRES_IN;

/**
 * ISO timestamp when the token expires (from decoded `exp` claim).
 */
export const getTokenExpiresAt = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) {
    return null;
  }
  return new Date(decoded.exp * 1000).toISOString();
};

/**
 * Seconds until token expiry — used when blacklisting on logout.
 */
export const getTokenRemainingSeconds = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) {
    return DEFAULT_EXPIRES_SECONDS;
  }

  const remaining = decoded.exp - Math.floor(Date.now() / 1000);
  return Math.max(remaining, 0);
};
