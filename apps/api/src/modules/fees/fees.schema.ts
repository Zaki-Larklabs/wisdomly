import { z } from 'zod';

export const createFeeSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  discount: z.number().min(0).optional(),
  discountReason: z.string().optional(),
  remarks: z.string().optional(),
});

export const bulkCreateFeeSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  sectionId: z.string().optional(),
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  discount: z.number().min(0).optional(),
  discountReason: z.string().optional(),
  remarks: z.string().optional(),
});

export const payFeeSchema = z.object({
  paidAmount: z.number().positive('Paid amount must be positive'),
  paymentGatewayRef: z.string().optional(),
});

export const lateFeeConfigSchema = z.object({
  percentagePerDay: z.number().min(0).max(100).optional().default(0.5),
  maxLateFeePercent: z.number().min(0).max(1000).optional().default(20),
  graceDays: z.number().min(0).optional().default(7),
});

export const sendReminderSchema = z.object({
  feeIds: z.array(z.string()).min(1, 'At least one fee ID is required'),
  message: z.string().optional(),
});

export const checkoutSchema = z.object({
  feeIds: z.array(z.string()).min(1, 'At least one fee is required'),
  paymentMethod: z.enum(['CARD', 'UPI', 'NET_BANKING', 'CASH', 'CHEQUE', 'ONLINE']).optional().default('ONLINE'),
  paidAmounts: z.record(z.string(), z.number().positive()).optional(),
});

export const installmentPlanSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').optional(),
  classId: z.string().min(1, 'Class ID is required').optional(),
  sectionId: z.string().optional(),
  feeType: z.string().min(1, 'Fee type is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  numberOfInstallments: z.number().int().min(2, 'Minimum 2 installments').max(24, 'Maximum 24 installments'),
  frequency: z.enum(['monthly', 'quarterly', 'half_yearly']),
  firstDueDate: z.string().min(1, 'First due date is required'),
  discount: z.number().min(0).optional().default(0),
  discountReason: z.string().optional(),
  remarks: z.string().optional(),
}).refine(data => data.studentId || data.classId, {
  message: 'Either studentId or classId must be provided',
});

export const waiverSchema = z.object({
  feeIds: z.array(z.string()).min(1, 'At least one fee ID is required'),
  reason: z.string().min(1, 'Waiver reason is required'),
});

export const updateFeeSchema = z.object({
  feeType: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.string().optional(),
  discount: z.number().min(0).optional(),
  discountReason: z.string().optional(),
  remarks: z.string().optional(),
});

export const bulkDeleteSchema = z.object({
  feeIds: z.array(z.string()).min(1, 'At least one fee ID is required'),
});

export type CreateFeeInput = z.infer<typeof createFeeSchema>;
export type BulkCreateFeeInput = z.infer<typeof bulkCreateFeeSchema>;
export type PayFeeInput = z.infer<typeof payFeeSchema>;
export type LateFeeConfig = z.infer<typeof lateFeeConfigSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type InstallmentPlanInput = z.infer<typeof installmentPlanSchema>;
export type WaiverInput = z.infer<typeof waiverSchema>;
export type UpdateFeeInput = z.infer<typeof updateFeeSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

export const feeTemplateItemSchema = z.object({
  feeType: z.string().min(1, 'Fee type is required'),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  discount: z.number().min(0).optional().default(0),
  discountReason: z.string().optional(),
});

export const createFeeTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  items: z.array(feeTemplateItemSchema).min(1, 'At least one fee item is required'),
});

export const applyFeeTemplateSchema = z.object({
  templateId: z.string().min(1),
  classId: z.string().min(1, 'Class ID is required'),
  sectionId: z.string().optional(),
});

export type CreateFeeTemplateInput = z.infer<typeof createFeeTemplateSchema>;
export type ApplyFeeTemplateInput = z.infer<typeof applyFeeTemplateSchema>;
