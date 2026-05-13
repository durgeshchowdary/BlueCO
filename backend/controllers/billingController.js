import fs from 'node:fs';
import Academy from '../models/Academy.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import { scopedFilter } from '../utils/scope.js';
import { ensureInvoicePdf } from '../services/invoiceService.js';
import {
  handleTrialReminders,
  suspendExpiredTrials,
  generateRenewalInvoices,
} from '../services/billingService.js';

const getBillingOverview = async (req, res, next) => {
  try {
    const academyId = req.user?.academyId || req.query.academyId;
    const academy = academyId
      ? await Academy.findById(academyId).select('name status subscription contactEmail').lean()
      : null;
    const invoiceFilter = scopedFilter(req);
    const [invoices, payments, totals] = await Promise.all([
      Invoice.find(invoiceFilter).sort({ createdAt: -1 }).limit(12).lean(),
      Payment.find({ ...invoiceFilter, plan: { $in: ['pro', 'legend'] } }).sort({ createdAt: -1 }).limit(12).lean(),
      Invoice.aggregate([
        { $match: invoiceFilter },
        { $group: { _id: '$status', total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.json({ academy, invoices, payments, totals });
  } catch (error) {
    next(error);
  }
};

const getInvoices = async (req, res, next) => {
  try {
    const filter = scopedFilter(req);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    const invoices = await Invoice.find(filter).sort({ createdAt: -1 }).lean();
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne(scopedFilter(req, { _id: req.params.id }));
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const pdfPath = await ensureInvoicePdf(invoice);
    if (!fs.existsSync(pdfPath)) return res.status(404).json({ message: 'Invoice PDF not found' });
    res.download(pdfPath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    next(error);
  }
};

const runBillingAutomation = async (req, res, next) => {
  try {
    const [reminders, suspended, invoices] = await Promise.all([
      handleTrialReminders(),
      suspendExpiredTrials(),
      generateRenewalInvoices(),
    ]);
    res.json({ reminders, suspended, invoices: invoices.length });
  } catch (error) {
    next(error);
  }
};

export {
  getBillingOverview,
  getInvoices,
  downloadInvoice,
  runBillingAutomation,
};
