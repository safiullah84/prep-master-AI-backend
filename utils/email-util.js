// Email utility — placeholder for Nodemailer integration
// Requires SMTP configuration in .env to function

import nodemailer from "nodemailer";

// Create transporter — configure in .env
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("Email not configured: SMTP_HOST, SMTP_USER, SMTP_PASS required in .env");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
};

/**
 * Send a score report email (placeholder — requires SMTP config)
 * @param {string} to - recipient email
 * @param {object} scoreData - { userName, track, correct, total, percentage, timeTaken }
 * @returns {Promise<boolean>}
 */
export const sendScoreReport = async (to, scoreData) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log("Email skipped: SMTP not configured");
    return false;
  }

  const { userName, track, correct, total, percentage, timeTaken } = scoreData;

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #6366f1; font-size: 24px;">🎯 Quiz Results — Night Coding Marathon</h1>
      <p>Hey <strong>${userName}</strong>, here's your score report:</p>
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 16px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748b;">Track</td><td style="padding: 8px 0; font-weight: 600;">${track}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Score</td><td style="padding: 8px 0; font-weight: 600;">${correct}/${total} (${percentage}%)</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b;">Time</td><td style="padding: 8px 0; font-weight: 600;">${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s</td></tr>
        </table>
      </div>
      <p style="color: #64748b; font-size: 14px;">Keep practicing! 🚀</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `Your Quiz Results: ${percentage}% on ${track}`,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return false;
  }
};
