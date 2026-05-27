import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required (e.g., Class 11)'),
  gradeLevel: z.number().int().min(1, 'Grade level must be a valid integer'),
});

export const createSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required (e.g., B)'),
  classId: z.string().min(1, 'Target class association is required'),
});