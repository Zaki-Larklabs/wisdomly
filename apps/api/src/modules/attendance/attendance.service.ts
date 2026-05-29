import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export const markBulkAttendance = async (
  schoolId: string,
  teacherId: string,
  data: any,
  userId: string
) => {
  const { classId, sectionId, date, session, attendance } = data;
  const parsedDate = new Date(date);

  const results = await prisma.$transaction(
    attendance.map((record: any) =>
      prisma.attendance.upsert({
        where: {
          schoolId_studentId_date_session: {
            schoolId,
            studentId: record.studentId,
            date: parsedDate,
            session
          }
        },
        update: {
          status: record.status,
          remarks: record.remarks,
          markedById: teacherId
        },
        create: {
          schoolId,
          studentId: record.studentId,
          classId,
          sectionId,
          date: parsedDate,
          session,
          status: record.status,
          remarks: record.remarks,
          markedById: teacherId
        }
      })
    )
  );

  await prisma.auditLog.create({
    data: {
      schoolId,
      userId,
      action: 'BULK_MARK_ATTENDANCE',
      entity: 'Attendance',
      newValue: { classId, sectionId, date, session, recordsCount: attendance.length } as any
    }
  });

  return results;
};

export const getAttendanceByClass = async (
  schoolId: string,
  classId: string,
  date: string,
  session: string
) => {
  const parsedDate = new Date(date);
  return await prisma.attendance.findMany({
    where: { schoolId, classId, date: parsedDate, session: session as any },
    include: { student: true }
  });
};

export const getAttendanceByStudent = async (
  schoolId: string,
  studentId: string,
  month: number,
  year: number
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return await prisma.attendance.findMany({
    where: {
      schoolId,
      studentId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  });
};
