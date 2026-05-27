import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const createTeacher = async (schoolId: string, data: any) => {
  // 1. Check if email identifier already exists across the global user workspace
  const existingUser = await prisma.user.findFirst({ where: { email: data.email } });
  if (existingUser) {
    throw new AppError(409, 'DUPLICATE_ERROR', 'A user with this email identity already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  // 2. Transactionally assign login credentials and teacher profile link
  return await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        schoolId,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: 'TEACHER',
      }
    });

    const count = await tx.teacher.count({ where: { schoolId } });
    const employeeId = `T${(count + 1).toString().padStart(3, '0')}`;

    return await tx.teacher.create({
      data: {
        schoolId,
        userId: user.id,
        employeeId,
        name: data.name,
        department: data.department,
        joinedAt: data.joiningDate,
      },
      include: { user: true }
    });
  });
};

export const getTeachersList = async (schoolId: string) => {
  return await prisma.teacher.findMany({
    where: { schoolId },
    include: {
      user: {
        select: { email: true, phone: true, isActive: true }
      }
    }
  });
};
export const getTeacherAssignments = async (userId: string) => {
  // 1. Locate the core teacher profile associated with this identity user ID
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
  });

  if (!teacher) {
    throw new AppError(404, 'NOT_FOUND', 'Teacher workspace profile not discovered');
  }

  // 2. Fetch only the courses assigned to this specific teacher index
  return await prisma.subject.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: {
        include: { sections: true }
      }
    },
    orderBy: { code: 'asc' }
  });
};