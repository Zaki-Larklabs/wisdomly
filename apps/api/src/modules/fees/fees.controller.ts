import { Request, Response } from 'express';
import * as feesService from './fees.service';
import { createFeeSchema, bulkCreateFeeSchema, payFeeSchema, sendReminderSchema, installmentPlanSchema, waiverSchema, updateFeeSchema, bulkDeleteSchema, createFeeTemplateSchema, applyFeeTemplateSchema } from './fees.schema';

export const createFee = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = createFeeSchema.parse(req.body);
  const fee = await feesService.createFeeRecord(schoolId, validatedInput);
  res.status(201).json({ success: true, data: fee });
};

export const bulkCreateFee = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = bulkCreateFeeSchema.parse(req.body);
  const result = await feesService.bulkCreateFees(schoolId, validatedInput);
  res.status(201).json({ success: true, data: result });
};

export const listFees = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const role = req.user!.role;
  const userId = req.user!.sub;

  if (req.query.studentId && !['STUDENT', 'PARENT'].includes(role)) {
    const fees = await feesService.getStudentFees(schoolId, req.query.studentId as string);
    return res.status(200).json({ success: true, data: fees });
  }

  const fees = await feesService.getFees(schoolId, role, userId);
  res.status(200).json({ success: true, data: fees });
};

export const getFee = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const fee = await feesService.getFeeById(schoolId, req.params.id);
  res.status(200).json({ success: true, data: fee });
};

export const payFee = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = payFeeSchema.parse(req.body);
  const fee = await feesService.recordPayment(schoolId, req.params.id, validatedInput);
  res.status(200).json({ success: true, data: fee });
};

export const applyLateFees = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const result = await feesService.applyLateFees(schoolId, req.body);
  res.status(200).json({ success: true, data: result });
};

export const sendReminders = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = sendReminderSchema.parse(req.body);
  const result = await feesService.sendFeeReminders(schoolId, validatedInput.feeIds, validatedInput.message);
  res.status(200).json({ success: true, data: result });
};

export const feeStats = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const stats = await feesService.getFeeStats(schoolId);
  res.status(200).json({ success: true, data: stats });
};

export const checkoutPay = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const role = req.user!.role;
  const userId = req.user!.sub;
  const { feeIds, paidAmounts } = req.body;
  if (!feeIds || !Array.isArray(feeIds) || feeIds.length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'feeIds array is required' } });
  }
  const result = await feesService.batchPayFees(schoolId, feeIds, role, userId, paidAmounts);
  res.status(200).json({ success: true, data: result });
};

export const deleteFee = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  await feesService.deleteFeeRecord(schoolId, req.params.id);
  res.status(200).json({ success: true, data: null });
};

export const createInstallmentPlan = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = installmentPlanSchema.parse(req.body);
  const result = await feesService.createInstallmentPlan(schoolId, validatedInput);
  res.status(201).json({ success: true, data: result });
};

export const getInstallmentGroup = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const result = await feesService.getInstallmentGroup(schoolId, req.params.groupId);
  res.status(200).json({ success: true, data: result });
};

export const applyWaiver = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = waiverSchema.parse(req.body);
  const result = await feesService.applyWaiver(schoolId, validatedInput);
  res.status(200).json({ success: true, data: result });
};

export const waiverStats = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const result = await feesService.getWaiverStats(schoolId);
  res.status(200).json({ success: true, data: result });
};

export const updateFee = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = updateFeeSchema.parse(req.body);
  const result = await feesService.updateFeeRecord(schoolId, req.params.id, validatedInput);
  res.status(200).json({ success: true, data: result });
};

export const bulkDeleteFees = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = bulkDeleteSchema.parse(req.body);
  const result = await feesService.bulkDeleteFees(schoolId, validatedInput);
  res.status(200).json({ success: true, data: result });
};

export const getReceipt = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const result = await feesService.getReceiptData(schoolId, req.params.id);
  res.status(200).json({ success: true, data: result });
};

export const listReceipts = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const studentId = req.query.studentId as string | undefined;
  const result = await feesService.listReceipts(schoolId, studentId);
  res.status(200).json({ success: true, data: result });
};

// ─── Fee Templates ───────────────────────────────────────────
export const createFeeTemplateCtrl = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = createFeeTemplateSchema.parse(req.body);
  const result = await feesService.createFeeTemplateService(schoolId, validatedInput);
  res.status(201).json({ success: true, data: result });
};

export const listFeeTemplatesCtrl = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const result = await feesService.listFeeTemplates(schoolId);
  res.status(200).json({ success: true, data: result });
};

export const getFeeTemplateCtrl = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const result = await feesService.getFeeTemplate(schoolId, req.params.id);
  res.status(200).json({ success: true, data: result });
};

export const deleteFeeTemplateCtrl = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const result = await feesService.deleteFeeTemplateService(schoolId, req.params.id);
  res.status(200).json({ success: true, data: result });
};

export const applyFeeTemplateCtrl = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const validatedInput = applyFeeTemplateSchema.parse(req.body);
  const result = await feesService.applyFeeTemplateToClass(schoolId, validatedInput);
  res.status(200).json({ success: true, data: result });
};
