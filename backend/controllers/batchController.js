const Batch = require('../models/Batch');
const { coachBatchFilter, scopedFilter, scopedPayload } = require('../utils/scope');

const getBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find(coachBatchFilter(req)).sort({ name: 1 }).lean();
    res.json(batches);
  } catch (error) {
    next(error);
  }
};

const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findOne(coachBatchFilter(req, { _id: req.params.id })).lean();
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    next(error);
  }
};

const createBatch = async (req, res, next) => {
  try {
    const batch = new Batch(scopedPayload(req, req.body));
    const saved = await batch.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

const updateBatch = async (req, res, next) => {
  try {
    const updated = await Batch.findOneAndUpdate(scopedFilter(req, { _id: req.params.id }), scopedPayload(req, req.body), {
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
    const deleted = await Batch.findOneAndDelete(scopedFilter(req, { _id: req.params.id }));
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
