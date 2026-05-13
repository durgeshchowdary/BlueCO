import Payroll from '../models/Payroll.js';
import { scopedFilter } from '../utils/scope.js';
import { calculatePayrollForAcademy, monthKey } from '../services/payrollService.js';

const getPayroll = async (req, res, next) => {
  try {
    const filter = scopedFilter(req);
    if (req.query.month) filter.month = req.query.month;
    const payroll = await Payroll.find(filter).sort({ month: -1, employeeName: 1 }).lean();
    res.json(payroll);
  } catch (error) {
    next(error);
  }
};

const generatePayroll = async (req, res, next) => {
  try {
    const academyId = req.user?.academyId || req.body?.academyId;
    if (!academyId) return res.status(400).json({ message: 'academyId is required' });
    const payroll = await calculatePayrollForAcademy({ academyId, month: req.body.month || monthKey() });
    res.status(201).json({ generated: payroll.length, payroll });
  } catch (error) {
    next(error);
  }
};

const updatePayroll = async (req, res, next) => {
  try {
    const existing = await Payroll.findOne(scopedFilter(req, { _id: req.params.id }));
    if (!existing) return res.status(404).json({ message: 'Payroll record not found' });
    if (existing.status === 'frozen') return res.status(409).json({ message: 'Frozen payroll cannot be edited' });

    const incentives = Number(req.body.incentives ?? existing.incentives);
    const bonus = Number(req.body.bonus ?? existing.bonus);
    const deductions = Number(req.body.deductions ?? existing.deductions);
    existing.incentives = incentives;
    existing.bonus = bonus;
    existing.deductions = deductions;
    existing.netSalary = Math.max(0, existing.baseSalary + incentives + bonus - deductions);
    if (req.body.status === 'approved') {
      existing.status = 'approved';
      existing.approvedAt = new Date();
    }
    if (req.body.status === 'frozen') {
      existing.status = 'frozen';
      existing.frozenAt = new Date();
    }
    await existing.save();
    res.json(existing);
  } catch (error) {
    next(error);
  }
};

export {
  getPayroll,
  generatePayroll,
  updatePayroll,
};
