import { Router } from 'express';
import { createStaff, updateStaff, deleteStaff, getStaff, getStaffById } from './staff.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', rbac(['ADMIN']), asyncHandler(createStaff));
router.put('/:id', rbac(['ADMIN']), asyncHandler(updateStaff));
router.delete('/:id', rbac(['ADMIN']), asyncHandler(deleteStaff));
router.get('/', rbac(['ADMIN']), asyncHandler(getStaff));
router.get('/:id', rbac(['ADMIN']), asyncHandler(getStaffById));

export default router;
