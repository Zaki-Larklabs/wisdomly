import { prisma } from '../../config/database';

export const getDashboardAnalytics = async (schoolId: string) => {
  const [
    totalStudents,
    totalTeachers,
    totalStaff,
    totalClasses,
    totalSubjects,
    attendanceToday,
    pendingFees,
    totalFeesCollected,
    pendingLeaves,
    totalBooks,
    borrowedBooks,
    homeworkThisWeek,
    recentPayments,
    feeStatusBreakdown,
    classDistribution,
    attendanceTrend,
    monthlyFeeCollection,
  ] = await Promise.all([
    prisma.student.count({ where: { schoolId, isActive: true } }),
    prisma.teacher.count({ where: { schoolId, isActive: true } }),
    prisma.staff.count({ where: { schoolId, isActive: true } }),
    prisma.class.count({ where: { schoolId } }),
    prisma.subject.count({ where: { schoolId } }),
    prisma.attendance.count({
      where: { schoolId, date: new Date() }
    }),
    prisma.fee.aggregate({
      where: { schoolId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
      _sum: { amount: true }
    }),
    prisma.fee.aggregate({
      where: { schoolId, status: 'PAID' },
      _sum: { amount: true }
    }),
    prisma.leave.count({ where: { schoolId, status: 'PENDING' } }),
    prisma.book.count({ where: { schoolId } }),
    prisma.bookBorrow.count({ where: { schoolId, status: 'BORROWED' } }),
    prisma.homework.count({
      where: { schoolId, dueDate: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }
    }),
    prisma.fee.findMany({
      where: { schoolId, paidAt: { not: null } },
      orderBy: { paidAt: 'desc' },
      take: 10,
      include: { student: { select: { name: true, rollNumber: true } } }
    }),
    prisma.fee.groupBy({
      by: ['status'],
      where: { schoolId },
      _count: { id: true },
      _sum: { amount: true }
    }),
    prisma.student.groupBy({
      by: ['classId'],
      where: { schoolId, isActive: true },
      _count: { id: true }
    }),
    // Attendance trend (last 7 days)
    Promise.all(
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return prisma.attendance.count({
          where: { schoolId, date: d, status: 'PRESENT' }
        }).then(count => ({ date: d.toISOString().slice(0, 10), present: count }));
      })
    ),
    // Monthly fee collection (last 6 months)
    Promise.all(
      Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        return prisma.fee.aggregate({
          where: { schoolId, status: 'PAID', paidAt: { gte: start, lt: end } },
          _sum: { amount: true }
        }).then(r => ({
          month: d.toLocaleString('default', { month: 'short' }),
          collected: r._sum.amount || 0
        }));
      })
    ),
  ]);

  return {
    overview: {
      totalStudents,
      totalTeachers,
      totalStaff,
      totalClasses,
      totalSubjects,
      attendanceToday,
      pendingFees: pendingFees._sum.amount || 0,
      totalFeesCollected: totalFeesCollected._sum.amount || 0,
      pendingLeaves,
      totalBooks,
      borrowedBooks,
      homeworkThisWeek,
    },
    recentPayments,
    feeStatusBreakdown: feeStatusBreakdown.map(f => ({
      status: f.status,
      count: f._count.id,
      total: f._sum.amount || 0
    })),
    classDistribution,
    attendanceTrend,
    monthlyFeeCollection,
  };
};

export const exportAnalyticsCSV = async (schoolId: string) => {
  const analytics = await getDashboardAnalytics(schoolId);
  const rows: string[] = ['Metric,Value'];

  const addRow = (key: string, value: any) => rows.push(`${key},${value}`);

  addRow('Total Students', analytics.overview.totalStudents);
  addRow('Total Teachers', analytics.overview.totalTeachers);
  addRow('Total Staff', analytics.overview.totalStaff);
  addRow('Total Classes', analytics.overview.totalClasses);
  addRow('Total Subjects', analytics.overview.totalSubjects);
  addRow('Attendance Today', analytics.overview.attendanceToday);
  addRow('Pending Fees Amount', analytics.overview.pendingFees);
  addRow('Total Fees Collected', analytics.overview.totalFeesCollected);
  addRow('Pending Leaves', analytics.overview.pendingLeaves);
  addRow('Total Books', analytics.overview.totalBooks);
  addRow('Borrowed Books', analytics.overview.borrowedBooks);
  addRow('Homework This Week', analytics.overview.homeworkThisWeek);

  rows.push('');
  rows.push('Fee Status Breakdown');
  rows.push('Status,Count,Total Amount');
  for (const f of analytics.feeStatusBreakdown) {
    rows.push(`${f.status},${f.count},${f.total}`);
  }

  rows.push('');
  rows.push('Monthly Fee Collection');
  rows.push('Month,Collected');
  for (const m of analytics.monthlyFeeCollection) {
    rows.push(`${m.month},${m.collected}`);
  }

  rows.push('');
  rows.push('Attendance Trend (Last 7 Days)');
  rows.push('Date,Present');
  for (const a of analytics.attendanceTrend) {
    rows.push(`${a.date},${a.present}`);
  }

  return rows.join('\n');
};
