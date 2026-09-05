import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { env } from '../config/env';

if (env.SENDGRID_API_KEY) sgMail.setApiKey(env.SENDGRID_API_KEY);

const twilioClient = env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN
  ? twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!env.SENDGRID_API_KEY || env.SENDGRID_API_KEY === 'sg_placeholder') {
    console.log(`[EMAIL][MOCK] To: ${to} | Subject: ${subject}`);
    return { mock: true };
  }
  return sgMail.send({
    to,
    from: env.EMAIL_FROM || 'noreply@wisdomly.com',
    subject,
    html,
  });
}

export async function sendSMS(to: string, body: string) {
  if (!twilioClient) {
    console.log(`[SMS][MOCK] To: ${to} | Body: ${body}`);
    return { mock: true };
  }
  return twilioClient.messages.create({
    body,
    to,
    from: env.TWILIO_PHONE_NUMBER,
  });
}

// Convenience wrappers
export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  return sendEmail(
    email,
    'Reset Your Wisdomly Password',
    `<h2>Hi ${name},</h2><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
  );
}

export async function sendFeeReminder(email: string, name: string, amount: number, dueDate: string) {
  return sendEmail(
    email,
    'Fee Payment Reminder',
    `<h2>Hi ${name},</h2><p>Your fee of ₹${amount} is due on ${dueDate}. Please pay to avoid late fees.</p>`
  );
}

export async function sendHomeworkAlert(email: string, name: string, title: string, dueDate: string) {
  return sendEmail(
    email,
    `New Homework: ${title}`,
    `<h2>Hi ${name},</h2><p>New homework "<strong>${title}</strong>" has been assigned. Due: ${dueDate}.</p>`
  );
}

export async function sendLeaveStatusSMS(phone: string, name: string, status: string) {
  return sendSMS(phone, `Hi ${name}, your leave request has been ${status}. - Wisdomly`);
}
