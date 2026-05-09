const Batch = require('../models/Batch');

const getBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find().sort({ name: 1 }).lean();
    res.json(batches);
  } catch (error) {
    next(error);
  }
};

const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id).lean();
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    next(error);
  }
};

const createBatch = async (req, res, next) => {
  try {
    const batch = new Batch(req.body);
    const saved = await batch.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const updateBatch = async (req, res, next) => {
  try {
    const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Batch not found' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const deleteBatch = async (req, res, next) => {
  try {
    const deleted = await Batch.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Batch removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
};
