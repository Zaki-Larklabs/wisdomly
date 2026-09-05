import { Router } from 'express';
import { listNotifications, unreadCount, markRead, markAllRead } from './notifications.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', asyncHandler(listNotifications));
router.get('/unread-count', asyncHandler(unreadCount));
router.patch('/read', asyncHandler(markRead));
router.patch('/read-all', asyncHandler(markAllRead));

export default router;
