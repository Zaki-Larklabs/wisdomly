import { Request, Response } from 'express';
import * as subjectsService from './subjects.service';
import { createSubjectSchema } from './subjects.schema';

export const addSubject = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = createSubjectSchema.parse(req.body);

  const subject = await subjectsService.createNewSubject(schoolId, validatedInput);

  res.status(201).json({
    success: true,
    data: subject
  });
};

export const listSubjects = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const subjects = await subjectsService.getSubjectsWithAssignments(schoolId);

  res.status(200).json({
    success: true,
    data: subjects
  });
};

export const listSubjectsByClass = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { classId } = req.params;
  const subjects = await subjectsService.getSubjectsByClass(schoolId, classId);
  res.status(200).json({ success: true, data: subjects });
};