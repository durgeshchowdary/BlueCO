const express = require('express');
const {
  getAttendanceRecords,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.route('/')
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), getAttendanceRecords)
  .post(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), createAttendance);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), getAttendanceById)
  .put(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), updateAttendance)
  .delete(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), deleteAttendance);

module.exports = router;
