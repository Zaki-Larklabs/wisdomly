import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required (e.g., Algebra II)'),
  code: z.string().min(1, 'Subject code is required (e.g., MATH-101)'),
  classId: z.string().min(1, 'Target class allocation is required'),
  teacherId: z.string().optional(), // Optional on initialization, can assign later
});