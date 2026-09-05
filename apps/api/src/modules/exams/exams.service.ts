import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateExamInput } from './exams.schema';

export const createExam = async (schoolId: string, input: CreateExamInput) => {
  return await prisma.exam.create({
    data: {
      schoolId,
      name: input.name,
      classId: input.classId,
      subjectId: input.subjectId,
      examType: input.examType,
      examDate: new Date(input.examDate),
      maxMarks: input.maxMarks,
      passMark: input.passMark,
    },
    include: { class: { select: { name: true } }, subject: { select: { name: true, code: true } } },
  });
};

export const listExams = async (schoolId: string, filters: { classId?: string; subjectId?: string }) => {
  const where: Record<string, unknown> = { schoolId };
  if (filters.classId) where.classId = filters.classId;
  if (filters.subjectId) where.subjectId = filters.subjectId;

  return await prisma.exam.findMany({
    where,
    include: { class: { select: { name: true } }, subject: { select: { name: true, code: true } } },
    orderBy: { examDate: 'desc' },
  });
};

export const getExam = async (schoolId: string, examId: string) => {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, schoolId },
    include: {
      class: { select: { name: true } },
      subject: { select: { name: true, code: true } },
      marks: {
        include: { student: { select: { id: true, name: true, rollNumber: true } } },
        orderBy: { student: { name: 'asc' } },
      },
    },
  });
  if (!exam) throw new AppError(404, 'NOT_FOUND', 'Exam not found');
  return exam;
};
