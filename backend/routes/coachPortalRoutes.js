const express = require('express');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const { authenticateUser, requireCoach, requireAcademyScope, requirePermission, audit } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.use(authenticateUser, requireCoach(), requireAcademyScope);

router.get('/dashboard', async (req, res, next) => {
  try {
    const [assignedPlayers, assignedBatches, todaySessions, announcements] = await Promise.all([
      Student.countDocuments({ academyId: req.user.academyId, _id: { $in: req.user.assignedStudents || [] } }),
      Batch.countDocuments({ academyId: req.user.academyId, _id: { $in: req.user.assignedBatches || [] } }),
      Event.countDocuments({ academyId: req.user.academyId, date: { $gte: new Date() } }),
      Announcement.find({ academyId: req.user.academyId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    res.json({ assignedPlayers, assignedBatches, todaySessions, announcements });
  } catch (error) {
    next(error);
  }
});

router.get('/students', requirePermission(PERMISSIONS.STUDENTS_READ), async (req, res, next) => {
  try {
    res.json(await Student.find({ academyId: req.user.academyId, _id: { $in: req.user.assignedStudents || [] } }).sort({ name: 1 }).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/batches', requirePermission(PERMISSIONS.BATCHES_READ), async (req, res, next) => {
  try {
    res.json(await Batch.find({ academyId: req.user.academyId, _id: { $in: req.user.assignedBatches || [] } }).sort({ name: 1 }).lean());
  } catch (error) {
    next(error);
  }
});

router.route('/attendance')
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), async (req, res, next) => {
    try {
      const players = await Student.find({
        academyId: req.user.academyId,
        _id: { $in: req.user.assignedStudents || [] },
      }).select('name').lean();
      res.json(await Attendance.find({
        academyId: req.user.academyId,
        studentName: { $in: players.map((player) => player.name) },
      }).sort({ date: -1 }).limit(100).lean());
    } catch (error) {
      next(error);
    }
  })
  .post(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), audit('attendance_marked', 'Attendance'), async (req, res, next) => {
    try {
      if (req.body.studentId && !(req.user.assignedStudents || []).some((id) => String(id) === String(req.body.studentId))) {
        return res.status(403).json({ message: 'Access Denied' });
      }
      if (req.body.batchId && !(req.user.assignedBatches || []).some((id) => String(id) === String(req.body.batchId))) {
        return res.status(403).json({ message: 'Access Denied' });
      }
      const attendance = await Attendance.create({ ...req.body, academyId: req.user.academyId });
      res.status(201).json(attendance);
    } catch (error) {
      next(error);
    }
  });

router.post('/performance', requirePermission(PERMISSIONS.PERFORMANCE_WRITE), audit('performance_report_created', 'Student'), async (req, res) => {
  if (req.body.studentId && !(req.user.assignedStudents || []).some((id) => String(id) === String(req.body.studentId))) {
    return res.status(403).json({ message: 'Access Denied' });
  }
  res.status(201).json({
    message: 'Performance report captured',
    coachId: req.user._id,
    academyId: req.user.academyId,
    report: req.body,
  });
});

router.get('/reports', requirePermission(PERMISSIONS.REPORTS_READ), async (req, res) => {
  res.json({ reports: [], message: 'Coach reports are scoped to assigned students only.' });
});

router.get('/events', requirePermission(PERMISSIONS.EVENTS_READ), async (req, res, next) => {
  try {
    res.json(await Event.find({ academyId: req.user.academyId, date: { $gte: new Date() } }).sort({ date: 1 }).lean());
  } catch (error) {
    next(error);
  }
});

router.get('/announcements', requirePermission(PERMISSIONS.ANNOUNCEMENTS_READ), async (req, res, next) => {
  try {
    res.json(await Announcement.find({ academyId: req.user.academyId }).sort({ createdAt: -1 }).lean());
  } catch (error) {
    next(error);
  }
});

module.exports = router;
