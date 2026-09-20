import nodemailer from 'nodemailer';

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!transporter) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    console.log(`[Email] Body: ${html.substring(0, 200)}...`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'StayScape <noreply@stayscape.com>',
    to,
    subject,
    html,
  });
}

export function bookingConfirmationEmail(guestName: string, propertyTitle: string, checkIn: string, checkOut: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e11d48;">Booking Confirmed! 🎉</h1>
      <p>Hi ${guestName},</p>
      <p>Your booking at <strong>${propertyTitle}</strong> has been confirmed.</p>
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Check-in:</strong> ${checkIn}</p>
        <p><strong>Check-out:</strong> ${checkOut}</p>
      </div>
      <p>You can view your reservation details in your dashboard.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/guest/trips" style="background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Reservation</a>
      <p style="color: #6b7280; margin-top: 24px;">Best regards,<br>The StayScape Team</p>
    </div>
  `;
}

export function bookingCancellationEmail(name: string, propertyTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e11d48;">Booking Cancelled</h1>
      <p>Hi ${name},</p>
      <p>Your booking at <strong>${propertyTitle}</strong> has been cancelled.</p>
      <p>If you have any questions about the refund, please contact our support team.</p>
      <p style="color: #6b7280; margin-top: 24px;">Best regards,<br>The StayScape Team</p>
    </div>
  `;
}

export function welcomeEmail(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #e11d48;">Welcome to StayScape! 🏠</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining StayScape. We're excited to have you!</p>
      <p>Start exploring unique stays around the world, or become a host and share your space.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Explore StayScape</a>
      <p style="color: #6b7280; margin-top: 24px;">Best regards,<br>The StayScape Team</p>
    </div>
  `;
}
