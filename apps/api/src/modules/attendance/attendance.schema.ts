import { z } from 'zod';

export const markAttendanceSchema = z.object({
  classId: z.string().cuid(),
  sectionId: z.string().cuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  session: z.enum(['AM', 'PM']),
  attendance: z.array(z.object({
    studentId: z.string().cuid(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEAVE']),
    remarks: z.string().optional()
  }))
});
