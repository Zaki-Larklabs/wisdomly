import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive(),
  category: z.string().optional(),
  classId: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
