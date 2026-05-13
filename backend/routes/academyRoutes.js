import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Academy from '../models/Academy.js';
import { ROLES } from '../constants/roles.js';
import { hashPassword } from '../utils/auth.js';
import { authenticateUser, requireRole, requireAcademyScope, requirePermission, audit } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createStorageKey,
  isAllowedDocType,
  resolveStoragePath,
  sanitizeFileName,
  serializeCompliance,
  validateUploadPayload,
  writeFileWithRetry,
} from '../services/complianceService.js';
import logger from '../services/logger.js';
import observability from '../services/observabilityService.js';

import studentRoutes from './studentRoutes.js';
import coachRoutes from './coachRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import batchRoutes from './batchRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import eventRoutes from './eventRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();
router.use(authenticateUser, requireRole(ROLES.SUPER_ADMIN, ROLES.ACADEMY_ADMIN), requireAcademyScope);

/**
 * @typedef {object} CustomUser
 * @property {string} _id
 * @property {string} academyId
 * @property {string} role
 */

router.use('/students', studentRoutes);
router.use('/coaches', coachRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/batches', batchRoutes);
router.use('/payments', paymentRoutes);
router.use('/events', eventRoutes);
router.use('/tickets', ticketRoutes);
router.use('/announcements', announcementRoutes);
router.use('/reports', dashboardRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/compliance/dlt-documents', requirePermission(PERMISSIONS.ACADEMY_MANAGE), async (req, res, next) => {
  try {
    const academy = await Academy.findById(/** @type {CustomUser} */ (req.user).academyId).lean();
    if (!academy) return res.status(404).json({ message: 'Academy not found' });
    res.json(serializeCompliance(academy));
  } catch (error) {
    next(error);
  }
});

router.post('/compliance/dlt-documents/:docType', requirePermission(PERMISSIONS.ACADEMY_MANAGE), audit('dlt_document_upload', 'Academy'), async (req, res, next) => {
  const { docType } = req.params;

  try {
    if (!isAllowedDocType(docType)) return res.status(400).json({ message: 'Invalid DLT document type' });

    const { fileName, mimeType, size, contentBase64 } = req.body || {};
    let validated;
    try {
      validated = validateUploadPayload({ fileName, size, contentBase64 });
    } catch (error) {
      if (error.code === 'INVALID_EXTENSION') {
        logger.warn('dlt.invalid_extension', { category: 'upload', academyId: String(req.user.academyId), docType, fileName });
      }
      observability.increment('uploadFailures', { academyId: String(req.user.academyId), docType, code: error.code });
      return res.status(error.status || 400).json({ message: error.message, code: error.code });
    }

    const cleanName = sanitizeFileName(fileName);
    const storageKey = createStorageKey({
      academyId: /** @type {CustomUser} */ (req.user).academyId,
      docType,
      extension: validated.extension,
    });

    try {
      await writeFileWithRetry(storageKey, validated.buffer);
    } catch (error) {
      observability.increment('uploadFailures', { academyId: String(/** @type {CustomUser} */ (req.user).academyId), docType, code: 'STORAGE_FAILURE' });
      logger.error('dlt.upload_failure', { category: 'upload', academyId: String(/** @type {CustomUser} */ (req.user).academyId), docType, error });
      return res.status(503).json({ message: 'DLT storage is temporarily unavailable. Please retry.', code: 'STORAGE_FAILURE' });
    }

    const academy = await Academy.findByIdAndUpdate(
      /** @type {CustomUser} */ (req.user).academyId,
      {
        $set: {
          [`compliance.dltDocuments.${docType}`]: {
            fileName: cleanName,
            originalName: cleanName,
            mimeType: mimeType || 'application/octet-stream',
            size: validated.buffer.length,
            storageKey,
            uploadedAt: new Date(),
            uploadedBy: /** @type {CustomUser} */ (req.user)._id,
            deletedAt: null,
            deletedBy: null,
          },
        },
      },
      { new: true, runValidators: true },
    ).lean();

    logger.info('dlt.upload_success', {
      category: 'compliance',
      academyId: String(/** @type {CustomUser} */ (req.user).academyId),
      docType,
      fileSize: validated.buffer.length,
    });
    res.status(201).json(serializeCompliance(academy));
  } catch (error) {
    next(error);
  }
});

router.get('/compliance/dlt-documents/:docType/download', requirePermission(PERMISSIONS.ACADEMY_MANAGE), async (req, res, next) => {
  try {
    const { docType } = req.params;
    if (!isAllowedDocType(docType)) return res.status(400).json({ message: 'Invalid DLT document type' });

    const academy = await Academy.findById(/** @type {CustomUser} */ (req.user).academyId).lean();
    const doc = academy?.compliance?.dltDocuments?.[docType];
    if (!doc?.storageKey || doc.deletedAt) return res.status(404).json({ message: 'DLT document not found' });

    logger.info('dlt.download', { category: 'compliance', academyId: String(/** @type {CustomUser} */ (req.user).academyId), docType, actorId: String(/** @type {CustomUser} */ (req.user)._id) });
    res.download(resolveStoragePath(doc.storageKey), doc.fileName || 'dlt-document');
  } catch (error) {
    observability.increment('downloadFailures', { academyId: String(/** @type {CustomUser} */ (req.user)?.academyId || ''), docType: req.params.docType });
    logger.error('dlt.download_failure', { category: 'storage', docType: req.params.docType, error });
    next(error);
  }
});

router.delete('/compliance/dlt-documents/:docType', requirePermission(PERMISSIONS.ACADEMY_MANAGE), audit('dlt_document_delete', 'Academy'), async (req, res, next) => {
  try {
    const { docType } = req.params;
    if (!isAllowedDocType(docType)) return res.status(400).json({ message: 'Invalid DLT document type' });

    logger.info('dlt.delete', { category: 'compliance', academyId: String(req.user.academyId), docType, actorId: String(req.user._id) });
    const academy = await Academy.findByIdAndUpdate(
      /** @type {CustomUser} */ (req.user).academyId,
      {
        $set: {
          [`compliance.dltDocuments.${docType}.deletedAt`]: new Date(),
          [`compliance.dltDocuments.${docType}.deletedBy`]: /** @type {CustomUser} */ (req.user)._id,
        },
      },
      { new: true },
    ).lean();

    if (!academy) return res.status(404).json({ message: 'Academy not found' });
    res.json(serializeCompliance(academy));
  } catch (error) {
    next(error);
  }
});

router.get('/employees', requirePermission(PERMISSIONS.EMPLOYEES_READ), async (req, res, next) => {
  try {
    const employees = await User.find({
      academyId: /** @type {CustomUser} */ (req.user).academyId,
      role: { $in: [ROLES.EMPLOYEE, ROLES.COACH] },
    }).select('-passwordHash').sort({ name: 1 }).lean();
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

router.post('/employees', requirePermission(PERMISSIONS.EMPLOYEES_WRITE), audit('user_creation', 'User'), async (req, res, next) => {
  try {
    const user = await User.create({
      ...req.body,
      academyId: /** @type {CustomUser} */ (req.user).academyId,
      role: req.body.role === ROLES.COACH ? ROLES.COACH : ROLES.EMPLOYEE,
      passwordHash: hashPassword(req.body.password || 'PlayGrid@123'),
    });
    const clean = user.toObject();
    delete clean.passwordHash;
    res.status(201).json(clean);
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', requirePermission(PERMISSIONS.TASKS_READ), async (req, res, next) => {
  try {
    res.json(await Task.find({ academyId: /** @type {CustomUser} */ (req.user).academyId }).sort({ createdAt: -1 }).lean());
  } catch (error) {
    next(error);
  }
});

export default router;
