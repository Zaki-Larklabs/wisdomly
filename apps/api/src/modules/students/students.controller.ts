import { Request, Response } from 'express';
import * as studentsService from './students.service';
import { createStudentSchema } from './students.schema';

export const registerStudent = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!; // Injected directly by your tenant middleware
  const validatedInput = createStudentSchema.parse(req.body);

  const student = await studentsService.createStudent(schoolId, validatedInput);

  res.status(201).json({
    success: true,
    data: student,
    meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() }
  });
};

export const getStudentsList = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const students = await studentsService.getAllStudents(schoolId);

  res.status(200).json({
    success: true,
    data: students
  });
};

export const bulkImportStudents = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { csvData } = req.body;

  if (!csvData) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing csvData text string in request body' } });
  }

  const result = await studentsService.importStudentsBulk(schoolId, csvData);

  res.status(200).json({
    success: true,
    data: result,
    meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() }
  });
};
export const getMyProfileDashboard = async (req: Request, res: Response) => {
  const userId = req.user?.sub!; // Securely extracted from token claims middleware
  const studentWorkspace = await studentsService.getStudentProfileWorkspace(userId);

  res.status(200).json({
    success: true,
    data: studentWorkspace,
  });
};