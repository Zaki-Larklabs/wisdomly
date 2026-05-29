// apps/api/src/modules/homework/homework.controller.ts
import { Request, Response } from 'express';
import * as homeworkService from './homework.service';
import { 
  createHomeworkSchema, 
  submitHomeworkSchema, 
  gradeSubmissionSchema, 
  listHomeworkSchema 
} from './homework.schema';

// ─── Teacher Operations ──────────────────────────────────────────
export const createHomework = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const teacherUserId = req.user!.sub;
  
  // Parse nested Zod schema
  const { body } = createHomeworkSchema.parse({ body: req.body });

  const homework = await homeworkService.createHomework(schoolId, teacherUserId, body);
  res.status(201).json({ success: true, data: homework });
};

export const listHomework = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { query } = listHomeworkSchema.parse({ query: req.query });

  const result = await homeworkService.listHomework(schoolId, query);
  res.status(200).json({ success: true, data: result });
};

export const getHomework = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;

  const homework = await homeworkService.getHomeworkById(schoolId, id);
  res.status(200).json({ success: true, data: homework });
};

export const gradeSubmission = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const teacherUserId = req.user!.sub;
  const { body, params } = gradeSubmissionSchema.parse({ body: req.body, params: req.params });

  const graded = await homeworkService.gradeSubmission(schoolId, teacherUserId, params.submissionId, body);
  res.status(200).json({ success: true, data: graded });
};

// ─── Student Operations ──────────────────────────────────────────
export const getMyHomework = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const studentUserId = req.user!.sub;

  const homework = await homeworkService.getStudentHomework(schoolId, studentUserId);
  res.status(200).json({ success: true, data: homework });
};

export const submitHomework = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const studentUserId = req.user!.sub;
  const { body, params } = submitHomeworkSchema.parse({ body: req.body, params: req.params });

  const submission = await homeworkService.submitHomework(schoolId, studentUserId, params.id, body);
  res.status(200).json({ success: true, data: submission });
};