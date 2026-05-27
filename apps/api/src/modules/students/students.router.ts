import { Router } from 'express';
import { 
  registerStudent, 
  getStudentsList, 
  bulkImportStudents, 
  getMyProfileDashboard 
} from './students.controller';
import { authMiddleware } from '../../middleware/auth';
import { tenantMiddleware } from '../../middleware/tenant';
import { rbac } from '../../middleware/rbac';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

// ─── Security Perimeter Guards ────────────────
router.use(authMiddleware);
router.use(tenantMiddleware);

// ─── Student Self Services ────────────────────
router.get('/me/profile', rbac(['STUDENT']), asyncHandler(getMyProfileDashboard));

// ─── Administrative Management ────────────────
router.post('/', rbac(['ADMIN']), asyncHandler(registerStudent));
router.get('/', rbac(['ADMIN', 'TEACHER']), asyncHandler(getStudentsList));
router.post('/import', rbac(['ADMIN']), asyncHandler(bulkImportStudents));

export default router;