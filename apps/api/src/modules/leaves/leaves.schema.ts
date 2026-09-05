import { z } from 'zod';
import { LeaveStatus } from '@prisma/client';

export const createLeaveSchema = z.object({
  leaveType: z.enum(['SICK', 'PERSONAL', 'EMERGENCY', 'ANNUAL', 'OTHER']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(1, 'Reason is required'),
});

export const reviewLeaveSchema = z.object({
  status: z.nativeEnum(LeaveStatus),
  reviewNote: z.string().optional(),
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
