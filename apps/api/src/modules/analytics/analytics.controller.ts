import { Request, Response } from 'express';
import * as analyticsService from './analytics.service';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const data = await analyticsService.getDashboardAnalytics(schoolId);
  res.status(200).json({ success: true, data, meta: { requestId: req.headers['x-request-id'], timestamp: new Date().toISOString() } });
};

export const exportCSV = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const csv = await analyticsService.exportAnalyticsCSV(schoolId);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="analytics-export.csv"');
  res.status(200).send(csv);
};
