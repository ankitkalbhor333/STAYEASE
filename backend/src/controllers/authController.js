import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { sendEmail } from "../utils/sendEmail.js";

/**
 * REGISTER - Create new user account
 * POST /api/auth/register
 * Body: { name, email, password }
 */

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        msg: "Please provide name, email, and password" 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken
    });

    // Build verification link
    const baseUrl = req.serverURL;
    const verifyLink = `${base}/verify/${verificationToken}`;

    // Send verification email
    try {
      await sendEmail(
        email,
        "Verify Your Email",
        `
          <h2>Welcome to Coaching Platform!</h2>
          <p>Click the link below to verify your email:</p>
          <a href="${verifyLink}" style="padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>This link expires in 24 hours.</p>
        `
      );
      res.status(201).json({ 
        msg: "Registration successful! Check your email to verify your account."
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      res.status(201).json({ 
        msg: "Registration successful! Email verification may be delayed."
      });
    }

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * VERIFY EMAIL - Confirm email verification token
 * GET /api/auth/verify/:token
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: "Verification token required" });
    }

    // Find user with token
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired verification token" });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ msg: "Email verified successfully! You can now login." });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * LOGIN - Authenticate user with email and password
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ 
      msg: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * FORGOT PASSWORD - Send password reset email
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Generate reset token (valid for 30 minutes)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Build reset link
    const baseUrl = req.serverURL;
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    // Send reset email
    try {
      await sendEmail(
        email,
        "Reset Your Password",
        `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p><strong>This link expires in 30 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      );
      res.json({ msg: "Password reset link sent to your email" });
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      res.status(500).json({ msg: "Failed to send reset email" });
    }

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * RESET PASSWORD - Update password with reset token
 * POST /api/auth/reset-password/:token
 * Body: { newPassword }
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validation
    if (!token) {
      return res.status(400).json({ msg: "Reset token required" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // Find user with reset token
    const user = await User.findOne({ resetToken: token });
    if (!user) {
      return res.status(400).json({ msg: "Invalid reset token" });
    }

    // Check if token expired
    if (new Date() > user.resetTokenExpiry) {
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return res.status(400).json({ msg: "Reset token has expired" });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ msg: "Password reset successful! You can now login." });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/**
 * TEST EMAIL - Send test email to verify email service is working
 * GET /api/auth/test-email
 */
export const testEmail = async (req, res) => {
  try {
    const testEmail = process.env.EMAIL_USER;
    
    if (!testEmail) {
      return res.status(400).json({ 
        msg: "EMAIL_USER not configured in .env",
        debug: {
          EMAIL_USER: process.env.EMAIL_USER ? "✓ Set" : "✗ Not set",
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✓ Set" : "✗ Not set",
          EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
          EMAIL_PORT: process.env.EMAIL_PORT || 587
        }
      });
    }

    await sendEmail(
      testEmail,
      "🧪 Test Email - Coaching Platform",
      `
        <h2>Test Email Successful! ✓</h2>
        <p>If you received this email, your email service is working correctly.</p>
        <hr>
        <h3>Environment Details:</h3>
        <ul>
          <li>Email User: ${process.env.EMAIL_USER}</li>
          <li>Email Host: ${process.env.EMAIL_HOST || "smtp.gmail.com"}</li>
          <li>Email Port: ${process.env.EMAIL_PORT || 587}</li>
          <li>Timestamp: ${new Date().toISOString()}</li>
        </ul>
        <p><strong>Your email authentication system is ready to use!</strong></p>
      `
    );

    res.json({ 
      msg: "Test email sent successfully!",
      sentTo: testEmail,
      debug: {
        EMAIL_USER: process.env.EMAIL_USER ? "✓ Configured" : "✗ Missing",
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✓ Configured" : "✗ Missing",
        EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
        EMAIL_PORT: process.env.EMAIL_PORT || 587
      }
    });

  } catch (err) {
    console.error("❌ Test email error:", err.message);
    res.status(500).json({ 
      msg: "Failed to send test email",
      error: err.message,
      debug: {
        EMAIL_USER: process.env.EMAIL_USER ? "✓ Set" : "✗ Not set",
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "✓ Set" : "✗ Not set",
        EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
        EMAIL_PORT: process.env.EMAIL_PORT || 587
      }
    });
  }
};