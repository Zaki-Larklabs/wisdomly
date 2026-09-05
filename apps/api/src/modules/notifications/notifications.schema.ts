import { z } from 'zod';

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  unreadOnly: z.coerce.boolean().optional().default(false),
  type: z.enum(['ATTENDANCE', 'MARKS', 'HOMEWORK', 'FEE', 'ANNOUNCEMENT', 'MESSAGE', 'SYSTEM']).optional(),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;

export const markReadSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one notification ID is required'),
});

export type MarkReadInput = z.infer<typeof markReadSchema>;
