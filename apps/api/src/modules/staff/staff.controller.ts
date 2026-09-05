import { Request, Response } from 'express';
import * as staffService from './staff.service';
import { createStaffSchema, updateStaffSchema } from './staff.schema';

export const createStaff = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const data = createStaffSchema.parse(req.body);
  const staff = await staffService.createStaff(schoolId, data);
  res.status(201).json({ success: true, data: staff, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const updateStaff = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  const data = updateStaffSchema.parse(req.body);
  const staff = await staffService.updateStaff(schoolId, id, data);
  res.status(200).json({ success: true, data: staff, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const deleteStaff = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  await staffService.deleteStaff(schoolId, id);
  res.status(200).json({ success: true, data: { id }, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const getStaff = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const staff = await staffService.getStaff(schoolId, req.query as any);
  res.status(200).json({ success: true, data: staff, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const getStaffById = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const { id } = req.params;
  const staff = await staffService.getStaffById(schoolId, id);
  res.status(200).json({ success: true, data: staff, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};
