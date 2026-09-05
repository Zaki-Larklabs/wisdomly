import { Request, Response } from 'express';
import * as leavesService from './leaves.service';
import { createLeaveSchema, reviewLeaveSchema } from './leaves.schema';

export const createLeave = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const input = createLeaveSchema.parse(req.body);
  const leave = await leavesService.createLeaveRequest(schoolId, userId, input);
  res.status(201).json({ success: true, data: leave });
};

export const getMyLeaves = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const leaves = await leavesService.getMyLeaves(schoolId, userId);
  res.status(200).json({ success: true, data: leaves });
};

export const getAllLeaves = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const leaves = await leavesService.getAllLeaves(schoolId);
  res.status(200).json({ success: true, data: leaves });
};

export const reviewLeave = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const { leaveId } = req.params;
  const { status, reviewNote } = reviewLeaveSchema.parse(req.body);
  const leave = await leavesService.reviewLeave(schoolId, userId, leaveId, status, reviewNote);
  res.status(200).json({ success: true, data: leave });
};
