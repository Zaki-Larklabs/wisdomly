import { z } from 'zod';

export const submitMarksSchema = z.object({
  examId: z.string().cuid(),
  subjectId: z.string().cuid(),
  maxMarks: z.number().positive(),
  marks: z.array(z.object({
    studentId: z.string().cuid(),
    marksObtained: z.number().min(0),
    remarks: z.string().optional()
  }))
});

export const generateReportCardSchema = z.object({
  examId: z.string().cuid(),
  classId: z.string().cuid()
});
