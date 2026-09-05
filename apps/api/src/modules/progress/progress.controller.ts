import { Request, Response } from 'express';
import * as progressService from './progress.service';

export const getMyProgress = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const progress = await progressService.getStudentProgress(schoolId, userId);
  res.status(200).json({ success: true, data: progress });
};
