import { Router } from 'express';
import { getDashboardAnalytics, exportCSV } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/dashboard', rbac(['ADMIN']), asyncHandler(getDashboardAnalytics));
router.get('/export/csv', rbac(['ADMIN']), asyncHandler(exportCSV));

export default router;
