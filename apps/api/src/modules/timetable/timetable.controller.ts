import { Request, Response } from 'express';
import * as timetableService from './timetable.service';
import { createTimetableSchema, updateTimetableSchema } from './timetable.schema';
import { prisma } from '../../config/database';

export const createTimetable = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const data = createTimetableSchema.parse(req.body);

  const entry = await timetableService.createTimetableEntry(schoolId, data, userId);

  res.status(201).json({
    success: true,
    data: entry,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const updateTimetable = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const { id } = req.params;
  const data = updateTimetableSchema.parse(req.body);

  const entry = await timetableService.updateTimetableEntry(schoolId, id, data, userId);

  res.status(200).json({
    success: true,
    data: entry,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const deleteTimetable = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const { id } = req.params;

  await timetableService.deleteTimetableEntry(schoolId, id, userId);

  res.status(200).json({
    success: true,
    data: { id },
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getTimetableByClassId = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { classId } = req.params;

  const timetable = await timetableService.getTimetableByClass(schoolId, classId);

  res.status(200).json({
    success: true,
    data: timetable,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getTimetableBySectionId = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { sectionId } = req.params;

  const timetable = await timetableService.getTimetableBySection(schoolId, sectionId);

  res.status(200).json({
    success: true,
    data: timetable,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getTimetableByTeacherId = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { teacherId } = req.params;

  const timetable = await timetableService.getTimetableByTeacher(schoolId, teacherId);

  res.status(200).json({
    success: true,
    data: timetable,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};

export const getMyTimetable = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user?.sub!;
  const role = req.user?.role!;

  let timetable: any[] = [];

  if (role === 'TEACHER') {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (teacher) {
      timetable = await timetableService.getTimetableByTeacher(schoolId, teacher.id);
    }
  } else if (role === 'STUDENT') {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (student) {
      timetable = await timetableService.getTimetableBySection(schoolId, student.sectionId);
    }
  }

  res.status(200).json({
    success: true,
    data: timetable,
    meta: { requestId: req.headers['x-request-id'] as string, timestamp: new Date().toISOString() }
  });
};
