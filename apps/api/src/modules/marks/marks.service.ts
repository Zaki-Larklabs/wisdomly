import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const submitBulkMarks = async (
  schoolId: string,
  teacherId: string,
  data: any,
  userId: string
) => {
  const { examId, subjectId, maxMarks, marks } = data;

  const results = await prisma.$transaction(
    marks.map((record: any) => {
      // Calculate grade (simple example logic)
      const percentage = (record.marksObtained / maxMarks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      return prisma.mark.upsert({
        where: {
          schoolId_studentId_subjectId_examId: {
            schoolId,
            studentId: record.studentId,
            subjectId,
            examId
          }
        },
        update: {
          marksObtained: record.marksObtained,
          maxMarks,
          grade,
          remarks: record.remarks
        },
        create: {
          schoolId,
          studentId: record.studentId,
          subjectId,
          examId,
          marksObtained: record.marksObtained,
          maxMarks,
          grade,
          remarks: record.remarks
        }
      });
    })
  );

  await prisma.auditLog.create({
    data: {
      schoolId,
      userId,
      action: 'BULK_MARK_ENTRY',
      entity: 'Mark',
      newValue: { examId, subjectId, recordsCount: marks.length } as any
    }
  });

  return results;
};

export const generateReportCards = async (
  schoolId: string,
  classId: string,
  examId: string,
  userId: string
) => {
  // 1. Get all students in the class
  const students = await prisma.student.findMany({
    where: { schoolId, classId }
  });

  // 2. Get all marks for these students for the given exam
  const studentIds = students.map(s => s.id);
  const marks = await prisma.mark.findMany({
    where: { schoolId, studentId: { in: studentIds }, examId }
  });

  if (marks.length === 0) {
    throw new AppError(400, 'NO_MARKS_FOUND', 'No marks found for this exam and class to generate report cards.');
  }

  // 3. Group marks by student and calculate totals
  const studentStats: Record<string, { totalMarksObtained: number, totalMaxMarks: number }> = {};
  
  marks.forEach(mark => {
    if (!studentStats[mark.studentId]) {
      studentStats[mark.studentId] = { totalMarksObtained: 0, totalMaxMarks: 0 };
    }
    studentStats[mark.studentId].totalMarksObtained += mark.marksObtained;
    studentStats[mark.studentId].totalMaxMarks += mark.maxMarks;
  });

  // 4. Calculate percentage and rank
  const results = Object.keys(studentStats).map(studentId => {
    const stat = studentStats[studentId];
    const percentage = (stat.totalMarksObtained / stat.totalMaxMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    return {
      studentId,
      totalMarks: stat.totalMarksObtained,
      percentage,
      grade
    };
  });

  // Sort by percentage descending for rank
  results.sort((a, b) => b.percentage - a.percentage);

  // 5. Upsert report cards
  const reportCards = await prisma.$transaction(
    results.map((res, index) => 
      prisma.reportCard.upsert({
        where: {
          schoolId_studentId_examId: {
            schoolId,
            studentId: res.studentId,
            examId
          }
        },
        update: {
          totalMarks: res.totalMarks,
          percentage: res.percentage,
          rank: index + 1,
          grade: res.grade,
          generatedAt: new Date()
        },
        create: {
          schoolId,
          studentId: res.studentId,
          examId,
          totalMarks: res.totalMarks,
          percentage: res.percentage,
          rank: index + 1,
          grade: res.grade
        }
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      schoolId,
      userId,
      action: 'GENERATE_REPORT_CARDS',
      entity: 'ReportCard',
      newValue: { examId, classId, cardsCount: reportCards.length } as any
    }
  });

  return reportCards;
};

export const getStudentResults = async (schoolId: string, studentId: string) => {
  return await prisma.reportCard.findMany({
    where: { schoolId, studentId },
    include: { exam: true },
    orderBy: { generatedAt: 'desc' }
  });
};

export const getStudentMarksForExam = async (schoolId: string, studentId: string, examId: string) => {
  return await prisma.mark.findMany({
    where: { schoolId, studentId, examId },
    include: { subject: true }
  });
};
