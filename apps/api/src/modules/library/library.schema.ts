import { z } from 'zod';

export const createBookSchema = z.object({
  isbn: z.string().optional(),
  title: z.string().min(1),
  author: z.string().min(1),
  publisher: z.string().optional(),
  edition: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  shelfLocation: z.string().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const borrowBookSchema = z.object({
  bookId: z.string().cuid(),
  borrowerId: z.string(),
  borrowerRole: z.enum(['STUDENT', 'TEACHER']),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
