import express from 'express';
import {
  getAttendanceRecords,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();
router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), getAttendanceRecords)
  .post(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), createAttendance);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.ATTENDANCE_READ), getAttendanceById)
  .put(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), updateAttendance)
  .delete(requirePermission(PERMISSIONS.ATTENDANCE_WRITE), deleteAttendance);

export default router;
