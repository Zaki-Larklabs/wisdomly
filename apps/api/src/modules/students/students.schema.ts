import { z } from 'zod';
import { Gender } from '@prisma/client';

export const createStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  name: z.string().min(1, 'Student name is required'),
  dob: z.string().transform((str) => new Date(str)),
  gender: z.nativeEnum(Gender),
  address: z.string().optional(),
  classId: z.string().min(1, 'Class allocation is required'),
  sectionId: z.string().min(1, 'Section allocation is required'),
  parentId: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().omit({ password: true });