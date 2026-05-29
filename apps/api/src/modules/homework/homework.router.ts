import { Router } from 'express';
import {
  createHomework,
  listHomework,
  getHomework,
  gradeSubmission,
  getMyHomework,
  submitHomework
} from './homework.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// Teacher-specific / Admin operations
router.post('/', rbac(['TEACHER']), asyncHandler(createHomework));
router.get('/', rbac(['ADMIN', 'TEACHER']), asyncHandler(listHomework));
router.get('/:id', rbac(['ADMIN', 'TEACHER']), asyncHandler(getHomework));
router.post('/submissions/:submissionId/grade', rbac(['TEACHER']), asyncHandler(gradeSubmission));

// Student-specific operations
router.get('/student/me', rbac(['STUDENT']), asyncHandler(getMyHomework));
router.post('/:id/submit', rbac(['STUDENT']), asyncHandler(submitHomework));

export default router;