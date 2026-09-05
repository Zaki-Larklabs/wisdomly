import { Router } from 'express';
import { getMyChildren } from './parents.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/me/children', rbac(['PARENT']), asyncHandler(getMyChildren));

export default router;
