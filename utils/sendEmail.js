const nodemailer = require("nodemailer");

/**
 * Send OTP email for password reset
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} userName - Recipient name
 */
const sendOtpEmail = async (toEmail, otp, userName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Hustum" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset OTP - Hustum",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 32px; font-weight: 800; background: linear-gradient(to right, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">
            Hustum
          </h1>
        </div>

        <div style="background: #ffffff; border-radius: 10px; padding: 28px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px 0;">Reset Your Password</h2>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
            Hi <strong>${userName}</strong>, we received a request to reset your password.
            Use the OTP below — it expires in <strong>10 minutes</strong>.
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 16px 40px; border-radius: 10px;">
              <span style="color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: 12px;">${otp}</span>
            </div>
          </div>

          <p style="color: #6b7280; font-size: 13px; margin: 0; text-align: center;">
            If you didn't request a password reset, please ignore this email.
            Your password will remain unchanged.
          </p>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2026 Hustum. This is an automated email, please do not reply.
        </p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };
