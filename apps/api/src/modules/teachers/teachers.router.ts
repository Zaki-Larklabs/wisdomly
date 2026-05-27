import { Router } from 'express';
import { registerTeacher, listTeachers,getMyDashboard } from './teachers.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Only structural administrative layers can manipulate instructor registries
router.post('/', rbac(['ADMIN']), asyncHandler(registerTeacher));
router.get('/', rbac(['ADMIN']), asyncHandler(listTeachers));
router.get('/me/assignments', rbac(['TEACHER']), asyncHandler(getMyDashboard));

export default router;