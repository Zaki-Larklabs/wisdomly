import { z } from 'zod';

export const createStaffSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1),
  designation: z.string().min(1),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  salary: z.number().positive().optional(),
  address: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const updateStaffSchema = createStaffSchema.partial();
