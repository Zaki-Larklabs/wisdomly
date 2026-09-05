import { Request, Response } from 'express';
import * as marksService from './marks.service';
import { submitMarksSchema, generateReportCardSchema } from './marks.schema';
import { prisma } from '../../config/database';

export const submitMarks = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const data = submitMarksSchema.parse(req.body);

  let teacherId = userId;
  if (req.user?.role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (teacher) teacherId = teacher.id;
  }

  const results = await marksService.submitBulkMarks(schoolId, teacherId, data, userId);

  res.status(200).json({
    success: true,
    data: { updatedCount: results.length },
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const generateReportCards = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const data = generateReportCardSchema.parse(req.body);

  const results = await marksService.generateReportCards(schoolId, data.classId, data.examId, userId);

  res.status(200).json({
    success: true,
    data: { generatedCount: results.length },
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getStudentResults = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const userRole = req.user?.role!;
  const { studentId } = req.params;

  if (userRole === 'PARENT') {
    const isOwner = await prisma.student.findFirst({
      where: { id: studentId, parent: { userId } }
    });
    if (!isOwner) {
      return res.status(403).json({ success: false, error: { message: 'Access denied: You can only view your own child\'s records.' } });
    }
  }

  const results = await marksService.getStudentResults(schoolId, studentId);

  res.status(200).json({
    success: true,
    data: results,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getMyResults = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;

  const student = await prisma.student.findFirst({ where: { schoolId, userId } });
  if (!student) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } });

  const results = await marksService.getStudentResults(schoolId, student.id);
  res.status(200).json({ success: true, data: results });
};

export const getMyMarksForExam = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const { examId } = req.params;

  const student = await prisma.student.findFirst({ where: { schoolId, userId } });
  if (!student) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Student not found' } });

  const marks = await marksService.getStudentMarksForExam(schoolId, student.id, examId);
  res.status(200).json({ success: true, data: marks });
};

export const getStudentMarksForExam = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const userRole = req.user?.role!;
  const { studentId, examId } = req.params;

  if (userRole === 'PARENT') {
    const isOwner = await prisma.student.findFirst({
      where: { id: studentId, parent: { userId } }
    });
    if (!isOwner) {
      return res.status(403).json({ success: false, error: { message: 'Access denied: You can only view your own child\'s records.' } });
    }
  }

  const marks = await marksService.getStudentMarksForExam(schoolId, studentId, examId);

  res.status(200).json({
    success: true,
    data: marks,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};
