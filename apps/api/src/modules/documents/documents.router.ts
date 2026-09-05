import { Router } from 'express';
import { create, list, remove } from './documents.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', rbac(['TEACHER', 'ADMIN']), asyncHandler(create));
router.get('/', rbac(['TEACHER', 'ADMIN', 'STUDENT', 'PARENT']), asyncHandler(list));
router.delete('/:documentId', rbac(['TEACHER', 'ADMIN']), asyncHandler(remove));

export default router;
