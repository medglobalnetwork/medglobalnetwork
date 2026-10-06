import nodemailer, { type Transporter } from "nodemailer";
import fs from "node:fs";
import path from "node:path";

function getSmtpCredentials(): { user?: string; pass?: string } {
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    try {
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed.startsWith("SMTP_USER=")) {
            user = trimmed.split("=")[1].replace(/["']/g, "").trim();
          } else if (trimmed.startsWith("SMTP_PASS=")) {
            pass = trimmed.split("=")[1].replace(/["']/g, "").trim();
          }
        }
      }
    } catch {
      // Ignore file read errors
    }
  }

  return { user, pass };
}

// Lazy-initialized SMTP transporter singleton
let transporter: Transporter | null = null;

function getTransporter(): { transport: Transporter | null; user?: string } {
  const { user, pass } = getSmtpCredentials();

  if (!user || !pass) {
    return { transport: null, user };
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });
  }

  return { transport: transporter, user };
}

/**
 * Sends a 6-digit OTP verification email with MedGlobalNetwork branding
 */
export async function sendOtpEmail(toEmail: string, otpCode: string): Promise<boolean> {
  const { transport, user } = getTransporter();

  if (!transport || !user) {
    console.warn(`[MAIL] SMTP_USER or SMTP_PASS not set. Email not dispatched to ${toEmail}. OTP was: ${otpCode}`);
    return false;
  }

  const mailOptions = {
    from: `"MedGlobalNetwork" <${user}>`,
    to: toEmail,
    subject: `${otpCode} is your MedGlobalNetwork verification code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="margin-bottom: 24px;">
          <h2 style="color: #0f4c81; margin: 0 0 4px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">MedGlobalNetwork</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Verified Clinical & Healthcare Community</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-bottom: 20px;">
          <p style="font-size: 14px; color: #1e293b; margin: 0 0 12px 0;">Hello,</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.5; margin: 0 0 20px 0;">
            Please use the following 6-digit verification code to complete your registration on MedGlobalNetwork:
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 18px 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #0f4c81; font-family: monospace;">${otpCode}</span>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0;">
            This verification code is valid for <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.
          </p>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} Med Global Network (MGN). All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.info(`[MAIL] Verification code successfully sent to ${toEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error(`[MAIL] Error sending OTP email to ${toEmail}:`, err?.message || err);
    return false;
  }
}

/**
 * Sends a password reset link email with MedGlobalNetwork branding
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetUrl: string,
  userName?: string
): Promise<boolean> {
  const { transport, user } = getTransporter();

  if (!transport || !user) {
    console.warn(`[MAIL] SMTP credentials not configured. Password reset link not dispatched to ${toEmail}. URL was: ${resetUrl}`);
    return false;
  }

  const greeting = userName ? `Hello ${userName},` : "Hello,";

  const mailOptions = {
    from: `"MedGlobalNetwork Security" <${user}>`,
    to: toEmail,
    subject: "Reset your MedGlobalNetwork password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="margin-bottom: 24px; text-align: center;">
          <h2 style="color: #0f4c81; margin: 0 0 4px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">MedGlobalNetwork</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Verified Clinical & Healthcare Community</p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 24px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">Password Reset Request</h3>
          <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">${greeting}</p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
            We received a request to reset the password for your MedGlobalNetwork account. Click the button below to set a new password:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #0f4c81; color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(15, 76, 129, 0.2);">
              Reset My Password
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 0 0 16px 0;">
            If the button above does not work, copy and paste this link into your web browser:
          </p>
          <p style="font-size: 11px; color: #0f4c81; word-break: break-all; background-color: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 0 0 20px 0;">
            <a href="${resetUrl}" style="color: #0f4c81; text-decoration: underline;">${resetUrl}</a>
          </p>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
            <p style="font-size: 12px; color: #991b1b; margin: 0; line-height: 1.4;">
              <strong>Security Notice:</strong> This password reset link expires in <strong>1 hour</strong>. If you did not request this, please ignore this email or change your password immediately.
            </p>
          </div>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} Med Global Network (MGN). All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    console.info(`[MAIL] Password reset email successfully sent to ${toEmail}. MessageId: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.error(`[MAIL] Error sending password reset email to ${toEmail}:`, err?.message || err);
    return false;
  }
}
