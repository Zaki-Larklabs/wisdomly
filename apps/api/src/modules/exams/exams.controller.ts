import { Request, Response } from 'express';
import * as examsService from './exams.service';
import { createExamSchema, listExamsSchema } from './exams.schema';

export const createExam = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const input = createExamSchema.parse(req.body);
  const exam = await examsService.createExam(schoolId, input);
  res.status(201).json({ success: true, data: exam });
};

export const listExams = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { query } = listExamsSchema.parse({ query: req.query });
  const exams = await examsService.listExams(schoolId, query);
  res.status(200).json({ success: true, data: exams });
};

export const getExam = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  const exam = await examsService.getExam(schoolId, id);
  res.status(200).json({ success: true, data: exam });
};
