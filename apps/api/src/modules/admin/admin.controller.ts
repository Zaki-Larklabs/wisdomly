import { Request, Response } from 'express';
import * as adminService from './admin.service';
import { prisma } from '../../config/database';

export const getDashboardStats = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const stats = await adminService.getSchoolMetrics(schoolId);

  res.status(200).json({
    success: true,
    data: stats,
  });
};

export const getPendingApprovals = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const users = await prisma.user.findMany({
    where: { schoolId, isActive: false, role: { in: ['STUDENT', 'PARENT'] } },
    select: {
      id: true, email: true, role: true, createdAt: true,
      student: { select: { name: true, rollNumber: true, class: { select: { name: true } }, section: { select: { name: true } } } },
      parent: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.status(200).json({ success: true, data: users });
};

export const approveUser = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { userId } = req.params;

  const user = await prisma.user.findFirst({ where: { id: userId, schoolId } });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive: true } });

  res.status(200).json({ success: true, data: { message: 'User approved successfully' } });
};

export const rejectUser = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { userId } = req.params;

  const user = await prisma.user.findFirst({ where: { id: userId, schoolId } });
  if (!user) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  }

  // Delete related student/parent records first, then user
  await prisma.$transaction(async (tx: any) => {
    if (user.role === 'STUDENT') {
      await tx.student.deleteMany({ where: { userId } });
    } else if (user.role === 'PARENT') {
      await tx.parent.deleteMany({ where: { userId } });
    }
    await tx.user.delete({ where: { id: userId } });
  });

  res.status(200).json({ success: true, data: { message: 'User rejected and removed' } });
};