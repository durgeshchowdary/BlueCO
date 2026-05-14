import express from 'express';
import FAQ from "../models/FAQ.js";
import Academy from '../models/Academy.js';
import VideoAnalysis from "../models/VideoAnalysis.js";
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import AuditLog from '../models/AuditLog.js';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import Announcement from '../models/Announcement.js';
import {
  authenticateUser,
  requireSuperAdmin,
  requirePermission,
  audit,
} from '../middleware/authMiddleware.js';

import { PERMISSIONS } from '../constants/permissions.js';
import { IntelligencePipeline } from '../IntelligencePipeline.js';
import { IntelligenceAggregator } from '../IntelligenceAggregator.js';
import { hashPassword } from '../utils/auth.js';
import { startTrialForAcademy } from '../services/billingService.js';

const router = express.Router();

router.use(authenticateUser, requireSuperAdmin());

/**
 * @typedef {object} CustomUser
 * @property {string} _id
 * @property {string} academyId
 * @property {string} role
 */

router.get('/dashboard', requirePermission(PERMISSIONS.PLATFORM_MANAGE), async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAcademies,
      activeAcademies,
      trialAcademies,
      deactivatedAcademies,
      activeSubscriptions,
      trialSubscriptions,
      totalUsers,
      totalStudents,
      totalRevenueAgg,
      monthlyRevenueAgg,
      pendingPayments,
      openTickets,
      recentLogs,
      recentAcademies,
      growth,
    ] = await Promise.all([
      Academy.countDocuments(),
      Academy.countDocuments({ status: { $in: ['active', 'Active'] } }),
      Subscription.countDocuments({ status: 'trial' }),
      Academy.countDocuments({ status: { $in: ['deactivated', 'inactive', 'suspended'] } }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: 'trial' }),
      User.countDocuments(),
      Student.countDocuments(),
      Payment.aggregate([
        { $match: { status: { $in: ['Paid', 'paid', 'success'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: { $in: ['Paid', 'paid', 'success'] },
            paidAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ status: { $in: ['Pending', 'pending', 'unpaid'] } }),
      Ticket.countDocuments({ status: { $in: ['open', 'Open', 'pending'] } }),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
      Academy.find().sort({ createdAt: -1 }).limit(6).lean(),
      Academy.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            academies: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    res.json({
      totalAcademies,
      activeAcademies,
      trialAcademies,
      deactivatedAcademies,
      activeSubscriptions,
      trialSubscriptions,
      totalUsers,
      totalStudents,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
      pendingPayments,
      openTickets,
      systemHealth: 'operational',
      growth,
      recentLogs,
      recentAcademies,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.route('/academies')
  .get(requirePermission(PERMISSIONS.ACADEMIES_READ), async (req, res, next) => {
    try {
      const academies = await Academy.find().sort({ createdAt: -1 }).lean();
      res.json(academies);
    } catch (error) {
      next(error);
    }
  })
  .post(requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('academy_creation', 'Academy'), async (req, res, next) => {
    try {
      const academy = await Academy.create(req.body);
      const trialAcademy = await startTrialForAcademy(academy._id);

      await Subscription.create({
        academyId: academy._id,
        plan: 'trial',
        status: 'trial',
        trialStartedAt: trialAcademy.subscription.trialStartedAt,
        trialEndsAt: trialAcademy.subscription.trialEndsAt,
        bufferUntil: trialAcademy.subscription.bufferUntil,
      });

      res.status(201).json(trialAcademy);
    } catch (error) {
      next(error);
    }
  });

router.put('/academies/:id', requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('academy_update', 'Academy'), async (req, res, next) => {
  try {
    const academy = await Academy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    res.json(academy);
  } catch (error) {
    next(error);
  }
});

router.delete('/academies/:id', requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('academy_delete', 'Academy'), async (req, res, next) => {
  try {
    const academy = await Academy.findByIdAndDelete(req.params.id);

    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    res.json({ message: 'Academy removed' });
  } catch (error) {
    next(error);
  }
});

router.get('/trials', requirePermission(PERMISSIONS.SUBSCRIPTIONS_READ), async (req, res, next) => {
  try {
    const trials = await Subscription.find({ status: 'trial' })
      .populate('academyId', 'name slug status createdAt')
      .sort({ trialEndsAt: 1 })
      .lean();

    res.json({ trials });
  } catch (error) {
    next(error);
  }
});

router.get('/deactivated', requirePermission(PERMISSIONS.ACADEMIES_READ), async (req, res, next) => {
  try {
    const academies = await Academy.find({
      status: { $in: ['deactivated', 'inactive', 'suspended'] },
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ academies });
  } catch (error) {
    next(error);
  }
});

router.get('/finance', requirePermission(PERMISSIONS.REVENUE_READ), async (req, res, next) => {
  try {
    const [payments, subscriptions, revenue] = await Promise.all([
      Payment.find().sort({ paidAt: -1, createdAt: -1 }).limit(100).lean(),
      Subscription.find()
        .populate('academyId', 'name slug status')
        .sort({ createdAt: -1 })
        .lean(),
      Payment.aggregate([
        { $match: { status: { $in: ['Paid', 'paid', 'success'] } } },
        { $group: { _id: '$academyId', total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({ payments, subscriptions, revenue });
  } catch (error) {
    next(error);
  }
});

router.get('/platform-tickets', requirePermission(PERMISSIONS.TICKETS_READ), async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

router.get('/users', requirePermission(PERMISSIONS.USERS_READ), async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/users', requirePermission(PERMISSIONS.USERS_WRITE), audit('user_creation', 'User'), async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body,
      passwordHash: hashPassword(req.body.password || 'PlayGrid@123'),
    });

    const clean = user.toObject();
    delete clean.passwordHash;

    res.status(201).json(clean);
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', requirePermission(PERMISSIONS.USERS_WRITE), audit('role_update', 'User'), async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.password) {
      payload.passwordHash = hashPassword(payload.password);
      delete payload.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', requirePermission(PERMISSIONS.USERS_WRITE), audit('user_deletion', 'User'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-passwordHash');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deactivated', user });
  } catch (error) {
    next(error);
  }
});

router.get('/revenue', requirePermission(PERMISSIONS.REVENUE_READ), async (req, res, next) => {
  try {
    const [subscriptions, academyPayments] = await Promise.all([
      Subscription.find()
        .populate('academyId', 'name status')
        .sort({ monthlyAmount: -1 })
        .lean(),
      Payment.aggregate([
        { $match: { status: { $in: ['Paid', 'paid', 'success'] } } },
        { $group: { _id: '$academyId', total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({ subscriptions, academyPayments });
  } catch (error) {
    next(error);
  }
});

router.get('/subscriptions', requirePermission(PERMISSIONS.SUBSCRIPTIONS_READ), async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('academyId', 'name slug status')
      .sort({ createdAt: -1 })
      .lean();

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
});

router.get('/compliance', requirePermission(PERMISSIONS.ACADEMIES_READ), async (req, res, next) => {
  try {
    const status = String(req.query.status || 'all').toLowerCase();
    const search = String(req.query.q || '').trim().toLowerCase();
    const sort = String(req.query.sort || 'updatedAt');

    const [academies, subscriptions] = await Promise.all([
      Academy.find().sort({ updatedAt: -1 }).lean(),
      Subscription.find().select('academyId status plan monthlyAmount').lean(),
    ]);

    const subscriptionByAcademy = new Map(
      subscriptions.map((s) => [String(s.academyId), s])
    );

    const results = academies
      .filter((academy) => {
        if (status !== 'all' && String(academy.status || '').toLowerCase() !== status) {
          return false;
        }

        if (search && !String(academy.name || '').toLowerCase().includes(search)) {
          return false;
        }

        return true;
      })
      .map((academy) => ({
        ...academy,
        subscription: subscriptionByAcademy.get(String(academy._id)) || null,
      }));

    if (sort === 'revenue') {
      results.sort(
        (a, b) =>
          (b.subscription?.monthlyAmount || 0) -
          (a.subscription?.monthlyAmount || 0)
      );
    } else {
      results.sort(
        (a, b) => new Date(b[sort] || 0) - new Date(a[sort] || 0)
      );
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

router.post('/compliance/:academyId/review', requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('dlt_review_start', 'Academy'), async (req, res, next) => {
  try {
    const academy = await Academy.findById(req.params.academyId);

    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    academy.dlt_status = 'under_review';
    academy.dlt_reviewed_at = new Date();
    await academy.save();

    await IntelligencePipeline.handleEvent(
      req.params.academyId,
      'DLT_UNDER_REVIEW',
      {
        reviewerId: String(/** @type {CustomUser} */ (req.user)._id),
        context: 'Manual review started by super-admin',
        sourceSystem: 'super-admin-console',
        schemaVersion: '1.0.0',
      },
      req.headers['x-trace-id']
    );

    res.json({ status: 'under_review', academy });
  } catch (error) {
    next(error);
  }
});

router.post('/compliance/:academyId/approve', requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('dlt_approval', 'Academy'), async (req, res, next) => {
  try {
    const academy = await Academy.findById(req.params.academyId);

    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    if (academy.dlt_status === 'pending') {
      return res.status(400).json({ message: 'Cannot approve without documents' });
    }

    academy.dlt_status = 'approved';
    academy.dlt_approved_at = new Date();
    academy.dlt_approved_by = String(/** @type {CustomUser} */ (req.user)._id);
    await academy.save();

    await IntelligencePipeline.handleEvent(
      req.params.academyId,
      'DLT_APPROVED',
      {
        reviewerId: String(/** @type {CustomUser} */ (req.user)._id),
        notes: req.body.notes,
        schemaVersion: '1.0.0',
        sourceSystem: 'super-admin-console',
      },
      req.headers['x-trace-id']
    );

    res.json({ message: 'Academy DLT approved', status: 'approved' });
  } catch (error) {
    next(error);
  }
});

router.post('/compliance/:academyId/reject', requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('dlt_rejection', 'Academy'), async (req, res, next) => {
  try {
    if (!req.body.reason) {
      return res.status(400).json({ message: 'Rejection reason is mandatory' });
    }

    const academy = await Academy.findByIdAndUpdate(
      req.params.academyId,
      {
        dlt_status: 'rejected',
        dlt_rejected_at: new Date(),
        dlt_rejected_by: String(/** @type {CustomUser} */ (req.user)._id),
        dlt_rejection_reason: req.body.reason,
        dlt_review_notes: req.body.notes,
      },
      { new: true }
    );

    if (!academy) return res.status(404).json({ message: 'Academy not found' });

    await IntelligencePipeline.handleEvent(
      req.params.academyId,
      'DLT_REJECTED',
      {
        reason: req.body.reason,
        reviewerId: String(/** @type {CustomUser} */ (req.user)._id),
        sourceSystem: 'super-admin-console',
        schemaVersion: '1.0.0',
      },
      req.headers['x-trace-id']
    );

    res.json({ message: 'Academy DLT rejected', status: 'rejected' });
  } catch (error) {
    next(error);
  }
});

router.get('/compliance/:academyId/timeline', requirePermission(PERMISSIONS.ACADEMIES_READ), async (req, res, next) => {
  try {
    const timeline = await IntelligenceAggregator.getTimeline(req.params.academyId, 20);
    res.json(timeline);
  } catch (error) {
    next(error);
  }
});

router.get('/observability', (req, res) => {
  return res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    platform: {
      backend: 'online',
      database: 'connected',
      aiOps: 'active',
      relay: 'stable',
    },
    metrics: {
      authFailures: 0,
      uploadFailures: 0,
      rbacDenials: 0,
    },
  });
});

router.get('/delivery-logs', async (req, res) => {
  try {
    const logs = [
      {
        _id: "1",
        channel: "Email",
        recipient: "academy@gmail.com",
        subject: "Welcome Email",
        status: "sent",
        route: "Academy",
        createdAt: new Date(),
      },
      {
        _id: "2",
        channel: "WhatsApp",
        recipient: "+91XXXXXXXXXX",
        subject: "Trial reminder",
        status: "sent",
        route: "Student",
        createdAt: new Date(),
      },
    ];

    res.json({ logs });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message:"Server error"
    });
  }
});
import Prospect from "../models/Prospect.js";

router.get("/crm", async(req,res)=>{

try{

const prospects=
await Prospect.find()
.sort({
createdAt:-1
})
.lean();

res.json({
prospects
});

}
catch(err){

res.status(500).json({
message:"Error loading CRM"
});

}

});

router.post("/crm",async(req,res)=>{

try{

const prospect=
await Prospect.create(
req.body
);

res.status(201).json(
prospect
);

}
catch(err){

res.status(500).json({
message:"Error creating prospect"
});

}

});
router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ announcements });
  } catch (error) {
    next(error);
  }
});

router.post('/announcements', async (req, res, next) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ announcement });
  } catch (error) {
    next(error);
  }
});

router.put('/announcements/:id', async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ announcement });
  } catch (error) {
    next(error);
  }
});
router.get(
"/help-center",
async(req,res)=>{

try{

const faqs=
await FAQ.find()
.sort({
createdAt:-1
});

res.json({
faqs
});

}
catch(err){

res.status(500).json({
message:"Error loading FAQs"
});

}

}
);
router.get(
"/video-analysis",
async(req,res)=>{

try{

const analyses=
await VideoAnalysis.find()
.sort({
createdAt:-1
});

res.json({
analyses
});

}
catch(err){

res.status(500).json({
message:"Error loading analyses"
});

}

}
);

router.post(
"/video-analysis",
async(req,res)=>{

try{

const analysis=
await VideoAnalysis.create({
...req.body,
status:"queued"
});

res.status(201).json(
analysis
);

}
catch(err){

res.status(500).json({
message:"Error creating analysis"
});

}

}
);
export default router;