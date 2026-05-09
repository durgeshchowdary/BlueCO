const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  importStudents,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();
router.route('/')
  .get(requirePermission(PERMISSIONS.STUDENTS_READ), getStudents)
  .post(requirePermission(PERMISSIONS.STUDENTS_WRITE), createStudent);
router.post('/import', requirePermission(PERMISSIONS.STUDENTS_WRITE), importStudents);
router.route('/:id')
  .get(requirePermission(PERMISSIONS.STUDENTS_READ), getStudentById)
  .put(requirePermission(PERMISSIONS.STUDENTS_WRITE), updateStudent)
  .delete(requirePermission(PERMISSIONS.STUDENTS_DELETE), deleteStudent);

module.exports = router;
