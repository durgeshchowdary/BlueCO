import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import logger from './logger.js';
import observability from './observabilityService.js';
import process from 'node:process';

const DOC_TYPES = Object.freeze(['registration', 'authorization']);
const ALLOWED_EXTENSIONS = Object.freeze(['jpg', 'jpeg', 'png', 'pdf', 'xlsx']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_ROOT = path.resolve(process.env.DLT_UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads', 'dlt'));

const isAllowedDocType = (docType) => DOC_TYPES.includes(docType);

const getExtension = (fileName = '') => String(fileName).split('.').pop().toLowerCase();

const sanitizeFileName = (fileName = '') => {
  const base = path.basename(String(fileName)).replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || 'dlt-document';
};

const activeDoc = (doc = {}) => Boolean(doc.storageKey && doc.uploadedAt && !doc.deletedAt);

const complianceStatusForDocs = (documents = {}) => {
  const uploaded = ['registration', 'authorization'].filter((type) => activeDoc(documents[type])).length;
  if (uploaded === 2) return 'complete';
  if (uploaded === 1) return 'partial';
  return 'pending';
};

const serializeDocument = (doc = {}) => ({
  fileName: doc.fileName || '',
  originalName: doc.originalName || '',
  mimeType: doc.mimeType || '',
  size: doc.size || 0,
  uploadedAt: doc.uploadedAt || null,
  uploadedBy: doc.uploadedBy || null,
  deletedAt: doc.deletedAt || null,
  isUploaded: activeDoc(doc),
});

const serializeCompliance = (academy = {}) => {
  const dltDocuments = academy.compliance?.dltDocuments || {};
  const documents = {
    registration: serializeDocument(dltDocuments.registration),
    authorization: serializeDocument(dltDocuments.authorization),
  };

  return {
    status: complianceStatusForDocs(dltDocuments),
    documents,
  };
};

const validateUploadPayload = ({ fileName, size, contentBase64 }) => {
  const extension = getExtension(fileName);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    const error = new Error('Invalid file extension. Upload jpg, jpeg, png, pdf, or xlsx.');
    error.status = 400;
    error.code = 'INVALID_EXTENSION';
    throw error;
  }

  const declaredSize = Number(size || 0);
  if (!declaredSize) {
    const error = new Error('Empty files cannot be uploaded.');
    error.status = 400;
    error.code = 'EMPTY_FILE';
    throw error;
  }

  if (declaredSize > MAX_FILE_SIZE) {
    const error = new Error('File exceeds the 5MB DLT upload limit.');
    error.status = 413;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  const buffer = Buffer.from(String(contentBase64 || ''), 'base64');
  if (!buffer.length) {
    const error = new Error('Empty files cannot be uploaded.');
    error.status = 400;
    error.code = 'EMPTY_FILE';
    throw error;
  }

  if (buffer.length > MAX_FILE_SIZE) {
    const error = new Error('File exceeds the 5MB DLT upload limit.');
    error.status = 413;
    error.code = 'FILE_TOO_LARGE';
    throw error;
  }

  return { extension, buffer };
};

const writeFileWithRetry = async (storageKey, buffer, attempts = 2) => {
  const targetPath = path.join(UPLOAD_ROOT, storageKey);
  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

  let lastError;
  const startedAt = process.hrtime.bigint();
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await fs.promises.writeFile(targetPath, buffer, { flag: 'wx' });
      logger.info('storage.write_success', {
        category: 'storage',
        storageKey,
        attempts: attempt,
        latencyMs: Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6),
      });
      return targetPath;
    } catch (error) {
      lastError = error;
      observability.increment('storageFailures', { storageKey, attempt, errorMessage: error.message });
      logger.error('storage.write_failure', { category: 'storage', storageKey, attempt, error });
      if (error.code === 'EEXIST') throw error;
    }
  }

  throw lastError;
};

const createStorageKey = ({ academyId, docType, extension }) => {
  const nonce = crypto.randomBytes(10).toString('hex');
  return path.join(String(academyId), `${docType}-${Date.now()}-${nonce}.${extension}`);
};

const resolveStoragePath = (storageKey) => {
  const target = path.resolve(UPLOAD_ROOT, storageKey);
  const relative = path.relative(UPLOAD_ROOT, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    const error = new Error('Invalid storage key');
    error.status = 400;
    throw error;
  }
  return target;
};

export {
  DOC_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  UPLOAD_ROOT,
  activeDoc,
  complianceStatusForDocs,
  createStorageKey,
  isAllowedDocType,
  resolveStoragePath,
  sanitizeFileName,
  serializeCompliance,
  validateUploadPayload,
  writeFileWithRetry,
};
