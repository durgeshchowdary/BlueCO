const express = require('express');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants/roles');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Ticket = require('../models/Ticket');

const router = express.Router();
router.use(authenticateUser, requireRole(ROLES.STUDENT));

const ownNameFilter = (req) => ({
  $or: [
    { studentName: req.user.name },
    { studentEmail: req.user.email },
    { email: req.user.email },
  ],
});

router.get('/dashboard', (req, res) => {
  res.json({
    message: 'Student dashboard',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.effectivePermissions || [],
    },
    allowedActions: [
      'View own profile',
      'View own attendance',
      'View own payments',
      'View events and announcements',
      'Create and view own support tickets',
      'View allowed features',
    ],
    deniedActions: [
      'No admin dashboards',
      'No academy management',
      'No coach or employee portals',
      'No revenue, subscriptions, users, academies, or logs',
    ],
    features: ['profile', 'attendance', 'payments', 'events', 'announcements', 'tickets', 'features'],
  });
});

router.get('/profile', (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

router.get('/attendance', async (req, res, next) => {
  try {
    const attendance = await Attendance.find(ownNameFilter(req)).sort({ date: -1 }).limit(100).lean();
    res.json({
      records: attendance,
      scope: 'own_attendance_only',
      emptyState: 'No attendance has been linked to your account yet.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/payments', async (req, res, next) => {
  try {
    const payments = await Payment.find(ownNameFilter(req)).sort({ paidAt: -1 }).limit(100).lean();
    res.json({
      records: payments,
      scope: 'own_payments_only',
      emptyState: 'No payments have been linked to your account yet.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/events', async (req, res, next) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .select('title sport type date location venue description')
      .sort({ date: 1 })
      .limit(50)
      .lean();
    res.json({ events, scope: 'public_student_events' });
  } catch (error) {
    next(error);
  }
});

router.get('/announcements', async (req, res, next) => {
  try {
    const announcements = await Announcement.find({
      audience: { $in: ['All (Students + Employees)', 'Students', 'All'] },
    }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ announcements, scope: 'student_announcements' });
  } catch (error) {
    next(error);
  }
});

router.route('/tickets')
  .get(async (req, res, next) => {
    try {
      const tickets = await Ticket.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
      res.json({ tickets, scope: 'own_tickets_only' });
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const subject = String(req.body.subject || '').trim();
      const message = String(req.body.message || '').trim();
      if (!subject || !message) return res.status(400).json({ message: 'Subject and message are required' });

      const ticket = await Ticket.create({
        createdBy: req.user._id,
        subject,
        message,
        requester: req.user.name,
        category: req.body.category || 'student_support',
        priority: req.body.priority || 'medium',
      });

      res.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  });

router.get('/features', (req, res) => {
  res.json({
    features: [
      { key: 'profile', label: 'Profile' },
      { key: 'attendance', label: 'Own Attendance' },
      { key: 'payments', label: 'Own Payments' },
      { key: 'events', label: 'Events' },
      { key: 'announcements', label: 'Announcements' },
      { key: 'tickets', label: 'Own Support Tickets' },
      { key: 'dashboard', label: 'Dashboard' },
    ],
  });
});

module.exports = router;
