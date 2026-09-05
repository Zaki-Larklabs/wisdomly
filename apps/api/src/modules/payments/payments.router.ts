import { Router } from 'express';
import { createCheckout, verifySession } from './payments.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/create-checkout', rbac(['STUDENT', 'PARENT']), asyncHandler(createCheckout));
router.get('/verify/:sessionId', rbac(['STUDENT', 'PARENT']), asyncHandler(verifySession));

export default router;
