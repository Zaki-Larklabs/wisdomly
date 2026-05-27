import { Router } from 'express';
import { addClass, listClasses, addSection } from './classes.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', rbac(['ADMIN']), asyncHandler(addClass));
router.get('/', rbac(['ADMIN', 'TEACHER']), asyncHandler(listClasses));
router.post('/sections', rbac(['ADMIN']), asyncHandler(addSection));

export default router;