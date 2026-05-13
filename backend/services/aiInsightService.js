import Academy from '../models/Academy.js';
import Attendance from '../models/Attendance.js';
import Batch from '../models/Batch.js';
import Coach from '../models/Coach.js';
import Student from '../models/Student.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import AIInsight from '../models/AIInsight.js';
import { createNotification } from './notificationService.js';

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const upsertInsight = async ({ academyId, category, severity, title, recommendation, impact, confidence, signals }) => {
  const generatedAt = new Date();
  const insight = await AIInsight.findOneAndUpdate(
    {
      academyId,
      category,
      title,
      status: { $in: ['open', 'acknowledged'] },
      generatedAt: { $gte: daysAgo(14) },
    },
    {
      $set: { severity, recommendation, impact, confidence, signals, generatedAt },
      $setOnInsert: { academyId, category, title },
    },
    { new: true, upsert: true, runValidators: true },
  );

  await createNotification({
    academyId,
    category: 'ai_insights',
    title,
    message: recommendation,
    actionUrl: '/academy/ai-ops',
    priority: severity === 'critical' || severity === 'high' ? 'high' : 'normal',
    dedupeKey: `ai:${academyId}:${category}:${title}`,
  });

  return insight;
};

const generateAcademyInsights = async (academyId) => {
  const since30 = daysAgo(30);
  const since7 = daysAgo(7);
  const [
    students,
    batches,
    coaches,
    recentAttendance,
    previousAttendance,
    pendingFees,
    recentRevenue,
    recentExpenses,
  ] = await Promise.all([
    Student.find({ academyId }).lean(),
    Batch.find({ academyId }).lean(),
    Coach.find({ academyId, status: 'Active' }).lean(),
    Attendance.find({ academyId, date: { $gte: since7 } }).lean(),
    Attendance.find({ academyId, date: { $gte: since30, $lt: since7 } }).lean(),
    Student.countDocuments({ academyId, feeStatus: 'Pending' }),
    Payment.aggregate([
      { $match: { academyId, status: { $in: ['Paid', 'paid'] }, paidAt: { $gte: since30 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { academyId, spentAt: { $gte: since30 } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);

  const insights = [];
  const present = recentAttendance.filter((item) => ['Present', 'present'].includes(item.status)).length;
  const absent = recentAttendance.filter((item) => ['Absent', 'absent'].includes(item.status)).length;
  const attendanceRate = present + absent ? present / (present + absent) : 1;
  const prevPresent = previousAttendance.filter((item) => ['Present', 'present'].includes(item.status)).length;
  const prevAbsent = previousAttendance.filter((item) => ['Absent', 'absent'].includes(item.status)).length;
  const previousRate = prevPresent + prevAbsent ? prevPresent / (prevPresent + prevAbsent) : attendanceRate;

  if (attendanceRate < 0.72 || previousRate - attendanceRate > 0.12) {
    insights.push(await upsertInsight({
      academyId,
      category: 'attendance',
      severity: attendanceRate < 0.6 ? 'high' : 'medium',
      title: 'Weekend attendance dropping',
      recommendation: 'Review batch timing and send targeted attendance nudges to students with repeated absences.',
      impact: 'Recovering attendance can improve retention and fee collection consistency.',
      confidence: 0.78,
      signals: { attendanceRate, previousRate, sample: recentAttendance.length },
    }));
  }

  const avgStudentsPerBatch = batches.length ? students.length / batches.length : students.length;
  if (batches.length && avgStudentsPerBatch < 8) {
    insights.push(await upsertInsight({
      academyId,
      category: 'utilization',
      severity: 'medium',
      title: 'Morning batch utilization is low',
      recommendation: 'Merge underfilled batches or run a local campaign for morning slots before adding new sessions.',
      impact: 'Higher batch density improves coach utilization and facility ROI.',
      confidence: 0.72,
      signals: { students: students.length, batches: batches.length, avgStudentsPerBatch },
    }));
  }

  const studentsPerCoach = coaches.length ? students.length / coaches.length : students.length;
  if (studentsPerCoach > 35) {
    insights.push(await upsertInsight({
      academyId,
      category: 'coach_load',
      severity: 'high',
      title: 'Coach overload detected',
      recommendation: 'Rebalance students across coaches or add part-time support for high-density sports.',
      impact: 'Reducing overload can improve training quality and lower churn risk.',
      confidence: 0.81,
      signals: { students: students.length, coaches: coaches.length, studentsPerCoach },
    }));
  }

  if (pendingFees > Math.max(5, students.length * 0.2)) {
    insights.push(await upsertInsight({
      academyId,
      category: 'churn',
      severity: 'high',
      title: 'Student churn risk increasing',
      recommendation: 'Prioritize parent follow-ups for pending-fee students and offer structured payment reminders.',
      impact: 'Fee delinquency is a leading churn signal for academies.',
      confidence: 0.76,
      signals: { pendingFees, students: students.length },
    }));
  }

  const electricity = recentExpenses.find((item) => /electric|power|utility/i.test(item._id || ''));
  if (electricity && electricity.total > Number(recentRevenue[0]?.total || 0) * 0.12) {
    insights.push(await upsertInsight({
      academyId,
      category: 'cost',
      severity: 'medium',
      title: 'Reduce electricity costs',
      recommendation: 'Shift lighting-heavy sessions away from low-utilization slots and audit facility power usage.',
      impact: 'Facility cost control protects margins without cutting coaching quality.',
      confidence: 0.68,
      signals: { electricityCost: electricity.total, revenue: recentRevenue[0]?.total || 0 },
    }));
  }

  return insights;
};

const generateInsightsForAllAcademies = async () => {
  const academies = await Academy.find({ status: { $in: ['active', 'trial'] } }).select('_id').lean();
  const results = [];
  for (const academy of academies) {
    results.push(...await generateAcademyInsights(academy._id));
  }
  return results;
};

export {
  generateAcademyInsights,
  generateInsightsForAllAcademies,
};
