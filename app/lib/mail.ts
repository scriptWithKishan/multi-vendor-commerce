import nodemailer from "nodemailer";

const host = process.env.ZOHO_HOST || "smtp.zoho.in";
const port = Number(process.env.ZOHO_PORT) || 465;
const secure = port === 465;

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: process.env.ZOHO_EMAIL || "",
    pass: process.env.ZOHO_PASSWORD || "",
  },
});

export async function sendOtpEmail(to: string, otp: string, shopName: string) {
  const mailOptions = {
    from: `"Multi-Vendor Marketplace" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject: `Vendor Registration OTP - ${shopName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #111827; margin: 0; font-size: 22px; font-weight: 700;">Vendor Registration Verification</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 6px;">Multi-Vendor Commerce Marketplace</p>
        </div>

        <p style="color: #374151; font-size: 15px; line-height: 1.5;">Hello,</p>
        <p style="color: #374151; font-size: 15px; line-height: 1.5;">
          You requested to register <strong>${shopName}</strong> as a seller. Please enter the following 6-digit One-Time Password (OTP) to complete your verification:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563eb; background-color: #eff6ff; padding: 12px 28px; border-radius: 10px; display: inline-block; border: 1px solid #bfdbfe;">
            ${otp}
          </span>
        </div>

        <p style="color: #6b7280; font-size: 13px; text-align: center;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
        
        <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">If you did not request vendor registration, you can safely ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
