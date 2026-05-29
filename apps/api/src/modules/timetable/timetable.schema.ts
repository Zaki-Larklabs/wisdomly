import { z } from 'zod';

export const createTimetableSchema = z.object({
  classId:      z.string().cuid(),
  sectionId:    z.string().cuid().optional(),
  subjectId:    z.string().cuid(),
  teacherId:    z.string().cuid(),
  dayOfWeek:    z.number().int().min(1).max(6),  // 1=Mon, 6=Sat
  periodNumber: z.number().int().min(1).max(10),
  startTime:    z.string().regex(/^\d{2}:\d{2}$/),  // "09:00"
  endTime:      z.string().regex(/^\d{2}:\d{2}$/),  // "09:45"
});

export const updateTimetableSchema = createTimetableSchema.partial();
