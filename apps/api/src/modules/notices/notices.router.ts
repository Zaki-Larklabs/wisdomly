import { Router } from 'express';
import { postNotice, fetchNotices } from './notices.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Only administrators can broadcast, but anyone authenticated can read their authorized feed
router.post('/', rbac(['ADMIN', 'SUPER_ADMIN']), asyncHandler(postNotice));
router.get('/', asyncHandler(fetchNotices));

export default router;