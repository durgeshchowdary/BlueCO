const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { ROLES } = require('../constants/roles');
const { hashPassword } = require('../utils/auth');
const { authenticateUser, requireRole, requireAcademyScope, requirePermission, audit } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const studentRoutes = require('./studentRoutes');
const coachRoutes = require('./coachRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const batchRoutes = require('./batchRoutes');
const paymentRoutes = require('./paymentRoutes');
const eventRoutes = require('./eventRoutes');
const ticketRoutes = require('./ticketRoutes');
const announcementRoutes = require('./announcementRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();
router.use(authenticateUser, requireRole(ROLES.SUPER_ADMIN, ROLES.ACADEMY_ADMIN), requireAcademyScope);

router.use('/students', studentRoutes);
router.use('/coaches', coachRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/batches', batchRoutes);
router.use('/payments', paymentRoutes);
router.use('/events', eventRoutes);
router.use('/tickets', ticketRoutes);
router.use('/announcements', announcementRoutes);
router.use('/reports', dashboardRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/employees', requirePermission(PERMISSIONS.EMPLOYEES_READ), async (req, res, next) => {
  try {
    const employees = await User.find({
      academyId: req.user.academyId,
      role: { $in: [ROLES.EMPLOYEE, ROLES.COACH] },
    }).select('-passwordHash').sort({ name: 1 }).lean();
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

router.post('/employees', requirePermission(PERMISSIONS.EMPLOYEES_WRITE), audit('user_creation', 'User'), async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body,
      academyId: req.user.academyId,
      role: req.body.role === ROLES.COACH ? ROLES.COACH : ROLES.EMPLOYEE,
      passwordHash: hashPassword(req.body.password || 'PlayGrid@123'),
    });
    const clean = user.toObject();
    delete clean.passwordHash;
    res.status(201).json(clean);
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', requirePermission(PERMISSIONS.TASKS_READ), async (req, res, next) => {
  try {
    res.json(await Task.find({ academyId: req.user.academyId }).sort({ createdAt: -1 }).lean());
  } catch (error) {
    next(error);
  }
});

module.exports = router;
