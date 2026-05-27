import { Router } from 'express';
import { getDashboardStats } from './admin.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/stats', rbac(['ADMIN']), asyncHandler(getDashboardStats));

export default router;