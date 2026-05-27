import { Request, Response } from 'express';
import * as teachersService from './teachers.service';
import { createTeacherSchema } from './teachers.schema';

export const registerTeacher = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = createTeacherSchema.parse(req.body);

  const teacher = await teachersService.createTeacher(schoolId, validatedInput);

  res.status(201).json({
    success: true,
    data: teacher,
    meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() }
  });
};

export const listTeachers = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const teachers = await teachersService.getTeachersList(schoolId);

  res.status(200).json({
    success: true,
    data: teachers
  });
};
export const getMyDashboard = async (req: Request, res: Response) => {
  // req.user is populated securely via your authMiddleware stack
  const userId = req.user?.sub!;     
  const assignments = await teachersService.getTeacherAssignments(userId);

  res.status(200).json({
    success: true,
    data: assignments
  });
};