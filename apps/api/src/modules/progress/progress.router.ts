import { Router } from 'express';
import { getMyProgress } from './progress.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/my-progress', rbac(['STUDENT']), asyncHandler(getMyProgress));

export default router;
