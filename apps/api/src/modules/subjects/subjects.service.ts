import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const createNewSubject = async (schoolId: string, data: any) => {
  // Prevent duplicate subject codes within the same institutional boundary
  const existingCode = await prisma.subject.findFirst({
    where: { schoolId, code: data.code }
  });
  if (existingCode) {
    throw new AppError(409, 'DUPLICATE_ERROR', `Subject code ${data.code} is already registered`);
  }

  return await prisma.subject.create({
    data: {
      schoolId,
      classId: data.classId,
      teacherId: data.teacherId || null,
      name: data.name,
      code: data.code,
    },
    include: { class: true, teacher: true }
  });
};

export const getSubjectsByClass = async (schoolId: string, classId: string) => {
  return await prisma.subject.findMany({
    where: { schoolId, classId },
    include: { teacher: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });
};

export const getSubjectsWithAssignments = async (schoolId: string) => {
  return await prisma.subject.findMany({
    where: { schoolId },
    include: {
      class: true,
      teacher: { select: { name: true, department: true } }
    },
    orderBy: { code: 'asc' }
  });
};