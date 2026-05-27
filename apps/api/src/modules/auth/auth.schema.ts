import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email, phone, or roll number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
  schoolSlug: z.string().optional(),
}).refine(data => {
  // If they aren't a Super Admin, they MUST provide the school they belong to
  if (data.role !== 'SUPER_ADMIN' && !data.schoolSlug) return false;
  return true;
}, { message: "School identifier required for this role", path: ["schoolSlug"] });

export type LoginInput = z.infer<typeof loginSchema>;