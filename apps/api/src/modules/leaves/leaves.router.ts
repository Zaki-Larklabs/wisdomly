import { Router } from 'express';
import { createLeave, getMyLeaves, getAllLeaves, reviewLeave } from './leaves.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', rbac(['TEACHER']), asyncHandler(createLeave));
router.get('/me', rbac(['TEACHER']), asyncHandler(getMyLeaves));
router.get('/', rbac(['ADMIN']), asyncHandler(getAllLeaves));
router.put('/:leaveId/review', rbac(['ADMIN']), asyncHandler(reviewLeave));

export default router;
