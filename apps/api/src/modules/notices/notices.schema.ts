import { z } from 'zod';

export const createNoticeSchema = z.object({
  title: z.string().min(1, 'Broadcast title is required'),
  content: z.string().min(1, 'Broadcast content cannot be empty'),
  targetRole: z.enum(['ALL', 'STUDENT', 'TEACHER', 'PARENT']),
});