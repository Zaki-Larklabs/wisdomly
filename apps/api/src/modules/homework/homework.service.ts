// apps/api/src/modules/homework/homework.service.ts
import { prisma }   from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import type { CreateHomeworkInput, SubmitHomeworkInput, GradeSubmissionInput } from './homework.schema';

// ─── Teacher creates homework ─────────────────────────────────────
export async function createHomework(
  schoolId: string,
  teacherUserId: string,
  input: CreateHomeworkInput,
) {
  const teacher = await prisma.teacher.findFirst({
    where: { schoolId, userId: teacherUserId },
  });
  if (!teacher) throw new AppError(403, 'FORBIDDEN', 'Teacher record not found');

  const homework = await prisma.homework.create({
    data: {
      schoolId,
      teacherId: teacher.id,
      classId:   input.classId,
      subjectId: input.subjectId,
      title:     input.title,
      description: input.description,
      dueDate:   new Date(input.dueDate),
      fileUrl:   input.fileUrl,
    },
    include: {
      subject: { select: { name: true, code: true } },
      class:   { select: { name: true } },
      teacher: { select: { name: true } },
    },
  });

  // Auto-create pending submission records for all students in the class
  const students = await prisma.student.findMany({
    where: { schoolId, classId: input.classId, isActive: true },
    select: { id: true },
  });

  if (students.length > 0) {
    await prisma.homeworkSubmission.createMany({
      data: students.map(s => ({
        schoolId,
        homeworkId: homework.id,
        studentId:  s.id,
        status:     'PENDING' as const,
      })),
      skipDuplicates: true,
    });
  }

  return homework;
}

// ─── List homework (teacher/admin: by class; student: own class) ──
export async function listHomework(
  schoolId: string,
  filters: { classId?: string; subjectId?: string; page: number; pageSize: number },
) {
  const { classId, subjectId, page, pageSize } = filters;
  const skip = (page - 1) * pageSize;

  const where = {
    schoolId,
    ...(classId   && { classId }),
    ...(subjectId && { subjectId }),
  };

  const [items, total] = await Promise.all([
    prisma.homework.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { dueDate: 'asc' },
      include: {
        subject:     { select: { name: true, code: true } },
        class:       { select: { name: true } },
        teacher:     { select: { name: true } },
        _count:      { select: { submissions: true } },
      },
    }),
    prisma.homework.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── Get single homework with submissions ─────────────────────────
export async function getHomeworkById(schoolId: string, homeworkId: string) {
  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, schoolId },
    include: {
      subject:     { select: { name: true, code: true } },
      class:       { select: { name: true } },
      teacher:     { select: { name: true } },
      submissions: {
        include: {
          student: { select: { id: true, name: true, rollNumber: true } },
        },
        orderBy: { student: { name: 'asc' } },
      },
    },
  });
  if (!homework) throw new AppError(404, 'NOT_FOUND', 'Homework not found');
  return homework;
}

// ─── Student submits homework ─────────────────────────────────────
export async function submitHomework(
  schoolId: string,
  studentUserId: string,
  homeworkId: string,
  input: SubmitHomeworkInput,
) {
  const student = await prisma.student.findFirst({
    where: { schoolId, userId: studentUserId },
  });
  if (!student) throw new AppError(403, 'FORBIDDEN', 'Student record not found');

  const homework = await prisma.homework.findFirst({
    where: { id: homeworkId, schoolId, classId: student.classId },
  });
  if (!homework) throw new AppError(404, 'NOT_FOUND', 'Homework not found for your class');

  const now = new Date();
  const isLate = now > homework.dueDate;

  return prisma.homeworkSubmission.upsert({
    where: {
      schoolId_homeworkId_studentId: {
        schoolId, homeworkId, studentId: student.id,
      },
    },
    update: {
      fileUrl:     input.fileUrl,
      submittedAt: now,
      status:      isLate ? 'LATE_SUBMITTED' : 'SUBMITTED',
    },
    create: {
      schoolId,
      homeworkId,
      studentId:   student.id,
      fileUrl:     input.fileUrl,
      submittedAt: now,
      status:      isLate ? 'LATE_SUBMITTED' : 'SUBMITTED',
    },
  });
}

// ─── Teacher grades a submission ──────────────────────────────────
export async function gradeSubmission(
  schoolId: string,
  teacherUserId: string,
  submissionId: string,
  input: GradeSubmissionInput,
) {
  const teacher = await prisma.teacher.findFirst({
    where: { schoolId, userId: teacherUserId },
  });
  if (!teacher) throw new AppError(403, 'FORBIDDEN', 'Teacher record not found');

  const submission = await prisma.homeworkSubmission.findFirst({
    where: { id: submissionId, schoolId },
    include: { homework: { select: { teacherId: true } } },
  });
  if (!submission) throw new AppError(404, 'NOT_FOUND', 'Submission not found');

  if (submission.homework.teacherId !== teacher.id) {
    throw new AppError(403, 'FORBIDDEN', 'You can only grade your own homework submissions');
  }

  return prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data:  { grade: input.grade, feedback: input.feedback, status: 'GRADED' },
  });
}

// ─── Student's homework list ──────────────────────────────────────
export async function getStudentHomework(
  schoolId: string,
  studentUserId: string,
) {
  const student = await prisma.student.findFirst({
    where: { schoolId, userId: studentUserId },
  });
  if (!student) throw new AppError(403, 'FORBIDDEN', 'Student record not found');

  return prisma.homework.findMany({
    where: { schoolId, classId: student.classId },
    orderBy: { dueDate: 'asc' },
    include: {
      subject: { select: { name: true, code: true } },
      teacher: { select: { name: true } },
      submissions: {
        where: { studentId: student.id },
        select: { status: true, submittedAt: true, grade: true, feedback: true },
      },
    },
  });
}