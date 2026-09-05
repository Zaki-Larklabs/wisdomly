import { z } from 'zod';
import { ExamType } from '@prisma/client';

export const createExamSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  examType: z.nativeEnum(ExamType),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
  maxMarks: z.number().positive(),
  passMark: z.number().positive().optional(),
});

export const listExamsSchema = z.object({
  query: z.object({
    classId: z.string().optional(),
    subjectId: z.string().optional(),
  }),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
