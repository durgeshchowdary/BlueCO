const express = require('express');
const Academy = require('../models/Academy');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const FeaturePermission = require('../models/FeaturePermission');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const { hashPassword } = require('../utils/auth');
const { authenticateUser, requireSuperAdmin, requirePermission, audit } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.use(authenticateUser, requireSuperAdmin());

router.get('/dashboard', requirePermission(PERMISSIONS.PLATFORM_MANAGE), async (req, res, next) => {
  try {
    const [totalAcademies, activeSubscriptions, totalUsers, revenueAgg, recentLogs] = await Promise.all([
      Academy.countDocuments(),
      Subscription.countDocuments({ status: { $in: ['active', 'trial'] } }),
      User.countDocuments(),
      Subscription.aggregate([{ $group: { _id: null, total: { $sum: '$monthlyAmount' } } }]),
      AuditLog.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    res.json({
      totalAcademies,
      activeSubscriptions,
      totalUsers,
      totalRevenue: revenueAgg[0]?.total || 0,
      systemHealth: 'operational',
      aiInsights: [
        'Academy utilization is trending upward across active tenants.',
        'Payment follow-up automation can reduce pending fee exposure.',
      ],
      growth: [
        { month: 'Jan', academies: Math.max(totalAcademies - 4, 0) },
        { month: 'Feb', academies: Math.max(totalAcademies - 3, 0) },
        { month: 'Mar', academies: Math.max(totalAcademies - 2, 0) },
        { month: 'Apr', academies: Math.max(totalAcademies - 1, 0) },
        { month: 'May', academies: totalAcademies },
      ],
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
});

router.route('/academies')
  .get(requirePermission(PERMISSIONS.ACADEMIES_READ), async (req, res, next) => {
    try {
      res.json(await Academy.find().sort({ createdAt: -1 }).lean());
    } catch (error) {
      next(error);
    }
  })
  .post(requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('academy_creation', 'Academy'), async (req, res, next) => {
    try {
      const academy = await Academy.create(req.body);
      await Subscription.create({ academyId: academy._id, plan: 'trial', status: 'trial' });
      res.status(201).json(academy);
    } catch (error) {
      next(error);
    }
  });

router.put('/academies/:id', requirePermission(PERMISSIONS.ACADEMIES_WRITE), audit('academy_update', 'Academy'), async (req, res, next) => {
  try {
    const academy = await Academy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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

router.get('/users', requirePermission(PERMISSIONS.USERS_READ), async (req, res, next) => {
  try {
    res.json(await User.find().select('-passwordHash').sort({ createdAt: -1 }).lean());
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
    const user = await User.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', requirePermission(PERMISSIONS.USERS_WRITE), audit('user_deletion', 'User'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated', user });
  } catch (error) {
    next(error);
  }
});

router.get('/revenue', requirePermission(PERMISSIONS.REVENUE_READ), async (req, res, next) => {
  try {
    const [subscriptions, paymentRevenue] = await Promise.all([
      Subscription.find().populate('academyId', 'name status').sort({ monthlyAmount: -1 }).lean(),
      Payment.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: '$academyId', total: { $sum: '$amount' } } }]),
    ]);
    res.json({ subscriptions, academyPayments: paymentRevenue });
  } catch (error) {
    next(error);
  }
});

router.get('/subscriptions', requirePermission(PERMISSIONS.SUBSCRIPTIONS_READ), async (req, res, next) => {
  try {
    res.json(await Subscription.find().populate('academyId', 'name slug status').sort({ createdAt: -1 }).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/logs', requirePermission(PERMISSIONS.LOGS_READ), async (req, res, next) => {
  try {
    res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(200).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/features', requirePermission(PERMISSIONS.FEATURES_WRITE), async (req, res, next) => {
  try {
    res.json(await FeaturePermission.find().sort({ key: 1 }).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/settings', requirePermission(PERMISSIONS.SETTINGS_WRITE), (req, res) => {
  res.json({ platformName: 'PlayGrid AI', strictTenantIsolation: true, supportImpersonation: true });
});

router.get('/academy/:academyId/overview', requirePermission(PERMISSIONS.ACADEMIES_READ), async (req, res, next) => {
  try {
    const academyId = req.params.academyId;
    const [students, users] = await Promise.all([
      Student.countDocuments({ academyId }),
      User.countDocuments({ academyId }),
    ]);
    res.json({ academyId, students, users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
