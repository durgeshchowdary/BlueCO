import Batch from '../models/Batch.js';
import { coachBatchFilter, scopedFilter, scopedPayload } from '../utils/scope.js';
import { detectBatchConflicts } from '../services/scheduleConflictService.js';
import logger from '../services/logger.js';

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
    const payload = scopedPayload(req, req.body);
    const conflictWarnings = await detectBatchConflicts({ academyId: payload.academyId, batch: payload });
    if (conflictWarnings.length) {
      logger.warn('schedule.conflict_detected', {
        category: 'scheduling',
        academyId: String(payload.academyId || ''),
        conflicts: conflictWarnings.length,
        highestSeverity: conflictWarnings[0]?.severity,
      });
    }
    const batch = new Batch(payload);
    const saved = await batch.save();
    res.status(201).json({ ...saved.toObject(), conflictWarnings });
  } catch (error) {
    next(error);
  }
};

const updateBatch = async (req, res, next) => {
  try {
    const payload = scopedPayload(req, req.body);
    const conflictWarnings = await detectBatchConflicts({ academyId: payload.academyId || req.user?.academyId, batch: payload, excludeBatchId: req.params.id });
    if (conflictWarnings.length) {
      logger.warn('schedule.conflict_detected', {
        category: 'scheduling',
        academyId: String(payload.academyId || req.user?.academyId || ''),
        conflicts: conflictWarnings.length,
        highestSeverity: conflictWarnings[0]?.severity,
      });
    }
    const updated = await Batch.findOneAndUpdate(scopedFilter(req, { _id: req.params.id }), payload, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Batch not found' });
    res.json({ ...updated.toObject(), conflictWarnings });
  } catch (error) {
    next(error);
  }
};

const validateBatchConflicts = async (req, res, next) => {
  try {
    const academyId = req.user?.academyId || req.body?.academyId;
    const conflictWarnings = await detectBatchConflicts({
      academyId,
      batch: scopedPayload(req, req.body),
      excludeBatchId: req.body?._id || req.query?.excludeBatchId,
    });
    res.json({
      hasConflicts: conflictWarnings.length > 0,
      highestSeverity: conflictWarnings[0]?.severity || 'none',
      conflictWarnings,
    });
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

export {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  validateBatchConflicts,
};
