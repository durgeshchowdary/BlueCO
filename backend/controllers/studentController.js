const Student = require('../models/Student');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const getStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [students, total] = await Promise.all([
      Student.find().sort({ joinedAt: -1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(),
    ]);

    res.json(paginatedResponse({ data: students, total, page, limit }));
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const student = new Student(req.body);
    const saved = await student.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const importStudents = async (req, res, next) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) return res.status(400).json({ message: 'No student rows provided' });

    const validRows = rows
      .map((row) => ({
        name: String(row.name || '').trim(),
        age: Number(row.age || 0),
        sport: String(row.sport || '').trim(),
        batch: String(row.batch || '').trim(),
        phone: String(row.phone || '').trim(),
        parentName: String(row.parentName || '').trim(),
        monthlyFee: Number(row.monthlyFee || 0),
        feeStatus: row.feeStatus === 'Paid' ? 'Paid' : 'Pending',
        joinedAt: row.joinedAt ? new Date(row.joinedAt) : new Date(),
      }))
      .filter((row) => row.name && row.age > 0 && row.sport && row.batch && row.phone && row.parentName && row.monthlyFee >= 0);

    if (!validRows.length) return res.status(400).json({ message: 'No valid student rows found' });

    const phones = validRows.map((row) => row.phone);
    const existing = await Student.find({ phone: { $in: phones } }).select('phone').lean();
    const existingPhones = new Set(existing.map((student) => student.phone));
    const seen = new Set();
    const toInsert = validRows.filter((row) => {
      if (existingPhones.has(row.phone) || seen.has(row.phone)) return false;
      seen.add(row.phone);
      return true;
    });

    const inserted = toInsert.length ? await Student.insertMany(toInsert, { ordered: false }) : [];
    res.status(201).json({ inserted: inserted.length, skipped: validRows.length - inserted.length });
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  importStudents,
  updateStudent,
  deleteStudent,
};
