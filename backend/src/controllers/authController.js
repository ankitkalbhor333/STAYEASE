import User from "../model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { sendEmail } from "../utils/sendEmail.js";
import { validatePassword, isCommonPassword } from "../utils/passwordValidator.js";

/**
 * REGISTER - Create new user account
 * POST /api/auth/register
 * Body: { name, email, password }
 */

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        msg: "Please provide name, email, phone, and password" 
      });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        msg: "Password does not meet requirements",
        errors: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Check for common passwords
    if (isCommonPassword(password)) {
      return res.status(400).json({
        msg: "Password is too common. Please choose a stronger password.",
        errors: ["This password is commonly used and not secure"]
      });
    }

    // Check if user exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Check if phone already exists
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ msg: "Phone number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      verificationToken
    });

    // Build verification link
    const protocol = req.protocol || "http";
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}/api/auth`;
    const verifyLink = `${baseUrl}/verify/${verificationToken}`;

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
    const protocol = req.protocol || "http";
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}/api/auth`;
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
 * RESET PASSWORD PAGE - Show password reset form (GET)
 * GET /api/auth/reset-password/:token
 */
export const resetPasswordPage = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>❌ Error</h2>
            <p>Reset token is required</p>
          </body>
        </html>
      `);
    }

    // Check if token exists and is not expired
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>❌ Invalid Token</h2>
            <p>Reset token is invalid or has expired</p>
          </body>
        </html>
      `);
    }

    // Check if token expired
    if (new Date() > user.resetTokenExpiry) {
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>❌ Token Expired</h2>
            <p>Reset link has expired. Please request a new one.</p>
          </body>
        </html>
      `);
    }

    // Show password reset form
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 400px;
          }
          h2 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
          }
          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
          }
          input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            transition: border-color 0.3s;
          }
          input:focus {
            outline: none;
            border-color: #667eea;
          }
          .requirements {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #666;
          }
          .requirements li {
            margin: 5px 0;
            margin-left: 20px;
          }
          .requirements li.met {
            color: #4caf50;
          }
          .requirements li.unmet {
            color: #f44336;
          }
          button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          button:hover {
            transform: translateY(-2px);
          }
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
          }
          .message {
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            text-align: center;
            display: none;
          }
          .message.error {
            background: #ffebee;
            color: #c62828;
            display: block;
          }
          .message.success {
            background: #e8f5e9;
            color: #2e7d32;
            display: block;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔐 Reset Password</h2>
          <p class="subtitle">Enter your new password below</p>

          <form id="resetForm">
            <div class="form-group">
              <label for="password">New Password:</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter new password"
                required
              >
            </div>

            <div class="requirements">
              <strong>Password Requirements:</strong>
              <ul id="requirements">
                <li id="length" class="unmet">At least 8 characters</li>
                <li id="upper" class="unmet">One uppercase letter (A-Z)</li>
                <li id="lower" class="unmet">One lowercase letter (a-z)</li>
                <li id="number" class="unmet">One number (0-9)</li>
                <li id="special" class="unmet">One special character (!@#$%^&*)</li>
              </ul>
            </div>

            <button type="submit" id="submitBtn" disabled>Reset Password</button>

            <div id="message" class="message"></div>
          </form>
        </div>

        <script>
          const token = "${token}";
          const passwordInput = document.getElementById("password");
          const submitBtn = document.getElementById("submitBtn");
          const messageDiv = document.getElementById("message");
          const form = document.getElementById("resetForm");

          const checks = {
            length: password => password.length >= 8,
            upper: password => /[A-Z]/.test(password),
            lower: password => /[a-z]/.test(password),
            number: password => /[0-9]/.test(password),
            special: password => /[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]/.test(password)
          };

          passwordInput.addEventListener("input", (e) => {
            const password = e.target.value;
            let allMet = true;

            for (const [key, check] of Object.entries(checks)) {
              const element = document.getElementById(key);
              const met = check(password);
              
              if (met) {
                element.classList.remove("unmet");
                element.classList.add("met");
              } else {
                element.classList.remove("met");
                element.classList.add("unmet");
                allMet = false;
              }
            }

            submitBtn.disabled = !allMet;
          });

          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            messageDiv.innerHTML = "Processing...";

            try {
              const response = await fetch("/api/auth/reset-password/${token}", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: passwordInput.value })
              });

              const data = await response.json();

              if (response.ok) {
                messageDiv.className = "message success";
                messageDiv.innerHTML = "✅ " + data.msg + " <br><br> Redirecting to login...";
                setTimeout(() => {
                  // Optionally redirect to frontend login page
                  // window.location.href = "/login";
                }, 2000);
              } else {
                messageDiv.className = "message error";
                messageDiv.innerHTML = "❌ " + (data.errors?.[0] || data.msg || "Error");
                submitBtn.disabled = false;
              }
            } catch (error) {
              messageDiv.className = "message error";
              messageDiv.innerHTML = "❌ Network error: " + error.message;
              submitBtn.disabled = false;
            }
          });
        </script>
      </body>
      </html>
    `);

  } catch (err) {
    console.error("Reset password page error:", err);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2>❌ Server Error</h2>
          <p>Something went wrong. Please try again.</p>
        </body>
      </html>
    `);
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

    if (!newPassword) {
      return res.status(400).json({ msg: "New password required" });
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        msg: "Password does not meet requirements",
        errors: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Check for common passwords
    if (isCommonPassword(newPassword)) {
      return res.status(400).json({
        msg: "Password is too common. Please choose a stronger password.",
        errors: ["This password is commonly used and not secure"]
      });
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