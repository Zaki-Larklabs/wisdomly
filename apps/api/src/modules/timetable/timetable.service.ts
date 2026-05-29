import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const createTimetableEntry = async (schoolId: string, data: any, userId: string) => {
  const { classId, dayOfWeek, periodNumber, teacherId } = data;

  const classConflict = await prisma.timetable.findFirst({
    where: { schoolId, classId, dayOfWeek, periodNumber }
  });
  if (classConflict) throw new AppError(409, 'TIMETABLE_CONFLICT', `Class already has a subject in period ${periodNumber} on day ${dayOfWeek}`);

  const teacherConflict = await prisma.timetable.findFirst({
    where: { schoolId, teacherId, dayOfWeek, periodNumber }
  });
  if (teacherConflict) throw new AppError(409, 'TEACHER_CONFLICT', `Teacher already assigned to another class in this slot`);

  const entry = await prisma.timetable.create({
    data: {
      schoolId,
      ...data
    }
  });

  await prisma.auditLog.create({
    data: {
      schoolId,
      userId,
      action: 'CREATE',
      entity: 'Timetable',
      entityId: entry.id,
      newValue: entry as any
    }
  });

  return entry;
};

export const updateTimetableEntry = async (schoolId: string, id: string, data: any, userId: string) => {
  const existing = await prisma.timetable.findFirst({ where: { id, schoolId } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Timetable entry not found');

  const checkClassId = data.classId || existing.classId;
  const checkDayOfWeek = data.dayOfWeek || existing.dayOfWeek;
  const checkPeriodNumber = data.periodNumber || existing.periodNumber;
  const checkTeacherId = data.teacherId || existing.teacherId;

  const classConflict = await prisma.timetable.findFirst({
    where: { schoolId, classId: checkClassId, dayOfWeek: checkDayOfWeek, periodNumber: checkPeriodNumber, id: { not: id } }
  });
  if (classConflict) throw new AppError(409, 'TIMETABLE_CONFLICT', `Class already has a subject in period ${checkPeriodNumber} on day ${checkDayOfWeek}`);

  const teacherConflict = await prisma.timetable.findFirst({
    where: { schoolId, teacherId: checkTeacherId, dayOfWeek: checkDayOfWeek, periodNumber: checkPeriodNumber, id: { not: id } }
  });
  if (teacherConflict) throw new AppError(409, 'TEACHER_CONFLICT', `Teacher already assigned to another class in this slot`);

  const updated = await prisma.timetable.update({
    where: { id },
    data
  });

  await prisma.auditLog.create({
    data: {
      schoolId,
      userId,
      action: 'UPDATE',
      entity: 'Timetable',
      entityId: id,
      oldValue: existing as any,
      newValue: updated as any
    }
  });

  return updated;
};

export const deleteTimetableEntry = async (schoolId: string, id: string, userId: string) => {
  const existing = await prisma.timetable.findFirst({ where: { id, schoolId } });
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Timetable entry not found');

  await prisma.timetable.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      schoolId,
      userId,
      action: 'DELETE',
      entity: 'Timetable',
      entityId: id,
      oldValue: existing as any
    }
  });

  return true;
};

export const getTimetableByClass = async (schoolId: string, classId: string) => {
  return await prisma.timetable.findMany({
    where: { schoolId, classId },
    include: { subject: true, teacher: true, class: true },
    orderBy: [
      { dayOfWeek: 'asc' },
      { periodNumber: 'asc' }
    ]
  });
};

export const getTimetableBySection = async (schoolId: string, sectionId: string) => {
  return await prisma.timetable.findMany({
    where: { schoolId, sectionId },
    include: { subject: true, teacher: true, class: true, section: true },
    orderBy: [
      { dayOfWeek: 'asc' },
      { periodNumber: 'asc' }
    ]
  });
};

export const getTimetableByTeacher = async (schoolId: string, teacherId: string) => {
  return await prisma.timetable.findMany({
    where: { schoolId, teacherId },
    include: { subject: true, class: true, section: true },
    orderBy: [
      { dayOfWeek: 'asc' },
      { periodNumber: 'asc' }
    ]
  });
};
