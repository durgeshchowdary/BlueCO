import crypto from 'node:crypto';
import Academy from '../models/Academy.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { getSubscriptionPlan } from '../constants/paymentPlans.js';
import { createInvoice, ensureInvoicePdf } from './invoiceService.js';
import { createNotification, sendTemplatedEmail, sendWhatsAppTemplate } from './notificationService.js';

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const addOneMonth = (date) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
};

const startTrialForAcademy = async (academyId) => {
  const now = new Date();
  const trialEndsAt = addDays(now, 15);
  return Academy.findByIdAndUpdate(
    academyId,
    {
      $set: {
        status: 'trial',
        'subscription.plan': 'trial',
        'subscription.status': 'trial',
        'subscription.trialStartedAt': now,
        'subscription.trialEndsAt': trialEndsAt,
        'subscription.bufferUntil': trialEndsAt,
      },
    },
    { new: true },
  );
};

const activateSubscription = async ({ academyId, planId, razorpayOrderId, razorpayPaymentId, paymentObjectId = null }) => {
  const plan = getSubscriptionPlan(planId);
  if (!plan) throw new Error('Invalid subscription plan');

  const paidAt = new Date();
  const currentPeriodEnd = addOneMonth(paidAt);
  const academy = await Academy.findByIdAndUpdate(
    academyId,
    {
      $set: {
        status: 'active',
        'subscription.plan': plan.id,
        'subscription.status': 'active',
        'subscription.currentPeriodStart': paidAt,
        'subscription.currentPeriodEnd': currentPeriodEnd,
        'subscription.bufferUntil': null,
        'subscription.lastPaymentId': razorpayPaymentId,
        'subscription.lastOrderId': razorpayOrderId,
        'subscription.paidAt': paidAt,
      },
    },
    { new: true, runValidators: true },
  );

  if (!academy) throw new Error('Academy not found');

  const invoice = await createInvoice({
    academy,
    type: 'receipt',
    status: 'paid',
    paymentId: paymentObjectId,
    razorpayPaymentId,
    lineItems: [{
      description: `Outplay ${plan.name} Subscription - Monthly`,
      quantity: 1,
      unitAmount: plan.amount,
      amount: plan.amount,
    }],
    metadata: { plan: plan.id, razorpayOrderId },
  });
  const pdfPath = await ensureInvoicePdf(invoice);

  await createNotification({
    academyId,
    category: 'billing',
    title: 'Subscription activated',
    message: `Outplay ${plan.name} is active until ${currentPeriodEnd.toLocaleDateString('en-IN')}.`,
    actionUrl: '/academy/subscription',
    priority: 'high',
    dedupeKey: `subscription-paid:${razorpayPaymentId}`,
  });

  if (academy.contactEmail) {
    await sendTemplatedEmail({
      academyId,
      to: academy.contactEmail,
      template: 'invoice',
      data: { invoiceNumber: invoice.invoiceNumber, total: invoice.total },
      attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, path: pdfPath }],
      dedupeKey: `receipt-email:${invoice.invoiceNumber}`,
    });
  }

  return { academy, invoice };
};

const handleTrialReminders = async () => {
  const now = new Date();
  const windows = [3, 1];
  const results = [];

  for (const daysLeft of windows) {
    const start = addDays(now, daysLeft);
    start.setHours(0, 0, 0, 0);
    const end = addDays(start, 1);
    const academies = await Academy.find({
      'subscription.status': 'trial',
      'subscription.trialEndsAt': { $gte: start, $lt: end },
    }).lean();

    for (const academy of academies) {
      const dedupeKey = `trial-reminder:${academy._id}:${daysLeft}:${start.toISOString().slice(0, 10)}`;
      await createNotification({
        academyId: academy._id,
        category: 'billing',
        title: `Trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
        message: 'Upgrade to Pro to keep billing, payroll, automation, and AI insights active.',
        actionUrl: '/academy/subscription',
        priority: daysLeft === 1 ? 'critical' : 'high',
        dedupeKey,
      });
      await sendTemplatedEmail({
        academyId: academy._id,
        to: academy.contactEmail,
        template: 'trialReminder',
        data: { academyName: academy.name, daysLeft },
        dedupeKey: `${dedupeKey}:email`,
      });
      results.push({ academyId: academy._id, daysLeft });
    }
  }

  return results;
};

const suspendExpiredTrials = async () => {
  const now = new Date();
  const academies = await Academy.find({
    'subscription.status': 'trial',
    'subscription.bufferUntil': { $lt: now },
  });

  const suspended = [];
  for (const academy of academies) {
    academy.status = 'suspended';
    academy.subscription.status = 'suspended';
    await academy.save();
    await createNotification({
      academyId: academy._id,
      category: 'billing',
      title: 'Trial suspended',
      message: 'Your trial period has ended. Upgrade to Pro to restore full access.',
      actionUrl: '/academy/subscription',
      priority: 'critical',
      dedupeKey: `trial-suspended:${academy._id}`,
    });
    suspended.push(academy._id);
  }

  return suspended;
};

const generateRenewalInvoices = async () => {
  const now = new Date();
  const dueSoon = addDays(now, 3);
  const academies = await Academy.find({
    'subscription.status': 'active',
    'subscription.plan': 'pro',
    'subscription.currentPeriodEnd': { $lte: dueSoon },
  }).lean();

  const invoices = [];
  for (const academy of academies) {
    const exists = await Invoice.findOne({
      academyId: academy._id,
      type: 'subscription',
      status: { $in: ['draft', 'sent'] },
      'metadata.periodEnd': academy.subscription.currentPeriodEnd,
    }).lean();
    if (exists) continue;

    const plan = getSubscriptionPlan('pro');
    const invoice = await createInvoice({
      academy,
      type: 'subscription',
      status: 'sent',
      dueAt: academy.subscription.currentPeriodEnd,
      lineItems: [{
        description: 'Outplay Pro Subscription Renewal',
        quantity: 1,
        unitAmount: plan.amount,
        amount: plan.amount,
      }],
      metadata: { plan: 'pro', periodEnd: academy.subscription.currentPeriodEnd },
    });
    await ensureInvoicePdf(invoice);
    invoices.push(invoice);
  }

  return invoices;
};

const handleFailedPayment = async ({ razorpayOrderId, razorpayPaymentId = '' }) => {
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { $set: { status: 'failed', razorpayPaymentId } },
    { new: true },
  );
  if (!payment) return null;

  const academy = await Academy.findById(payment.academyId).lean();
  if (!academy) return payment;

  await createNotification({
    academyId: academy._id,
    category: 'billing',
    title: 'Payment failed',
    message: 'Your subscription payment failed. Retry payment to keep your workspace active.',
    actionUrl: '/academy/subscription',
    priority: 'critical',
    dedupeKey: `payment-failed:${razorpayOrderId}:${razorpayPaymentId || 'unknown'}`,
  });
  await sendTemplatedEmail({
    academyId: academy._id,
    to: academy.contactEmail,
    template: 'failedPayment',
    data: { academyName: academy.name },
    dedupeKey: `payment-failed-email:${razorpayOrderId}`,
  });

  return payment;
};

const verifyRazorpayWebhook = (rawBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return true;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  const received = String(signature || '');
  return received.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};

export {
  startTrialForAcademy,
  activateSubscription,
  handleTrialReminders,
  suspendExpiredTrials,
  generateRenewalInvoices,
  handleFailedPayment,
  verifyRazorpayWebhook,
};
