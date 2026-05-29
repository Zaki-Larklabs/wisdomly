import { Request, Response } from 'express';
import * as noticesService from './notices.service';
import { createNoticeSchema } from './notices.schema';

export const postNotice = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const authorId = req.user!.sub;
  const validatedInput = createNoticeSchema.parse(req.body);

  const notice = await noticesService.createBroadcast(schoolId, authorId, validatedInput);

  res.status(201).json({ success: true, data: notice });
};

export const fetchNotices = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userRole = req.user!.role;

  const notices = await noticesService.getTargetedNotices(schoolId, userRole);

  res.status(200).json({ success: true, data: notices });
};