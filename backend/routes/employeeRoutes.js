const express = require('express');
const Task = require('../models/Task');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const Student = require('../models/Student');
const { authenticateUser, requireEmployee, requireAcademyScope, requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.use(authenticateUser, requireEmployee(), requireAcademyScope);

router.get('/dashboard', async (req, res, next) => {
  try {
    const tasks = await Task.find({ academyId: req.user.academyId, assignedTo: req.user._id }).sort({ dueAt: 1 }).lean();
    res.json({
      employeeType: req.user.employeeType,
      permissions: req.user.permissions || [],
      openTasks: tasks.filter((task) => task.status !== 'done').length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', requirePermission(PERMISSIONS.TASKS_READ), async (req, res, next) => {
  try {
    res.json(await Task.find({ academyId: req.user.academyId, assignedTo: req.user._id }).sort({ dueAt: 1 }).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/profile', requirePermission(PERMISSIONS.PROFILE_READ), (req, res) => {
  res.json({ user: req.user });
});

router.get('/schedule', requirePermission(PERMISSIONS.SCHEDULE_READ), async (req, res) => {
  res.json({ shifts: [], message: 'Schedule is tenant scoped and visible only to the signed-in employee.' });
});

router.get('/payments', requirePermission(PERMISSIONS.PAYMENTS_READ), async (req, res, next) => {
  try {
    res.json(await Payment.find({ academyId: req.user.academyId }).sort({ paidAt: -1 }).limit(100).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/tickets', requirePermission(PERMISSIONS.TICKETS_READ), async (req, res, next) => {
  try {
    res.json(await Ticket.find({ academyId: req.user.academyId }).sort({ createdAt: -1 }).limit(100).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/admissions', requirePermission(PERMISSIONS.ADMISSIONS_READ), async (req, res, next) => {
  try {
    res.json(await Student.find({ academyId: req.user.academyId }).sort({ joinedAt: -1 }).limit(100).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/reports', requirePermission(PERMISSIONS.REPORTS_READ), async (req, res) => {
  res.json({ reports: [], message: 'Analyst reports are academy scoped.' });
});

module.exports = router;
