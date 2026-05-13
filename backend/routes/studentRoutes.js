import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  importStudents,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { requirePermission } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = express.Router();
router.route('/') // Use .js extension for local imports
  .get(requirePermission(PERMISSIONS.STUDENTS_READ), getStudents)
  .post(requirePermission(PERMISSIONS.STUDENTS_WRITE), createStudent);
router.post('/import', requirePermission(PERMISSIONS.STUDENTS_WRITE), importStudents);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.STUDENTS_READ), getStudentById)
  .put(requirePermission(PERMISSIONS.STUDENTS_WRITE), updateStudent)
  .delete(requirePermission(PERMISSIONS.STUDENTS_DELETE), deleteStudent);

export default router;
