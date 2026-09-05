import { Router } from 'express';
import { getDashboardStats, getPendingApprovals, approveUser, rejectUser } from './admin.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/stats', rbac(['ADMIN']), asyncHandler(getDashboardStats));
router.get('/pending-approvals', rbac(['ADMIN']), asyncHandler(getPendingApprovals));
router.put('/approve-user/:userId', rbac(['ADMIN']), asyncHandler(approveUser));
router.delete('/reject-user/:userId', rbac(['ADMIN']), asyncHandler(rejectUser));

export default router;