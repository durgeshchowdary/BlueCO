import Attendance from '../models/Attendance.js';
import Coach from '../models/Coach.js';
import Payroll from '../models/Payroll.js';
import { createNotification } from './notificationService.js';

const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthWindow = (month = monthKey()) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const start = new Date(year, monthNumber - 1, 1);
  const end = new Date(year, monthNumber, 1);
  return { start, end };
};

const calculatePayrollForAcademy = async ({ academyId, month = monthKey() }) => {
  const { start, end } = monthWindow(month);
  const coaches = await Coach.find({ academyId, status: 'Active' }).lean();
  const created = [];

  for (const coach of coaches) {
    const attendance = await Attendance.find({
      academyId,
      actorType: 'coach',
      $or: [{ coachId: coach._id }, { employeeName: coach.name }],
      date: { $gte: start, $lt: end },
    }).lean();

    const lateMarks = attendance.filter((item) => item.status === 'late').length;
    const absentCount = attendance.filter((item) => item.status === 'absent' || item.status === 'Absent').length;
    const halfDayDeductions = Math.floor(lateMarks / 3);
    const perDaySalary = Number(coach.salary || 0) / 30;
    const deductions = Math.round((halfDayDeductions * perDaySalary * 0.5) + (absentCount * perDaySalary));
    const netSalary = Math.max(0, Number(coach.salary || 0) - deductions);

    const payroll = await Payroll.findOneAndUpdate(
      { academyId, month, employeeName: coach.name },
      {
        $setOnInsert: {
          academyId,
          coachId: coach._id,
          employeeName: coach.name,
          month,
          baseSalary: coach.salary,
        },
        $set: {
          lateMarks,
          halfDayDeductions,
          absentDeductions: absentCount,
          deductions,
          netSalary,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    created.push(payroll);
  }

  if (created.length) {
    await createNotification({
      academyId,
      category: 'payroll',
      title: 'Payroll calculated',
      message: `${created.length} payroll records were prepared for ${month}.`,
      actionUrl: '/academy/reports',
      dedupeKey: `payroll-calculated:${academyId}:${month}`,
    });
  }

  return created;
};

export {
  calculatePayrollForAcademy,
  monthKey,
};
