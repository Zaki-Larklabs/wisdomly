import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { NotificationQueryInput } from './notifications.schema';

export const getNotifications = async (
  schoolId: string,
  recipientId: string,
  query: NotificationQueryInput,
) => {
  const where: Record<string, unknown> = { schoolId, recipientId };
  if (query.unreadOnly) where.isRead = false;
  if (query.type) where.type = query.type;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getUnreadCount = async (schoolId: string, recipientId: string) => {
  const count = await prisma.notification.count({
    where: { schoolId, recipientId, isRead: false },
  });
  return { count };
};

export const markAsRead = async (
  schoolId: string,
  recipientId: string,
  ids: string[],
) => {
  const result = await prisma.notification.updateMany({
    where: { schoolId, recipientId, id: { in: ids }, isRead: false },
    data: { isRead: true },
  });
  return { updatedCount: result.count };
};

export const markAllAsRead = async (schoolId: string, recipientId: string) => {
  const result = await prisma.notification.updateMany({
    where: { schoolId, recipientId, isRead: false },
    data: { isRead: true },
  });
  return { updatedCount: result.count };
};

export const createNotificationRecord = async (
  schoolId: string,
  recipientId: string,
  title: string,
  message: string,
  type: 'ATTENDANCE' | 'MARKS' | 'HOMEWORK' | 'FEE' | 'ANNOUNCEMENT' | 'MESSAGE' | 'SYSTEM',
  metadata?: Record<string, unknown>,
) => {
  const notification = await prisma.notification.create({
    data: {
      schoolId,
      recipientId,
      title,
      message,
      type,
      sentVia: ['IN_APP'],
      metadata: (metadata || {}) as Prisma.InputJsonValue,
    },
  });
  return notification;
};
