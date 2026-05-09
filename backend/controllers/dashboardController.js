const Student = require('../models/Student');
const Coach = require('../models/Coach');
const Batch = require('../models/Batch');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const { scopedFilter } = require('../utils/scope');

const getDashboardSummary = async (req, res, next) => {
  try {
    const currentMonth = new Intl.DateTimeFormat('en-US', {
      month: 'long',
    }).format(new Date());

    const monthWindows = Array.from({ length: 6 }, (_, index) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - index));
      return {
        monthFull: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d),
        monthShort: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d),
      };
    });

    const dayWindows = Array.from({ length: 7 }, (_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - index));
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        start: d,
        end: nextD,
      };
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const scope = scopedFilter(req);

    const [
      totalStudents,
      activeCoaches,
      totalBatches,
      pendingFees,
      monthlyRevenueAgg,
      revenueHistoryAgg,
      attendanceHistory,
      todayAttendanceCounts,
      upcomingEvents,
      sportWiseStudents,
      feeStatusDistribution,
      recentPayments,
      upcomingEventsList,
      pendingFeeStudentsList,
    ] = await Promise.all([
      Student.countDocuments(scope),
      Coach.countDocuments(scopedFilter(req, { status: 'Active' })),
      Batch.countDocuments(scope),
      Student.countDocuments(scopedFilter(req, { feeStatus: 'Pending' })),
      Payment.aggregate([
        { $match: scopedFilter(req, { status: 'Paid', month: currentMonth }) },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            ...scopedFilter(req, {
              status: 'Paid',
              month: { $in: monthWindows.map((item) => item.monthFull) },
            }),
          },
        },
        { $group: { _id: '$month', total: { $sum: '$amount' } } },
      ]),
      Promise.all(
        dayWindows.map(async (window) => {
          const present = await Attendance.countDocuments({
            ...scopedFilter(req, {
              status: 'Present',
              date: { $gte: window.start, $lt: window.end },
            }),
          });

          return { day: window.day, count: present };
        }),
      ),
      Attendance.aggregate([
        { $match: scopedFilter(req, { date: { $gte: startOfDay, $lt: endOfDay } }) },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Event.countDocuments(scopedFilter(req, { date: { $gte: startOfDay } })),
      Student.aggregate([
        { $match: scope },
        { $group: { _id: '$sport', count: { $sum: 1 } } },
        { $project: { sport: '$_id', count: 1, _id: 0 } },
      ]),
      Student.aggregate([
        { $match: scope },
        { $group: { _id: '$feeStatus', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),
      Payment.find(scope)
        .select('studentName amount status month paidAt')
        .sort({ paidAt: -1 })
        .limit(5)
        .lean(),
      Event.find(scopedFilter(req, { date: { $gte: startOfDay } }))
        .select('title sport date location')
        .sort({ date: 1 })
        .limit(5)
        .lean(),
      Student.find(scopedFilter(req, { feeStatus: 'Pending' }))
        .select('name sport monthlyFee')
        .sort({ joinedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;
    const revenueMap = new Map(
      revenueHistoryAgg.map((item) => [item._id, item.total]),
    );
    const revenueHistory = monthWindows.map((item) => ({
      month: item.monthShort,
      amount: revenueMap.get(item.monthFull) || 0,
    }));
    const todayTotal = todayAttendanceCounts.reduce((sum, item) => sum + item.count, 0);
    const todayPresent = todayAttendanceCounts.find((item) => item._id === 'Present')?.count || 0;
    const todayAttendancePercentage = todayTotal
      ? Math.round((todayPresent / todayTotal) * 100)
      : 0;

    res.json({
      totalStudents,
      activeCoaches,
      totalBatches,
      pendingFees,
      monthlyRevenue,
      todayAttendancePercentage,
      upcomingEvents,
      sportWiseStudents,
      feeStatusDistribution,
      recentPayments,
      upcomingEventsList,
      revenueHistory,
      attendanceHistory,
      pendingFeeStudentsList,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
