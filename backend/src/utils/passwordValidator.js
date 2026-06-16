/**
 * Password Validation Utility
 * Ensures strong password requirements
 */

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*)
 * 
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, errors }
 */
export const validatePassword = (password) => {
  const errors = [];

  // Check minimum length
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check maximum length (prevent extremely long passwords)
  if (password && password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*...)");
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength score (0-5)
 * @param {string} password - Password to evaluate
 * @returns {Object} { score, level }
 */
export const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length scoring
  if (password && password.length >= 8) score++;
  if (password && password.length >= 12) score++;
  if (password && password.length >= 16) score++;

  // Character variety scoring
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const levels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const level = levels[Math.min(Math.floor(score / 1.4), 5)];

  return {
    score: Math.min(score, 5),
    level
  };
};

/**
 * Check if password is commonly used (basic check)
 * @param {string} password - Password to check
 * @returns {boolean} true if password is in common list
 */
export const isCommonPassword = (password) => {
  const commonPasswords = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "abc123",
    "admin123",
    "letmein",
    "welcome",
    "monkey",
    "dragon"
  ];

  return commonPasswords.includes(password.toLowerCase());
};
