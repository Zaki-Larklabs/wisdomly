import { z } from 'zod';
import { Role, Gender } from '@prisma/client';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email, phone, or roll number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
  schoolSlug: z.string().optional(),
}).refine(data => {
  if (data.role !== 'SUPER_ADMIN' && !data.schoolSlug) return false;
  return true;
}, { message: "School identifier required for this role", path: ["schoolSlug"] });

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  role: z.nativeEnum(Role),
  schoolSlug: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const registerStudentSchema = z.object({
  schoolSlug: z.string().min(1, 'School slug is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  dob: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  address: z.string().optional(),
  parentPhone: z.string().optional(),
});

export const registerParentSchema = z.object({
  schoolSlug: z.string().min(1, 'School slug is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentRollNumbers: z.array(z.string()).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;
export type RegisterParentInput = z.infer<typeof registerParentSchema>;