import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { CreateLeaveInput } from './leaves.schema';

export const createLeaveRequest = async (schoolId: string, teacherUserId: string, input: CreateLeaveInput) => {
  const teacher = await prisma.teacher.findFirst({ where: { schoolId, userId: teacherUserId } });
  if (!teacher) throw new AppError(403, 'FORBIDDEN', 'Teacher not found');

  return await prisma.leave.create({
    data: {
      schoolId,
      teacherId: teacher.id,
      leaveType: input.leaveType,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      reason: input.reason,
    },
    include: { teacher: { select: { name: true } } },
  });
};

export const getMyLeaves = async (schoolId: string, teacherUserId: string) => {
  const teacher = await prisma.teacher.findFirst({ where: { schoolId, userId: teacherUserId } });
  if (!teacher) throw new AppError(403, 'FORBIDDEN', 'Teacher not found');

  return await prisma.leave.findMany({
    where: { schoolId, teacherId: teacher.id },
    orderBy: { createdAt: 'desc' },
    include: { reviewer: { select: { name: true } } },
  });
};

export const getAllLeaves = async (schoolId: string) => {
  return await prisma.leave.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'desc' },
    include: {
      teacher: { select: { id: true, name: true, employeeId: true } },
      reviewer: { select: { name: true } },
    },
  });
};

export const reviewLeave = async (schoolId: string, adminUserId: string, leaveId: string, status: string, reviewNote?: string) => {
  const leave = await prisma.leave.findFirst({ where: { id: leaveId, schoolId } });
  if (!leave) throw new AppError(404, 'NOT_FOUND', 'Leave not found');
  if (leave.status !== 'PENDING') throw new AppError(400, 'INVALID_STATE', 'Leave has already been reviewed');

  const admin = await prisma.teacher.findFirst({ where: { schoolId, userId: adminUserId } });
  if (!admin) throw new AppError(403, 'FORBIDDEN', 'Admin/Teacher record not found');

  return await prisma.leave.update({
    where: { id: leaveId },
    data: { status: status as any, reviewedBy: admin.id, reviewNote },
    include: { teacher: { select: { name: true } }, reviewer: { select: { name: true } } },
  });
};
