import { Request, Response } from 'express';
import * as adminService from './admin.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const stats = await adminService.getSchoolMetrics(schoolId);

  res.status(200).json({
    success: true,
    data: stats,
  });
};