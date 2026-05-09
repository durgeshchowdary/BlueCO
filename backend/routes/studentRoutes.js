const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  importStudents,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const router = express.Router();
router.route('/').get(getStudents).post(createStudent);
router.post('/import', importStudents);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);

module.exports = router;
