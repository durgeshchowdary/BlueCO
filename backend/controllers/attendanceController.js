const Attendance = require('../models/Attendance');
const { scopedFilter, scopedPayload } = require('../utils/scope');

const getAttendanceRecords = async (req, res, next) => {
  try {
    const records = await Attendance.find(scopedFilter(req)).sort({ date: -1 }).lean();
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findOne(scopedFilter(req, { _id: req.params.id })).lean();
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(record);
  } catch (error) {
    next(error);
  }
};

const createAttendance = async (req, res, next) => {
  try {
    const attendance = new Attendance(scopedPayload(req, req.body));
    const saved = await attendance.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const updated = await Attendance.findOneAndUpdate(scopedFilter(req, { _id: req.params.id }), scopedPayload(req, req.body), {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Attendance record not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const deleted = await Attendance.findOneAndDelete(scopedFilter(req, { _id: req.params.id }));
    if (!deleted) return res.status(404).json({ message: 'Attendance record not found' });
    res.json({ message: 'Attendance record removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendanceRecords,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
