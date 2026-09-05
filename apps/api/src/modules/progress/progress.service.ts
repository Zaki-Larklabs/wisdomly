import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const getStudentProgress = async (schoolId: string, studentUserId: string) => {
  const student = await prisma.student.findFirst({ where: { schoolId, userId: studentUserId } });
  if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found');

  const reportCards = await prisma.reportCard.findMany({
    where: { schoolId, studentId: student.id },
    orderBy: { generatedAt: 'desc' },
    include: { exam: { select: { id: true, name: true, examType: true, examDate: true } } },
  });

  const allMarks = await prisma.mark.findMany({
    where: { schoolId, studentId: student.id },
    include: { subject: { select: { id: true, name: true, code: true } }, exam: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const subjectAverages: Record<string, { name: string; code: string; totalObtained: number; totalMax: number; count: number }> = {};
  for (const m of allMarks) {
    if (!subjectAverages[m.subjectId]) {
      subjectAverages[m.subjectId] = { name: m.subject.name, code: m.subject.code, totalObtained: 0, totalMax: 0, count: 0 };
    }
    subjectAverages[m.subjectId].totalObtained += m.marksObtained;
    subjectAverages[m.subjectId].totalMax += m.maxMarks;
    subjectAverages[m.subjectId].count++;
  }

  const subjectPerformance = Object.values(subjectAverages).map(s => ({
    name: s.name,
    code: s.code,
    average: s.count > 0 ? Math.round((s.totalObtained / s.totalMax) * 100) : 0,
    examsCount: s.count,
  }));

  const overallAvg = reportCards.length > 0
    ? Math.round(reportCards.reduce((a, r) => a + r.percentage, 0) / reportCards.length)
    : allMarks.length > 0
      ? Math.round(allMarks.reduce((a, m) => a + (m.marksObtained / m.maxMarks) * 100, 0) / allMarks.length)
      : 0;

  return {
    reportCards,
    subjectPerformance,
    overallAverage: overallAvg,
    totalExams: reportCards.length,
    bestExam: reportCards.length > 0 ? reportCards.reduce((best, r) => r.percentage > best.percentage ? r : best, reportCards[0]) : null,
  };
};
