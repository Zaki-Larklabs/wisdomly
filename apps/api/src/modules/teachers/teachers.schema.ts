import { z } from 'zod';

export const createTeacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be valid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Teacher name is required'),
  department: z.string().min(1, 'Department allocation is required'),
  joiningDate: z.string().optional().transform((str) => str ? new Date(str) : new Date()),
});