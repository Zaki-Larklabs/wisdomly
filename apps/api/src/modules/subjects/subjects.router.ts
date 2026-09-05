import { Router } from 'express';
import { addSubject, listSubjects, listSubjectsByClass } from './subjects.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', rbac(['ADMIN']), asyncHandler(addSubject));
router.get('/', rbac(['ADMIN', 'TEACHER']), asyncHandler(listSubjects));
router.get('/class/:classId', rbac(['ADMIN', 'TEACHER']), asyncHandler(listSubjectsByClass));

export default router;