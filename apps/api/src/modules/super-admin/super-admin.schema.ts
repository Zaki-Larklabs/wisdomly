import { z } from 'zod';
import { Plan } from '@prisma/client';

export const createSchoolSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  plan: z.nativeEnum(Plan).default('FREE'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});
