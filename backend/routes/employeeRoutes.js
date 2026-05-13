import express from 'express';
import Task from '../models/Task.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import Student from '../models/Student.js';
import { authenticateUser, requireEmployee, requireAcademyScope, requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();
router.use(authenticateUser, requireEmployee(), requireAcademyScope);

/**
 * @typedef {object} CustomUser
 * @property {string} _id
 * @property {string} academyId
 * @property {string} role
 * @property {string} employeeType
 * @property {string[]} permissions
 */

router.get('/dashboard', async (req, res, next) => {
  try {
    const tasks = await Task.find({ academyId: /** @type {CustomUser} */ (req.user).academyId, assignedTo: /** @type {CustomUser} */ (req.user)._id }).sort({ dueAt: 1 }).lean();
    res.json({
      employeeType: /** @type {CustomUser} */ (req.user).employeeType,
      permissions: /** @type {CustomUser} */ (req.user).permissions || [],
      openTasks: tasks.filter((task) => task.status !== 'done').length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', requirePermission(PERMISSIONS.TASKS_READ), async (req, res, next) => {
  try {
    res.json(await Task.find({ academyId: /** @type {CustomUser} */ (req.user).academyId, assignedTo: /** @type {CustomUser} */ (req.user)._id }).sort({ dueAt: 1 }).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/profile', requirePermission(PERMISSIONS.PROFILE_READ), (req, res) => {
  res.json({ user: /** @type {CustomUser} */ (req.user) });
});

router.get('/schedule', requirePermission(PERMISSIONS.SCHEDULE_READ), async (req, res) => {
  res.json({ shifts: [], message: 'Schedule is tenant scoped and visible only to the signed-in employee.' });
});

router.get('/payments', requirePermission(PERMISSIONS.PAYMENTS_READ), async (req, res, next) => {
  try {
    res.json(await Payment.find({ academyId: /** @type {CustomUser} */ (req.user).academyId }).sort({ paidAt: -1 }).limit(100).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/tickets', requirePermission(PERMISSIONS.TICKETS_READ), async (req, res, next) => {
  try {
    res.json(await Ticket.find({ academyId: /** @type {CustomUser} */ (req.user).academyId }).sort({ createdAt: -1 }).limit(100).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/admissions', requirePermission(PERMISSIONS.ADMISSIONS_READ), async (req, res, next) => {
  try {
    res.json(await Student.find({ academyId: /** @type {CustomUser} */ (req.user).academyId }).sort({ joinedAt: -1 }).limit(100).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/reports', requirePermission(PERMISSIONS.REPORTS_READ), async (req, res) => {
  res.json({ reports: [], message: 'Analyst reports are academy scoped.' });
});

export default router;
