import { Router } from 'express';
import { getStats, listSchools, createSchool, toggleSchool } from './super-admin.controller';
import { authMiddleware } from '../../middleware/auth';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

router.get('/stats', rbac(['SUPER_ADMIN']), asyncHandler(getStats));
router.get('/schools', rbac(['SUPER_ADMIN']), asyncHandler(listSchools));
router.post('/schools', rbac(['SUPER_ADMIN']), asyncHandler(createSchool));
router.put('/schools/:schoolId/toggle', rbac(['SUPER_ADMIN']), asyncHandler(toggleSchool));

export default router;
