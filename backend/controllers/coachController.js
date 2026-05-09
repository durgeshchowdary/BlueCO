const Coach = require('../models/Coach');
const { getPagination, paginatedResponse } = require('../utils/pagination');

const getCoaches = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [coaches, total] = await Promise.all([
      Coach.find().sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Coach.countDocuments(),
    ]);

    res.json(paginatedResponse({ data: coaches, total, page, limit }));
  } catch (error) {
    next(error);
  }
};

const getCoachById = async (req, res, next) => {
  try {
    const coach = await Coach.findById(req.params.id).lean();
    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    res.json(coach);
  } catch (error) {
    next(error);
  }
};

const createCoach = async (req, res, next) => {
  try {
    const coach = new Coach(req.body);
    const saved = await coach.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const importCoaches = async (req, res, next) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) return res.status(400).json({ message: 'No employee rows provided' });

    const validRows = rows
      .map((row) => ({
        name: String(row.name || '').trim(),
        sport: String(row.sport || '').trim(),
        phone: String(row.phone || '').trim(),
        salary: Number(row.salary || 0),
        status: row.status === 'Inactive' ? 'Inactive' : 'Active',
      }))
      .filter((row) => row.name && row.sport && row.phone && row.salary >= 0);

    if (!validRows.length) return res.status(400).json({ message: 'No valid employee rows found' });

    const phones = validRows.map((row) => row.phone);
    const existing = await Coach.find({ phone: { $in: phones } }).select('phone').lean();
    const existingPhones = new Set(existing.map((coach) => coach.phone));
    const seen = new Set();
    const toInsert = validRows.filter((row) => {
      if (existingPhones.has(row.phone) || seen.has(row.phone)) return false;
      seen.add(row.phone);
      return true;
    });

    const inserted = toInsert.length ? await Coach.insertMany(toInsert, { ordered: false }) : [];
    res.status(201).json({ inserted: inserted.length, skipped: validRows.length - inserted.length });
  } catch (error) {
    next(error);
  }
};

const updateCoach = async (req, res, next) => {
  try {
    const updated = await Coach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Coach not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteCoach = async (req, res, next) => {
  try {
    const deleted = await Coach.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Coach not found' });
    res.json({ message: 'Coach removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoaches,
  getCoachById,
  createCoach,
  importCoaches,
  updateCoach,
  deleteCoach,
};
