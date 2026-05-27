import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const createNewClass = async (schoolId: string, data: any) => {
  const existingClass = await prisma.class.findFirst({
    where: { schoolId, gradeLevel: data.gradeLevel }
  });
  if (existingClass) {
    throw new AppError(409, 'DUPLICATE_ERROR', `Grade level ${data.gradeLevel} already configured in this school`);
  }

  return await prisma.class.create({
    data: {
      schoolId,
      name: data.name,
      gradeLevel: data.gradeLevel,
    },
  });
};

export const getClassesWithSections = async (schoolId: string) => {
  return await prisma.class.findMany({
    where: { schoolId },
    include: {
      sections: true,
      _count: { select: { students: true } }
    },
    orderBy: { gradeLevel: 'asc' }
  });
};
export const createNewSection = async (schoolId: string, data: any) => {
  // Prevent duplicate section letters within the same grade scope
  const existingSection = await prisma.section.findFirst({
    where: { schoolId, classId: data.classId, name: data.name }
  });
  if (existingSection) {
    throw new AppError(409, 'DUPLICATE_ERROR', `Section ${data.name} already exists for this grade level`);
  }

  return await prisma.section.create({
    data: {
      schoolId,
      classId: data.classId,
      name: data.name,
    },
  });
};