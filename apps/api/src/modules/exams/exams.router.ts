import { Router } from 'express';
import { createExam, listExams, getExam } from './exams.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', rbac(['ADMIN', 'TEACHER']), asyncHandler(createExam));
router.get('/', rbac(['ADMIN', 'TEACHER']), asyncHandler(listExams));
router.get('/:id', rbac(['ADMIN', 'TEACHER']), asyncHandler(getExam));

export default router;
