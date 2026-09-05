import { Request, Response } from 'express';
import * as notificationsService from './notifications.service';
import { notificationQuerySchema, markReadSchema } from './notifications.schema';

export const listNotifications = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const query = notificationQuerySchema.parse(req.query);
  const result = await notificationsService.getNotifications(schoolId, userId, query);
  res.status(200).json({ success: true, data: result });
};

export const unreadCount = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const result = await notificationsService.getUnreadCount(schoolId, userId);
  res.status(200).json({ success: true, data: result });
};

export const markRead = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const { ids } = markReadSchema.parse(req.body);
  const result = await notificationsService.markAsRead(schoolId, userId, ids);
  res.status(200).json({ success: true, data: result });
};

export const markAllRead = async (req: Request, res: Response) => {
  const schoolId = req.schoolId!;
  const userId = req.user!.sub;
  const result = await notificationsService.markAllAsRead(schoolId, userId);
  res.status(200).json({ success: true, data: result });
};
