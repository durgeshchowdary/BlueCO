const brand = {
  name: 'Outplay',
  primary: '#0891b2',
  text: '#0f172a',
  muted: '#64748b',
};

const layout = ({ title, body, ctaLabel, ctaUrl }) => `
  <div style="margin:0;background:#f8fafc;padding:32px;font-family:Inter,Arial,sans-serif;color:${brand.text}">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden">
      <div style="padding:28px 32px;background:${brand.primary};color:#fff">
        <div style="font-size:13px;font-weight:800;letter-spacing:.18em;text-transform:uppercase">Outplay</div>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15">${title}</h1>
      </div>
      <div style="padding:30px 32px;font-size:15px;line-height:1.7;color:${brand.text}">
        ${body}
        ${ctaLabel && ctaUrl ? `<p style="margin-top:28px"><a href="${ctaUrl}" style="display:inline-block;background:${brand.primary};color:white;text-decoration:none;border-radius:12px;padding:12px 18px;font-weight:800">${ctaLabel}</a></p>` : ''}
      </div>
      <div style="padding:18px 32px;border-top:1px solid #e2e8f0;color:${brand.muted};font-size:12px">
        PlayGrid AI operations platform for modern sports academies.
      </div>
    </div>
  </div>
`;

const templates = {
  welcome: ({ name = 'there' }) => ({
    subject: 'Welcome to Outplay',
    html: layout({
      title: 'Your academy operating system is ready',
      body: `<p>Hi ${name},</p><p>Your Outplay workspace is ready to run academy operations, billing, attendance, payroll, and AI insights from one place.</p>`,
      ctaLabel: 'Open dashboard',
      ctaUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/academy/dashboard`,
    }),
  }),
  trialReminder: ({ academyName, daysLeft }) => ({
    subject: `Your Outplay trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    html: layout({
      title: 'Trial ending soon',
      body: `<p>${academyName || 'Your academy'} has ${daysLeft} day${daysLeft === 1 ? '' : 's'} left in the free trial.</p><p>Upgrade to Pro to keep automations, analytics, payroll, and billing active.</p>`,
      ctaLabel: 'Upgrade to Pro',
      ctaUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/academy/subscription`,
    }),
  }),
  invoice: ({ invoiceNumber, total }) => ({
    subject: `Invoice ${invoiceNumber} from Outplay`,
    html: layout({
      title: 'Your invoice is ready',
      body: `<p>Invoice <strong>${invoiceNumber}</strong> has been generated.</p><p>Total due: <strong>Rs ${Number(total || 0).toLocaleString('en-IN')}</strong>.</p>`,
      ctaLabel: 'View billing',
      ctaUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/academy/billing`,
    }),
  }),
  failedPayment: ({ academyName }) => ({
    subject: 'Payment failed for your Outplay subscription',
    html: layout({
      title: 'Payment needs attention',
      body: `<p>We could not complete the latest subscription payment for ${academyName || 'your academy'}.</p><p>Please retry payment to avoid service interruption.</p>`,
      ctaLabel: 'Retry payment',
      ctaUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/academy/subscription`,
    }),
  }),
};

const renderEmailTemplate = (template, data = {}) => {
  const renderer = templates[template];
  if (!renderer) throw new Error(`Unknown email template: ${template}`);
  return renderer(data);
};

export { renderEmailTemplate };
