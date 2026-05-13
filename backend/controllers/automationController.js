import AutomationLog from '../models/AutomationLog.js';
import * as jobs from '../schedulers/jobs.js';
import { scopedFilter } from '../utils/scope.js';

const jobMap = {
  trialReminderJob: jobs.trialReminderJob,
  suspensionJob: jobs.suspensionJob,
  invoiceGenerationJob: jobs.invoiceGenerationJob,
  payrollJob: jobs.payrollJob,
  AIInsightJob: jobs.aiInsightJob,
  feeReminderJob: jobs.feeReminderJob,
  attendanceAlertJob: jobs.attendanceAlertJob,
  cleanupJob: jobs.cleanupJob,
};

const getAutomationLogs = async (req, res, next) => {
  try {
    const filter = scopedFilter(req);
    if (req.query.jobName) filter.jobName = req.query.jobName;
    if (req.query.status) filter.status = req.query.status;
    const logs = await AutomationLog.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const runAutomationJob = async (req, res, next) => {
  try {
    const job = jobMap[req.params.jobName];
    if (!job) return res.status(404).json({ message: 'Automation job not found' });
    const result = await job();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export {
  getAutomationLogs,
  runAutomationJob,
};
