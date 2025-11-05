import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (userEmail, resetToken) => {
  const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

  await resend.emails.send({
   from: 'Acme <onboarding@resend.dev>',
    to: userEmail,
    subject: 'Reset Your Password',
    html: `
      <p>Hi! You requested a password reset.</p>
      <p>Click <a href="${resetURL}">here</a> to reset your password.</p>
      <p>If you didn’t request this, please ignore this email.</p>
    `,
  });
};
