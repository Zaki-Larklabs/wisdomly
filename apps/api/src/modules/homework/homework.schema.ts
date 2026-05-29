// apps/api/src/modules/homework/homework.schema.ts
import { z } from 'zod';

export const createHomeworkSchema = z.object({
  body: z.object({
    classId:     z.string().cuid(),
    subjectId:   z.string().cuid(),
    title:       z.string().min(1).max(255),
    description: z.string().optional(),
    dueDate:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format: YYYY-MM-DD'),
    fileUrl:     z.string().url().optional(),
  }),
});

export const submitHomeworkSchema = z.object({
  body: z.object({
    fileUrl:  z.string().url().optional(),
    remarks:  z.string().optional(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    grade:    z.string().min(1).max(10),
    feedback: z.string().optional(),
    status:   z.enum(['GRADED']),
  }),
  params: z.object({
    submissionId: z.string().cuid(),
  }),
});

export const listHomeworkSchema = z.object({
  query: z.object({
    classId:   z.string().cuid().optional(),
    subjectId: z.string().cuid().optional(),
    page:      z.string().default('1').transform(Number),
    pageSize:  z.string().default('20').transform(Number),
  }),
});

export type CreateHomeworkInput    = z.infer<typeof createHomeworkSchema>['body'];
export type SubmitHomeworkInput    = z.infer<typeof submitHomeworkSchema>['body'];
export type GradeSubmissionInput   = z.infer<typeof gradeSubmissionSchema>['body'];