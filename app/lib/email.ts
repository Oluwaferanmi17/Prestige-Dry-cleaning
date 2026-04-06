// lib/email.ts
// ─── Email service using Resend ───────────────────────────────────────────────
// Install: npm install resend
// Docs: https://resend.com/docs

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = "Prestige Dry Cleaning <no-reply@prestigeclean.co.uk>";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WelcomeEmailProps {
  to: string;
  firstName: string;
  verifyUrl: string;
}

interface PasswordResetProps {
  to: string;
  firstName: string;
  resetUrl: string;
}

interface OrderConfirmedProps {
  to: string;
  firstName: string;
  orderNumber: string;
  service: string;
  pickupDate: string;
  pickupSlot: string;
  pickupAddress: string;
}

interface OrderStatusProps {
  to: string;
  firstName: string;
  orderNumber: string;
  status: string;
  message: string;
  ctaUrl?: string;
}

// ─── Shared HTML wrapper ──────────────────────────────────────────────────────

function wrap(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { background: #1A1712; margin: 0; padding: 0; font-family: 'Georgia', serif; color: #F5F0E8; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 48px 24px; }
    .logo { font-size: 24px; font-weight: 400; color: #F5F0E8; letter-spacing: 0.02em; margin-bottom: 4px; }
    .logo-sub { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #C9A84C; margin-bottom: 40px; }
    .divider { height: 1px; background: rgba(201,168,76,0.18); margin: 32px 0; }
    h2 { font-size: 28px; font-weight: 300; color: #F5F0E8; line-height: 1.15; margin: 0 0 16px; }
    h2 em { font-style: italic; color: #E8C97A; }
    p { font-size: 15px; color: #8C8070; line-height: 1.75; margin: 0 0 16px; font-family: sans-serif; font-weight: 300; }
    .btn { display: inline-block; background: #C9A84C; color: #1A1712 !important; padding: 14px 32px; font-family: sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; margin: 8px 0 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(201,168,76,0.1); font-family: sans-serif; }
    .detail-label { font-size: 12px; color: #8C8070; font-weight: 300; }
    .detail-val { font-size: 13px; color: #F5F0E8; font-weight: 400; }
    .footer { font-size: 11px; color: #4A4238; font-family: sans-serif; font-weight: 300; margin-top: 40px; line-height: 1.7; }
    .order-num { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #C9A84C; margin-bottom: 8px; font-family: sans-serif; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">Prestige</div>
    <div class="logo-sub">Dry Cleaning</div>
    ${content}
    <div class="footer">
      © ${new Date().getFullYear()} Prestige Dry Cleaning Ltd. · London, UK<br>
      You're receiving this because you have an account with us.
      <a href="{{unsubscribe}}" style="color: #4A4238;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── 1. Welcome / verify email ────────────────────────────────────────────────

export async function sendWelcomeEmail({
  to,
  firstName,
  verifyUrl,
}: WelcomeEmailProps) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Prestige — please verify your email",
    html: wrap(`
      <h2>Welcome,<br><em>${firstName}.</em></h2>
      <p>Thank you for joining Prestige Dry Cleaning. You're one step away from getting started — please verify your email address.</p>
      <a href="${verifyUrl}" class="btn">Verify Email Address →</a>
      <p style="font-size:13px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
}

// ─── 2. Password reset ────────────────────────────────────────────────────────

export async function sendPasswordResetEmail({
  to,
  firstName,
  resetUrl,
}: PasswordResetProps) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your Prestige password",
    html: wrap(`
      <h2>Reset your<br><em>password.</em></h2>
      <p>Hi ${firstName}, we received a request to reset your password. Click the button below — this link is valid for 15 minutes.</p>
      <a href="${resetUrl}" class="btn">Reset Password →</a>
      <div class="divider"></div>
      <p style="font-size:13px;">If you didn't request this, please ignore this email. Your password will not be changed.</p>
    `),
  });
}

// ─── 3. Order confirmed ───────────────────────────────────────────────────────

export async function sendOrderConfirmedEmail({
  to,
  firstName,
  orderNumber,
  service,
  pickupDate,
  pickupSlot,
  pickupAddress,
}: OrderConfirmedProps) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://prestigeclean.co.uk";

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Order ${orderNumber} confirmed — we'll collect soon`,
    html: wrap(`
      <div class="order-num">${orderNumber}</div>
      <h2>Booking<br><em>confirmed.</em></h2>
      <p>Hi ${firstName}, your collection is booked. Here's a summary:</p>
      <div style="border:1px solid rgba(201,168,76,0.18); padding: 20px; margin: 24px 0;">
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-val">${service}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Date</span>
          <span class="detail-val">${pickupDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Pickup Window</span>
          <span class="detail-val">${pickupSlot}</span>
        </div>
        <div class="detail-row" style="border:none;">
          <span class="detail-label">Collection Address</span>
          <span class="detail-val" style="text-align:right;max-width:60%;">${pickupAddress}</span>
        </div>
      </div>
      <a href="${appUrl}/dashboard" class="btn">Track Your Order →</a>
      <p style="font-size:13px;">Our driver will arrive during your chosen window. Please ensure garments are ready for collection.</p>
    `),
  });
}

// ─── 4. Order status update ───────────────────────────────────────────────────

export async function sendOrderStatusEmail({
  to,
  firstName,
  orderNumber,
  status,
  message,
  ctaUrl,
}: OrderStatusProps) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://prestigeclean.co.uk";

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Order ${orderNumber} — ${status}`,
    html: wrap(`
      <div class="order-num">${orderNumber}</div>
      <h2>Your order<br><em>${status.toLowerCase()}.</em></h2>
      <p>Hi ${firstName}, ${message}</p>
      <a href="${ctaUrl ?? `${appUrl}/dashboard`}" class="btn">View Order →</a>
    `),
  });
}
