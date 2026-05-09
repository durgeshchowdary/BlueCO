const Payment = require('../models/Payment');
const { getPagination, paginatedResponse } = require('../utils/pagination');
const { scopedFilter, scopedPayload } = require('../utils/scope');

const getPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [payments, total] = await Promise.all([
      Payment.find(scopedFilter(req)).sort({ paidAt: -1 }).skip(skip).limit(limit).lean(),
      Payment.countDocuments(scopedFilter(req)),
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

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  importPayments,
  updatePayment,
  deletePayment,
};
