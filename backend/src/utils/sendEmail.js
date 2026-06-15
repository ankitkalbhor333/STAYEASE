import nodemailer from "nodemailer";

/**
 * Email Service
 * Sends emails using Gmail SMTP service
 */

let transporter;

/**
 * Initialize email transporter
 * Must have EMAIL_USER and EMAIL_PASS in .env
 */
const getTransporter = () => {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn("⚠️ Email credentials not configured in .env");
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true" || false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
};

/**
 * Send Email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @returns {Promise<Object>} - Success message
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailer = getTransporter();
    
    const mailOptions = {
      from: `"StayEase rental home" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    console.log("\n📧 Sending email...");
    console.log("   From:", process.env.EMAIL_USER);
    console.log("   To:", to);
    console.log("   Subject:", subject);
    console.log("   Host:", process.env.EMAIL_HOST || "smtp.gmail.com");
    console.log("   Port:", process.env.EMAIL_PORT || 587);

    const info = await mailer.sendMail(mailOptions);
    
    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response);
    
    return { success: true, message: "Email sent successfully", messageId: info.messageId };

  } catch (err) {
    console.error("\n❌ Email sending failed!");
    console.error("   Error:", err.message);
    console.error("   To:", to);
    console.error("   Configuration:");
    console.error("     EMAIL_USER:", process.env.EMAIL_USER ? "✓" : "✗");
    console.error("     EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "✓" : "✗");
    console.error("     EMAIL_HOST:", process.env.EMAIL_HOST);
    console.error("     EMAIL_PORT:", process.env.EMAIL_PORT);
    
    throw err;
  }
};