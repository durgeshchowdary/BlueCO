import nodemailer from 'nodemailer';
import process from 'node:process';

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error(
      'Email credentials missing. Check EMAIL_USER and EMAIL_PASS in backend .env'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const sendVerificationEmail = async ({
  to,
  name,
  verificationLink,
}) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Out-Play" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your Out-Play account',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Welcome to Out-Play</h2>

        <p>Hello ${name},</p>

        <p>Please verify your email address to activate your account.</p>

        <a
          href="${verificationLink}"
          style="
            display:inline-block;
            margin-top:20px;
            padding:12px 20px;
            background:#059669;
            color:white;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
          "
        >
          Verify Email
        </a>

        <p style="margin-top:24px;">
          If you did not create this account, ignore this email.
        </p>
      </div>
    `,
  });
};