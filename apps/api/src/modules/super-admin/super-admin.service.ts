import { Plan } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const getPlatformStats = async () => {
  const [totalSchools, totalUsers, totalStudents, totalTeachers] = await Promise.all([
    prisma.school.count(),
    prisma.user.count(),
    prisma.student.count(),
    prisma.teacher.count(),
  ]);
  return { totalSchools, totalUsers, totalStudents, totalTeachers };
};

export const listSchools = async () => {
  return await prisma.school.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { users: true, students: true, teachers: true } } },
  });
};

export const createSchool = async (data: { name: string; slug: string; plan: string; address?: string; city?: string; state?: string; phone?: string; email?: string }) => {
  const existing = await prisma.school.findUnique({ where: { slug: data.slug } });
  if (existing) throw new AppError(409, 'DUPLICATE_ERROR', 'School slug already exists');
  const createData = { name: data.name, slug: data.slug, plan: data.plan as Plan, address: data.address, city: data.city, state: data.state, phone: data.phone, email: data.email };
  return await prisma.school.create({ data: createData });
};

export const toggleSchoolStatus = async (schoolId: string) => {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) throw new AppError(404, 'NOT_FOUND', 'School not found');
  return await prisma.school.update({ where: { id: schoolId }, data: { isActive: !school.isActive } });
};
