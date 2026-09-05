import { Request, Response } from 'express';
import * as attendanceService from './attendance.service';
import { markAttendanceSchema } from './attendance.schema';
import { prisma } from '../../config/database';

export const markAttendance = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const data = markAttendanceSchema.parse(req.body);

  // If Admin is marking, we might just use their ID, but usually Teacher marks it.
  let teacherId = userId;
  if (req.user?.role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (teacher) teacherId = teacher.id;
  }

  const results = await attendanceService.markBulkAttendance(schoolId, teacherId, data, userId);

  res.status(200).json({
    success: true,
    data: { updatedCount: results.length },
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getAttendanceByClass = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { classId } = req.params;
  const { date, session } = req.query;

  if (!date || !session) {
    return res.status(400).json({ success: false, error: { message: 'date and session are required query parameters' } });
  }

  const attendance = await attendanceService.getAttendanceByClass(schoolId, classId, date as string, session as string);

  res.status(200).json({
    success: true,
    data: attendance,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getMyAttendance = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;

  const student = await prisma.student.findFirst({ where: { schoolId, userId } });
  if (!student) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } });

  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ success: false, error: { message: 'month and year are required' } });

  const attendance = await attendanceService.getAttendanceByStudent(schoolId, student.id, parseInt(month as string), parseInt(year as string));
  res.status(200).json({ success: true, data: attendance });
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const userRole = req.user?.role!;
  const { studentId } = req.params;
  const { month, year } = req.query;

  if (userRole === 'PARENT') {
    const isOwner = await prisma.student.findFirst({
      where: { id: studentId, parent: { userId } }
    });
    if (!isOwner) {
      return res.status(403).json({ success: false, error: { message: 'Access denied: You can only view your own child\'s records.' } });
    }
  }

  if (!month || !year) {
    return res.status(400).json({ success: false, error: { message: 'month and year are required query parameters' } });
  }

  const attendance = await attendanceService.getAttendanceByStudent(
    schoolId,
    studentId,
    parseInt(month as string),
    parseInt(year as string)
  );

  res.status(200).json({
    success: true,
    data: attendance,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};
