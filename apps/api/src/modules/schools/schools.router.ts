import { Router } from 'express';
import { getProfile, updateProfile } from './schools.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/profile', rbac(['ADMIN']), asyncHandler(getProfile));
router.patch('/profile', rbac(['ADMIN']), asyncHandler(updateProfile));

export default router;
