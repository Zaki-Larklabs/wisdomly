import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const createStaff = async (schoolId: string, data: any) => {
  const existing = await prisma.staff.findFirst({
    where: { schoolId, employeeId: data.employeeId }
  });
  if (existing) throw new AppError(409, 'DUPLICATE', 'Staff with this employee ID already exists');

  return await prisma.staff.create({ data: { ...data, schoolId } });
};

export const updateStaff = async (schoolId: string, id: string, data: any) => {
  const staff = await prisma.staff.findFirst({ where: { id, schoolId } });
  if (!staff) throw new AppError(404, 'NOT_FOUND', 'Staff member not found');

  return await prisma.staff.update({ where: { id }, data });
};

export const deleteStaff = async (schoolId: string, id: string) => {
  const staff = await prisma.staff.findFirst({ where: { id, schoolId } });
  if (!staff) throw new AppError(404, 'NOT_FOUND', 'Staff member not found');

  await prisma.staff.delete({ where: { id } });
  return true;
};

export const getStaff = async (schoolId: string, query: { search?: string; designation?: string; isActive?: string }) => {
  const where: any = { schoolId };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { employeeId: { contains: query.search, mode: 'insensitive' } },
      { designation: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.designation) where.designation = query.designation;
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

  return await prisma.staff.findMany({
    where,
    orderBy: { name: 'asc' }
  });
};

export const getStaffById = async (schoolId: string, id: string) => {
  const staff = await prisma.staff.findFirst({ where: { id, schoolId } });
  if (!staff) throw new AppError(404, 'NOT_FOUND', 'Staff member not found');
  return staff;
};
