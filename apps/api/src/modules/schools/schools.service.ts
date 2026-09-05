import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const getSchoolProfile = async (schoolId: string) => {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) throw new AppError(404, 'NOT_FOUND', 'School not found');
  return school;
};

export const updateSchoolProfile = async (schoolId: string, data: Record<string, unknown>) => {
  const school = await prisma.school.update({ where: { id: schoolId }, data });
  return school;
};
