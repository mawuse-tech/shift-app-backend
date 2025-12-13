import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email to notify a worker about a new shift assignment
 *  {string} userEmail - The worker's email address
 * {string} workerName - The worker's first name (optional, for personalization)
 */
export const sendShiftEmail = async (userEmail, workerName) => {
  // const dashboardURL = `http://localhost:5173/workersDash`; 
  const dashboardURL = new URL( "/workersDash", process.env.LIVE_FRONTEND_URL).toString();

  await resend.emails.send({
    from: 'Shift Scheduler <onboarding@resend.dev>',
    to: userEmail,
    subject: 'You Have a New Shift Assignment',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Hello ${workerName || ''},</h2>
        <p>You have been assigned a new shift.</p>
        <p>Click below to view your updated schedule:</p>
        <a href="${dashboardURL}" 
           style="display:inline-block; background-color:#ff7f00; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
          View My Shift
        </a>
        <p>If you have any questions, please reach out to your team lead.</p>
        <hr />
        <small>This is an automated message from the Shift Management System.</small>
      </div>
    `,
  });
};
