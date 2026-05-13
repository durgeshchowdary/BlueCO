import Payment from '../models/Payment.js';
import Academy from '../models/Academy.js';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { getRazorpayClient } from '../config/razorpay.js';
import { getSubscriptionPlan } from '../constants/paymentPlans.js';
import { activateSubscription, handleFailedPayment, verifyRazorpayWebhook } from '../services/billingService.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';
import { scopedFilter, scopedPayload } from '../utils/scope.js';
import logger from '../services/logger.js';
import observability from '../services/observabilityService.js';

const resolveAcademyId = (req) => req.user?.academyId || req.body?.academyId;

const validateAcademyId = (academyId) => mongoose.Types.ObjectId.isValid(String(academyId || ''));

const paymentListFilter = (req) => {
  const base = scopedFilter(req);
  if (req.query?.type === 'subscription') return { ...base, plan: { $in: ['pro', 'legend'] } };
  return {
    ...base,
    $or: [{ plan: null }, { plan: { $exists: false } }],
  };
};

const getPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = paymentListFilter(req);
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ paidAt: -1 }).skip(skip).limit(limit).lean(),
      Payment.countDocuments(filter),
    ]);

    res.json(paginatedResponse({ data: payments, total, page, limit }));
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne(scopedFilter(req, { _id: req.params.id })).lean();
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = new Payment(scopedPayload(req, req.body));
    const saved = await payment.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const importPayments = async (req, res, next) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) return res.status(400).json({ message: 'No payment rows provided' });

    const validRows = rows
      .map((row) => ({
        studentName: String(row.studentName || '').trim(),
        amount: Number(row.amount || 0),
        status: row.status === 'Pending' ? 'Pending' : 'Paid',
        month: String(row.month || '').trim(),
        paidAt: row.paidAt ? new Date(row.paidAt) : new Date(),
        academyId: req.user?.academyId,
      }))
      .filter((row) => row.studentName && row.amount > 0 && row.month);

    if (!validRows.length) return res.status(400).json({ message: 'No valid payment rows found' });

    const names = validRows.map((row) => row.studentName);
    const months = validRows.map((row) => row.month);
    const existing = await Payment.find(scopedFilter(req, {
      studentName: { $in: names },
      month: { $in: months },
    })).select('studentName month amount').lean();
    const existingKeys = new Set(existing.map((payment) => `${payment.studentName.toLowerCase()}|${payment.month.toLowerCase()}|${Number(payment.amount)}`));
    const seen = new Set();
    const toInsert = validRows.filter((row) => {
      const key = `${row.studentName.toLowerCase()}|${row.month.toLowerCase()}|${Number(row.amount)}`;
      if (existingKeys.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const inserted = toInsert.length ? await Payment.insertMany(toInsert, { ordered: false }) : [];
    res.status(201).json({ inserted: inserted.length, skipped: validRows.length - inserted.length });
  } catch (error) {
    observability.increment('razorpayFailures', { operation: 'create_order', academyId: String(resolveAcademyId(req) || '') });
    logger.error('razorpay.create_order_failed', { category: 'payments', operation: 'create_order', academyId: String(resolveAcademyId(req) || ''), error });
    next(error);
  }
};

const createRazorpayOrder = async (req, res, next) => {
  try {
    const academyId = resolveAcademyId(req);
    const plan = getSubscriptionPlan(req.body?.plan);

    if (!validateAcademyId(academyId)) {
      return res.status(400).json({ message: 'Valid academyId is required' });
    }

    if (!plan) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }
    if (!plan.checkoutEnabled || !plan.amount) {
      return res.status(400).json({ message: 'This plan requires a custom sales-led checkout' });
    }

    const academy = await Academy.findById(academyId).select('_id name').lean();
    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    const receipt = `pg_${String(academyId).slice(-8)}_${Date.now().toString(36)}`;
    const order = await getRazorpayClient().orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt,
      notes: {
        academyId: String(academyId),
        plan: plan.id,
      },
    });

    await Payment.create({
      academyId,
      plan: plan.id,
      amount: plan.amount,
      currency: plan.currency,
      razorpayOrderId: order.id,
      status: 'created',
      paidAt: null,
    });

    res.status(201).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const {
      plan: requestedPlan,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};
    const academyId = resolveAcademyId(req);
    const plan = getSubscriptionPlan(requestedPlan);

    if (!validateAcademyId(academyId)) {
      return res.status(400).json({ message: 'Valid academyId is required' });
    }

    if (!plan || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification payload is incomplete' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      const error = new Error('Razorpay credentials are not configured');
      error.status = 500;
      throw error;
    }

    const payment = await Payment.findOne({
      academyId,
      razorpayOrderId,
      plan: plan.id,
      status: 'created',
    });

    if (!payment) {
      return res.status(404).json({ message: 'Matching payment order not found' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${payment.razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      payment.status = 'failed';
      await payment.save();
      observability.increment('razorpayFailures', { operation: 'verify_payment', reason: 'invalid_signature', academyId: String(academyId) });
      logger.warn('razorpay.verify_failed', { category: 'payments', operation: 'verify_payment', reason: 'invalid_signature', academyId: String(academyId) });
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const paidAt = new Date();

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'paid';
    payment.paidAt = paidAt;
    await payment.save();

    const { academy, invoice } = await activateSubscription({
      academyId,
      planId: plan.id,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId,
      paymentObjectId: payment._id,
    });

    res.json({
      success: true,
      message: 'Payment verified and subscription activated',
      academy,
      payment: {
        id: payment._id,
        status: payment.status,
        paidAt: payment.paidAt,
      },
      invoice,
    });
  } catch (error) {
    observability.increment('razorpayFailures', { operation: 'verify_payment', academyId: String(resolveAcademyId(req) || '') });
    logger.error('razorpay.verify_exception', { category: 'payments', operation: 'verify_payment', academyId: String(resolveAcademyId(req) || ''), error });
    next(error);
  }
};

const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body || {});
    if (!verifyRazorpayWebhook(rawBody, signature)) {
      observability.increment('razorpayFailures', { operation: 'webhook', reason: 'invalid_signature' });
      logger.warn('razorpay.webhook_invalid_signature', { category: 'payments', operation: 'webhook' });
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const payload = Buffer.isBuffer(req.body) ? JSON.parse(rawBody) : req.body;
    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (event === 'payment.failed' && orderId) {
      observability.increment('razorpayFailures', { operation: 'webhook', reason: 'payment_failed' });
      logger.warn('razorpay.payment_failed', { category: 'payments', operation: 'webhook', razorpayOrderId: orderId, razorpayPaymentId: paymentEntity?.id });
      await handleFailedPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentEntity?.id,
      });
    }

    if (event === 'payment.captured' && orderId) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { $set: { status: 'paid', razorpayPaymentId: paymentEntity?.id, paidAt: new Date() } },
      );
    }

    res.json({ received: true });
  } catch (error) {
    observability.increment('razorpayFailures', { operation: 'webhook', reason: 'exception' });
    logger.error('razorpay.webhook_exception', { category: 'payments', operation: 'webhook', error });
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const updated = await Payment.findOneAndUpdate(scopedFilter(req, { _id: req.params.id }), scopedPayload(req, req.body), {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Payment not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const deleted = await Payment.findOneAndDelete(scopedFilter(req, { _id: req.params.id }));
    if (!deleted) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment removed' });
  } catch (error) {
    next(error);
  }
};

export {
  getPayments,
  getPaymentById,
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  importPayments,
  updatePayment,
  deletePayment,
};
